// Import the required modules
import api from '../controllers/api.mjs';

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

  // fastify.get('/api/register', async (req, reply) => { return reply.view('register.ejs', { text: 'Register' }); });
  fastify.get('/api/users', api.users);
  //fastify.post('/api/register', api.register); WRONG
  
  fastify.get('/ping', async () => { return { message: 'pong' }; });

  fastify.get('/api/register', (req, reply) => { return reply.view('register.ejs', { text: 'Register' , layout: null});});

  // Define the routes
  fastify.post('/api/login', {schema: loginSchema}, api.auth);
   // {onRequest: [fastify.authenticate]}, 
// api.register
  fastify.post('/api/register', api.register);

  fastify.get('/api/pong', { preHandler: [fastify.authenticate] } , api.pong_view);
  // connect to the websocket server
  fastify.get('/api/remote', {preHandler: [fastify.authenticate], websocket: true}, (socket, req) => {
    api.sock_con(socket, req, fastify);})

}

export default routes;
