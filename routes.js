
  async function routes(fastify, options) {
    fastify.get('/data', async (request, reply) => {
      const data = await getData();
      const processed = await processData(data);
      return processed;
    });
  }