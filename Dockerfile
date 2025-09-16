FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm install pm2 -g

RUN npm cache clean --force && \
    rm -rf /var/cache/apk/*

CMD ["pm2-runtime", "dist/main.ts", "--name", "api"]
