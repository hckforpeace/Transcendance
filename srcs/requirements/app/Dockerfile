FROM node:22.14.0

WORKDIR /app

COPY . .

RUN npm update -g npm

RUN npm i

ENTRYPOINT  [ "npm", "run", "dev" ]
