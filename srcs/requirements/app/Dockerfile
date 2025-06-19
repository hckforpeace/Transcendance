FROM node:22.14.0

WORKDIR /app

COPY . .

# RUN apt update && apt upgrade -y \
#     && apt install jq -y 

RUN npm update -g npm

# RUN export VAULT_TOKEN=$(jq -r '.root_token' /vault/init.json)

RUN npm i

ENTRYPOINT  [ "npm", "run", "dev" ]
