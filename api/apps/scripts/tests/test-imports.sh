#!/usr/bin/env bash
# End-to-end smoke test for the Imports vertical slice.
# Registers a fresh user, creates a MEI, builds a tiny CSV locally,
# uploads it, lists imports, and fetches the single import by id.
#
# IMPORTANT: this script exercises the FULL flow end-to-end. It assumes:
#   - The .NET API is running on http://127.0.0.1:8080
#   - The FastAPI classifier is running on http://localhost:8000
#   - Supabase Storage credentials are configured (SupabaseStorage:Url
#     and SupabaseStorage:ServiceRoleKey in appsettings.Development.json)
#   - The "imports" bucket exists in Supabase and is public.
# If any of those is missing the upload step will produce a 500 / error
# import instead of a clean "completed".
#
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
NAME="Imports Test"
EMAIL="imports-test@lumemei.com.br"
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

# --- Step 2: Create the MEI that will own the import ---
# Unique CNPJ per run avoids the global meis_cnpj_key unique constraint
# on reruns.
echo
echo "--- Step 2: Create MEI ---"
CNPJ_SUFFIX=$(date +%H%M%S)
RESPONSE=$(curl -s -X POST "$API/v1/meis" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Imports Test MEI\",\"cnpj\":\"77665544$CNPJ_SUFFIX\",\"cnae\":\"4751201\",\"annualLimit\":81000,\"plan\":\"free\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

MEI_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$MEI_ID" ] || [ "$MEI_ID" = "null" ]; then
  echo "ERROR: Failed to create MEI. Aborting." >&2
  exit 1
fi

# --- Step 3: Build a sample CSV locally ---
# 3 income rows + 1 expense row, dates within the current month.
# The header row is included so FastAPI can column-map without guessing.
echo
echo "--- Step 3: Build sample CSV ---"
CSV_FILE=$(mktemp --suffix=.csv)
cat > "$CSV_FILE" <<'CSVEOF'
date,description,type,amount,category
2026-05-02,Sale of artisanal bread,income,150.00,sales
2026-05-04,Catering for office event,income,800.00,services
2026-05-07,Supplier payment - flour,expense,200.00,supplies
2026-05-10,Cake delivery,income,75.00,sales
CSVEOF
echo "Wrote sample CSV to: $CSV_FILE"
cat "$CSV_FILE"

# --- Step 4: Upload the CSV ---
# multipart/form-data with the field name "file". Expect 201 Created
# with the import payload (includes id, status, totalRows,
# processedRows, errors).
echo
echo "--- Step 4: Upload CSV via POST /v1/meis/$MEI_ID/imports ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/meis/$MEI_ID/imports" \
  -H "$AUTH_HEADER" \
  -F "file=@${CSV_FILE};type=text/csv")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "201" ]; then
  echo "ERROR: expected 201 from upload, got $STATUS. Aborting." >&2
  rm -f "$CSV_FILE"
  exit 1
fi

# Pluck the fields the spec asks us to print.
IMPORT_ID=$(echo "$BODY" | jq -r '.id')
IMPORT_STATUS=$(echo "$BODY" | jq -r '.status')
TOTAL_ROWS=$(echo "$BODY" | jq -r '.totalRows')
PROCESSED_ROWS=$(echo "$BODY" | jq -r '.processedRows')
echo
echo "Import summary:"
echo "  id              : $IMPORT_ID"
echo "  status          : $IMPORT_STATUS"
echo "  totalRows       : $TOTAL_ROWS"
echo "  processedRows   : $PROCESSED_ROWS"

if [ -z "$IMPORT_ID" ] || [ "$IMPORT_ID" = "null" ]; then
  echo "ERROR: could not read import id from response. Aborting." >&2
  rm -f "$CSV_FILE"
  exit 1
fi

# --- Step 5: List all imports for the MEI ---
# Expect at least one entry (the one we just created).
echo
echo "--- Step 5: List imports ---"
RESPONSE=$(curl -s -X GET "$API/v1/meis/$MEI_ID/imports" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

LIST_COUNT=$(echo "$RESPONSE" | jq -r 'length')
if [ "$LIST_COUNT" -lt 1 ]; then
  echo "ERROR: expected at least 1 import in the list, got $LIST_COUNT. Aborting." >&2
  rm -f "$CSV_FILE"
  exit 1
fi

# --- Step 6: Fetch the single import by id ---
echo
echo "--- Step 6: Get single import by id ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "$API/v1/meis/$MEI_ID/imports/$IMPORT_ID" \
  -H "$AUTH_HEADER")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 from GET-by-id, got $STATUS. Aborting." >&2
  rm -f "$CSV_FILE"
  exit 1
fi

# Sanity check: the id we got back matches the one we created.
GOT_ID=$(echo "$BODY" | jq -r '.id')
if [ "$GOT_ID" != "$IMPORT_ID" ]; then
  echo "ERROR: GET-by-id returned id '$GOT_ID', expected '$IMPORT_ID'. Aborting." >&2
  rm -f "$CSV_FILE"
  exit 1
fi
echo "OK: GET-by-id returned the same import."

rm -f "$CSV_FILE"
echo
echo "--- Imports smoke test complete ---"
