import { getDB } from "../database/database.js";

const isLoggedIn = async (req, reply) => {
  try {
    const decoded = await req.jwtVerify();
    const userId = decoded.userId;

    if (!userId) {
      return reply.status(401).send({ error: 'Invalid token: missing userId' });
    }

    const db = getDB();

    const user = await db.get("SELECT * FROM users WHERE id = ?", userId);


    if (!user) {
      return reply.status(404).send({ error: 'User doesn\'t exist' });
    }

    if (user.connected)
      return reply.status(200);

  } catch (err) {
    console.error(err);
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};

export default { isLoggedIn };
