const sql_add_user = "INSERT INTO users (name, hashed_password, email, connected, avatarPath, friends) VALUES (?, ?, ?, ?, ?, ?)";
const sql_add_stats = "INSERT INTO stats (matchesWon, matchesLost, tournamentsWon, tournamentsPlayed, matchesPlayed, playerId) VALUES (?, ?, ?, ?, ?, ?)";
const sql_add_match = "INSERT INTO matches (player1_alias , player2_alias, player1_id, player2_id, player1_score, player2_score) VALUES (?, ?, ?, ?, ?, ?)"

const populateDB = async (db) => 
{
  await db.run(sql_add_user, ['pablo', "password", "sjahdad@gmail.com", 1, "images/avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['mel', "password", "hsadkdh@gmail.com", 1, "images/avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['momo', "password", "shs@gmail.com", 0, "images/avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['admin', "password", "admin@gmail.com", 1, "images/avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['georges', "pomme", "ajhskdjasgd@gmail.com", 1, "images/avatar_1747840269281.png", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  
  // adding to stats some stuff
  await db.run(sql_add_stats, [4, 10, 4, 4, 4, 2], function(err) { 
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })

  // populating the matches table
  await db.run(sql_add_match, ['mel', 'pablo', 2, 1, 5, 7], function(err) { 
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  // await db.run(sql_add_match, ['mel', 'pablo', 2, 1, 5, 7], function(err) { 
  //   if (err) {
  //     console.error('Error inserting admin user:', err);
  //   } else {
  //     console.log("user added");
  //   }
  // })
}

export default {populateDB}
