FROM nginx:stable

COPY ./nginx.conf /etc/nginx/nginx.conf

# update and upgrade
RUN apt-get update && apt-get upgrade -y

# install nginx and openssl
RUN apt-get install -y openssl

# create directories for nginx configuration and SSL certificates
RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -out /etc/nginx/ssl/inception.crt -keyout \
    /etc/nginx/ssl/inception.key -subj "/C=MO/ST=KH/L=KH/O=42/OU=42/CN=domain_name.fr/UID=admin_name"


ENTRYPOINT ["nginx", "-g", "daemon off;"]
