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

function rateLimiter(maxRequests, timeWindowMs) {
  return async (request, reply) => {
    const ip = request.ip || '127.0.0.1';
    const now = Date.now();
    let entry = rateLimitMap.get(ip) || { count: 0, startTime: now, blockedUntil: 0 };

    console.log(`[RateLimiter] IP: ${ip}, Count: ${entry.count}, BlockedUntil: ${entry.blockedUntil}, Now: ${now}`);

    if (entry.blockedUntil > now) {
      const remaining = Math.ceil((entry.blockedUntil - now) / 1000);
      console.log(`[RateLimiter] IP ${ip} still blocked for ${remaining} seconds`);
      return reply.code(429).type('text/html').view('too_many_requests.ejs', {
        text: 'Too Many Requests. Please wait...',
        seconds: remaining,
        layout: false,
      });
    } else if (entry.blockedUntil !== 0) {
      // Reset 
      entry.blockedUntil = 0;
      entry.count = 0;
      entry.startTime = now;
      console.log(`[RateLimiter] IP ${ip} unblock - reset counters`);
    }

    if (now - entry.startTime > timeWindowMs) {
      entry.count = 1;
      entry.startTime = now;
    } else {
      entry.count++;
    }

    if (entry.count > maxRequests) {
      entry.blockedUntil = now + 5000; // bloque 5 secondes
      rateLimitMap.set(ip, entry);
      console.log(`[RateLimiter] IP ${ip} blocked due to too many requests`);
      return reply.code(429).type('text/html').view('too_many_requests.ejs', {
        text: 'Too Many Requests. Please wait...',
        seconds: 5,
        layout: false,
      });
    }

    rateLimitMap.set(ip, entry);

    return;
  };
}

/* -----------------------------------------------------------------------SQL injections -------------------------------------------------------------------------- */


async function sqlInjectionCheck(request, reply) {
  const { method, url, body } = request;

  try {
    const decodedUrl = decodeURIComponent(url);
    if (suspicious_sql_patterns.some(r => r.test(decodedUrl))) {
      request.log.warn(`❌ Request blocked (pattern SQL URL) : ${decodedUrl}`);

      return reply.code(403).type('text/html').view('WAF.ejs', {
        text: 'Access Blocked by WAF',
      });
    }
  } catch (err) {
    request.log.error('Erreur décodage URL:', err.message);
  }

  const rawBody = JSON.stringify(body || {});
  for (const path of forbiddenPaths) {
    if (url.includes(path) || rawBody.includes(path)) {
      request.log.warn(`❌❌❌❌ Request blocked (Forbidden Path) : ${path}`);
      console.log("La\n\n\n\n\n\n\n\n\n\n\n\n\n");
      return reply.code(403).type('text/html').view('WAF.ejs', {
        text: 'Access Blocked by WAF',
      });
    }
  }
if (
  ['POST', 'PUT', 'PATCH'].includes(method) &&
  body &&
  typeof body === 'object' &&
  !Array.isArray(body)
) {
  for (const key in body) {
    const value = String(body[key] || '');
    if (suspicious_sql_patterns.some(r => r.test(value))) {
      request.log.warn(`❌ Request blocked (pattern SQL BODY: ${key})`);
      return reply.code(403).type('text/html').view('WAF.ejs', {
        text: 'Access Blocked by WAF',
      });
    }
  }
    const { username = '', password = '' } = body;
    if (
      suspicious_sql_patterns.some(r => r.test(username)) ||
      suspicious_sql_patterns.some(r => r.test(password))
    ) {
      return reply.code(403).type('text/html').view('WAF.ejs', {
        text: 'Access Blocked by WAF',
      });
    }
  }
  return;
}

/* ----------------------------------------------------------------------- XSS attacks -------------------------------------------------------------------------- */

function xssSanitizeBody(request, reply, done) {
  if (
    ['POST', 'PUT', 'PATCH'].includes(request.method) &&
    request.body &&
    typeof request.body === 'object' &&
    !Array.isArray(request.body)
  ) {
    const sanitizedBody = {};
    for (const key in request.body) {
      const field = request.body[key];
      if (field && field.type === 'field' && typeof field.value === 'string') {
        sanitizedBody[key] = { ...field, value: xss(field.value) };
      } else if (typeof field === 'string') {
        // Si c’est une string simple, sanitize directement
        sanitizedBody[key] = xss(field);
      } else {
        sanitizedBody[key] = field;
      }
    }
    request.body = sanitizedBody;
  }
  done();
}

export {
  rateLimiter,
  sqlInjectionCheck,
  xssSanitizeBody,
};