export default async function (fastify, opts) {
  fastify.get('/login', async (req, reply) => {
    return reply.view('login.ejs', { text: 'Login', user: req.user });
  });

  fastify.get('/register', async (req, reply) => {
    return reply.view('register.ejs', { text: 'Register', user: req.user });
  });

}