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

  fastify.get('/api/users', api.users);

  fastify.get('/ping', async () => { return { message: 'pong' }; });

  fastify.get('/api/avatar', { preHandler: [fastify.authenticate] }, api.avatar);

  fastify.get('/api/register', (req, reply) => { 
    const data = fs.readFileSync(path.join(__dirname, '../views/register.ejs'), 'utf-8');
    reply.send(data);});

  fastify.get('/api/login', (req, reply) => { 
    const data = fs.readFileSync(path.join(__dirname, '../views/login.ejs'), 'utf-8');
    reply.send(data);
  });
  fastify.get('/api/logout', { preHandler: [fastify.authenticate] }, api.logout);
  fastify.get('/api/remote', {preHandler: [fastify.authenticate], websocket: true}, (socket, req) => {
    api.sock_con(socket, req, fastify);})

  fastify.get('/api/tournament', { preHandler: [fastify.authenticate] } , api.tournament_view);


}


export default routes;
