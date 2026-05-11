#!/usr/bin/env bash
# End-to-end smoke test for the MEI vertical slice.
# Logs in, runs the full CRUD lifecycle, and confirms that the deleted MEI is gone.
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
EMAIL="jose2@gmail.com"
PASSWORD="jose"

# --- Step 1: Login ---
echo "--- Step 1: Login ---"
LOGIN_RESPONSE=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RESPONSE" | jq . || echo "$LOGIN_RESPONSE"

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: Login failed or accessToken is empty. Aborting." >&2
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

# --- Step 2: Create MEI ---
echo
echo "--- Step 2: Create MEI ---"
CREATE_RESPONSE=$(curl -s -X POST "$API/v1/meis" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lanchonete do Jose","cnpj":"11222333000181","cnae":"5611201","annualLimit":81000,"plan":"free"}')
echo "$CREATE_RESPONSE" | jq . || echo "$CREATE_RESPONSE"

MEI_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')

# Treat both an empty value AND the literal string "null" (what `jq -r` prints
# when the field is missing) as failure — otherwise subsequent steps would
# blindly hit /v1/meis/null and fail far less obviously.
if [ -z "$MEI_ID" ] || [ "$MEI_ID" = "null" ]; then
  echo "ERROR: Failed to create MEI. Aborting." >&2
  exit 1
fi

# --- Step 3: List MEIs ---
echo
echo "--- Step 3: List MEIs ---"
LIST_RESPONSE=$(curl -s -X GET "$API/v1/meis" -H "$AUTH_HEADER")
echo "$LIST_RESPONSE" | jq . || echo "$LIST_RESPONSE"

# --- Step 4: Get single MEI ---
echo
echo "--- Step 4: Get single MEI ($MEI_ID) ---"
GET_RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID" -H "$AUTH_HEADER")
echo "$GET_RESPONSE" | jq . || echo "$GET_RESPONSE"

# --- Step 5: Update MEI ---
echo
echo "--- Step 5: Update MEI ($MEI_ID) ---"
UPDATE_RESPONSE=$(curl -s -X PUT "$API/v1/meis/$MEI_ID" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lanchonete do Jose Atualizada","cnae":"5611201","annualLimit":81000,"plan":"pro"}')
echo "$UPDATE_RESPONSE" | jq . || echo "$UPDATE_RESPONSE"

# --- Step 6: Delete MEI ---
echo
echo "--- Step 6: Delete MEI ($MEI_ID) ---"
DELETE_BODY_FILE=$(mktemp)
DELETE_STATUS=$(curl -s -o "$DELETE_BODY_FILE" -w "%{http_code}" \
  -X DELETE "$API/v1/meis/$MEI_ID" -H "$AUTH_HEADER")
echo "HTTP $DELETE_STATUS"
DELETE_BODY=$(cat "$DELETE_BODY_FILE")
rm -f "$DELETE_BODY_FILE"
if [ -n "$DELETE_BODY" ]; then
  echo "$DELETE_BODY" | jq . || echo "$DELETE_BODY"
fi

# --- Step 7: Confirm deletion (expecting 404) ---
echo
echo "--- Step 7: Confirm deletion (expecting 404) ---"
CONFIRM_BODY_FILE=$(mktemp)
CONFIRM_STATUS=$(curl -s -o "$CONFIRM_BODY_FILE" -w "%{http_code}" \
  -X GET "$API/v1/meis/$MEI_ID" -H "$AUTH_HEADER")
echo "HTTP $CONFIRM_STATUS"
CONFIRM_BODY=$(cat "$CONFIRM_BODY_FILE")
rm -f "$CONFIRM_BODY_FILE"
if [ -n "$CONFIRM_BODY" ]; then
  echo "$CONFIRM_BODY" | jq . || echo "$CONFIRM_BODY"
fi
