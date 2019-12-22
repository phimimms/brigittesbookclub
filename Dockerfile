
FROM node:13.5

RUN mkdir -p /usr/src/brigittesbookclub
WORKDIR /usr/src/brigittesbookclub

COPY . /usr/src/brigittesbookclub

RUN npm i

ENV DOCKER_MONGO_ADDRESS mongo
ENV PORT 80

RUN npm run build

EXPOSE 80
CMD ["npm", "start"]
