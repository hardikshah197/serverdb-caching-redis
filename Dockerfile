FROM node:9-slim
LABEL DEV=hardikshah.hs2015@gmail.com
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 4000
CMD ["npm", "start"]