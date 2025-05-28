import nodemailer from 'nodemailer';
import fp from 'fastify-plugin';

async function mailConnector(fastify, options) {
  const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: "mppd.42.transcendence@gmail.com",
			pass: "leCCmieux"
			// user: process.env.GMAIL_USER,
			// pass: process.env.GMAIL_PASS,
		},
  });

  fastify.decorate('mail_transporter', transporter);
}

export default fp(mailConnector);
