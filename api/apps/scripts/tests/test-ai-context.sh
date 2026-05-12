#!/usr/bin/env bash
# End-to-end smoke test for the AI Context vertical slice.
# Registers a fresh user, creates a MEI, seeds 5 transactions / 2
# products / 1 employee, then prints the responses of both AI read
# endpoints (with and without a date filter on financial-summary).
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
NAME="AI Test"
EMAIL="ai-test@lumemei.com.br"
PASSWORD="test123"

# --- Setup: register the test account (idempotent) ---
echo "--- Setup: register (never aborts) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "409" ]; then
  echo "INFO: account '$EMAIL' already exists — continuing."
elif [ "$STATUS" != "201" ]; then
  echo "WARNING: unexpected register status $STATUS — continuing anyway." >&2
fi

# --- Step 1: Login ---
echo
echo "--- Step 1: Login ---"
RESPONSE=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "ERROR: Login failed or accessToken is empty. Aborting." >&2
  exit 1
fi
AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

# --- Step 2: Create the MEI that will own the seed data ---
# Unique CNPJ per run avoids the global meis_cnpj_key unique constraint
# on reruns.
echo
echo "--- Step 2: Create MEI ---"
CNPJ_SUFFIX=$(date +%H%M%S)
RESPONSE=$(curl -s -X POST "$API/v1/meis" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"AI Test MEI\",\"cnpj\":\"88776655$CNPJ_SUFFIX\",\"cnae\":\"4751201\",\"annualLimit\":81000,\"plan\":\"free\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

MEI_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$MEI_ID" ] || [ "$MEI_ID" = "null" ]; then
  echo "ERROR: Failed to create MEI. Aborting." >&2
  exit 1
fi

# --- Step 3: Seed 5 transactions across categories AND months ---
# Mix: 3 income, 2 expense. Spread across two different months so the
# financial-summary monthly breakdown shows multiple buckets — that is
# the only way the test can sanity-check the chronological sort.
echo
echo "--- Step 3a: Income, Sales, 2026-03-15 ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"type":"income","category":"Sales","amount":500.00,"date":"2026-03-15","description":"Order #1"}'

echo "--- Step 3b: Income, Services, 2026-03-22 ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"type":"income","category":"Services","amount":1200.00,"date":"2026-03-22","description":"Consulting"}'

echo "--- Step 3c: Expense, Supplies, 2026-03-25 ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"type":"expense","category":"Supplies","amount":150.00,"date":"2026-03-25","description":"Raw materials"}'

echo "--- Step 3d: Income, Sales, 2026-04-10 ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"type":"income","category":"Sales","amount":350.00,"date":"2026-04-10","description":"Order #2"}'

echo "--- Step 3e: Expense, Rent, 2026-04-05 ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"type":"expense","category":"Rent","amount":900.00,"date":"2026-04-05","description":"April rent"}'

# --- Step 4: Seed 2 products ---
echo
echo "--- Step 4a: Product Espresso ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/products" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Espresso","cost":4.00,"price":10.00,"desiredMargin":30,"status":"active"}'

echo "--- Step 4b: Product Latte ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/products" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Latte","cost":8.00,"price":15.00,"desiredMargin":40,"status":"active"}'

# --- Step 5: Seed 1 employee ---
echo
echo "--- Step 5: Employee Maria ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/meis/$MEI_ID/employees" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","contractType":"clt","salary":1500.00,"charges":450.00}'

# --- Step 6: GET /v1/meis/{meiId}/ai/context ---
# Expect: counts (5 transactions, 2 products, 1 employee), totals
# (income=2050, expense=1050, netProfit=1000), top categories
# (Sales appears twice so it should lead), and the 10 most recent
# transactions (we only seeded 5 so the list will have 5).
echo
echo "--- Step 6: AI context snapshot ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "$API/v1/meis/$MEI_ID/ai/context" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 from AI context, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 7: GET /v1/meis/{meiId}/ai/financial-summary (no filter) ---
# Expect: Period="All time", same totals as the context, monthly
# breakdown with two buckets (2026-03 and 2026-04 in chronological
# order), top expenses sorted by amount desc.
echo
echo "--- Step 7: AI financial summary (no filter) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "$API/v1/meis/$MEI_ID/ai/financial-summary" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 from AI financial-summary, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 8: GET financial-summary with date window ---
# from + to bracket the entire 2026 calendar year, so the result
# should match Step 7 except the Period label changes from "All time"
# to "2026-01-01 to 2026-12-31".
echo
echo "--- Step 8: AI financial summary (from=2026-01-01 to=2026-12-31) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "$API/v1/meis/$MEI_ID/ai/financial-summary?from=2026-01-01&to=2026-12-31" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 from filtered AI financial-summary, got $STATUS. Aborting." >&2
  exit 1
fi

echo
echo "--- AI context smoke test complete ---"
