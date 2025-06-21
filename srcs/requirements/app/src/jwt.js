import axios from 'axios';

const VAULT_ADDR =  'http://vault:8200';
const VAULT_TOKEN = process.env.VAULT_TOKEN; // Make sure this is set in your app env
const TRANSIT_KEY = 'jwt-signing-key';

// Helper to base64url encode
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Will sign a JWT using Vault's transit engine
async function signJWT(payload) {
  const header = {
    alg: "ECDSA256",
    typ: "JWT",
  };


  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  try {
    const response = await axios.post(
      `${VAULT_ADDR}/v1/transit/sign/${TRANSIT_KEY}`,
      { input: Buffer.from(signingInput).toString('base64') },
      {
        headers: {
          'X-Vault-Token': VAULT_TOKEN,
          'Content-Type': 'application/json',
        }
      }
    );

    // Extract Vault signature: format is "vault:v1:<base64sig>"
    const vaultSig = response.data.data.signature.split(':')[2];

    // Convert Vault base64 signature to base64url (for JWT)
    const signature = vaultSig
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const jwt = `${signingInput}.${signature}`;
    return jwt;
  } catch (error) {
    throw new Error(`Vault sign error: ${error.response?.data?.errors || error.message}`);
  }
}

// will verify a JWT using Vault's transit engine
async function verifyJWT(jwt) {
  const [header64, payload64, signature64] = jwt.split('.');

  // Convert JWT base64url signature back to base64
  const signatureBase64 = signature64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    + '='.repeat((4 - signature64.length % 4) % 4);

  const inputBase64 = Buffer.from(`${header64}.${payload64}`).toString('base64');

  const response = await axios.post(
    `${VAULT_ADDR}/v1/transit/verify/${TRANSIT_KEY}`,
    {
      input: inputBase64,
      signature: `vault:v1:${signatureBase64}`
    },
    {
      headers: {
        'X-Vault-Token': VAULT_TOKEN,
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data.data.valid;  // true or false
}

function decodeJWTPayload(jwt) {
  const payloadBase64Url = jwt.split('.')[1];

  const payloadBase64 = payloadBase64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    + '='.repeat((4 - payloadBase64Url.length % 4) % 4);

  const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
  return JSON.parse(payloadJson);
}


export default {signJWT, verifyJWT, decodeJWTPayload};
