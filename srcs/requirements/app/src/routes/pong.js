import dispIndex from '../controllers/index.mjs'

// routes
async function routes(fastify, options) {
  fastify.get('/', dispIndex);

  fastify.post('/', async (request, reply) => {
    const data = request.body;
    console.log('Form data received:', data);
    return reply.send({ status: 'form received', data });
  });
}

// ESM
export default routes;
