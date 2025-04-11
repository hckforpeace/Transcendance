// const dispIndex = (req, rep) => {
//   rep.view("index.ejs", {body: "Kess emak "})
// }
// const dispIndex = (req, rep) => {
//   rep.view(null, 'login.ejs', {
//     text: 'kess emak',
//   })
// }

import fastify from "fastify";

// Handler for index route
const dispIndex = async (req, rep) => { 
	const home = await rep.view('home.ejs', { raw: true });

	return rep.view('index.ejs', { text: 'index', body: home }) };

export default dispIndex;
