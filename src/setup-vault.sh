#!/bin/bash

# Variables
VAULT_VERSION="1.19.3"
VAULT_DIR="$HOME/vault-bin"
VAULT_BIN="$VAULT_DIR/vault"
VAULT_CONFIG="$VAULT_DIR/vault.hcl"
VAULT_DATA="$VAULT_DIR/vault-data"
INIT_FILE="$VAULT_DIR/vault_init_output.txt"
VAULT_ADDR="http://127.0.0.1:8200"

export VAULT_ADDR
export PATH="$VAULT_DIR:$PATH"

export VAULT_TOKEN=$(grep 'Initial Root Token:' ~/vault-bin/vault_init_output.txt | awk '{print $NF}')

# 1. Créer dossier Vault
mkdir -p "$VAULT_DIR"

# 2. Télécharger Vault si absent
if [ ! -f "$VAULT_BIN" ]; then
  echo "➡️ Téléchargement de Vault $VAULT_VERSION..."
  curl -Lo "$VAULT_DIR/vault.zip" "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip"
  
  echo "➡️ Extraction..."
  unzip -o "$VAULT_DIR/vault.zip" -d "$VAULT_DIR"
  rm "$VAULT_DIR/vault.zip"
  
  chmod +x "$VAULT_BIN"
fi

# 3. Créer fichier de config si absent
if [ ! -f "$VAULT_CONFIG" ]; then
  cat > "$VAULT_CONFIG" <<EOF
listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = 1
}

storage "file" {
  path = "$VAULT_DATA"
}

ui = true
EOF
fi

# 4. Lancer Vault en arrière-plan si pas déjà lancé
if ! pgrep -f "$VAULT_BIN server" > /dev/null; then
  echo "➡️ Lancement de Vault..."
  "$VAULT_BIN" server -config="$VAULT_CONFIG" > "$VAULT_DIR/vault.log" 2>&1 &
  
  # Attente que Vault soit prêt (max 20s)
  for i in {1..20}; do
    if curl --silent --fail "$VAULT_ADDR/v1/sys/health" > /dev/null; then
      echo "✅ Vault est prêt."
      break
    else
      echo "⏳ Attente de Vault ($i/20)..."
      sleep 1
    fi
  done
  
  if ! curl --silent --fail "$VAULT_ADDR/v1/sys/health" > /dev/null; then
    echo "❌ Vault n'a pas démarré correctement. Voir $VAULT_DIR/vault.log"
    exit 1
  fi
else
  echo "✅ Vault est déjà lancé."
fi

# 5. Initialiser Vault si besoin
if ! "$VAULT_BIN" status | grep -q "Initialized.*true"; then
  echo "➡️ Initialisation de Vault..."
  "$VAULT_BIN" operator init > "$INIT_FILE"
  cat "$INIT_FILE"
else
  echo "✅ Vault est déjà initialisé."
fi

# 6. Déverrouiller Vault si scellé
if "$VAULT_BIN" status | grep -q "Sealed.*true"; then
  echo "🔓 Déverrouillage de Vault..."
  i=0
  while read -r line && [ $i -lt 3 ]; do
    if [[ $line == "Unseal Key "* ]]; then
      key=$(echo "$line" | awk '{print $4}')
      "$VAULT_BIN" operator unseal "$key"
      ((i++))
    fi
  done < "$INIT_FILE"
else
  echo "✅ Vault est déjà déverrouillé."
fi

# 7. Login root token

echo "🔑 Login avec token root..."
"$VAULT_BIN" login "$VAULT_TOKEN" > /dev/null

vault secrets enable -path=secret -version=2 kv

cat ~/vault-bin/vault_init_output.txt | grep 'Initial Root Token:' | awk '{print $NF}'

echo "✅ Vault prêt à l'emploi."

 if [ -f ~/vault-bin/vault_init_output.txt ]; then
  export VAULT_ADDR=https://127.0.0.1:8200
  export VAULT_TOKEN=$(grep 'Initial Root Token:' ~/vault-bin/vault_init_output.txt | awk '{print $NF}')
fi