#!/bin/bash

# === CONFIGURATION ===
CERT_DIR="./src/secret/certs"
CRT_FILE="$CERT_DIR/server.crt"
KEY_FILE="$CERT_DIR/server.key"
VAULT_ADDR="http://127.0.0.1:8200"
VAULT_VERSION="1.15.4"
VAULT_ZIP="vault_${VAULT_VERSION}_linux_amd64.zip"
VAULT_URL="https://releases.hashicorp.com/vault/${VAULT_VERSION}/${VAULT_ZIP}"
BIN_DIR="./bin"
VAULT_BIN="${BIN_DIR}/vault"

export VAULT_ADDR

mkdir -p "$CERT_DIR" "$BIN_DIR"

# === 0. Télécharger Vault si non présent ===
if [ ! -f "$VAULT_BIN" ]; then
  echo "[vault.sh] Téléchargement de Vault ${VAULT_VERSION}..."
  curl -o "$BIN_DIR/$VAULT_ZIP" "$VAULT_URL"
  echo "[vault.sh] Extraction..."
  unzip "$BIN_DIR/$VAULT_ZIP" -d "$BIN_DIR"
  rm "$BIN_DIR/$VAULT_ZIP"
  chmod +x "$VAULT_BIN"
else
  echo "[vault.sh] Vault déjà présent dans $BIN_DIR"
fi

# === 1. Lancer Vault en tâche de fond (mode dev) ===
echo "[vault.sh] Lancement de Vault (mode dev) en tâche de fond..."
"$VAULT_BIN" server -dev 2>&1 &
VAULT_PID=$!

# === 2. Attendre que Vault soit prêt ===
echo "[vault.sh] Attente de la disponibilité de Vault..."
until curl -s "$VAULT_ADDR/v1/sys/health" > /dev/null; do
  sleep 1
done
echo "[vault.sh] ✅ Vault est prêt."

# === 3. Générer un certificat auto-signé ===
echo "[vault.sh] Génération du certificat..."
openssl req -x509 -newkey rsa:2048 -sha256 -days 365 \
  -nodes \
  -keyout "$KEY_FILE" \
  -out "$CRT_FILE" \
  -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost"

# === 4. Stocker les certificats dans Vault ===
echo "[vault.sh] Stockage dans Vault..."
"$VAULT_BIN" kv put secret/certs \
  server.crt=@"$CRT_FILE" \
  server.key=@"$KEY_FILE"

echo "[vault.sh] 🔄 Vault tourne en arrière-plan avec le PID $VAULT_PID"

# Optionnel : kill Vault à la fin du script
# kill $VAULT_PID

# VAULT_TOKEN=$(grep 'Root Token:' vault.log | awk '{print $NF}')
# export VAULT_TOKEN
# export VAULT_ADDR="http://127.0.0.1:8200"
# ./bin/vault kv get secret/certs