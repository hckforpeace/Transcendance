import fastify, { FastifyInstance } from 'fastify';
import path from 'node:path';
import fastifyStatic from '@fastify/static';

/*
 * Create fastify instance
 */
const frontend: FastifyInstance = fastify({
	logger: true
})

/*
 * Register fastify plugin
 */
frontend.register(fastifyStatic, {
	root: path.join(__dirname, "../src/public"),
	prefix: "/"
});


frontend.get('/', (request, reply) => {
	console.log("dirname:", __dirname);
	return reply.sendFile("index.html");
});

frontend.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		frontend.log.error(err);
		process.exit(1);
	}
	frontend.log.info("Server listening on ${address}");
});
