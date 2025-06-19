# FROM node:22.14.0

# WORKDIR /app

# COPY . .

# RUN apt update && apt upgrade -y \
#     && apt install jq -y 

# RUN npm update -g npm


# RUN npm i

# CMD export VAULT_TOKEN=$(jq -r '.root_token' /vault/init.json)

# ENTRYPOINT  [ "npm", "run", "dev" ]
FROM node:22.14.0

WORKDIR /app

COPY . .

RUN apt update && apt upgrade -y \
    && apt install -y jq

RUN npm update -g npm
RUN npm install

COPY entrypoint.sh /entrypoint.sh


RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["source", "/entrypoint.sh", "&&", "npm run dev"]
# CMD ["/bin/sh", "-c", ". /entrypoint.sh &&  npm run dev"]
CMD ["/bin/sh", "-c", ". /entrypoint.sh && exec npm run dev"]
