import fs from 'fs'
import jwtPlugin from './plugins/jwtPlugin.js'
import Fastify from 'fastify'
import routesItems from './routes/items.js'
import routesHome from './routes/home.js'
import routesApi from './routes/api.js'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import swaggerConfig from './swagger.js'
import view from '@fastify/view'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import path from 'path'
import fastifyStatic from '@fastify/static'
import websockets from '@fastify/websocket'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { initDB } from './database/database.js'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from "@fastify/multipart"
import dotenv from 'dotenv';
import { rateLimiter, sqlInjectionCheck, xssSanitizeBody } from './WAF.js';
//import routesPong from './routes/pong.js';

const { swg_config, swgUI_config } = swaggerConfig;
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
      key: fs.readFileSync(__dirname + '/src/secret/certs/server.key'),
      cert: fs.readFileSync(__dirname + '/src/secret/certs/server.crt')
  },
  logger: true,
});

// WAF Hooks
fastify.addHook('preHandler', sqlInjectionCheck);
fastify.addHook('preHandler', xssSanitizeBody);
fastify.addHook('preHandler', rateLimiter(50, 60000));

// Plugins
fastify.register(fastifyCookie);

fastify.register(websockets);

fastify.register(swagger, swg_config);

fastify.register(swaggerUi, swgUI_config);

// jwt plugin
fastify.register(jwtPlugin);

// To handle form submissions
fastify.register(fastifyFormbody);

// fastify/static
fastify.register(fastifyStatic, {
	root: path.join(__dirname, '/public'),
	prefix: '/',
});

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

fastify.addHook('preHandler', async (req, reply) => {
	reply.locals = reply.locals || {};
	reply.locals.user = req.user;
});

await initDB();

// view
fastify.register(view, {
	engine: { ejs },
	layout: "layout.ejs",
	root: __dirname + '/views/'
});

fastify.register(fastifyMultipart, { attachFieldsToBody: true });
// regiter routes
fastify.register(routesItems);
fastify.register(routesHome);
fastify.register(routesApi);

// server is listening
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})
