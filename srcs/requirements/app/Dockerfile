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

#Copy startup script
# COPY entrypoint.sh /entrypoint.sh

# set script as and executable
# RUN chmod +x /entrypoint.sh

RUN npm run build

# run the script with sh and make the env changes persistent, then launch the server
# CMD ["/bin/sh", "-c", ". /entrypoint.sh && exec npm run dev"]
ENTRYPOINT ["npm"]
CMD ["run", "start"]
