import { getDB } from "../database/database.js";
const db = getDB();

export async function get_player(req, reply) {
  try {
    const user = await req.jwtVerify(); // Vérifie le token JWT et récupère l'utilisateur

    console.log("JE PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASSE")

    return new Promise((resolve, reject) => {
      db.get(
        "SELECT username FROM users WHERE id = ?",
        [user.id], // utilise l'ID extrait du token
        (err, row) => {
          if (err) return reject(err);
          resolve(row?.username || null);
        }
      );
    });
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}
