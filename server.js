const Fastify = require('fastify');

// Création d'une instance Fastify avec les logs activés
const fastify = Fastify({ logger: true });

// Enregistrement d'une route GET sur la racine
fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' });
});

// Démarrage du serveur en écoute sur le port 3000
fastify.listen(3000, (err) => {
  if (err) {
    // Log l'erreur et arrête le processus en cas d'échec
    fastify.log.error(err);
    process.exit(1);
  }

  // Affiche un message lorsque le serveur démarre avec succès
  fastify.log.info('Server listening on http://localhost:3000');
});

fastify.get('/users/:userId/posts', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'integer' }
        }
      },
      query: {
        type: 'object',
        properties: {
          start_at: {
            type: 'string',
            format: 'date'
          },
          end_at: {
            type: 'string',
            format: 'date'
          }
        }
      }
    }
  }, (request, reply) => {
    return [/* les articles de l'utilisateur */]
  })

  fastify.get('/me', {
    schema: {
      response: {
        // On spécifie le code de la réponse HTTP pour lequel le schéma s'applique
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            play: {type: 'string'}
          }
        }
      }
    }
  }, (request, reply) => {
    return {
      id: 1,
      name: 'John',
      password: 'password', // ne sera pas envoyé
      play: 'hello'
    }
  })