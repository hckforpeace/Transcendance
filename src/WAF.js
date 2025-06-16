import fs from 'fs';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import path from 'path';
// xss test = <script>alert('XSS!')</script>

const rateLimitMap = new Map();
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

/* -----------------------------------------------------------------------RateLimiter -------------------------------------------------------------------------- */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pré-charge le template (à faire une fois au démarrage pour optimiser)
const templatePath = path.join(__dirname, 'views', 'too_many_requests.ejs');
const template = fs.readFileSync(templatePath, 'utf8');

function rateLimiter(maxRequests, timeWindowMs) {
  return async (request, reply) => {
    const ip = request.ip || '127.0.0.1';
    const now = Date.now();
    let entry = rateLimitMap.get(ip) || { count: 0, startTime: now, blockedUntil: 0 };

    console.log(`[RateLimiter] IP: ${ip}, Count: ${entry.count}, BlockedUntil: ${entry.blockedUntil}, Now: ${now}`);

    if (entry.blockedUntil > now) {
      const remaining = Math.ceil((entry.blockedUntil - now) / 1000);
      console.log(`[RateLimiter] IP ${ip} still blocked for ${remaining} seconds`);

      // Render le HTML avec ejs en brut, sans layout
      const html = ejs.render(template, { seconds: remaining });

      return reply
        .code(429)
        .type('text/html')
        .send(html);
    }

    if (entry.blockedUntil !== 0 && entry.blockedUntil <= now) {
      // Reset counters après déblocage
      entry.blockedUntil = 0;
      entry.count = 0;
      entry.startTime = now;
      console.log(`[RateLimiter] IP ${ip} unblock - reset counters`);
    }

    if (now - entry.startTime > timeWindowMs) {
      // Nouvelle fenêtre, reset compteur
      entry.count = 1;
      entry.startTime = now;
    } else {
      entry.count++;
    }

    if (entry.count > maxRequests) {
      entry.blockedUntil = now + 5000; // bloque 5 secondes
      rateLimitMap.set(ip, entry);

      console.log(`[RateLimiter] IP ${ip} blocked due to too many requests`);

      const html = ejs.render(template, { seconds: 5 });

      return reply
      .code(429)
      .type('text/html')
      .send(html);
    }
    
    rateLimitMap.set(ip, entry);
  };
}

/* -----------------------------------------------------------------------SQL injections XSS attacks ------------------------------------------------------------------------ */

const suspicious_xss_patterns = [
  /<script.*?>.*?<\/script>/i,
  /<.*?on\w+\s*=\s*['"].*?['"].*?>/i,
  /javascript:/i,
  /<iframe.*?>.*?<\/iframe>/i,
  /document\.cookie/i,
  /<img.*?src=['"].*?['"].*?>/i,
  /<\/?(svg|math|style|link|meta).*?>/i
];

async function sql_xss_check(request, reply) {
  const { method, url, body } = request;
  try {
    const decodedUrl = decodeURIComponent(url);

    for (const pattern of suspicious_sql_patterns.concat(suspicious_xss_patterns)) {
      if (pattern.test(decodedUrl)) {
        request.log.warn(`❌ Request blocked (URL match): ${pattern} in ${decodedUrl}`);
        return reply.code(403).type('text/html').view('WAF.ejs', {
          text: 'Access Blocked by WAF (URL)',
        });
      }
    }
  } catch (err) {
    request.log.error('Erreur décodage URL:', err.message);
  }

  if (
    ['GET','POST', 'PUT', 'PATCH'].includes(method) &&
    body &&
    typeof body === 'object' &&
    !Array.isArray(body)
  ) {
    for (const key in body) {
      const value = String(body[key] || '');
      for (const pattern of suspicious_sql_patterns.concat(suspicious_xss_patterns)) {
        if (pattern.test(value)) {
          request.log.warn(`❌ Request blocked (BODY match): key=${key}, pattern=${pattern}`);
          return reply.code(403).type('text/html').view('WAF.ejs', {
            text: 'Access Blocked by WAF (Form Input)',
          });
        }
      }
    }
  }

  return;
}



export {
  rateLimiter,
  sql_xss_check,
};
