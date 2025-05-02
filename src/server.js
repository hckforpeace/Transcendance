import fs from 'fs';
import jwtPlugin from './plugins/jwtPlugin.js';
import Fastify from 'fastify';
import routesItems from './routes/items.js';
import routesPong from './routes/pong.js';
import routesApi from './routes/api.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import swaggerConfig from './swagger.js';
const { swg_config, swgUI_config } = swaggerConfig;
import view from '@fastify/view';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import path from 'path';
import fastifyStatic from '@fastify/static';
import websockets from '@fastify/websocket';
import WAF from './WAF.js';

const suspicious_sql_patterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\b(OR|AND)\b\s+\w+\s*=\s*\w+/i,
  /UNION\s+SELECT/i,
  /SELECT\s.+\sFROM/i,
  /INSERT\s+INTO/i,
  /UPDATE\s+\w+\s+SET/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /EXEC(\s|\+)+(s|x)p\w+/i,
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// setting up the PORT TODO: use .env ?
const PORT = 8080;

// enable logger messages
const fastify = Fastify({
  level: 'info',
  https: {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
  },
});

// server is listening
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server is listening at ${address}`);
});

/*
 * REGISTER */

// WAF
fastify.register(WAF);

// jwt plugin
fastify.register(jwtPlugin);

// fastify/static
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '/public'),
  prefix: '/',
});

fastify.register(websockets);

// view
fastify.register(view, {
  engine: { ejs },
  layout: 'layout.ejs',
  root: __dirname + '/views/',
});

// swagger
fastify.register(swagger, swg_config);
fastify.register(swaggerUi, swgUI_config);

// Register routes
fastify.register(routesItems);
fastify.register(routesPong);
fastify.register(routesApi);


// Specifics orders  of the hook is important
fastify.addHook('preHandler', async (request, reply) => {
  const { method, url, body } = request;

  console.log('--- Début de la requête ---');
  console.log(`Méthode: ${method}`);
  console.log(`URL: `, url);
  console.log('Corps de la requêteee:', body);

  // Vérification du body uniquement si c’est un objet
  if (['POST', 'PUT', 'PATCH'].includes(method) && body && typeof body === 'object') {
    const { username = '', password = '' } = body;
    if (
      suspicious_sql_patterns.some(r => r.test(username))
    ) {
      fastify.log.warn('🚨 Suspicious request blocked (body fields)');
      return reply.code(403).send({ error: 'Blocked by WAF' });
    }
  }
});

// WAF hook after registering routes
fastify.addHook('onRequest', async (request, reply) => {
  const { method, url} = request;
  
  console.log('--- Début de la requête ---');
  console.log(`Méthode: ${method}`);
  console.log(`URL: `, url) ;
  
  // Vérification de l'URL
  try {
    const decodedUrl = decodeURIComponent(url);
    if (suspicious_sql_patterns.some(r => r.test(decodedUrl))) {
      return reply.code(403).send({ error: 'Blocked by WAF, suspicious SQL pattern detected.' });
    }
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'URL :', err);
  }
});


