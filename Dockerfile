FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

FROM node:22-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./

RUN npm ci --omit=dev

RUN apk del python3 make g++

COPY --from=builder /app/dist ./dist

RUN mkdir -p /data

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
