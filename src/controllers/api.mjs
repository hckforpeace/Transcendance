const auth = async (req, reply) => {
  try {
    const user_data = { username: req.body.username, password: req.body.password };
    
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

const sock_con =  (socket, req) => {
  // the connection will only be opened for authenticated incoming requests
  socket.on('message', message => {
    console.log('Received message:', message.toString());
    socket.send(`Echo: ${message}`);
  });
  
}

const pong_view = (req, reply) => {
  reply.view('pong.ejs', {layout: false});
}

export default {auth, sock_con, pong_view};
