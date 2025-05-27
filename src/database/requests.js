
import { getDB } from "./database.js"

const getConnectedUsers = async () => {
  const db = getDB();
  const users = await db.all("SELECT name FROM users WHERE connected = 1");
  return (users);
};


const getProfileData = async (id) => {
  const db = getDB();
  if (db)
  {
    const res = await db.get("SELECT name, email, avatarPath from users WHERE id = ? ", [id]);
    return (res);
  }
  else 
    return (null);
}

const getFriends = async (id) => {
  const db = getDB();
  let friendsDataJson = {}
  let data;

  try {
    const res = await db.get("SELECT friends from users WHERE id = ? ", [id]);
    const friendsjson = JSON.parse(res.friends) 
    for (const id of friendsjson) {
      data = await getProfileData(id) 
      friendsDataJson[id] = data 
    }
    console.log(friendsDataJson)
  } catch (error){
    return (null)
  }
  return (friendsDataJson)
}

const insertSocket = async (userId, socketId) => {
  const db = getDB()
  const res = await db.run("UPDATE users SET socketId = ? WHERE id = ?", [socketId, userId])
  console.log(res)
}


const removeSocket = async (userId) => {
  const db = getDB()
  const res = await db.run("UPDATE users SET socketId = ? WHERE id = ?", [-1, userId])
  console.log(res)
}

export default { getConnectedUsers, getProfileData , getFriends, insertSocket, removeSocket};

