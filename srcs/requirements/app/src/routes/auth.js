import auth from '../controllers/auth.js'
import twofa from '../controllers/2fa.js'

async function routes(fastify, options) {
  fastify.post('/auth/google', (req, reply) => auth.googleAuth(req, reply, fastify));
  fastify.post('/auth/2fa', (req, reply) => twofa.verify2fa(req, reply));
}

// ESM
export default routes;
