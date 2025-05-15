import fs from 'fs';
import vault from 'node-vault';

const vaultClient = vault({
  endpoint: 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN,
});

async function putCertsToVault() {
  try {


    await vaultClient.write('secret/data/certs', {
      data: {
        server_key: serverKey,
        server_crt: serverCrt,
      },
    });

    console.log('✅ Certificats ajoutés à Vault');
  } catch (err) {
    console.error('Erreur ajout certifs dans Vault:', err.response?.statusCode || err.message);
  }
}

async function getCertsFromVault() {
  try {
    const secret = await vaultClient.read('secret/data/certs');
    const { server_key, server_crt } = secret.data.data;
    console.log('Certificat key:', server_key.slice(0, 30), '...');
    console.log('Certificat crt:', server_crt.slice(0, 30), '...');
    return { server_key, server_crt };
  } catch (err) {
    console.error('Erreur lecture certifs depuis Vault:', err.response?.statusCode || err.message);
    return null;
  }
}

export { putCertsToVault, getCertsFromVault };
export default vaultClient;