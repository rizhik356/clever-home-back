FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Сначала компилируем TypeScript в JavaScript
RUN npm run build

RUN npm install pm2 -g

RUN npm cache clean --force && \
    rm -rf /var/cache/apk/*

# Запускаем скомпилированный JavaScript файл
CMD ["pm2-runtime", "dist/main.js", "--name", "api"]
