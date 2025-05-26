import api from '../controllers/profile.mjs'
import users from '../database/requests.js'  

async function routes (fastify, options) {
  //TODO add prehandler to check if the user is authenticated with JWT
  fastify.get('/api/profile', api.get_profile_data)
  fastify.post('/api/profile', api.update_profile_data)

  fastify.get('/api/connected', users.getConnectedUsers)
}

export default routes;
