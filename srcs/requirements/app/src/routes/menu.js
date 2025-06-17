import api from '../controllers/menu.mjs'

async function routes(fastify, options) {
  fastify.get('/api/menu/profile', api.getProfileView)
}

// ESM
export default routes;
