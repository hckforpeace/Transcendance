import { v4 as uuidv4 } from 'uuid';
import remoteObj from '../obj/remoteGame.js';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const auth = async (req, reply) => {
  // password: req.body.password 
  try { const user_data = { username: req.body.username, id: uuidv4() };
    
    const token = await reply.jwtSign(user_data, { expiresIn: "1h" });

    return reply.status(200).send({ 
      message: 'Login successful', 
      token: token 
    });
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
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
        console.log('Received message:', message);
        if (message != null && message.type == 'invite')
          remoteObj.invitePlayer(message, socket);
        else if (message.type == 'accept')
          remoteObj.startGame(message, uuidv4());  
        else if (message.type == 'pressed' || message.type == 'released')
          remoteObj.moveOpponent(message);
      } catch (error)
      {
        console.log(error)
        socket.send(error);
      }
    });

    socket.on('close', () => {
      console.log('Connection closed:', id);
      remoteObj.removePlayer(id);
      remoteObj.sendCurrentUsers(id);
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

export default {auth, sock_con, pong_view};
