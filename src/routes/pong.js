import dispIndex from '../controllers/index.mjs'

// routes
async function routes (fastify, options) {
  fastify.get('/', dispIndex);
}


// ESM 
export default routes;

