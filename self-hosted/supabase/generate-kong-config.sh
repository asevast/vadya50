#!/bin/bash
# Generate kong.yml with actual API keys from .env
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
KONG_TEMPLATE="$SCRIPT_DIR/kong/kong.yml.template"
KONG_OUTPUT="$SCRIPT_DIR/kong/kong.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

if [ ! -f "$KONG_TEMPLATE" ]; then
  echo "Error: kong.yml.template not found at $KONG_TEMPLATE"
  exit 1
fi

# Source env vars
set -a
source "$ENV_FILE"
set +a

# Substitute variables
sed \
  -e "s|\${ANON_KEY}|$ANON_KEY|g" \
  -e "s|\${SERVICE_ROLE_KEY}|$SERVICE_ROLE_KEY|g" \
  "$KONG_TEMPLATE" > "$KONG_OUTPUT"

echo "Generated kong.yml with API keys"
