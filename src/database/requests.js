import { getDB } from "./database.js"
import socket from "../controllers/profile.mjs"

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
const getNonFriends = async (id) => {
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
    return (res);
  } catch (error) {
    console.error("Error inserting socket:", error);
    return (null);
  }
}


const updateDisconnected = async (userId) => {
  const db = getDB()
  try {
    const res = await db.run("UPDATE users SET socketConnectionProfile = ? WHERE id = ?", [0, userId])
    return (res);
  } catch (error) {
    console.error("Error removing socket:", error);
    return (null);
  }
}

const addFriend = async (userId, friendId) => {
  var users = [];
  const db = getDB();
  var friendData
  var friends;
  var res;
  try {
    friendId.forEach (async id => {
    friendData = await db.get("SELECT friendedMe, connected, name from users WHERE id = ?", [id])
    users.push({id: id, name: friendData.name, connected: friendData.connected})
    if (!friendData)
      return (id + 'not found')
    friends = JSON.parse(friendData.friendedMe || "[]");
    if (!friends.includes(Number(userId))) {
      friends.push(Number(userId));
      await db.run("UPDATE users SET friendedMe = ? WHERE id = ?", [JSON.stringify(friends), id]);
    }
    })

    // updating userId line
    res = await db.get("SELECT friends FROM users WHERE id = ?", [userId]); 
    friends = JSON.parse(res.friends || "[]"); 
    
    // Ensure friendId is a number
    if (!friends.includes(friendId))
    { 
      friendId.forEach (id => { friends.push(id) }) 
      await db.run("UPDATE users SET friends = ? WHERE id = ?", [JSON.stringify(friends), userId]);

      users.forEach(async (user) => {
      if (socket.connections.has(Number(userId)))
      {
          await socket.connections.get(Number(userId)).send(JSON.stringify({id: user.id, name: user.name, connected: user.connected }))
      }
      })
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    return (null);
  } 
  return (1);
}


// const addFriend = async (userId, friendId) => {
//   const db = getDB();
//   let friendData;
//   let friends;
//   let res;

//   try {
//     await db.run("BEGIN TRANSACTION");

//     // Get the friend's data
//     friendData = await db.get("SELECT friendedMe, connected, name FROM users WHERE id = ?", [friendId]);
//     if (!friendData) {
//       await db.run("ROLLBACK");
//       return friendId + ' not found';
//     }

//     // Update friendedMe of friendId
//     friends = JSON.parse(friendData.friendedMe || "[]");
//     if (!friends.includes(Number(userId))) {
//       friends.push(Number(userId));
//       await db.run("UPDATE users SET friendedMe = ? WHERE id = ?", [JSON.stringify(friends), friendId]);
//     }

//     // Update friends of userId
//     res = await db.get("SELECT friends FROM users WHERE id = ?", [userId]);
//     friends = JSON.parse(res.friends || "[]");
//     if (!friends.includes(Number(friendId))) {
//       friends.push(Number(friendId));
//       await db.run("UPDATE users SET friends = ? WHERE id = ?", [JSON.stringify(friends), userId]);

//       // Optional: Send real-time update
//       if (socket.connections.has(Number(userId))) {
//         await socket.connections.get(Number(userId)).send(
//           JSON.stringify({
//             id: friendId,
//             name: friendData.name,
//             connected: friendData.connected
//           })
//         );
//       }
//     }

//     await db.run("COMMIT");
//     return 1;
//   } catch (error) {
//     await db.run("ROLLBACK");
//     console.error("Error adding friend (rolled back):", error);
//     return null;
//   }
// };

// const addFriend = async (userId, friendId) => {
//   const db = getDB();
//   
//   try {
//     // Convert IDs to numbers for consistency
//     const userIdNum = Number(userId);
//     const friendIdNum = Number(friendId);
//     
//     // Get friend's data
//     const friendData = await db.get("SELECT friendedMe, connected, name from users WHERE id = ?", [friendIdNum]);
//     if (!friendData) {
//       return friendIdNum + ' not found';
//     }
//     
//     // Parse friendedMe array (handle null/empty case)
//     let friendedMeArray = [];
//     try {
//       friendedMeArray = friendData.friendedMe ? JSON.parse(friendData.friendedMe) : [];
//     } catch (parseError) {
//       console.error("Error parsing friendedMe:", parseError);
//       friendedMeArray = [];
//     }
//     
//     // Ensure all IDs in array are numbers for consistency
//     friendedMeArray = friendedMeArray.map(id => Number(id));
//     
//     // Add userId to friend's friendedMe list if not already there
//     if (!friendedMeArray.includes(userIdNum)) {
//       friendedMeArray.push(userIdNum);
//       await db.run("UPDATE users SET friendedMe = ? WHERE id = ?", [JSON.stringify(friendedMeArray), friendIdNum]);
//     }
//     
//     // Get user's friends data
//     const userData = await db.get("SELECT friends FROM users WHERE id = ?", [userIdNum]);
//     if (!userData) {
//       return userIdNum + ' not found';
//     }
//     
//     // Parse friends array (handle null/empty case)
//     let friendsArray = [];
//     try {
//       friendsArray = userData.friends ? JSON.parse(userData.friends) : [];
//     } catch (parseError) {
//       console.error("Error parsing friends:", parseError);
//       friendsArray = [];
//     }
//     
//     // Ensure all IDs in array are numbers for consistency
//     friendsArray = friendsArray.map(id => Number(id));
//     
//     // Add friendId to user's friends list if not already there
//     if (!friendsArray.includes(friendIdNum)) {
//       console.log('friends array before pushing:', friendsArray);
//       friendsArray.push(friendIdNum);
//       console.log("adding friend with id:", friendIdNum, "to user:", userIdNum);
//       console.log("new friend list:", friendsArray);
//       
//       await db.run("UPDATE users SET friends = ? WHERE id = ?", [JSON.stringify(friendsArray), userIdNum]);
//       
//       // Send socket notification
//       if (socket.connections.has(userIdNum)) {
//         socket.connections.get(userIdNum).send(JSON.stringify({
//           id: friendIdNum, 
//           name: friendData.name, 
//           connected: friendData.connected 
//         }));
//       }
//     }
//     
//     return 1;
//     
//   } catch (error) {
//     console.error("Error adding friend:", error);
//     return null;
//   }
// }

export default { getConnectedUsers, getProfileData , getNonFriends, updateConnected, updateDisconnected, addFriend};

