FROM ubuntu:18.04

RUN apt-get update -y && apt-get install -y \
    build-essential \
    software-properties-common \
    ca-certificates \
    curl
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88
RUN echo "deb https://repo.sovrin.org/sdk/deb bionic stable" >> /etc/apt/sources.list
RUN apt-get update -y && apt-get install -y \
    libindy

RUN curl -sL https://deb.nodesource.com/setup_17.x -o /tmp/nodesource_setup.sh
RUN bash /tmp/nodesource_setup.sh
RUN apt-get install -y nodejs

# Copy app source code
COPY . .

RUN npm install -y

# Exports
EXPOSE 5001
EXPOSE 7100-7200

CMD ["node","index.js"]