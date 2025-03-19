// our-first-route.js

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {
  fastify.get('/exmple', async (request, reply) => {
    return { hello: 'world' }
  })
}

//ESM
export default routes;

// // CommonJs
// module.exports = routes
