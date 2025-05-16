#!/bin/bash

CERT_DIR="./src/secret/certs"
mkdir -p "$CERT_DIR"

CRT_FILE="$CERT_DIR/server.crt"
KEY_FILE="$CERT_DIR/server.key"

if [[ ! -f "$CRT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "[vault.sh] Génération du certificat auto-signé..."
  openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost"
else
  echo "[vault.sh] Certificat déjà présent, aucune génération nécessaire."
fi

# Ensuite, exécuter la commande passée en argument (nodemon ./src/server)
echo "[vault.sh] Lancement de la commande : $@"
exec "$@"
