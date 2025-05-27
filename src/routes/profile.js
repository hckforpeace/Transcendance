import api from '../controllers/profile.mjs'
import users from '../database/requests.js'  

//TODO add prehandler to all the routes to check if the user is authenticated with JWT
async function routes (fastify, options) {
  fastify.get('/api/profile/info', api.profileInfo) // TODO
  fastify.post('/api/profile/info', api.updateProfileData)
  fastify.get('/api/profile/friends', api.profileFriends)

  
  fastify.get('/api/profiles/connected', api.connectedUsers)

}

export default routes;
