// Import the required modules
import api from '../controllers/api.mjs';
import fs from 'fs';
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import { fileURLToPath } from 'url'


// Define schema for login
const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 6 },
    },
  },
};

function xss_test_route(fastify) {
  fastify.get('/test-xss', async (req, reply) => {
    const name = req.query.name || '';

    // Injection directe non échappée (volontaire pour tester XSS)
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Test XSS</title>
      </head>
      <body>
        <form method="GET" accept-charset="UTF-8">
          <input type="text" name="name" />
          <input type="submit" value="Envoyer" />
        </form>

        <div>
          Bonjour, ${name}
        </div>
      </body>
      </html>
    `;

    reply.type('text/html').send(html);
  });
  fastify.post('/test-xss', async (req, reply) => {
    const name = req.body.name;
    reply
      .header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'")
      .type('text/html')
  });
}


// routes/api.js
async function routes(fastify, options) {

  xss_test_route(fastify)

  fastify.get('/api/users', { preHandler: [fastify.authenticate] }, api.users);

  fastify.get('/ping', async () => { return { message: 'pong' }; });

  fastify.get('/api/avatar', { preHandler: [fastify.authenticate] }, api.avatar)

  // fastify.get('/api/get_player', { preHandler: [fastify.authenticate] }, async (req, reply) => {
  //   const username = await get_player(req, reply);
  //   return { name: username };
  // });

  fastify.get('/home', (req, reply) => {
    const data = fs.readFileSync(path.join(__dirname, '../views/home.ejs'), 'utf-8');
    reply.send(data);
  });
  fastify.get('/rgpd', (req, reply) => {
    const data = fs.readFileSync(path.join(__dirname, '../views/rgpd.ejs'), 'utf-8');
    reply.send(data);
  });

  fastify.get('/pong_ia', (req, reply) => {
    const data = fs.readFileSync(path.join(__dirname, '../views/pong_ia.ejs'), 'utf-8');
    reply.send(data);
  });

  fastify.get('/game_menu', (req, reply) => {
    const data = fs.readFileSync(path.join(__dirname, '../views/game_menu.ejs'), 'utf-8');
    reply.send(data);
  });

  fastify.get('/api/register', (req, reply) => {
    const data = fs.readFileSync(path.join(__dirname, '../views/register.ejs'), 'utf-8');
    reply.send(data);
  });

  fastify.get('/api/login', (req, reply) => {
    const data = fs.readFileSync(path.join(__dirname, '../views/login.ejs'), 'utf-8');
    reply.send(data);
  });

  fastify.post('/api/login', api.login);

  fastify.post('/api/register', api.register);

  // fastify.get('/api/pong', { preHandler: [fastify.authenticate] }, api.pong_view);
  // connect to the websocket server
  fastify.get('/api/remote', { preHandler: [fastify.authenticate], websocket: true }, (socket, req) => {
    api.sock_con(socket, req, fastify);
  })
}

export default routes;


