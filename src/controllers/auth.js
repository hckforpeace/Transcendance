import { OAuth2Client } from 'google-auth-library';
import requests from '../database/auth.js'
import profileRequests from '../database/profile.js'
const CLIENT_ID = '998291091717-69t8ub79jvhdfq195vqtc93buajcgsaf.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const googleAuth = async (req, reply, fastify) => {
  const Token = req.body.Token;
  var JWT;
  try {
    const ticket = await client.verifyIdToken({
      idToken: Token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const jwtPayload = await requests.googleAuth(payload);
    JWT = await fastify.jwt.sign(jwtPayload, {expiresIn: "1h"});
    reply.code(200).setCookie("token", JWT, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/"
    })
    .send({ message: "Authentication successful" });
    profileRequests.updateFriended(payload.sub)
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    reply.code(400).send({error: error.message});
  }
}

 export default {googleAuth};
