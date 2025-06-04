import fs from 'fs'
import jwtPlugin from './plugins/jwtPlugin.js'
import Fastify from 'fastify'
import routesItems from './routes/items.js'
import routesHome from './routes/home.js'
import routesApi from './routes/api.js'
import routesProfile from './routes/profile.js'
import routesViews from './routes/menu.js'
import view from '@fastify/view'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import path from 'path'
import fastifyStatic from '@fastify/static'
import websockets from '@fastify/websocket'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { initDB } from './database/database.js'
import { getDB } from './database/database.js'

import populate from './database/populate.js'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from "@fastify/multipart"
import dotenv from 'dotenv';
import { rateLimiter, sql_xss_check } from './WAF.js';
//import routesPong from './routes/pong.js';
import {check_token_validity} from './handle_account.js';

dotenv.config();
// setting up the PORT TODO: use .env ?
const PORT = 3000;

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fastify = Fastify({
  https: {
      key: fs.readFileSync(__dirname + '/secret/certs/server.key'),
      cert: fs.readFileSync(__dirname + '/secret/certs/server.crt')
  },
  logger: true,
});


// Plugins
fastify.register(fastifyCookie);

fastify.register(websockets);


// jwt plugin
fastify.register(jwtPlugin);

// To handle form submissions
fastify.register(fastifyFormbody);

// WAF Hooks
fastify.addHook('preHandler', sql_xss_check);
fastify.addHook('preHandler', rateLimiter(100, 60000));

// fastify/static
fastify.register(fastifyStatic, {
	root: path.join(__dirname, '/public'),
	prefix: '/',
});


fastify.addHook('preHandler', async (req, reply) => {
	reply.locals = reply.locals || {};
	reply.locals.user = req.user;
});

// Get the DB
await initDB();
const db = getDB();
await populate.populateDB(db);
fastify.decorate('db', db);

// view
fastify.register(view, {
	engine: { ejs },
	layout: "layout.ejs",
	root: __dirname + '/views/'
});

fastify.register(fastifyMultipart, { attachFieldsToBody: true });
// regiter routes
fastify.register(routesHome);
fastify.register(routesApi);
fastify.register(routesProfile);
fastify.register(routesViews);

// server is listening
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})

fastify.addHook('onRequest', async (req, reply) => {
	const token = req.cookies.token;
	if (token) {
		try {
			const user = await req.jwtVerify();
			req.user = user;
		}
		catch (err) {
			req.user = null;
		}
	}
	else {
		req.user = null;
	}
});

check_token_validity()