"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const node_path_1 = __importDefault(require("node:path"));
const static_1 = __importDefault(require("@fastify/static"));
/*
 * Create fastify instance
 */
const frontend = (0, fastify_1.default)({
    logger: true
});
/*
 * Register fastify plugin
 */
frontend.register(static_1.default, {
    root: node_path_1.default.join(__dirname, "../src/public"),
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
