const sql_add_user = "INSERT INTO users (id, name, hashed_password, email, connected, avatarPath, friends) VALUES (?, ?, ?, ?, ?, ?, ?)";
const sql_add_stats = "INSERT INTO stats (matchesWon, matchesLost, tournamentsWon, tournamentsPlayed, matchesPlayed, playerId) VALUES (?, ?, ?, ?, ?, ?)";
const sql_add_match = "INSERT INTO matches (player1_alias , player2_alias, player1_id, player2_id, player1_score, player2_score) VALUES (?, ?, ?, ?, ?, ?)"

const populateDB = async (db) => {

   await db.run(sql_add_user,
    ['0', 'Bot', 'bot_password_hash', 'bot@example.com', 0, 'images/avatar.jpg', '[]'],
  );
}

export default { populateDB }
