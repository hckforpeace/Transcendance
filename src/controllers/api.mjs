import bcrypt from 'bcryptjs';

const login = async (req, reply) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return reply.status(400).send({ error: "Email and password are required" });
		}

		const user = await db.get("SELECT * FROM userts WHERE email = ?", [email]);

		if (!user || !(await bcrypt.compare(password, user.password))) {
        	return reply.status(401).send({ error: "Invalid email or password" });
    }

		// Use the JWT functionality from the fastify instance
		const token = await reply.jwtSign({ userId: user.id, email: user.email }, { expiresIn: "1m" });

		return reply.status(200).send({ message: 'Login successful', token: token });
	} catch (error) {
		req.log.error(error);
		return reply.status(500).send({ message: 'Internal server error' });
	}
};

const register = async (req, reply) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return reply.status(400).send({ error: "All fields are required" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		await db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
			[name, email, hashedPassword]);
		reply.send({ message: "User registered successfully!" });
	} catch (err) {
		reply.status(500).send({ error: "User already exists or database error" });
	}
};

export default {register, login};