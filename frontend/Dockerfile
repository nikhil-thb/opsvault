FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false && npm install --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
