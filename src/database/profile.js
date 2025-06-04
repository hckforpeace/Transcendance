import { getDB } from "./database.js"
import socket from "../controllers/profile.mjs"

///////////////////////////////////////////////////////////////////////////////////////////////////
//                                       Request for Friends and AddFriend
///////////////////////////////////////////////////////////////////////////////////////////////////

const sendFriends = async (userId) => {
  const db = getDB();
  const users = [];

  if (!db) return null;

  const res = await db.get("SELECT friends FROM users WHERE id = ?", [userId]);
  if (!res || !res.friends) return [];

  const friends = JSON.parse(res.friends);
  for (const friend of friends) {
    const temp = await db.get('SELECT connected, name, avatarPath FROM users WHERE id = ?', [friend]);
    if (temp) {
      users.push({ id: friend, name: temp.name, connected: temp.connected, avatar: temp.avatarPath });
    }
  }

  for (const user of users) {
    console.log(`Sending friend data to user ${userId}:`, user);
    if (socket.connections.has(Number(userId))) {
      await socket.connections.get(Number(userId)).send(
        JSON.stringify({ id: user.id, name: user.name, connected: user.connected, avatar: user.avatar})
      );
    }
  }
};
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
      friendData = await db.get("SELECT friendedMe, connected, name, avatarPath from users WHERE id = ?", [id])
      if (!friendData)
        return (id + 'not found')
      users.push({id: id, name: friendData.name, connected: friendData.connected, avatar: friendData.avatarPath})
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
    if (!friends.includes(friendId)) { 
      friendId.forEach (id => { friends.push(id) }) 
      await db.run("UPDATE users SET friends = ? WHERE id = ?", [JSON.stringify(friends), userId]);

      users.forEach(async (user) => {
        if (socket.connections.has(Number(userId)))
          await socket.connections.get(Number(userId)).send(JSON.stringify({id: user.id, name: user.name, connected: user.connected, avatar: user.avatar }))
      })
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    return (null);
  } 
  return (1);
}


///////////////////////////////////////////////////////////////////////////////////////////////////
//                                              Requests for stats 
///////////////////////////////////////////////////////////////////////////////////////////////////

/* const getStats = async (id) => {
  const db = getDB()
  var stats = [];
  var matches = [];
  var avg_lost;
  var avg_win;

  try {
    console.log('id of Request: ' + id)
    stats = await db.get("SELECT matchesWon, matchesLost  FROM stats WHERE playerId = ?",  [id])
    matches = await db.all("SELECT player1_alias, player2_alias, player1_score, player2_score, date FROM matches WHERE player1_id = ? OR player2_id = ?",  [id, id])
    if (stats) {
      avg_lost = (stats.matchesLost * 100) / (stats.matchesWon + stats.matchesLost) 
      avg_win = (stats.matchesWon * 100) / (stats.matchesWon + stats.matchesLost) 
      stats = { matchesWon: stats.matchesWon, matchesLost: stats.matchesLost, avg_lost: avg_lost.toFixed(2), avg_win: avg_win.toFixed(2)}
    }
    if (matches !== null) {
      stats.push({'matches': matches})
    }
    return stats ; 
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
} */

const getStats = async (id) => {
  const db = getDB();
  let stats = null;
  let matches = [];
  let avg_lost;
  let avg_win;

  try {
    console.log('id of Request: ' + id);
    stats = await db.get("SELECT matchesWon, matchesLost FROM stats WHERE playerId = ?", [id]);
    matches = await db.all("SELECT player1_alias, player2_alias, player1_score, player2_score, date FROM matches WHERE player1_id = ? OR player2_id = ?", [id, id]);

    if (stats) {
      const total = stats.matchesWon + stats.matchesLost;
      avg_lost = total > 0 ? (stats.matchesLost * 100) / total : 0;
      avg_win = total > 0 ? (stats.matchesWon * 100) / total : 0;

      stats = {
        matchesWon: stats.matchesWon,
        matchesLost: stats.matchesLost,
        avg_lost: avg_lost.toFixed(2),
        avg_win: avg_win.toFixed(2),
        matches: matches || []  // Include matches in the same object
      };
    } else {
      stats = {
        matchesWon: 0,
        matchesLost: 0,
        avg_lost: "0.00",
        avg_win: "0.00",
        matches: []
      };
    }
    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};


export default { getConnectedUsers, getProfileData , getNonFriends, updateConnected, updateDisconnected, addFriend, sendFriends, getStats };

