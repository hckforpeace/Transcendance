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

// routes/api.js
async function routes (fastify, options) {

  fastify.get('/api/users', { preHandler: [fastify.authenticate] }, api.users);
  
  fastify.get('/ping', async () => { return { message: 'pong' }; });

  fastify.get('/api/avatar', { preHandler: [fastify.authenticate] }, api.avatar)

  fastify.get('/home', (req, reply) => { 
    const data = fs.readFileSync(path.join(__dirname, '../views/home.ejs'), 'utf-8');
    reply.send(data);});

  fastify.get('/api/register', (req, reply) => { 
    const data = fs.readFileSync(path.join(__dirname, '../views/register.ejs'), 'utf-8');
    reply.send(data);});

  fastify.get('/api/login', (req, reply) => { 
    const data = fs.readFileSync(path.join(__dirname, '../views/login.ejs'), 'utf-8');
    reply.send(data);});

  fastify.post('/api/login', api.login);

  fastify.post('/api/register', api.register);

  fastify.get('/api/pong', { preHandler: [fastify.authenticate] } , api.pong_view);
  // connect to the websocket server
  fastify.get('/api/remote', {preHandler: [fastify.authenticate], websocket: true}, (socket, req) => {
    api.sock_con(socket, req, fastify);})



}

export default routes;