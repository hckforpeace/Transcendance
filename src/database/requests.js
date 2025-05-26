
import { getDB } from "./database.js"

const getConnectedUsers = async (req, reply) => {
  const db = getDB();
  const friends = await db.all("SELECT name FROM users WHERE connected = 1");
  reply.send(friends);
};

export default { getConnectedUsers };

