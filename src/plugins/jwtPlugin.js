import jwt from "@fastify/jwt";
import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
  fastify.register(jwt, {
    secret: 'foobar',
    cookie: {
    cookieName: 'access_token',
      signed: false
    }
  });

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


// async function jwt(fastify, options) {
// 	fastify.register(jwt, {
// 		// secret: process.env.JWT_SECRET,
// 		secret: "secret_jwt",
// 		cookie: {
// 			cookieName: "access_token",
// 			signed: false
// 		}
// 	});
//
// 	fastify.decorate("authenticate", authenticate);
// };

// fastify.decorate("authenticate",
// 	async function (request, reply) {
// 		// try {
// 		// 	console.log("Verifying token");
// 		//
// 		// 	const { db } = request.server;
// 		// 	const decoded = await request.jwtVerify();
// 		// 	console.log(decoded);
// 		//
// 		// 	const db_reponse = db.prepare(`SELECT * FROM users WHERE email = ? AND username = ?;`).get(decoded.email, decoded.username);
// 		// 	console.log(db_reponse);
// 		//
// 		// 	if (!db.prepare(`SELECT * FROM users WHERE email = ? AND username = ?;`).get(decoded.email, decoded.username))
// 		// 		throw (new Error("Unknown user"));
// 		//
// 		// 	console.log("Token verified");
// 		// } catch (err) {
// 		// 	console.log(err);
// 		// 	return reply.view("login", { title: "Login" });
// 		// }
//
// 		try {
// 			console.log("Verifying token");
//
// 			console.log("Token verified");
// 		} catch (err) {
// 			console.log(err);
// 			return reply.code(400);
// 		}
// 	});
// };
//
// export default fp(jwt);
