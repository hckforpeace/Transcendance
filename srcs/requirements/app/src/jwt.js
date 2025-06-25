import axios from 'axios';

const VAULT_ADDR = 'http://vault:8200'; // or http://localhost:18200 if running locally
const VAULT_TOKEN = 'dev-token';
const TRANSIT_KEY = 'jwt-key'; // Match your vault script

// Helper to base64url encode
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper to convert base64url to base64
function base64urlToBase64(base64url) {
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
  const padding = 4 - (base64.length % 4);
  if (padding !== 4) {
    base64 += '='.repeat(padding);
  }
  
  return base64;
}

// Will sign a JWT using Vault's transit engine
async function signJWT(payload) {
  // Use RS256 since we're creating RSA keys in Vault
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  
  try {
    const response = await axios.post(
      `${VAULT_ADDR}/v1/transit/sign/${TRANSIT_KEY}/sha2-256`, // Note: added /sha2-256
      { 
        input: Buffer.from(signingInput).toString('base64'),
        signature_algorithm: 'pkcs1v15' // Explicit algorithm for RSA
      },
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
    console.error('Vault signing error:', error.response?.data || error.message);
    throw new Error(`Vault sign error: ${error.response?.data?.errors?.[0] || error.message}`);
  }
}

// Will verify a JWT using Vault's transit engine
async function verifyJWT(jwt) {
  try {
    const [header64, payload64, signature64] = jwt.split('.');
    
    if (!header64 || !payload64 || !signature64) {
      throw new Error('Invalid JWT format');
    }
    
    // Convert JWT base64url signature back to base64
    const signatureBase64 = base64urlToBase64(signature64);
    const inputBase64 = Buffer.from(`${header64}.${payload64}`).toString('base64');
    
    const response = await axios.post(
      `${VAULT_ADDR}/v1/transit/verify/${TRANSIT_KEY}/sha2-256`, // Note: added /sha2-256
      {
        input: inputBase64,
        signature: `vault:v1:${signatureBase64}`,
        signature_algorithm: 'pkcs1v15' // Explicit algorithm for RSA
      },
      {
        headers: {
          'X-Vault-Token': VAULT_TOKEN,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data.data.valid;
    
  } catch (error) {
    console.error('Vault verification error:', error.response?.data || error.message);
    throw new Error(`Vault verify error: ${error.response?.data?.errors?.[0] || error.message}`);
  }
}

// Decode JWT payload without verification
function decodeJWTPayload(jwt) {
  try {
    const payloadBase64Url = jwt.split('.')[1];
    if (!payloadBase64Url) {
      throw new Error('Invalid JWT format');
    }
    
    const payloadBase64 = base64urlToBase64(payloadBase64Url);
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(payloadJson);
    
  } catch (error) {
    throw new Error(`Failed to decode JWT payload: ${error.message}`);
  }
}

// Decode JWT header
function decodeJWTHeader(jwt) {
  try {
    const headerBase64Url = jwt.split('.')[0];
    if (!headerBase64Url) {
      throw new Error('Invalid JWT format');
    }
    
    const headerBase64 = base64urlToBase64(headerBase64Url);
    const headerJson = Buffer.from(headerBase64, 'base64').toString('utf-8');
    return JSON.parse(headerJson);
    
  } catch (error) {
    throw new Error(`Failed to decode JWT header: ${error.message}`);
  }
}

// Helper to create a standard JWT payload with common claims
function createJWTPayload(subject, additionalClaims = {}) {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    sub: subject,           // Subject
    iat: now,              // Issued at
    exp: now + (60 * 60),  // Expires in 1 hour
    ...additionalClaims
  };
}

export default {
  signJWT,
  verifyJWT,
  decodeJWTPayload,
  decodeJWTHeader,
  createJWTPayload
};// import axios from 'axios';

// const VAULT_ADDR =  'http://vault:8200';
// const VAULT_TOKEN = 'dev-token'; // Make sure this is set in your app env
// const TRANSIT_KEY = 'jwt-signing-key';

// // Helper to base64url encode
// function base64url(input) {
//   return Buffer.from(input)
//     .toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// }

// // Will sign a JWT using Vault's transit engine
// async function signJWT(payload) {
//   const header = {
//     alg: "ECDSA256",
//     typ: "JWT",
//   };


//   const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

//   try {
//     const response = await axios.post(
//       `${VAULT_ADDR}/v1/transit/sign/${TRANSIT_KEY}`,
//       { input: Buffer.from(signingInput).toString('base64') },
//       {
//         headers: {
//           'X-Vault-Token': VAULT_TOKEN,
//           'Content-Type': 'application/json',
//         }
//       }
//     );

//     // Extract Vault signature: format is "vault:v1:<base64sig>"
//     const vaultSig = response.data.data.signature.split(':')[2];

//     // Convert Vault base64 signature to base64url (for JWT)
//     const signature = vaultSig
//       .replace(/\+/g, '-')
//       .replace(/\//g, '_')
//       .replace(/=+$/, '');

//     const jwt = `${signingInput}.${signature}`;
//     return jwt;
//   } catch (error) {
//     throw new Error(`Vault sign error: ${error.response?.data?.errors || error.message}`);
//   }
// }

// // will verify a JWT using Vault's transit engine
// async function verifyJWT(jwt) {
//   const [header64, payload64, signature64] = jwt.split('.');

//   // Convert JWT base64url signature back to base64
//   const signatureBase64 = signature64
//     .replace(/-/g, '+')
//     .replace(/_/g, '/')
//     + '='.repeat((4 - signature64.length % 4) % 4);

//   const inputBase64 = Buffer.from(`${header64}.${payload64}`).toString('base64');

//   const response = await axios.post(
//     `${VAULT_ADDR}/v1/transit/verify/${TRANSIT_KEY}`,
//     {
//       input: inputBase64,
//       signature: `vault:v1:${signatureBase64}`
//     },
//     {
//       headers: {
//         'X-Vault-Token': VAULT_TOKEN,
//         'Content-Type': 'application/json',
//       }
//     }
//   );

//   return response.data.data.valid;  // true or false
// }

// function decodeJWTPayload(jwt) {
//   const payloadBase64Url = jwt.split('.')[1];

//   const payloadBase64 = payloadBase64Url
//     .replace(/-/g, '+')
//     .replace(/_/g, '/')
//     + '='.repeat((4 - payloadBase64Url.length % 4) % 4);

//   const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
//   return JSON.parse(payloadJson);
// }


// export default {signJWT, verifyJWT, decodeJWTPayload};
