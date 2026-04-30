FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./server.js
COPY public ./public

RUN mkdir -p /app/docs

EXPOSE 6006

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:6006/home.html').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
