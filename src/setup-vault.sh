#!/bin/bash

# === CONFIGURATION ===
CERT_DIR="./src/secret/certs"
CRT_FILE="$CERT_DIR/server.crt"
KEY_FILE="$CERT_DIR/server.key"
VAULT_ADDR="http://127.0.0.1:8200"

export VAULT_ADDR

mkdir -p "$CERT_DIR"

# === 1. Lancer Vault dans un nouveau terminal ===
echo "[vault.sh] Lancement de Vault (mode dev)..."
gnome-terminal -- bash -c "export VAULT_ADDR=$VAULT_ADDR; vault server -dev; exec bash"

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

# === 4. Stocker dans Vault (plaintext, pas de base64) ===
echo "[vault.sh] Stockage dans Vault..."
vault kv put secret/certs \
  server.crt=@"$CRT_FILE" \
  server.key=@"$KEY_FILE"

echo "[vault.sh] ✅ Certificats stockés avec succès."

# === 5. Ouvrir un autre terminal pour faire vault kv get ===
echo "[vault.sh] Ouverture d’un second terminal pour vérification..."
gnome-terminal -- bash -c "export VAULT_ADDR=$VAULT_ADDR; vault kv get secret/certs; exec bash"

echo "[vault.sh] 🚀 Tout est prêt."
