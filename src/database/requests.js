import { getDB } from "./database.js"


const getConnectedUsers = async () => {
  const db = getDB();
  const users = await db.all("SELECT name FROM users WHERE connected = 1");
  return (users);
};


// Used to display actual name, mail and avatar in the form of a profile 
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

// used to display the list of friends in the profile page
const getFriends = async (id) => {
    const db = getDB();
    let res;
    let friends, allUsers;
    
    try {
        // Get the user's friends list
        res = await db.get("SELECT friends FROM users WHERE id = ?", [id]);
        if (!res || !res.friends) return null;
        
        friends = JSON.parse(res.friends);
        
        // Get all users
        const allUsersRes = await db.all("SELECT id, name FROM users"); // assuming you want name too
        if (!allUsersRes) return null;
        
        // Filter out users who are in the friends list
        const nonFriends = allUsersRes.filter(user => 
            !friends.includes(user.id) && user.id !== id // exclude self too
        );
        
        return nonFriends;
        
    } catch (error) {
        console.error("Error fetching non-friends:", error);
        return null;
    }
}

// Profile socket management
const updateConnected = async (userId) => {
  const db = getDB()
  try {
    const res = await db.run("UPDATE users SET socketConnectionProfile = ? WHERE id = ?", [1, userId])
  } catch (error) {
    console.error("Error inserting socket:", error);
    return (null);
  }
  return (res);
}


const updateDisconnected = async (userId) => {
  const db = getDB()
  try {
    const res = await db.run("UPDATE users SET socketConnectionProfile = ? WHERE id = ?", [0, userId])
  } catch (error) {
    console.error("Error removing socket:", error);
    return (null);
  }
  return (res);
}

const addFriend = async (userId, friendId) => {
  const db = getDB();
  var res;
  let friends;
  try {
    res = await db.get("SELECT friendedMe from users WHERE id = ?", [friendId])

    if (!res)
      return (friendId + 'not found')
    friends = JSON.parse(res.friendedMe);
    if (!friends.includes(userId)) {
      friends.push(Number(userId));
      await db.run("UPDATE users SET friendedMe = ? WHERE id = ?", [JSON.stringify(friends), friendId]);
    }

    // updating userId line
    res = await db.get("SELECT friends FROM users WHERE id = ?", [userId]);
    friends = JSON.parse(res.friends);
    if (!friends.includes(friendId)) {
      friends.push(Number(friendId));
      await db.run("UPDATE users SET friends = ? WHERE id = ?", [JSON.stringify(friends), userId]);
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    return (null);
  } 
  return (1);
}

export default { getConnectedUsers, getProfileData , getFriends, updateConnected, updateDisconnected, addFriend};

