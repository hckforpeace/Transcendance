import nodemailer from 'nodemailer';
import fp from 'fastify-plugin';

async function mailConnector(fastify, options) {
  // console.log(process.env);
  const mailer = nodemailer.createTransport({
           service: 'gmail',
           host: "smtp.gmail.com",
           port: 465,
           secure: true,
               auth: {
                       // user: "mppd.42.transcendence@gmail.com",
                       // pass: "txcj prjh exya uuop"
                       user: process.env.MAILER_USER,
                       pass: process.env.MAILER_PASS,
               },
  });

  fastify.decorate('mailer', mailer);
}

export default fp(mailConnector);
