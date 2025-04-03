// Import the required modules
import api_controllers from '../controllers/api.mjs';

// Define schema for login
const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 6 },
    },
  },
};

// routes/api.js
async function routes (fastify, options) {

  // Define the routes
  fastify.post('/api/login', {schema: loginSchema}, api_controllers.auth);
   // {onRequest: [fastify.authenticate]}, 
  fastify.get('/api/pong', { preHandler: [fastify.authenticate] } ,(req, reply) => {
    console.log(req.headers.authorization);
    reply.send({ message: 'pong' });
  });

  // remote connection
  fastify.get('/api/remote', {websocket: true}, api_controllers.sock_con);

}

export default routes; 
