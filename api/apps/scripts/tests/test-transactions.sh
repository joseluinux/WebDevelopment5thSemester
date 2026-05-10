#!/usr/bin/env bash
# End-to-end smoke test for the Transactions vertical slice.
# Registers a fresh user, creates a MEI, exercises full transaction CRUD
# with filtering, and confirms deletion.
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:5027"
NAME="Transactions Test"
EMAIL="transactions-test@lumemei.com"
PASSWORD="test123"

# Today's date in ISO format — used for the three transactions below.
TODAY=$(date +%F)

# --- Setup: register the fresh test account (idempotent) ---
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

# --- Step 2: Create the MEI that will own the transactions ---
# Each run uses a unique CNPJ (timestamp suffix) so reruns don't collide
# with the global `meis_cnpj_key` unique index.
echo
echo "--- Step 2: Create MEI ---"
CNPJ_SUFFIX=$(date +%H%M%S)
RESPONSE=$(curl -s -X POST "$API/v1/meis" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Tx Test MEI\",\"cnpj\":\"99888777$CNPJ_SUFFIX\",\"cnae\":\"6201500\",\"annualLimit\":81000,\"plan\":\"free\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

MEI_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$MEI_ID" ] || [ "$MEI_ID" = "null" ]; then
  echo "ERROR: Failed to create MEI. Aborting." >&2
  exit 1
fi

# --- Step 3: Create three transactions (2 income + 1 expense) ---
echo
echo "--- Step 3a: Create transaction #1 (income) ---"
RESPONSE=$(curl -s -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"income\",\"category\":\"Sales\",\"amount\":250.00,\"date\":\"$TODAY\",\"description\":\"Customer A\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"
TX1_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$TX1_ID" ] || [ "$TX1_ID" = "null" ]; then
  echo "ERROR: Failed to create transaction #1. Aborting." >&2
  exit 1
fi

echo
echo "--- Step 3b: Create transaction #2 (income) ---"
RESPONSE=$(curl -s -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"income\",\"category\":\"Services\",\"amount\":480.00,\"date\":\"$TODAY\",\"description\":\"Customer B\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

echo
echo "--- Step 3c: Create transaction #3 (expense) ---"
RESPONSE=$(curl -s -X POST "$API/v1/meis/$MEI_ID/transactions" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"category\":\"Supplies\",\"amount\":75.00,\"date\":\"$TODAY\",\"description\":\"Inventory\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

# --- Step 4: List ALL transactions — expect 3 ---
echo
echo "--- Step 4: List all transactions (expecting 3) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/transactions" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

LIST_COUNT=$(echo "$RESPONSE" | jq -r 'length')
if [ "$LIST_COUNT" != "3" ]; then
  echo "ERROR: expected 3 transactions, got $LIST_COUNT. Aborting." >&2
  exit 1
fi
echo "OK: 3 transactions returned."

# --- Step 5: Filter by type=income — expect 2 ---
echo
echo "--- Step 5: Filter by type=income (expecting 2) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/transactions?type=income" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

INCOME_COUNT=$(echo "$RESPONSE" | jq -r 'length')
if [ "$INCOME_COUNT" != "2" ]; then
  echo "ERROR: expected 2 income transactions, got $INCOME_COUNT. Aborting." >&2
  exit 1
fi
echo "OK: 2 income transactions returned."

# --- Step 6: Get a single transaction by id ---
echo
echo "--- Step 6: GET single transaction ($TX1_ID) ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/transactions/$TX1_ID" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

FETCHED_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ "$FETCHED_ID" != "$TX1_ID" ]; then
  echo "ERROR: GET returned wrong id (expected $TX1_ID, got $FETCHED_ID). Aborting." >&2
  exit 1
fi

# --- Step 7: Update the transaction ---
echo
echo "--- Step 7: PUT update transaction ($TX1_ID) ---"
RESPONSE=$(curl -s -X PUT "$API/v1/meis/$MEI_ID/transactions/$TX1_ID" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"income\",\"category\":\"Sales\",\"amount\":300.00,\"date\":\"$TODAY\",\"description\":\"Customer A (revised)\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

UPDATED_AMOUNT=$(echo "$RESPONSE" | jq -r '.amount')
if [ "$UPDATED_AMOUNT" != "300.00" ] && [ "$UPDATED_AMOUNT" != "300" ]; then
  echo "ERROR: PUT did not update the amount (got '$UPDATED_AMOUNT'). Aborting." >&2
  exit 1
fi
echo "OK: amount updated to $UPDATED_AMOUNT."

# --- Step 8: Delete the transaction (expecting 204) ---
echo
echo "--- Step 8: DELETE transaction $TX1_ID (expecting 204) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$API/v1/meis/$MEI_ID/transactions/$TX1_ID" \
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
echo "--- Step 9: GET deleted transaction (expecting 404) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API/v1/meis/$MEI_ID/transactions/$TX1_ID" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "404" ]; then
  echo "OK: deleted transaction is gone."
else
  echo "ERROR: expected 404 after delete, got $STATUS." >&2
  exit 1
fi
