import { v4 as uuidv4 } from 'uuid';
import remoteObj from '../obj/remoteGame.js';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs';
import { getDB } from "../database/database.js"
import { pipeline } from 'stream/promises';
import profileRequests from '../database/profile.js'
import { request } from 'http';
import twofa from '../controllers/2fa.js';
import jwtFunc from '../jwt.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const uploadDir = path.join(__dirname, '..', 'public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const login = async (req, reply) => {

  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const password = formData.get("password");

    const db = getDB();

    if (!name || !password) {
      return reply.status(400).send({ error: 'All fields are required' });
    }

    // Username doesn't exist
    const user = await db.get("SELECT * FROM users WHERE name = ?", name);
    if (!user) {
      return reply.status(400).send({ error: "User is not registered" });
    }

    // Bad password
    if (!(await bcrypt.compare(password, user.hashed_password))) {
      return reply.status(400).send({ error: "Wrong password, try again" });
    }

	  // CHeck 2fa method
	if (user.twofa_secret === null || user.twofa_secret === '') { // App based 2fa
		return twofa.send2faEmail(req, reply, user);
	} else {
		return reply
		.code(200).send();
	}
    const payload = { userId: user.id, email: user.email, name: user.name, iat: Math.floor(Date.now() / 1000)};
    const JWT = await jwtFunc.signJWT(payload);
    


    await db.run("UPDATE users SET connected = 1 WHERE name = ?", name);
    await db.run("UPDATE users SET token_exp = ? WHERE id = ?", [Date.now(), user.id]);

    reply.setCookie("token", JWT, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/"
    });
    profileRequests.updateFriended(user.id)

  }
  catch (error) {
    req.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }

};

const avatar = async (req, reply) => {
  const db = getDB();

  try {

    const decoded = await jwtFunc.decodeJWTPayload(req.cookies['token']);


    const userId = decoded.userId;
    const data = await db.get('SELECT avatarPath FROM users WHERE id = ?', [userId]);

    let avatarUrl = '/images/avatar.jpg'; // default avatar
    if (data.avatarPath) {
      avatarUrl = data.avatarPath;
    }

    reply.send({ avatarUrl });
  } catch (err) {
    return reply.status(401).send({ error: 'Non authentifié: token invalide' });
  }
};

const register = async (req, reply) => {

  var uniqueId; 
  const formData = await req.formData();
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const confirm_password = formData.get("confirm_password");
  const avatar = formData.get("avatar");
  const twofa_methods = formData.get("2fa_method");

  const db = getDB();

  if (!name || !email || !password || !confirm_password) {
    return reply.status(400).send({ error: 'All fields are required' });
  }

  // Email format check
  console.log("Name = " + name + "\nMail = " + email);
  if (!email.includes("@")) {
    return reply.status(400).send({ error: "Invalid email address" });
  }

  // Password confirmation check
  if (password !== confirm_password) {
    return reply.status(400).send({ error: "Passwords do not match" });
  }

  // Username already used
  const existingUser = await db.get("SELECT * FROM users WHERE name = ?", name);
  if (existingUser) {
    return reply.status(400).send({ error: "Name is already in use" });
  }

  // Email already used
  const existingEmail = await db.get("SELECT * FROM users WHERE email = ?", email);
  if (existingEmail) {
    return reply.status(400).send({ error: "Email is already in use" });
  }

  let avatarPath = "/images/avatar.jpg";  // <- déclaration ici

  if (avatar && typeof avatar.stream === 'function' && avatar.name) {
    const ext = path.extname(avatar.name);
    const filename = avatar.name;
    avatarPath = `/images/${filename}`;
    const filePath = path.join(uploadDir, filename);
    console.log(`Saving avatar file to: ${filePath}`);

    try {
      await pipeline(avatar.stream(), fs.createWriteStream(filePath));
      console.log("Avatar saved successfully!");
    } catch (err) {
      console.error("Error saving avatar:", err);
    }
  } else {
    console.log("No valid avatar file to save.");
  }
  try {
    const hashed_password = await bcrypt.hash(password, 10);
    uniqueId = uuidv4(); // Generate a unique ID for the user
	if (twofa_methods === "app") {
		const twofa_secret = req.server.totp.generateSecret();
		console.log("2FA secret generated:", twofa_secret);
		console.log("TEST TOKEN: ", req.server.totp.generateToken({ secret: twofa_secret.ascii, encoding: 'ascii' }));
		const encodedSecret = encodeURIComponent(twofa_secret.base32); // URL-safe encoding
		const result = await db.run(`INSERT INTO users (id, name, email, hashed_password, avatarPath, twofa_secret) VALUES (?, ?, ?, ?, ?, ?)`, [uniqueId, name, email, hashed_password, avatarPath, twofa_secret.ascii]);
		const qrcode = await req.server.totp.generateQRCode({ secret: twofa_secret.ascii });
		return reply.status(200).send( { qrCode: qrcode, secret: encodedSecret } );
	} else {
		console.log("else");
		const result = await db.run(`INSERT INTO users (id, name, email, hashed_password, avatarPath) VALUES (?, ?, ?, ?, ?)`, [uniqueId, name, email, hashed_password, avatarPath]);
		console.log("User registered successfully:", );
		return reply.status(200).send({ message: "User registered successfully" });
	}
  } catch (error) {
    console.error('Error registering user:', error); // Affiche l'erreur dans la console
    return reply.status(500).send({ error: 'Error registering user' });
  }
};


const logout = async (req, reply) => {
  const db = getDB();

  try {
    const decoded = await jwtFunc.decodeJWTPayload(req.cookies['token']);
    const userId = decoded.userId;
    const data = await db.get('SELECT name FROM users WHERE id = ?', [userId]);
    await db.run("UPDATE users SET connected = 0 WHERE name = ?", data.name);
    reply.clearCookie("token", {
			path: "/"
		});
    await profileRequests.updateFriended(decoded.userId);
		return reply.code(200).send({ message: "Logged out" });
	} catch (err) {
		req.log.error(err);
		return reply.status(500).send({ error: "Logout failed" });
	}
};


const isLoggedIn = async (req, reply) => {
  const db = getDB();
  let decoded;

  if ((await jwtFunc.verifyJWT(req.cookies['token'])) === false)
    return reply.code(200).send({ message: "jwt failed", connected: false });
  
  decoded = await jwtFunc.decodeJWTPayload(req.cookies['token']);

  try {
    const userId = decoded.userId;
    const data = await db.get('SELECT connected FROM users WHERE id = ?', [userId]);

    if (!data) {
      return reply.code(200).send({ connected: false });
    }

    return reply.code(200).send({ connected: true });
  } catch (err) {
    req.log.error(err);
    return reply.status(500).send({ error: "isLoggedIn failed" });
  }
};


const delete_account = async (req, reply) => {

  const db = getDB();

  try {
    const decoded = await jwtFunc.decodeJWTPayload(req.cookies['token']);
    const userId = decoded.userId;
    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    reply.clearCookie("token", { path: "/" });
		return reply.code(200).send({ message: "Account deleted" });
  }
  catch (err) {
    req.log.error(err);
		return reply.status(500).send({ error: "Account deletion failed" });
  }
};


const sock_con = async (socket, req, fastify) => {
  try {
    var token = await jwtFunc.decodeJWTPayload(req.cookies['token']);
    if (!token)
      throw new Error('No token provided');

    var username = token.name;
    var id = token.userId;
    remoteObj.addPlayer(id, token, username, socket);    // DEBUG: Check socket state immediately after connection
    remoteObj.sendCurrentUsers();

    socket.on('message', message => {
      try {
        message = JSON.parse(message);
        if (message != null && message.type == 'invite')
          remoteObj.invitePlayer(message, id);
        else if (message.type == 'accept' || message.type == 'refuse')
          remoteObj.startGame(message, id, uuidv4());
        else if (message.type == 'endGame')
          remoteObj.endGame(message, id);
        else if (message.type == 'pressed' || message.type == 'released')
          remoteObj.moveOpponent(message);
        else if (message.type == 'moveBall')
          remoteObj.moveBall(message);
      } catch (error) {
        console.log(error)
        socket.send(error);
      }
    });

    socket.on('close', () => {
      console.log('Connection closed:', id);
      remoteObj.DisconnectPlayer(id);
    remoteObj.sendCurrentUsers();
    });
  }
  catch (error) {
    console.log(error);
    socket.close(4001, 'Unauthorized');
  }
}


const users = async (req, reply) => {
  try {
    const db = getDB();
    const users = await db.all('SELECT * FROM users');
    const stats = await db.all('SELECT * FROM stats');
    return reply.send({ users, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return reply.status(500).send({ error: 'Error fetching users' });
  }
};

export default { sock_con, login, register, users, avatar, logout, delete_account, isLoggedIn };
