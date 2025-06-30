import api from '../controllers/pong_match.mjs'

async function routes(fastify, options) {
  fastify.post('/updateUserStats', api.updateUserStats);
}

// ESM
export default routes;
