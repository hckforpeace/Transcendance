// Import the required modules
import api from '../controllers/api.mjs';
// routes/api.js
async function routes(fastify, options) {


  // fastify.get('/api/users', api.users);

  // fastify.get('/ping', async () => { return { message: 'pong' }; });

  fastify.get('/api/avatar', { preHandler: [fastify.authenticate] }, api.avatar);

  fastify.get('/api/logout', { preHandler: [fastify.authenticate] }, api.logout);

  fastify.get('/api/delete_account', { preHandler: [fastify.authenticate] }, api.delete_account);

  fastify.get('/api/isLoggedIn', api.isLoggedIn);

  fastify.post('/api/login', api.login);

  fastify.post('/api/register', api.register);

  fastify.get('/api/remote', { preHandler: [fastify.authenticate], websocket: true }, (socket, req) => {
    api.sock_con(socket, req, fastify);
  })
}

export default routes;


