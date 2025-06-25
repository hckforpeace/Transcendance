import { getDB } from "../database/database.js";
// import jwtFunctions from '../jwt.js' 

const updateUserStats = async (req, reply) => {
  try {
    const db = getDB();

    if (!db) {
      reply.code(500).send({ error: "Database not initialized" });
      return;
    }
    
    const { alias1, alias2, p1_score, p2_score } = req.body;

    console.log("--------- p1 => '", alias1,"'------------ p2 =>", alias2);

    const player_1 = await db.get("SELECT * FROM users WHERE name = ?", alias1);
    if (!player_1) {
      reply.code(404).send({ error: "Player1 not found" });
      return;
    }

    const player1_id = player_1.id;
    const player1_alias = player_1.name;
    const player2_alias = alias2;

    await db.run(
      `INSERT INTO matches
       (player1_alias, player1_id, player1_score, player2_score, player2_alias)
       VALUES (?, ?, ?, ?, ?)`,
      [player1_alias, player1_id, p1_score, p2_score, player2_alias]
    );

    const stats = await db.get(`SELECT * FROM stats WHERE playerId = ?`, [player1_id]);

    const won = p1_score > p2_score ? 1 : 0;
    const lost = p2_score > p1_score ? 1 : 0;

    if (!stats) {
      await db.run(
        `INSERT INTO stats (playerId, matchesWon, matchesLost, matchesPlayed)
         VALUES (?, ?, ?, ?)`,
        [player1_id, won, lost, 1]
      );
    } else {
      await db.run(
        `UPDATE stats SET
           matchesWon = matchesWon + ?,
           matchesLost = matchesLost + ?,
           matchesPlayed = matchesPlayed + 1
         WHERE playerId = ?`,
        [won, lost, player1_id]
      );
    }

    reply.code(200).send({ success: true, message: "Stats updated for player1" });
  } catch (error) {
    console.error("Error updating stats:", error);
    reply.code(500).send({ error: "Internal Server Error" });
  }
};


export default { updateUserStats };
