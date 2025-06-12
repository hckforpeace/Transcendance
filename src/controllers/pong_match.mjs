import { getDB } from "../database/database.js";

const updateUserStats = async (req, reply) => {
  try {
    const db = getDB();

    if (!db) {
      reply.code(500).send({ error: "Database not initialized" });
      return;
    }

    const decoded = await req.jwtVerify();
    const userId = decoded.userId;


    const { p1_score, p2_score } = req.body;

    const player_1 = await db.get("SELECT * FROM users WHERE id = ?", userId);
    const player1_alias = player_1.name;
    const player2_alias = "Bot"
    const player2_id = 2

    await db.run(
      `INSERT INTO matches
       (player1_alias, player1_id, player1_score, player2_score, player2_alias, player2_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [player1_alias, userId, p1_score, p2_score, player2_alias, player2_id]
    );

    const stats = await db.get(`SELECT * FROM stats WHERE playerId = ?`, [userId]);

    const won = p1_score > p2_score ? 1 : 0;
    const lost = p2_score > p1_score ? 1 : 0;

    if (!stats) {
      await db.run(
        `INSERT INTO stats (playerId, matchesWon, matchesLost, matchesPlayed)
         VALUES (?, ?, ?, ?)`,
        [userId, won, lost, 1]
      );
    } else {
      await db.run(
        `UPDATE stats SET
           matchesWon = matchesWon + ?,
           matchesLost = matchesLost + ?,
           matchesPlayed = matchesPlayed + 1
         WHERE playerId = ?`,
        [won, lost, userId]
      );
    }

    reply.code(200).send({ success: true, message: "Stats updated for player1" });
  } catch (error) {
    console.error("Error updating stats:", error);
    reply.code(500).send({ error: "Internal Server Error" });
  }
};

export default { updateUserStats };
