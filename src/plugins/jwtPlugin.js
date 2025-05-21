import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async function (fastify, opts) {
  fastify.register(jwt, { secret: "kuku" });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      if (request.headers['sec-websocket-protocol']){
        if (!fastify.jwt.verify(request.headers['sec-websocket-protocol']))
          throw new Error('Invalid token');
      }
      else
        await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ message: 'Invalid token' });
    }
  });
});
