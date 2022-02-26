FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./socket.js ./socket.js
COPY ./server.js ./server.js
COPY ./build ./build

EXPOSE 8080

CMD [ "node", "server.js" ]