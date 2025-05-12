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
import vaultFactory from 'node-vault';

// Configuration de Vault
const vault = vaultFactory({
  apiVersion: 'v1', // Version de l'API Vault
  endpoint: 'http://127.0.0.1:8200', // L'endpoint de Vault (modifie selon ta configuration)
  token: process.env.VAULT_TOKEN, // Token d'accès (tu peux utiliser un token de développement ou un token d'accès configuré)
});

// import WAF from './WAF.js';
import xss from 'xss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// setting up the PORT TODO: use .env ?
const PORT = 8080;

// enable logger messages
const fastify = Fastify({
  level: 'info',
  log: true,
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

/* ----------------------------------  WAF -------------------------------- */ 
/* Suspicious SQL patterns (in URL, in form) - Suspicious sensitive patterns - Rate limit to block an IP -  */

const forbiddenPaths = ['../', '/etc', '/bin/', 'eval', 'base64'];

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

// WAF
// fastify.register(WAF);

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



// Specifics orders  of the hook is important
fastify.addHook('preHandler', async (request, reply) => {
  const { method, url, body } = request;

  console.log('--- Début de la requête ---');
  console.log(`Méthode: ${method}`);
  console.log(`URL: `, url);
  console.log('Corps de la requêteee:', body);

  // Tis not diplay 403 error but not take into account what was written
  if (['POST', 'PUT', 'PATCH'].includes(method) && body && typeof body === 'object') {
    const { username = '', password = '' } = body;
    if ( suspicious_sql_patterns.some(r => r.test(username)) ||
    suspicious_sql_patterns.some(r => r.test(password)))
    {
      fastify.log.warn('🚨 Suspicious request blocked (body fields)');
      console.log('🚨 Suspicious request blocked (body fields)');
      return reply.code(403).send({ error: 'Blocked by WAF' });
    }

    if (typeof request.body === 'object' && request.body !== null) {
      const sanitizedBody = {};
      for (const key of Object.keys(request.body)) {
        sanitizedBody[key] = xss(request.body[key]);
      }
      request.body = sanitizedBody;
    console.log('Corps APRÈS nettoyage:', sanitizedBody);
  }
  }

});

// WAF hook after registering routes
fastify.addHook('onRequest', async (request, reply) => {

  // Have to tested this function because I cannot
  const result = await rateLimiter(100, 60 * 1000)(request, reply);
  if (result === false) console.log("YOYOYO"); // bloqué, on ne continue pas

  const { method, url} = request;
  
  console.log('--- Début de la requête ---');
  console.log(`Méthode: ${method}`);
  console.log(`URL: `, url) ;
  
  
  /* URL verification */
  try {
    const decodedUrl = decodeURIComponent(url);
    if (suspicious_sql_patterns.some(r => r.test(decodedUrl))) {
      return reply.code(403).send({ error: 'Blocked by WAF' });
    }
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'URL :', err);
  }

  // Sensitive pattern
  const body = request.body || {};
  const rawBody = JSON.stringify(body);

  for (const path of forbiddenPaths) {
    if (url.includes(path) || rawBody.includes(path)) {
      reply.code(403).send({ error: `Forbidden pattern detected: ${path}` });
      return;
    }
  }
});

// rateLimiter.js
const rateLimitMap = new Map();
export function rateLimiter(maxRequests, timeWindowMs) {
  return async (request, reply) => {
    const ip = request.ip;
    const now = Date.now();

    const entry = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - entry.startTime > timeWindowMs) {
      entry.count = 1;
      entry.startTime = now;
    } else {
      entry.count++;
    }

    rateLimitMap.set(ip, entry);

    if (entry.count > maxRequests) {
      reply.code(429).send({ error: 'Too many requests from this IP. Please try again later.' });
    }
  };
}

// Register routes
fastify.register(routesItems);
fastify.register(routesPong);
fastify.register(routesApi);

/* ---------------------------------- VAULT SECRET -------------------------------- */ 

// Fonction pour récupérer un secret de Vault
async function getSecret() {
  try {
    const secret = await vault.read('secret/data/myapp/config');
    console.log('Secret:', secret);
    return secret.data;
  } catch (err) {
    console.error('Error fetching secret:', err);
    throw new Error('Impossible de récupérer le secret');
  }
}


// Route de test
fastify.get('/get-secret', async (request, reply) => {
  try {
    const secretData = await getSecret();
    return reply.send({ secretData });
  } catch (err) {
    reply.code(500).send({ error: 'Erreur lors de la récupération des secrets' });
  }
});

console.log(process.env.JWT_SECRET); 

/* ----------------------------------  END WAF -------------------------------- */ 