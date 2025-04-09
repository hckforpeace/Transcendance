import bcrypt from 'bcryptjs';
import { getDB } from "../database/database.js"


const login = async (req, reply) => {
	try {
		const { email, password } = req.body;
		const db = getDB();
		if (!email || !password) {
			return reply.status(400).send({ error: "Email and password are required" });
		}

		const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

		if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
        	return reply.status(401).send({ error: "Invalid email or password" });}

		// Use the JWT functionality from the fastify instance
		const token = await reply.jwtSign({ userId: user.id, email: user.email }, { expiresIn: "1m" });

		reply.setCookie("token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/"
		});

		//return reply.redirect("/");
		//return reply.status(200).send({ message: 'Login successful', token: token });
	} catch (error) {
		req.log.error(error);
		return reply.status(500).send({ message: 'Internal server error' });
	}
};

const register = async (req, reply) => {

	const { name, email, password } = req.body;
	const db = getDB();

  if (!name || !email || !password) {
    return reply.status(400).send({ error: 'Name, email, and password are required' });
  }

	const hashed_password = await bcrypt.hash(password, 10);

  try {
    const result = await db.run(`INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)`, [name, email, hashed_password]);
	//reply.send({ message: 'User registered successfully', result });
    return reply.redirect('/');
  } catch (error) {
 console.error('Error registering user:', error); // Affiche l'erreur dans la console
    return reply.status(500).send({ error: 'Error registering user' });
  }
};

const users = async (req, reply) => {
  try {
    const db = getDB();
	const users = await db.all('SELECT * FROM users');
    return reply.send({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return reply.status(500).send({ error: 'Error fetching users' });
  }
};

export default {register, login, users};