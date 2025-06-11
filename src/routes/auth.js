import auth from '../controllers/auth.js'

async function routes(fastify, options) {
  fastify.post('/auth/google', auth.googleAuth)
}

// ESM
export default routes;
