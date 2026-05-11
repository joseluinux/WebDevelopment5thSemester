#!/usr/bin/env bash
# End-to-end smoke test for the Users vertical slice.
# Exercises GET/PUT/DELETE on /v1/users/me and verifies the account is gone.
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
NAME="Test User"
EMAIL="test@lumemei.com"
PASSWORD="test123"

# --- Setup: register the account (idempotent, never aborts) ---
# 201 = freshly created; 409 = already exists from a prior run; either way
# we keep going. We append a sentinel to capture both body and status code
# in a single curl call.
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

# --- Step 2: GET /v1/users/me ---
echo
echo "--- Step 2: GET /v1/users/me ---"
RESPONSE=$(curl -s -X GET "$API/v1/users/me" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

PROFILE_EMAIL=$(echo "$RESPONSE" | jq -r '.email')
if [ -z "$PROFILE_EMAIL" ] || [ "$PROFILE_EMAIL" = "null" ]; then
  echo "ERROR: GET /me did not return an email. Aborting." >&2
  exit 1
fi

# --- Step 3: PUT /v1/users/me (rename) ---
# Email is sent unchanged on purpose — PUT is a full replace and the
# handler treats omitted/null fields literally.
echo
echo "--- Step 3: PUT /v1/users/me (rename) ---"
RESPONSE=$(curl -s -X PUT "$API/v1/users/me" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User Updated\",\"email\":\"$EMAIL\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

UPDATED_NAME=$(echo "$RESPONSE" | jq -r '.name')
if [ -z "$UPDATED_NAME" ] || [ "$UPDATED_NAME" = "null" ]; then
  echo "ERROR: PUT /me did not return an updated name. Aborting." >&2
  exit 1
fi
if [ "$UPDATED_NAME" != "Test User Updated" ]; then
  echo "ERROR: PUT response carries the wrong name (got '$UPDATED_NAME'). Aborting." >&2
  exit 1
fi

# --- Step 4: GET /v1/users/me (confirm the rename was persisted) ---
echo
echo "--- Step 4: GET /v1/users/me (confirm rename) ---"
RESPONSE=$(curl -s -X GET "$API/v1/users/me" -H "$AUTH_HEADER")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

PERSISTED_NAME=$(echo "$RESPONSE" | jq -r '.name')
if [ -z "$PERSISTED_NAME" ] || [ "$PERSISTED_NAME" = "null" ]; then
  echo "ERROR: confirmation GET did not return a name. Aborting." >&2
  exit 1
fi
if [ "$PERSISTED_NAME" != "Test User Updated" ]; then
  echo "ERROR: rename was not persisted (got '$PERSISTED_NAME'). Aborting." >&2
  exit 1
fi

# --- Step 5: DELETE /v1/users/me (expecting 204) ---
echo
echo "--- Step 5: DELETE /v1/users/me (expecting 204) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$API/v1/users/me" -H "$AUTH_HEADER")
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

# --- Step 6: Login again — must FAIL (expecting 401) ---
# Confirms the account (and its credentials) really are gone.
echo
echo "--- Step 6: Login again (expecting 401) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "401" ]; then
  echo "OK: deleted account can no longer log in."
else
  echo "ERROR: expected 401 from re-login on deleted account, got $STATUS." >&2
  exit 1
fi
