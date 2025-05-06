import { v4 as uuidv4 } from 'uuid';
import remoteObj from '../obj/remoteGame.js';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs';
import { getDB } from "../database/database.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const auth = async (req, reply) => {
  // password: req.body.password 
  try { const user_data = { username: req.body.username, id: uuidv4() };
    
    const token = await reply.jwtSign(user_data, { expiresIn: "1h" });

    return reply.status(200).send({ 
      message: 'Login successful', 
      token: token 
    });
  }
  catch (error) {
		req.log.error(error);
		return reply.status(500).send({ message: 'Internal server error' });
	}
};

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

const sock_con =  async (socket, req, fastify) => {
  try
  {
    // var id = uuidvw();
    var token = req.headers['sec-websocket-protocol'];
    if (!token) 
      throw new Error('No token provided');
    
    var decodedToken = fastify.jwt.verify(token);
    if (!decodedToken) 
      throw new Error('failed to decode token');

    var username = decodedToken['username'];
    var id = decodedToken['id']

    remoteObj.addPlayer(id, token, username, socket); 
    
    remoteObj.sendCurrentUsers(id);
     // remoteObj.getUsers();

    socket.on('message', message => {
      try {
        message = JSON.parse(message);
        // console.log('Received message:', message);
        if (message != null && message.type == 'invite')
          remoteObj.invitePlayer(message, socket);
        else if (message.type == 'accept')
          remoteObj.startGame(message, uuidv4());  
        else if (message.type == 'pressed' || message.type == 'released')
          remoteObj.moveOpponent(message);
        else if (message.type == 'moveBall')
          remoteObj.moveBall(message);
      } catch (error)
      {
        console.log(error)
        socket.send(error);
      }
    });

    socket.on('close', () => {
      console.log('Connection closed:', id);
      remoteObj.DisconnectPlayer(id);
      // remoteObj.removePlayer(id);
      // remoteObj.sendCurrentUsers(id);
    });
  }
  catch (error) {
    console.log(error);
    socket.close(4001, 'Unauthorized');
  }  
}

const pong_view = async (req, rep) => {
  const data = fs.readFileSync( path.join(__dirname, '../views/pong.ejs'), 'utf-8');
  rep.send(data);
}

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

export default {auth, sock_con, pong_view, register, login, users};
