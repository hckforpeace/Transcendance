import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = '998291091717-69t8ub79jvhdfq195vqtc93buajcgsaf.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const googleAuth = async (req, reply) => {

  try {

    const Token = req.body.Token;
    const ticket = await client.verifyIdToken({
      idToken: Token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });

    const payload = ticket.getPayload();

    // payload contains user info like email, name, picture, etc.
    console.log('User info:', payload);

    // You can access specific fields:
    // payload.sub (user's Google ID)
    // payload.email
    // payload.name
    // payload.picture

    // return payload;
    reply.code(200)
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    reply.code(500)
  }
}

 export default {googleAuth};
