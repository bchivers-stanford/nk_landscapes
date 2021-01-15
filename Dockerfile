# Dockerfile
FROM node:6.9

ENV METEOR_ALLOW_SUPERUSER=true
ENV ROOT_URL http://127.0.0.1:3000
ENV PORT 3000
ENV MONGO_URL mongodb://MONGODB:27017/
RUN curl "https://install.meteor.com/" | sh

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN meteor npm install

EXPOSE 3000
EXPOSE 27017
EXPOSE 3001
CMD ["meteor --production --settings local.json"]