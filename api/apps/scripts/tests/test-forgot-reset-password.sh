#!/usr/bin/env bash
# End-to-end smoke test for the forgot/reset-password vertical slice.
#
# Usage:
#   ./test-forgot-reset-password.sh                # runs steps 1–3 (no token)
#   ./test-forgot-reset-password.sh <reset-token>  # runs steps 1–6 (full flow)
#
# Steps 1–3 don't need the token. Step 4+ needs the opaque reset token
# pulled from the `password_reset_tokens` table after step 2 fires — that's
# the same string Resend would email the user; this script just asks you
# to fetch it manually.
#
# Requires: curl, jq.

set -uo pipefail

API="http://127.0.0.1:8080"
NAME="Reset Test User"
EMAIL="reset-test@lumemei.com.br"
OLD_PASSWORD="test123"
NEW_PASSWORD="newpass123"

# Optional first argument: the reset token to redeem in step 4.
RESET_TOKEN="${1:-}"

# --- Step 1: Register a fresh user (idempotent) ---
echo "--- Step 1: Register fresh user ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$OLD_PASSWORD\"}")
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

# --- Step 2: forgot-password for the real email (expecting 200) ---
echo
echo "--- Step 2: forgot-password (existing email; expecting 200) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 from forgot-password, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 3: forgot-password for a NON-existent email (expecting 200, silent) ---
# This is the user-enumeration defence: a non-registered email must produce
# the SAME response shape as a registered one. Any divergence is a bug.
echo
echo "--- Step 3: forgot-password (unknown email; expecting 200) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody-here-12345@example.invalid"}')
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 (silent) from unknown-email forgot-password, got $STATUS. Aborting." >&2
  exit 1
fi
echo "OK: unknown-email forgot-password returned 200 as required (no user enumeration)."

# --- Step 4 prompt: token must come from the DB ---
if [ -z "$RESET_TOKEN" ]; then
  echo
  echo "============================================================"
  echo "MANUAL STEP — retrieve the reset token from the database."
  echo
  echo "Run this in psql / Supabase SQL editor:"
  echo
  echo "  SELECT token"
  echo "    FROM password_reset_tokens t"
  echo "    JOIN users u ON u.id = t.user_id"
  echo "   WHERE u.email = '$EMAIL'"
  echo "     AND t.is_used = false"
  echo "     AND t.expires_at > NOW()"
  echo "   ORDER BY t.created_at DESC"
  echo "   LIMIT 1;"
  echo
  echo "Then re-run this script passing the token as the first argument:"
  echo
  echo "  $0 <reset-token>"
  echo "============================================================"
  echo
  echo "Stopping here. Steps 1–3 passed."
  exit 0
fi

# --- Step 4: reset-password with the supplied token ---
echo
echo "--- Step 4: reset-password (expecting 200) ---"
# IMPORTANT: the token is base64 and may contain '+', '/', '=' — we use
# jq's @json filter to safely embed it inside the JSON body. Encoding it
# by hand via printf or sed risks shell-quoting bugs.
BODY_JSON=$(jq -nc --arg t "$RESET_TOKEN" --arg p "$NEW_PASSWORD" '{token:$t, newPassword:$p}')
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "$BODY_JSON")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" != "200" ]; then
  echo "ERROR: expected 200 from reset-password, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 5: Login with the OLD password — must FAIL (expecting 401) ---
echo
echo "--- Step 5: Login with OLD password (expecting 401) ---"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$OLD_PASSWORD\"}")
STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed '$d')
echo "HTTP $STATUS"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq . || echo "$BODY"
fi
if [ "$STATUS" = "401" ]; then
  echo "OK: old password rejected as expected."
else
  echo "ERROR: expected 401 from old-password login, got $STATUS. Aborting." >&2
  exit 1
fi

# --- Step 6: Login with the NEW password — must SUCCEED (expecting 200 + token) ---
echo
echo "--- Step 6: Login with NEW password (expecting 200 + token) ---"
RESPONSE=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEW_PASSWORD\"}")
echo "$RESPONSE" | jq . || echo "$RESPONSE"

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "ERROR: new-password login failed — no accessToken in response. Aborting." >&2
  exit 1
fi
echo "OK: new-password login succeeded; password reset flow works end-to-end."
