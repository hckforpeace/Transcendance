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
import websockets from '@fastify/websocket'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// setting up the PORT TODO: use .env ?
const PORT = 8080;

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

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

// jwt plugin
fastify.register(jwtPlugin)

// fastify/static
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '/public'),
  prefix: '/',
})

fastify.register(websockets)

// view
fastify.register(view, {
  engine: { ejs },
  layout: "layout.ejs",
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
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}) 

