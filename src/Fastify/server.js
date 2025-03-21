import Fastify from 'fastify'
import routes from './routes.js'

// enable logger messages
const fastify = Fastify({
  logger: true
})

// regiter routes
fastify.register(routes);

// setting up the PORT TODO: use .env ?
const PORT = 8080;

// server is listening
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}) 

