import fs from 'fs'
import jwtPlugin from './plugins/jwtPlugin.js'
import Fastify from 'fastify'
import routesItems from './routes/items.js'
import routesHome from './routes/home.js'
import routesApi from './routes/api.js'
import routesProfile from './routes/profile.js'
import view from '@fastify/view'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import path from 'path'
import fastifyStatic from '@fastify/static'
import websockets from '@fastify/websocket'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { initDB } from './database/database.js'
import { getDB } from './database/database.js'

import populate from './database/populate.js'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from "@fastify/multipart"
import dotenv from 'dotenv'; 
import xss from 'xss';

dotenv.config();
// setting up the PORT TODO: use .env ?
const PORT = 3000;

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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


const fastify = Fastify({
  https: {
      key: fs.readFileSync('./src/secret/certs/server.key'),
      cert: fs.readFileSync('./src/secret/certs/server.crt')
  },
  logger: true,
});


// WAF Hooks
fastify.addHook('onRequest', async (request, reply) => {
  await rateLimiter(100, 60 * 1000)(request, reply);

  const { method, url } = request;

  try {
    const decodedUrl = decodeURIComponent(url);
    if (suspicious_sql_patterns.some(r => r.test(decodedUrl))) {
      fastify.log.warn(`❌ Requête bloquée par WAF (pattern SQL) : ${decodedUrl}`);
      return reply.code(403).send({ error: 'Blocked by WAF' });
    }
  } catch (err) {
    fastify.log.error('Erreur lors de la décodification de l’URL:', err.message);
  }

  const rawBody = JSON.stringify(request.body || {});
  for (const path of forbiddenPaths) {
    if (url.includes(path) || rawBody.includes(path)) {
      fastify.log.warn(`❌ Requête bloquée (chemin interdit) : ${path}`);
      return reply.code(403).send({ error: `Forbidden pattern detected: ${path}` });
    }
  }
});

fastify.addHook('preHandler', async (request, reply) => {
  const { method, url, body } = request;

  if (
    ['POST', 'PUT', 'PATCH'].includes(method) &&
    body &&
    typeof body === 'object' &&
    !Array.isArray(body)
  ) {
    const { username = '', password = '' } = body;
    if (
      suspicious_sql_patterns.some(r => r.test(username)) ||
      suspicious_sql_patterns.some(r => r.test(password))
    ) {
      return reply.code(403).send({ error: 'Blocked by WAF' });
    }
    const sanitizedBody = {};

    for (const key in request.body) {
    const field = request.body[key];

    if (field.type === 'field' && typeof field.value === 'string') {
      sanitizedBody[key] = { ...field, value: xss(field.value) };
    } else {
      sanitizedBody[key] = field;
    }
  }
    request.body = sanitizedBody;
  }
});

// XSS test with a route
fastify.get('/test-xss', async (req, reply) => {
  reply.type('text/html').send(`
    <form method="POST" action="/test-xss">
      <input type="text" name="name" />
      <button type="submit">Envoyer</button>
    </form>
  `);
});

fastify.post('/test-xss', async (req, reply) => {
  const name = req.body.name;
  reply
    .header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'")
    .type('text/html')
});


// Plugins
fastify.register(fastifyCookie);

fastify.register(websockets);



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
await populate.populateDB(getDB());

// view
fastify.register(view, {
	engine: { ejs },
	layout: "layout.ejs",
	root: __dirname + '/views/'
});

fastify.register(fastifyMultipart, { attachFieldsToBody: true });


// regiter routes
fastify.register(routesHome);
fastify.register(routesApi);
fastify.register(routesProfile);

// server is listening
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})
