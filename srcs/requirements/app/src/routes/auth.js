import auth from '../controllers/auth.js'

async function routes(fastify, options) {
  fastify.post('/auth/google', (req, reply) => auth.googleAuth(req, reply, fastify));
}

// ESM
export default routes;
