import fs from 'fs'
import jwtPlugin from './plugins/jwtPlugin.js'
import Fastify from 'fastify'
import routesItems from './routes/items.js'
import routesPong from './routes/pong.js'
import routesApi from './routes/api.js'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import swaggerConfig from './swagger.js'
const  {swg_config, swgUI_config} = swaggerConfig;
import view from '@fastify/view'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import path from 'path'
import fastifyStatic from '@fastify/static'
import { initDB } from './database/database.js'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import pages from './routes/pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// setting up the PORT TODO: use .env ?
const PORT = 8080;

// enable logger messages
const fastify = Fastify({
  logger: true,
  https: {
      key: fs.readFileSync(path.join(__dirname, 'server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
}
})

/*
 * REGISTER */

await initDB();

// cookies
fastify.register(fastifyCookie);

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
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
});

fastify.addHook('preHandler', async (req, reply) => {
  reply.locals = reply.locals || {};
  reply.locals.user = req.user;
});


// view
fastify.register(view, {
  engine: { ejs },
  layout: "index.ejs",
  root: __dirname + '/views/'
});

// swagger 
fastify.register(swagger, swg_config)
fastify.register(swaggerUi, swgUI_config)

// regiter routes
fastify.register(routesItems);
fastify.register(routesPong);
fastify.register(routesApi);


// server is listening
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}) 

