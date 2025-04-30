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

async function WAF (fastify, opts) {
    console.log('🔒 WAF activated');
  
    // Intercepte TOUTES les requêtes avant le handler
    fastify.addHook('preHandler', (request, reply, done) => {
      const url = decodeURIComponent(request.raw.url);
      console.log(`WAF ▶ Checking ${request.method} ${url}`);
  
      if (suspicious_sql_patterns.some(r => r.test(url))) {
        fastify.log.warn('🚨 Suspicious request blocked:', url);
        return reply.code(403).send({ error: 'Blocked by WAF' });
      }
      done();
    });
  }

  

  export default WAF;
 