import requests from "../database/requests.js"
const id = 2;

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

export default { profileInfo, updateProfileData, connectedUsers, profileFriends};
