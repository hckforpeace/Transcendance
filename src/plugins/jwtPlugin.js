import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async function (fastify, opts) {
  fastify.register(jwt, {
    secret: 'foobar',
    cookie: {
      cookieName: 'token',
      signed: false
    }
 })

fastify.decorate("tryVerifyJWTOrShowLayout", async function (request, reply) {
  try {
    await request.jwtVerify();
    // JWT is valid, continue to the route handler
  } catch (err) {
    // JWT invalid, respond with the default SPA layout instead of 401
    const layoutPath = path.join(__dirname, "public", "index.html");
    const html = fs.readFileSync(layoutPath, "utf-8");
    reply.type("text/html").send(html);
  }
});


  fastify.decorate("authenticate", async function (request, reply) {
    try {

      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ message: 'Invalid token' });
    }
  });
});
