FROM node:24-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
EXPOSE 1500
CMD ["node", "server.js"]