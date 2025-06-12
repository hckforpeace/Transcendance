import api from '../controllers/profile.mjs'
import users from '../database/profile.js'  

//TODO add prehandler to all the routes to check if the user is authenticated with JWT
async function routes (fastify, options) {
  fastify.get('/api/profile/info', { preHandler: [fastify.authenticate] }, api.profileInfo) // TODO
  fastify.post('/api/profile/info', { preHandler: [fastify.authenticate] }, api.updateProfileData)

  fastify.get('/api/profile/add/friends', { preHandler: [fastify.authenticate] }, api.profileFriends)
  fastify.patch('/api/profile/add/friends', { preHandler: [fastify.authenticate] }, api.addFriends) // TODO
 
  fastify.get('/api/profile/stats', { preHandler: [fastify.authenticate] }, api.getStats)


  // fastify.get('/api/profile/friends', api.getFriends) // TODO;
  fastify.get('/api/profiles/connected', { preHandler: [fastify.authenticate] }, api.connectedUsers)

  // preHandler: [fastify.authenticate],
  fastify.post('/api/profile/update', { preHandler: [fastify.authenticate] }, api.updateProfileData)
  fastify.get('/api/profile/socket', { websocket: true, preHandler: [fastify.authenticate] }, (socket, req) => {api.profileSocket(socket, req)})

  fastify.get('/api/profile/friend/info/:id', api.getFriendInfo);
  fastify.get('/api/profile/friend/stats/:id', api.getFriendStats);
}

export default routes;
