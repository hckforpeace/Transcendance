
# 1. Get Vault container IP (optional, if you need to set VAULT_ADDR)
export VAULT_ADDR=$(docker inspect vault | jq -r '.[0].NetworkSettings.Networks[].IPAddress')
echo "Vault IP: $VAULT_ADDR"

# 2. Install jq inside the container (only if not installed yet)
docker exec vault apk add --no-cache jq

# 3. Initialize Vault inside the container and save the output to a file on the host
docker exec vault vault operator init -key-shares=1 -key-threshold=1 -format=json > init.json

# 4. Extract unseal key and root token from the init.json on the host
UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' init.json)
ROOT_TOKEN=$(jq -r '.root_token' init.json)

# 5. Copy init.json into the container (optional, for future reference)
docker cp init.json vault:/vault/init.json

# 6. Unseal Vault inside the container
docker exec vault vault operator unseal "$UNSEAL_KEY"

# 7. Login inside the container — since environment variables don’t persist between exec calls, pass token directly:
docker exec vault vault login "$ROOT_TOKEN"

docker exec vault vault secrets enable transit 
docker exec vault vault write -f transit/keys/jwt-signing-key type=ecdsa-p256


#
# #!/bin/bash
# # 1. Get Vault container IP (optional, if you need to set VAULT_ADDR)
# export VAULT_ADDR=$(docker inspect vault | jq -r '.[0].NetworkSettings.Networks[].IPAddress')
# echo "Vault IP: $VAULT_ADDR"

# # 2. Install jq inside the container (only if not installed yet)
# docker exec vault apk add --no-cache jq

# # 3. Initialize Vault inside the container and save the output to a file on the host
# docker exec vault vault operator init -key-shares=1 -key-threshold=1 -format=json > init.json

# # 4. Extract unseal key and root token from the init.json on the host
# UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' init.json)
# ROOT_TOKEN=$(jq -r '.root_token' init.json)

# # 5. Copy init.json into the container (optional, for future reference)
# docker cp init.json vault:/vault/init.json

# # 6. Unseal Vault inside the container
# docker exec vault vault operator unseal "$UNSEAL_KEY"

# # 7. Login inside the container — since environment variables don’t persist between exec calls, pass token directly:
# docker exec vault vault login "$ROOT_TOKEN"
# docker exec vault vault secrets enable transit 
