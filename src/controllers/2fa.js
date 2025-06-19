import { getDB } from "../database/database.js";

const	verify2fa = async (req, reply) => {
	const	db = getDB();
	const	formData = await req.formData();
	const username = formData.get('user_id');
	const code = formData.get('2fa');
	const	dbUser = await db.get("SELECT id, name, email FROM users WHERE name = ?", [username]);
	console.log("dbUser: ", dbUser);
	if (!dbUser || dbUser === 0)
		return reply.code(400).send({ error: "ERROR: User not found" });

	console.log("user: ", dbUser.name, "code: ", code);
	const users = await db.all(`SELECT code,created_at,expired_at FROM twofa WHERE user_id = ?`, [ dbUser.id ]);
	const now = new Date().getTime();
	for (let i = 0; i < users.length; i++) {
		if (users[i].code === code) {
			if (now < users[i].expired_at && now > users[i].created_at) {
				let token;
				try {
					token = req.server.jwt.sign({ email: dbUser.email, username: dbUser.username }, { expiresIn: '1h' });
				} catch(err) {
					console.log(err);
					return reply.status(500).send("Internal server error");
				}

				let test = req.server.jwt.verify(token);
				console.log("token: ", token);

				// Prepare response
				return reply.setCookie("access_token", token, {
					path: "/",
					secure: true,
					httpOnly: true,
					sameSite: true
				})
				.code(200)
				.send({ message: "2FA verification successful" });
				return ;
			}
		}
	}
	return reply.code(400).send({ error: "ERROR: Invalid 2FA code or expired" });
};

export default { verify2fa };
