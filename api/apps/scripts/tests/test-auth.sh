#!/usr/bin/env bash
# End-to-end smoke test for the Auth vertical slices.
# Exercises register -> login -> /me -> refresh -> logout -> confirm-revoked.
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
NAME="Test User"
EMAIL="test@lumemei.com"
PASSWORD="test123"

# --- Step 1: Register ---
# Non-critical: a "409 email already taken" is fine (the user might exist
# from a previous run). Anything else still gets printed; we move on.
echo "--- Step 1: Register ---"
REGISTER_BODY_FILE=$(mktemp)
REGISTER_STATUS=$(curl -s -o "$REGISTER_BODY_FILE" -w "%{http_code}" \
  -X POST "$API/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "HTTP $REGISTER_STATUS"
REGISTER_BODY=$(cat "$REGISTER_BODY_FILE")
rm -f "$REGISTER_BODY_FILE"
if [ -n "$REGISTER_BODY" ]; then
  echo "$REGISTER_BODY" | jq . || echo "$REGISTER_BODY"
fi

if [ "$REGISTER_STATUS" = "409" ]; then
  echo "WARNING: email '$EMAIL' is already registered — continuing with existing account." >&2
elif [ "$REGISTER_STATUS" != "201" ]; then
  echo "WARNING: unexpected register status $REGISTER_STATUS — continuing anyway." >&2
fi

# --- Step 2: Login ---
echo
echo "--- Step 2: Login ---"
LOGIN_RESPONSE=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RESPONSE" | jq . || echo "$LOGIN_RESPONSE"

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

if [ -z "$ACCESS_TOKEN" ] || [ -z "$REFRESH_TOKEN" ]; then
  echo "ERROR: Login failed or tokens are empty. Aborting." >&2
  exit 1
fi

# --- Step 3: Get Me ---
echo
echo "--- Step 3: Get Me ---"
ME_RESPONSE=$(curl -s -X GET "$API/v1/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$ME_RESPONSE" | jq . || echo "$ME_RESPONSE"

# --- Step 4: Refresh ---
# Critical: the next two steps depend on the rotated tokens.
echo
echo "--- Step 4: Refresh ---"
REFRESH_RESPONSE=$(curl -s -X POST "$API/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$REFRESH_TOKEN\"}")
echo "$REFRESH_RESPONSE" | jq . || echo "$REFRESH_RESPONSE"

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.refreshToken')

if [ -z "$NEW_ACCESS_TOKEN" ] || [ -z "$NEW_REFRESH_TOKEN" ]; then
  echo "ERROR: Refresh failed or rotated tokens are empty. Aborting." >&2
  exit 1
fi

# Sanity check: rotation MUST hand back a NEW refresh token, never the old one.
if [ "$NEW_REFRESH_TOKEN" = "$REFRESH_TOKEN" ]; then
  echo "ERROR: refresh did not rotate the token (got the same value back)." >&2
  exit 1
fi

# --- Step 5: Logout ---
# Sends the NEW refresh token (the one rotation just issued) and uses the
# NEW access token to authenticate the request — /v1/auth/logout requires
# [Authorize].
echo
echo "--- Step 5: Logout ---"
LOGOUT_BODY_FILE=$(mktemp)
LOGOUT_STATUS=$(curl -s -o "$LOGOUT_BODY_FILE" -w "%{http_code}" \
  -X POST "$API/v1/auth/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$NEW_REFRESH_TOKEN\"}")
echo "HTTP $LOGOUT_STATUS"
LOGOUT_BODY=$(cat "$LOGOUT_BODY_FILE")
rm -f "$LOGOUT_BODY_FILE"
if [ -n "$LOGOUT_BODY" ]; then
  echo "$LOGOUT_BODY" | jq . || echo "$LOGOUT_BODY"
fi

# --- Step 6: Confirm logout (expecting 401) ---
# Re-using the just-revoked refresh token must be rejected.
echo
echo "--- Step 6: Confirm logout (expecting 401) ---"
CONFIRM_BODY_FILE=$(mktemp)
CONFIRM_STATUS=$(curl -s -o "$CONFIRM_BODY_FILE" -w "%{http_code}" \
  -X POST "$API/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$NEW_REFRESH_TOKEN\"}")
echo "HTTP $CONFIRM_STATUS"
CONFIRM_BODY=$(cat "$CONFIRM_BODY_FILE")
rm -f "$CONFIRM_BODY_FILE"
if [ -n "$CONFIRM_BODY" ]; then
  echo "$CONFIRM_BODY" | jq . || echo "$CONFIRM_BODY"
fi

if [ "$CONFIRM_STATUS" = "401" ]; then
  echo "OK: revoked refresh token was rejected as expected."
else
  echo "ERROR: expected 401 from revoked-token refresh, got $CONFIRM_STATUS." >&2
  exit 1
fi
