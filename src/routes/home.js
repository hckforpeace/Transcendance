import dispHome from '../controllers/home.mjs'

// routes
async function routes (fastify, options) {fastify.get('/', dispHome); }

// ESM 
export default routes;