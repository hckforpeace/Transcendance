import api from '../controllers/profile.mjs'
import users from '../database/profile.js'  

//TODO add prehandler to all the routes to check if the user is authenticated with JWT
async function routes (fastify, options) {
  fastify.get('/api/profile/info', api.profileInfo) // TODO
   fastify.post('/api/profile/info', api.updateProfileData)

  fastify.get('/api/profile/add/friends', api.profileFriends)
  fastify.patch('/api/profile/add/friends', api.addFriends) // TODO
 
  fastify.get('/api/profile/stats', api.getStats)


  // fastify.get('/api/profile/friends', api.getFriends) // TODO;
  fastify.get('/api/profiles/connected', api.connectedUsers)

  // preHandler: [fastify.authenticate],
  fastify.get('/api/profile/socket', { websocket: true}, (socket, req) => {api.profileSocket(socket, req)})
}

export default routes;
