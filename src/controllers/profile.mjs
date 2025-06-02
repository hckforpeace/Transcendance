import requests from "../database/profile.js"


let connections = new Map();


// TODO : get from the jwt the user id 
const profileInfo = async (req, reply) => {
  const decoded = await req.jwtVerify()
  const userId = decoded.userId;
  const res = await requests.getProfileData(userId);
  if (!res)
    reply.code(500)
  else
    reply.send(res)
}

const updateProfileData = async (req, reply) => {
  const formData = await req.formData();
}

const connectedUsers = async (req, reply) => {
  const users = await requests.getConnectedUsers();
  if (!users)
    reply.code(500);
  else
    reply.send(users);
}

const profileFriends = async (req, reply) => {
  const decoded = await req.jwtVerify()
  const userId = decoded.userId;
  const friends = await requests.getNonFriends(userId);
  if (!friends)
    reply.code(500)
  else
    reply.send(friends)
}

// TODO retreive data from cookie as userId
const profileSocket = async (socket, req, fastify) => {
  try {
    const decoded = await req.jwtVerify()
    const userId = decoded.userId;
    if (connections.has(userId)) {
      console.log(`🔌 WebSocket already connected for user ${userId} `);
      await connections.get(userId).close(); // Close the existing connection 
      connections.delete(userId); // Remove the existing connection from the map
      // requests.updateDisconnected(userId); // Remove the socket from the database
    }

    connections.set(userId, socket)
    requests.updateConnected(userId)
    requests.sendFriends(userId);

    // when a message is sent
    socket.on('close', message => { 
      console.log(`❌ WebSocket disconnected for user ${userId} `);
      requests.updateDisconnected(userId) // Remove the socket from the database
      connections.delete(userId) // Remove the connection from the map
    })
  } catch (error) {
    console.log(error)
  }
}

const addFriends = async (req, reply)  => {
  const stringFriends =  JSON.parse(req.body); // Assuming the body is a JSON string
  const friendsId = stringFriends.map(str => +str); // makes sure to convert strings to numbers
  const decoded = await req.jwtVerify()
  const userId = decoded.userId;
  var res =  await requests.addFriend(userId, friendsId)
  if (res != 1)
    reply.code(500).send(res)
  else
    reply.send({ message: "Friends added successfully" });
}

////////////////////////////////////////////////////////////////////////////////////////////////
//                                      stats
////////////////////////////////////////////////////////////////////////////////////////////////

const getStats = async (req, reply) => {
  const decoded = await req.jwtVerify()
  const userId = decoded.userId;
  const res = await requests.getStats(userId);
  reply.send(res)
}

export default { profileInfo, updateProfileData, connectedUsers, profileFriends, profileSocket, addFriends , getStats, connections};
