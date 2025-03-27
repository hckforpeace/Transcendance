import Fastify from 'fastify'
import routesItems from './routes/items.js'
import routesPong from './routes/pong.js'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import swaggerConfig from './swagger.js'
const  {swg_config, swgUI_config} = swaggerConfig;
import view from '@fastify/view'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import path from 'path'
import fastifyStatic from '@fastify/static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// setting up the PORT TODO: use .env ?
const PORT = 8080;

// enable logger messages
const fastify = Fastify({
  logger: true
})

/*
 * REGISTER */

// fastify/static
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '/public'),
  prefix: '/',
})

// view
fastify.register(view, {
  engine: {
    ejs
  },
  root: __dirname + '/views/'
});

// swagger 
fastify.register(swagger, swg_config)
fastify.register(swaggerUi, swgUI_config)

// regiter routes
fastify.register(routesItems);
fastify.register(routesPong);


// server is listening
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}) 

