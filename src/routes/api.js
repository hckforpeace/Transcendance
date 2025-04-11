// Import the required modules
import api from '../controllers/api.mjs';

// routes/api.js
async function routes (fastify, options) {
  // Define the routes
  fastify.get('/api/register', async (req, reply) => { return reply.view('register.ejs', { text: 'Register' }); });
  fastify.post('/api/register', api.register);
  
  fastify.get('/api/login', async (req, reply) => { return reply.view('login.ejs', { text: 'Login' }); });
  fastify.post('/api/login', api.login);

  fastify.get('/ping', async () => { return { message: 'pong' }; });

  fastify.get('/api/users', api.users);


   // {onRequest: [fastify.authenticate]}, 
  fastify.get('/api/pong', { preHandler: [fastify.authenticate] } ,(req, reply) => {
    console.log(req.headers.authorization);
    reply.send({ message: 'pong' });
  });
}

export default routes;