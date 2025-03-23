import Fastify from 'fastify'
import routes from './routes/items.js'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

// setting up the PORT TODO: use .env ?
const PORT = 8080;

// enable logger messages
const fastify = Fastify({
  logger: true
})

// Register Swagger for API documentation
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Your API',
      description: 'API documentation',
      version: '1.0.0'
    },
    host: `localhost:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
})

// Register Swagger UI
fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
})

// regiter routes
fastify.register(routes);


// server is listening
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}) 

