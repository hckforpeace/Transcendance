import dispIndex from '../controllers/index.mjs'

// routes
async function routes (fastify, options) {
  fastify.get('/', async (req, rep) => { 
	const home = await rep.view('home.ejs', {text : 'ft_trancendence'}, { raw: true });

	return rep.view('index.ejs', { text: 'index', body: home }) });
}

export default routes;