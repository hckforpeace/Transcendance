##!/bin/sh
set -e

# Source environment variables if the file exists
if [ -f "/app/env.sh" ]; then
    echo "Sourcing environment variables from /app/env.sh"
    . /app/env.sh
else
    echo "Warning: /app/env.sh not found - proceeding without environment variables"
fi

# Run the command (npm run start by default)
echo "Starting application..."
exec "$@" #!/bin/sh

# # Wait until init.json exists
# while [ ! -f /vault/init.json ]; do
#   echo "Waiting for /vault/init.json..."
#   sleep 1
# done

# # Extract VAULT_TOKEN from init.json
# export VAULT_TOKEN=$(jq -r '.root_token' /vault/init.json)
