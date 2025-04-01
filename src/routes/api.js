// Import the required modules
import auth from '../controllers/api.mjs';

// routes/api.js
async function routes (fastify, options) {
  // Define the routes
  fastify.post('/api/login', auth);
   // {onRequest: [fastify.authenticate]}, 
  fastify.get('/api/pong', { preHandler: [fastify.authenticate] } ,(req, reply) => {
    console.log(req.headers.authorization);
    reply.send({ message: 'pong' });
  });


}

export default routes; 
