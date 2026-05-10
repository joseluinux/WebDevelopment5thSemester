#!/usr/bin/env bash
# End-to-end smoke test for the Products vertical slice.
# Registers a fresh user, creates a MEI, exercises full product CRUD
# with margin calculation, and confirms deletion.
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:5027"
NAME="Products Test"
EMAIL="products-test@lumemei.com"
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

# --- Step 2: Create the MEI that will own the products ---
# Unique CNPJ per run (timestamp suffix) avoids the global meis_cnpj_key
# unique constraint on reruns.
echo
echo "--- Step 2: Create MEI ---"
CNPJ_SUFFIX=$(date +%H%M%S)
RESPONSE=$(curl -s -X POST "$API/v1/meis" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Products Test MEI\",\"cnpj\":\"77665544$CNPJ_SUFFIX\",\"cnae\":\"4761003\",\"annualLimit\":81000,\"plan\":\"free\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

MEI_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$MEI_ID" ] || [ "$MEI_ID" = "null" ]; then
  echo "ERROR: Failed to create MEI. Aborting." >&2
  exit 1
fi

# --- Step 3: Create two products ---
# Product A — margin ABOVE desired:
#   cost=4, price=10, desiredMargin=30%  ->  margin = (10-4)/10*100 = 60% (>=30) -> isMarginBelowDesired=false
# Product B — margin BELOW desired:
#   cost=8, price=10, desiredMargin=40%  ->  margin = (10-8)/10*100 = 20% (<40)  -> isMarginBelowDesired=true
echo
echo "--- Step 3a: Create Product A (margin ABOVE desired) ---"
RESPONSE=$(curl -s -X POST "$API/v1/meis/$MEI_ID/products" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Espresso","cost":4.00,"price":10.00,"desiredMargin":30,"status":"active"}')
echo "$RESPONSE" | jq . || echo "$RESPONSE"

PRODUCT_A_ID=$(echo "$RESPONSE" | jq -r '.id')
A_MARGIN_BELOW=$(echo "$RESPONSE" | jq -r '.isMarginBelowDesired')
if [ -z "$PRODUCT_A_ID" ] || [ "$PRODUCT_A_ID" = "null" ]; then
  echo "ERROR: Failed to create Product A. Aborting." >&2
  exit 1
fi
if [ "$A_MARGIN_BELOW" != "false" ]; then
  echo "ERROR: Product A should have isMarginBelowDesired=false, got '$A_MARGIN_BELOW'. Aborting." >&2
  exit 1
fi

echo
echo "--- Step 3b: Create Product B (margin BELOW desired) ---"
RESPONSE=$(curl -s -X POST "$API/v1/meis/$MEI_ID/products" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Latte","cost":8.00,"price":10.00,"desiredMargin":40,"status":"active"}')
echo "$RESPONSE" | jq . || echo "$RESPONSE"

PRODUCT_B_ID=$(echo "$RESPONSE" | jq -r '.id')
B_MARGIN_BELOW=$(echo "$RESPONSE" | jq -r '.isMarginBelowDesired')
if [ -z "$PRODUCT_B_ID" ] || [ "$PRODUCT_B_ID" = "null" ]; then
  echo "ERROR: Failed to create Product B. Aborting." >&2
  exit 1
fi
if [ "$B_MARGIN_BELOW" != "true" ]; then
  echo "ERROR: Product B should have isMarginBelowDesired=true, got '$B_MARGIN_BELOW'. Aborting." >&2
  exit 1
fi
echo "OK: both products created with the expected margin flags."

# --- Step 4: List ALL products — expect 2 with calculated margins ---
echo
echo "--- Step 4: List all products (expecting 2) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/products" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

LIST_COUNT=$(echo "$RESPONSE" | jq -r 'length')
if [ "$LIST_COUNT" != "2" ]; then
  echo "ERROR: expected 2 products, got $LIST_COUNT. Aborting." >&2
  exit 1
fi

# Sanity-check: every row carries both calculated fields.
HAS_MARGIN=$(echo "$RESPONSE" | jq -r '[.[] | has("margin")] | all')
HAS_FLAG=$(echo "$RESPONSE" | jq -r '[.[] | has("isMarginBelowDesired")] | all')
if [ "$HAS_MARGIN" != "true" ] || [ "$HAS_FLAG" != "true" ]; then
  echo "ERROR: list response is missing margin/isMarginBelowDesired on at least one row. Aborting." >&2
  exit 1
fi
echo "OK: 2 products returned, each with calculated margin + flag."

# --- Step 5: Filter by status=active — expect both ---
echo
echo "--- Step 5: Filter by status=active (expecting 2) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/products?status=active" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

ACTIVE_COUNT=$(echo "$RESPONSE" | jq -r 'length')
if [ "$ACTIVE_COUNT" != "2" ]; then
  echo "ERROR: expected 2 active products, got $ACTIVE_COUNT. Aborting." >&2
  exit 1
fi

# --- Step 6: GET single product (Product A) ---
echo
echo "--- Step 6: GET single product ($PRODUCT_A_ID) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/products/$PRODUCT_A_ID" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

FETCHED_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ "$FETCHED_ID" != "$PRODUCT_A_ID" ]; then
  echo "ERROR: GET returned wrong id (expected $PRODUCT_A_ID, got $FETCHED_ID). Aborting." >&2
  exit 1
fi

# --- Step 7: Update price (Product A: 10 -> 20, margin should jump) ---
echo
echo "--- Step 7: PUT update Product A price ---"
RESPONSE=$(curl -s -X PUT "$API/v1/meis/$MEI_ID/products/$PRODUCT_A_ID" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Espresso","cost":4.00,"price":20.00,"desiredMargin":30,"status":"active"}')
echo "$RESPONSE" | jq . || echo "$RESPONSE"

UPDATED_PRICE=$(echo "$RESPONSE" | jq -r '.price')
if [ "$UPDATED_PRICE" != "20.00" ] && [ "$UPDATED_PRICE" != "20" ]; then
  echo "ERROR: PUT did not update the price (got '$UPDATED_PRICE'). Aborting." >&2
  exit 1
fi
echo "OK: price updated to $UPDATED_PRICE; new margin should be 80%."

# --- Step 8: Delete Product A (expecting 204) ---
echo
echo "--- Step 8: DELETE Product A (expecting 204) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$API/v1/meis/$MEI_ID/products/$PRODUCT_A_ID" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "204" ]; then
  echo "ERROR: expected 204 from DELETE, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 9: Confirm deletion (expecting 404) ---
echo
echo "--- Step 9: GET deleted product (expecting 404) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API/v1/meis/$MEI_ID/products/$PRODUCT_A_ID" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "404" ]; then
  echo "OK: deleted product is gone."
else
  echo "ERROR: expected 404 after delete, got $STATUS." >&2
  exit 1
fi
