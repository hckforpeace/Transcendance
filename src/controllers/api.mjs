import { v4 as uuidv4 } from 'uuid';
import remoteObj from '../obj/remoteGame.js';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs';
import { getDB } from "../database/database.js"
import { pipeline } from 'stream/promises';
import { request } from 'http';

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

    const token = await reply.jwtSign({ userId: user.id, email: user.email, name: user.name }, { expiresIn: "1h" });

    db.run("UPDATE users SET token_exp = ? WHERE id = ?", [Date.now(), user.id]);

    reply.setCookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/"
    });

  }
  catch (error) {
    req.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }

};

const avatar = async (req, reply) => {
  const db = getDB();

  try {

    const decoded = await req.jwtVerify()


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

  const formData = await req.formData();
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const confirm_password = formData.get("confirm_password");
  const avatar = formData.get("avatar");

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

  let avatarPath = "images/avatar.jpg";  // <- déclaration ici

  if (avatar && typeof avatar.stream === 'function' && avatar.name) {
    const ext = path.extname(avatar.name);
    const filename = avatar.name;
    avatarPath = `images/${filename}`;
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
    const result = await db.run(`INSERT INTO users (name, email, hashed_password, avatarPath) VALUES (?, ?, ?, ?)`, [name, email, hashed_password, avatarPath]);
    reply.send({ success: true, redirectTo: "/home" });
  }
  catch (error) {
    console.error('Error registering user:', error); // Affiche l'erreur dans la console
    return reply.status(500).send({ error: 'Error registering user' });
  }
};

const logout = async (req, reply) => {
	try {
		reply.clearCookie("token", {
			path: "/"
		});
		return reply.code(200).send({ message: "Logged out" });
	} catch (err) {
		req.log.error(err);
		return reply.status(500).send({ error: "Logout failed" });
	}
};


const sock_con = async (socket, req, fastify) => {
  try {
    var token = await req.jwtVerify()
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

export default { sock_con, login, register, users, avatar, logout };
