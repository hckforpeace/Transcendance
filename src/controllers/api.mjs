import remoteObj from '../obj/remoteGame.js';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const auth = async (req, reply) => {
  try { const user_data = { username: req.body.username, password: req.body.password };
    
    // Use the JWT functionality from the fastify instance
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

const sock_con =  async (socket, req) => {
  // var data = JSON.parse(socket);
  try {
    
     
    
    remoteObj.addPlayer(req.headers['sec-websocket-protocol']);
    socket.on('message', message => {

      console.log('Received message:', message.toString());
      
      socket.send(`Echo: ${message}`);
    });

  } catch (error) {
    console.log(error);
    socket.close(4001, 'Unauthorized');
  }

  
}

const pong_view = async (req, rep) => {
  const data = fs.readFileSync( path.join(__dirname, '../views/pong.ejs'), 'utf-8');
  rep.send(data);
}

export default {auth, sock_con, pong_view};
