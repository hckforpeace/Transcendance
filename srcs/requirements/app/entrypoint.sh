# #!/bin/sh

# # Wait until init.json exists
# while [ ! -f /vault/init.json ]; do
#   echo "Waiting for /vault/init.json..."
#   sleep 1
# done

# # Extract VAULT_TOKEN from init.json
# export VAULT_TOKEN=$(jq -r '.root_token' /vault/init.json)
