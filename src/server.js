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
import dotenv from 'dotenv';
import xss from 'xss';
import { getCertsFromVault, putCertsToVault } from './vault.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8080;

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

// Rate limiter helper
const rateLimitMap = new Map();
function rateLimiter(maxRequests, timeWindowMs) {
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

async function startServer() {
  const certs = await getCertsFromVault();

  if (!certs?.server_key || !certs?.server_crt) {
    console.error('❌ Certificats non trouvés dans Vault');
    process.exit(1);
  }

  const fastify = Fastify({
    https: {
      key: certs.server_key,
      cert: certs.server_crt,
    },
    logger: true,
  });

  // Plugins
  fastify.register(jwtPlugin);
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '/public'),
    prefix: '/',
  });
  fastify.register(websockets);
  fastify.register(view, {
    engine: { ejs },
    layout: 'layout.ejs',
    root: __dirname + '/views/',
  });
  fastify.register(swagger, swg_config);
  fastify.register(swaggerUi, swgUI_config);

  // WAF Hooks
  fastify.addHook('onRequest', async (request, reply) => {
    const result = await rateLimiter(100, 60 * 1000)(request, reply);

    const { method, url } = request;
    console.log('--- Début de la requête ---');
    console.log(`Méthode: ${method}`);
    console.log(`URL: `, url);

    try {
      const decodedUrl = decodeURIComponent(url);
      if (suspicious_sql_patterns.some(r => r.test(decodedUrl))) {
        return reply.code(403).send({ error: 'Blocked by WAF' });
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'URL :', err);
    }

    const body = request.body || {};
    const rawBody = JSON.stringify(body);

    for (const path of forbiddenPaths) {
      if (url.includes(path) || rawBody.includes(path)) {
        return reply.code(403).send({ error: `Forbidden pattern detected: ${path}` });
      }
    }
  });

  fastify.addHook('preHandler', async (request, reply) => {
    const { method, url, body } = request;
    console.log('Corps de la requête:', body);

    if (['POST', 'PUT', 'PATCH'].includes(method) && body && typeof body === 'object') {
      const { username = '', password = '' } = body;
      if (
        suspicious_sql_patterns.some(r => r.test(username)) ||
        suspicious_sql_patterns.some(r => r.test(password))
      ) {
        return reply.code(403).send({ error: 'Blocked by WAF' });
      }

      const sanitizedBody = {};
      for (const key of Object.keys(body)) {
        sanitizedBody[key] = xss(body[key]);
      }
      request.body = sanitizedBody;
      console.log('Corps après nettoyage:', sanitizedBody);
    }
  });

  // Routes
  fastify.register(routesItems);
  fastify.register(routesPong);
  fastify.register(routesApi);

  // Start server
  fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`✅ Server is listening at ${address}`);
  });
}

putCertsToVault();
startServer();
