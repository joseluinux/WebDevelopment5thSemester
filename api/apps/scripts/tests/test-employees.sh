#!/usr/bin/env bash
# End-to-end smoke test for the Employees vertical slice.
# Registers a fresh user, creates a MEI, exercises List + Create with
# happy and sad-path validation.
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
NAME="Employees Test"
EMAIL="employees-test@lumemei.com"
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

# --- Step 2: Create the MEI that will own the employees ---
# Unique CNPJ per run avoids the global meis_cnpj_key unique constraint
# on reruns.
echo
echo "--- Step 2: Create MEI ---"
CNPJ_SUFFIX=$(date +%H%M%S)
RESPONSE=$(curl -s -X POST "$API/v1/meis" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Employees Test MEI\",\"cnpj\":\"66554433$CNPJ_SUFFIX\",\"cnae\":\"4751201\",\"annualLimit\":81000,\"plan\":\"free\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

MEI_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$MEI_ID" ] || [ "$MEI_ID" = "null" ]; then
  echo "ERROR: Failed to create MEI. Aborting." >&2
  exit 1
fi

# --- Step 3a: Create CLT employee ---
# Salary 1500, charges 450 -> totalCost 1950
echo
echo "--- Step 3a: Create CLT employee ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/meis/$MEI_ID/employees" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","contractType":"clt","salary":1500.00,"charges":450.00}')
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "201" ]; then
  echo "ERROR: expected 201 from CLT create, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 3b: Create PJ employee ---
# Salary 3000, charges 0 -> totalCost 3000
echo
echo "--- Step 3b: Create PJ employee ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/meis/$MEI_ID/employees" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"João Pereira","contractType":"pj","salary":3000.00,"charges":0.00}')
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "201" ]; then
  echo "ERROR: expected 201 from PJ create, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 4: List ALL employees — expect 2 with calculated totalCost ---
echo
echo "--- Step 4: List employees (expecting 2 with totalCost) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/employees" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

LIST_COUNT=$(echo "$RESPONSE" | jq -r 'length')
if [ "$LIST_COUNT" != "2" ]; then
  echo "ERROR: expected 2 employees, got $LIST_COUNT. Aborting." >&2
  exit 1
fi

# Sanity-check: every row carries totalCost.
HAS_TOTAL=$(echo "$RESPONSE" | jq -r '[.[] | has("totalCost")] | all')
if [ "$HAS_TOTAL" != "true" ]; then
  echo "ERROR: list response is missing totalCost on at least one row. Aborting." >&2
  exit 1
fi

# Sanity-check: totalCost = salary + charges (1500+450=1950 ; 3000+0=3000)
SUM_CHECK=$(echo "$RESPONSE" | jq -r '[.[] | (.totalCost == (.salary + .charges))] | all')
if [ "$SUM_CHECK" != "true" ]; then
  echo "ERROR: totalCost does not equal salary + charges on at least one row. Aborting." >&2
  exit 1
fi
echo "OK: 2 employees returned with correct totalCost."

# --- Step 5: Sad path — invalid contract type (expecting 400) ---
echo
echo "--- Step 5: Sad path — invalid contractType (expecting 400) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/meis/$MEI_ID/employees" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bad Contract","contractType":"freelancer","salary":1500.00,"charges":0.00}')
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "400" ]; then
  echo "OK: invalid contractType was rejected with 400."
else
  echo "ERROR: expected 400 for invalid contractType, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 6: Sad path — salary zero (expecting 400) ---
echo
echo "--- Step 6: Sad path — salary zero (expecting 400) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/meis/$MEI_ID/employees" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Zero Salary","contractType":"clt","salary":0,"charges":0}')
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "400" ]; then
  echo "OK: salary=0 was rejected with 400."
else
  echo "ERROR: expected 400 for salary=0, got $STATUS. Aborting." >&2
  exit 1
fi
