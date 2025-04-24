// WAF.js
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

const WAF = async (fastify, opts) => {
    console.log('WAF activated');
    fastify.addHook('preHandler', async (request, reply) => {
        console.log('Before handling the request');
        // fastify.addHook('onRequest', (request, reply, done) => {
            // });

        const url = decodeURIComponent(request.raw.url).trim();

        console.log(`Received URL: ${url}`);
        console.log("URL = ", url);

        if (suspicious_sql_patterns.some(pattern => pattern.test(url))) {
            fastify.log.warn('Suspicious request blocked: ', url);
            return reply.code(403).send({ error: 'Blocked by WAF, suspicious pattern detected!' });
        }
        console.log("HHHHHHHHHHHHHHHHHHHHH = ", url);
        done()
    });
};

export default WAF;

