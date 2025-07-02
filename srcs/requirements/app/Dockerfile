# Pull nodejs image form dockerHub
FROM node:22.14.0

# install jq, update, upgrade
RUN apt update && apt install -y jq && npm update -g npm

# update to latest version
# RUN npm update -g npm

# enter directory
WORKDIR /app

# Copy only package.json to npm install once
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy everything in host current dir to the WORDIR
COPY . .

COPY entrypoint.sh /app/entrypoint.sh
#Copy startup script
# COPY entrypoint.sh /entrypoint.sh

# set script as and executable
# RUN chmod +x /entrypoint.sh

RUN npm run build
# RUN touch /app/env.sh && chmod +x /app/env.sh

# run the script with sh and make the env changes persistent, then launch the server
# CMD ["/bin/sh", "-c", ". /entrypoint.sh && exec npm run dev"]

# RUN timedatectl set-timezone Europe/Paris

# ENTRYPOINT ["npm"]
RUN chmod +x /app/entrypoint.sh

# ENTRYPOINT ["/app/entrypoint.sh"]
# CMD ["/app/entrypoint.sh", "&&" , "npm", "run", "start"]

# ENTRYPOINT ["npm"]

# CMD ["run", "start"]
