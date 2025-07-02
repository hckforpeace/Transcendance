import fs from 'fs'
import jwtPlugin from './plugins/jwtPlugin.js'
import Fastify from 'fastify'
import routesHome from './routes/home.js'
import routesApi from './routes/api.js'
import routesProfile from './routes/profile.js'
import routesViews from './routes/menu.js'
import routeAuth from './routes/auth.js'
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
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from "@fastify/multipart"
import fastifyTotp from "fastify-totp"
import dotenv from 'dotenv';
import pong_match from './routes/pong_match.js';
import {check_token_validity} from './handle_account.js';
import mailConnector from './plugins/nodemailer.js'
import metricsPlugin from 'fastify-metrics'


process.env.TZ = 'Europe/Paris';
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
  logger: true,
});


// Metrics

fastify.register(metricsPlugin, {endpoint: '/metrics',})

// Plugins
fastify.register(fastifyCookie);

fastify.register(websockets);

fastify.register(pong_match);
// jwt plugin
fastify.register(jwtPlugin);
fastify.register(mailConnector);

// To handle form submissions
fastify.register(fastifyFormbody);


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
fastify.decorate('db', db);

// view
fastify.register(view, {
	engine: { ejs },
	layout: "layout.ejs",
	root: __dirname + '/views/'
});

fastify.register(fastifyMultipart, { attachFieldsToBody: true });

fastify.register(fastifyTotp);

// regiter routes
fastify.register(routesHome);
fastify.register(routesApi);
fastify.register(routesProfile);
fastify.register(routesViews);
fastify.register(routeAuth);

// server is listening
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})


check_token_validity()
