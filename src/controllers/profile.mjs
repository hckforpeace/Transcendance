import fastify from "fastify";
import { v4 as uuidv4 } from 'uuid'; // To generate unique IDs, install 'uuid' package
import requests from "../database/requests.js"
const id = 2;


let connections = new Map();


// TODO : get from the jwt the user id 
const profileInfo = async (req, reply) => {
  const res = await requests.getProfileData(id);
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
  const friends = await requests.getFriends(id);
  if (!friends)
    reply.code(500)
  else
    reply.send(friends)
}

// TODO retreive data from cookie as userId
// const profileSocket = async (socket, req, fastify) => {
//   try {
//     var userId = 2;
//     var socketId = uuidv4();
//     connections.set(socketId, socket)
//     requests.insertSocket(userId, socketId)
//     console.log("ICI")
//     // when a message is sent
//     socket.on('close', message => { 
//       requests.removeSocket(userId)
//       connections.delete(socketId)
//     })
//     
//   } catch (error) {
//     console.log(error)
//   }
// }
// WebSocket route
const soc = async (connection, req) => {
  console.log('🔌 WebSocket connected');

  // Listen for messages
  connection.on('message', (message) => {
    console.log('📩 Received:', message.toString());

    // Echo it back
    connection.socket.send(`You said: ${message}`);
  });

  // On disconnect
  connection.on('close', () => {
    console.log('❌ WebSocket disconnected');
  });
}

export default { profileInfo, updateProfileData, connectedUsers, profileFriends, soc};
