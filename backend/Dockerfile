FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY prisma ./prisma
COPY migrations ./migrations
COPY src ./src
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/server.js"]
