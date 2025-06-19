import path from 'path'
import { pipeline } from 'stream/promises';
import bcrypt from 'bcryptjs';
import requests from "../database/profile.js"
import { fileURLToPath } from 'url'
import fs from 'fs';
import { getDB } from "../database/database.js"
import { request } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const uploadDir = path.join(__dirname, '..', 'public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
let connections = new Map();


// TODO : get from the jwt the user id 
const profileInfo = async (req, reply) => {
  const db = getDB();
  const decoded = await req.jwtVerify()
  const name = decoded.username;
  const userId = await db.get("SELECT id FROM users WHERE name = ?", [name]);
  console.log("******************** this is the call to profileInfo *****************************************" + userId)
  const res = await requests.getProfileData(userId);
  if (!res)
    reply.code(500)
  else
    reply.send(res)
}


const connectedUsers = async (req, reply) => {
  const users = await requests.getConnectedUsers();
  if (!users)
    reply.code(500);
  else
    reply.send(users);
}

const profileFriends = async (req, reply) => {
  const db = getDB();
  const decoded = await req.jwtVerify()
  const name = decoded.username;
  const userId = await db.get("SELECT id FROM users WHERE name = ?", [name]);
  const friends = await requests.getNonFriends(userId);
  if (!friends)
    reply.code(500)
  else
    reply.send(friends)
}

// TODO retreive data from cookie as userId
const profileSocket = async (socket, req, fastify) => {
  try {
    var friends;
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
    friends = await requests.getFriends(userId)
    console.log('sending:', JSON.stringify(friends))
    socket.send(JSON.stringify(friends));

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
  const db = getDB();
  const decoded = await req.jwtVerify()
  const name = decoded.username;
  const userId = await db.get("SELECT id FROM users WHERE name = ?", [name]);
  console.log('the userId id is ' + userId + ' and the friendsId are ' + stringFriends);
  var res =  await requests.addFriend(userId, stringFriends)
  if (res != 1)
    reply.code(500).send(res)
  else
    reply.send({ message: "Friends added successfully" });
}

////////////////////////////////////////////////////////////////////////////////////////////////
//                                      stats
////////////////////////////////////////////////////////////////////////////////////////////////

const getStats = async (req, reply) => {
  const db = getDB();
  const decoded = await req.jwtVerify()
  const name = decoded.username;
  const userId = await db.get("SELECT id FROM users WHERE name = ?", [name]);
  const res = await requests.getStats(userId);
  reply.send(res)
}


////////////////////////////////////////////////////////////////////////////////////////////////
//                                      Update profile
////////////////////////////////////////////////////////////////////////////////////////////////

const  updateProfileData = async (req, reply) => {

  var hashed;
  var modified = 0;
  const formData = await req.formData();
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const confirm_password = formData.get("confirm_password");
  const avatar = formData.get("avatar");
  const db = getDB();
  const decoded = await req.jwtVerify()
  const username = decoded.username;
  const userId = await db.get("SELECT id FROM users WHERE name = ?", [username]);
  var dbreq;


  const userInfo = await db.get("SELECT * FROM users WHERE id = ?", [userId])

  if (!userInfo)
    reply.code(404).send({error: 'User not found'})

  if (userInfo.isGoogleAuth)
    reply.code(400).send({error: 'Google authenticated users cannot update profile information'})

  console.log("******************** this is the call to update profile *****************************************")

  if (name && name != userInfo.name) { 
    dbreq = await db.get("SELECT *  FROM users WHERE name = ?", name)
    if (dbreq) {
      reply.code(400).send({error: 'name already in use'})
    }
  }

  if (email && email != userInfo.email) { 
    dbreq = await db.get("SELECT *  FROM users WHERE email = ?", email)
    if (dbreq)
      reply.code(400).send({error: 'email already in use'})
    if (!email.includes("@"))
      reply.code(400).send({error: 'Invalid email address'})
  }

  if (password || confirm_password) {
    if (password != confirm_password)
      reply.code(400).send({error: 'Passwords does not match'})
  }

  if (name && name != userInfo.name) {
    dbreq = await db.run("UPDATE users SET name = ? WHERE id = ?", [name, userId])
    modified = 1;
  }
  if (email && email != userInfo.email) { 
    dbreq = await db.run("UPDATE users SET email = ? WHERE id = ?", [email, userId]) 
    modified = 1;
  }

  if (password || confirm_password) {
    hashed = await bcrypt.hash(password, 10);
    dbreq = await db.run('UPDATE  users SET hashed_password = ? WHERE id = ?', [hashed, userId])
    modified = 1;
  } 

  if (avatar && typeof avatar.stream === 'function' && avatar.name) {
    const ext = path.extname(avatar.name);
    const filename = `${Date.now()}_${avatar.name}`; // avoid collisions
    const avatarPath = `images/${filename}`;
    const filePath = path.join(uploadDir, filename);
    console.log(`Saving avatar file to: ${filePath}`);

    try {
      await pipeline(avatar.stream(), fs.createWriteStream(filePath));
      console.log("Avatar saved successfully!");

      await db.run('UPDATE users SET avatarPath = ? WHERE id = ?', [avatarPath, userId]);
      modified = 1;
    } catch (err) {
      console.error("Error saving avatar:", err);
      reply.code(500).send({ error: "Avatar upload failed." });
      return;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
//                                      Get Friends data / stats
////////////////////////////////////////////////////////////////////////////////////////////////

const getFriendInfo = async (req, reply) => {
  const friendId = req.params.id;
  const friendInfo = await requests.getProfileData(friendId);
  reply.code(200).send(friendInfo);
}

const getFriendStats = async (req, reply) => {
  const friendId = req.params.id;
  const friendStats = await requests.getStats(friendId);
  reply.code(200).send(friendStats);
}

export default { profileInfo, updateProfileData, connectedUsers, profileFriends, profileSocket, addFriends , getStats, connections, updateProfileData, getFriendStats, getFriendInfo};
