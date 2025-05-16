// src/vault.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vault from 'node-vault';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vaultClient = vault({
  endpoint: 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN,
});

// Charger les certificats depuis le système de fichiers
function loadCertFiles() {
  const keyPath = path.join(__dirname, './src/secret/certs/server.key');
  const crtPath = path.join(__dirname, './src/secret/certs/server.crt');
  const serverKey = fs.readFileSync(keyPath, 'utf8');
  const serverCrt = fs.readFileSync(crtPath, 'utf8');
  return { serverKey, serverCrt };
}

// Écrire les certificats dans Vault
async function putCertsToVault() {
  try {
    const { serverKey, serverCrt } = loadCertFiles();

    await vaultClient.write('secret/data/certs', {
      data: {
        server_key: serverKey,
        server_crt: serverCrt,
      },
    });

    console.log('✅ Certificats ajoutés à Vault');
  } catch (err) {
    console.error('❌ Erreur ajout certifs dans Vault:', err.response?.statusCode || err.message);
  }
}

// Lire les certificats depuis Vault
async function getCertsFromVault() {
  try {
    const secret = await vaultClient.read('secret/data/certs');
    const { server_key, server_crt } = secret.data.data;
    console.log('📥 Certificat key:', server_key.slice(0, 30), '...');
    console.log('📥 Certificat crt:', server_crt.slice(0, 30), '...');
    return { server_key, server_crt };
  } catch (err) {
    console.error('❌ Erreur lecture certifs depuis Vault:', err.response?.statusCode || err.message);
    return null;
  }
}

export { putCertsToVault, getCertsFromVault };
export default vaultClient;
