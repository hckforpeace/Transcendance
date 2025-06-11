import { getDB } from "../database/database.js";

const updateUserStats = async (req, reply) => {
  try {
    const db = getDB();

    if (!db) {
      reply.code(500).send({ error: "Database not initialized" });
      return;
    }

    // Récupérer l'user connecté via JWT
    const decoded = await req.jwtVerify();
    const userId = decoded.userId;

    // Récupérer les données reçues (player2 info + scores)
    const {
      player1_score,
      player2_score
    } = req.body;

    // Insertion du match avec player1 = user connecté
    await db.run(
      `INSERT INTO matches 
       (player1_alias, player2_alias, player1_id, player2_id, player1_score, player2_score)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [player1_alias, player2_alias, userId, player2_id, player1_score, player2_score]
    );

    // Récupérer stats existantes pour user connecté (player1)
    const stats = await db.get(`SELECT * FROM stats WHERE playerId = ?`, [userId]);

    // Calculer victoires/défaites
    const won = player1_score > player2_score ? 1 : 0;
    const lost = player2_score > player1_score ? 1 : 0;

    if (!stats) {
      // Si pas de stats, créer une ligne
      await db.run(
        `INSERT INTO stats (playerId, matchesWon, matchesLost, matchesPlayed)
         VALUES (?, ?, ?, ?)`,
        [userId, won, lost, 1]
      );
    } else {
      // Sinon mettre à jour
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
