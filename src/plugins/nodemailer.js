import nodemailer from 'nodemailer';
import fp from 'fastify-plugin';

async function mailConnector(fastify, options) {
  const mailer = nodemailer.createTransport({
		service: 'gmail',
	    host: "smtp.gmail.com",
	    poort: 465,
	    secure: true,
		auth: {
			user: "mppd.42.transcendence@gmail.com",
			pass: "txcj prjh exya uuop"
			// user: process.env.GMAIL_USER,
			// pass: process.env.GMAIL_PASS,
		},
  });

  fastify.decorate('mailer', mailer);
}

export default fp(mailConnector);
