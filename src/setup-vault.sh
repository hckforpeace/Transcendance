#!/bin/bash
set -e

# Vérifier si Vault est déjà installé
if command -v vault &> /dev/null; then
  echo "✅ Vault est déjà installé."
  exit 0
fi

# Télécharger Vault
echo "➡️ Téléchargement de Vault..."
TMP_ZIP=$(mktemp)
curl -Lo "$TMP_ZIP" https://releases.hashicorp.com/vault/1.19.3/vault_1.19.3_linux_amd64.zip
unzip "$TMP_ZIP" -d ./vault_tmp
mkdir -p ~/bin
mv ./vault_tmp/vault ~/bin
rm -rf "$TMP_ZIP" ./vault_tmp

# Ajouter Vault au PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
export PATH="$HOME/bin:$PATH"

# Vérifier l'installation
vault --version

# Fichier de configuration
echo "➡️ Création du fichier de configuration de Vault..."
cat <<EOF > ./vault.hcl
storage "file" {
  path = "./vault-data"
}

listener "tcp" {
  address = "127.0.0.1:8200"
  tls_disable = 1
}

ui = true
EOF

# Lancer Vault
echo "➡️ Lancement de Vault..."
vault server -config=./vault.hcl &

# Attendre que Vault soit prêt
echo "⏳ Attente du démarrage de Vault..."
for i in {1..10}; do
  if curl -s http://127.0.0.1:8200/v1/sys/health &>/dev/null; then
    echo "✅ Vault est démarré."
    break
  fi
  sleep 1
done

# Initialiser Vault
echo "➡️ Initialisation de Vault..."
vault operator init > ./vault_init_output.txt

# Afficher l'output
cat ./vault_init_output.txt
