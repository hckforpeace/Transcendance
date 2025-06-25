import { getDB } from "../database/database.js";
import profileRequests from '../database/profile.js'
import { randomInt } from "crypto"
import jwtFunc from '../jwt.js'

const send2faEmail = async (req, reply, user) => {
	console.log("Sending 2FA email to user: ", user.name);
	const db = getDB();
	const { mailer } = req.server;
	const code = randomInt(100000, 999999);
	console.log(code);

	/* Storing it in db */
	console.log(user);
	db.run(`
	INSERT INTO twofa (user_id, code, validity, created_at, expired_at) VALUES (?, ?, ?, ?, ?)
	`, [user.id, code, true, Date.now(), Date.now() + 5 * 60 * 1000]);
	console.log("Inserted into db");

	console.log("Checking insertion");
	const tmp = await db.all(`
		SELECT * FROM twofa WHERE user_id = ? AND code = ?
	`, [user.id, code]);
	console.log(tmp);

	/* Sending it to user */
	const mailOptions = {
		from: 'mppd.42.transcendence@gmail.com',
		to: user.email,
		subject: '2fa code',
		text: code.toString().padStart(6, '0')
	};
	mailer.sendMail(mailOptions, function(err, info) {
		if (err) {
		console.log(err);
		} else {
				console.log('Email sent: ' + info.response);
		}
	});
	console.log("Email sent");
	return reply
	.code(200).send();
};

const sendToken = async (req, reply, dbUser) => {
	const db = getDB();
	let token;
	try {
		token = await jwtFunc.signJWT({ userId: dbUser.id, email: dbUser.email, name: dbUser.name, iat: Math.floor(Date.now() / 1000)});
	} catch(err) {
		console.log(err);
		return reply.status(500).send("Internal server error");
	}

	profileRequests.updateFriended(dbUser.id)
	await db.run("UPDATE users SET connected = 1 WHERE name = ?", dbUser.name);
	await db.run("UPDATE users SET token_exp = ? WHERE id = ?", [Date.now(), dbUser.id])
	// Prepare response
	console.log("sending token");
	return reply.setCookie("token", token, {
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: true
	})
	.code(200)
	.send({ message: "2FA verification successful" });
};

const verify2faEmail = async (req, reply, dbUser, code) => {
	const db = getDB();
	const users = await db.all(`SELECT code,created_at,expired_at FROM twofa WHERE user_id = ?`, [ dbUser.id ]);
	const now = new Date().getTime();
	console.log("users: ", users, " | now: ", now);
	for (let i = 0; i < users.length; i++) {
		if (users[i].code === code) {
			if (now < users[i].expired_at && now > users[i].created_at) {
				return sendToken(req, reply, dbUser);
			}
		}
	}
	return reply.code(400).send({ error: "ERROR: Invalid 2FA code or expired" });
};

const verify2faApp = async (req, reply, dbUser, code) => {
	try {
		const expectedCode = req.server.totp.generateToken({ secret: dbUser.twofa_secret, encoding: 'ascii' });
		if (expectedCode !== code)
			return reply.code(400).send({ error: "Invalid 2FA code" });
		return sendToken(req, reply, dbUser);
	} catch {
		return reply.code(400).send({ error: "Invalid 2FA code" });
	}
};

const	verify2fa = async (req, reply) => {
	const	db = getDB();
	const	formData = await req.formData();
	const username = formData.get('user_id');
	const code = formData.get('2fa');
	const	dbUser = await db.get("SELECT * FROM users WHERE name = ?", [username]);
	console.log("dbUser: ", dbUser);
	if (!dbUser || dbUser === 0)
		return reply.code(400).send({ error: "ERROR: User not found" });
	console.log("user: ", dbUser.name, "code: ", code);
	if (dbUser.twofa_secret === '' || dbUser.twofa_secret === null) { // App based 2fa
		return verify2faEmail(req, reply, dbUser, code);
	} else {
		return verify2faApp(req, reply, dbUser, code);
	}

};

export default { send2faEmail, verify2fa };
