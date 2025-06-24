FROM debian:bullseye

RUN apt-get update -y && \
    apt-get upgrade -y &&\
    apt install wget -y

RUN wget https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-386.tar.gz

RUN tar -xvf node_exporter-1.9.1.linux-386.tar.gz

WORKDIR /node_exporter-1.9.1.linux-386

ENTRYPOINT [ "./node_exporter" ]
