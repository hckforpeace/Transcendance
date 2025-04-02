const auth = async (req, reply) => {
  try {
    const user_data = { username: req.body.username, password: req.body.password };
    
    // Use the JWT functionality from the fastify instance
    const token = await reply.jwtSign(user_data, { expiresIn: "1m" });
    
    return reply.status(200).send({ 
      message: 'Login successful', 
      token: token 
    });
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export default auth;
