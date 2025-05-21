#!/bin/bash

CERT_DIR="./src/secret/certs"
CRT_FILE="$CERT_DIR/server.crt"
KEY_FILE="$CERT_DIR/server.key"

mkdir -p "$CERT_DIR"

# Fonction pour générer et stocker les certificats dans Vault
generate_and_store() {
  echo "[vault.sh] Génération du certificat auto-signé..."
  openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost"

  echo "[vault.sh] Stockage des certificats dans Vault..."
  vault kv put secret/certs server.crt="$(base64 -w 0 < "$CRT_FILE")" server.key="$(base64 -w 0 < "$KEY_FILE")"
}

# Démarrage du script

echo "[vault.sh] Recherche des certificats dans Vault..."
VAULT_SECRET_JSON=$(vault kv get -format=json secret/certs 2>/dev/null)

if [ $? -eq 0 ]; then
  VAULT_CRT=$(echo "$VAULT_SECRET_JSON" | jq -r '.data.data["server.crt"]')
  VAULT_KEY=$(echo "$VAULT_SECRET_JSON" | jq -r '.data.data["server.key"]')

  if [[ -n "$VAULT_CRT" && -n "$VAULT_KEY" && "$VAULT_CRT" != "null" && "$VAULT_KEY" != "null" ]]; then
    echo "[vault.sh] Certificats trouvés dans Vault."
    echo "$VAULT_CRT" | base64 --decode > "$CRT_FILE"
    echo "$VAULT_KEY" | base64 --decode > "$KEY_FILE"
  else
    echo "[vault.sh] Certificats non trouvés ou vides dans Vault, génération locale..."
    generate_and_store
  fi
else
  echo "[vault.sh] Aucun secret trouvé dans Vault, génération locale..."
  generate_and_store
fi

if [[ ! -f "$CRT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "[vault.sh] Erreur : Les certificats ne sont pas disponibles localement."
  exit 1
fi

echo "[vault.sh] Certificats prêts, lancement de la commande : $@"
exec "$@"
