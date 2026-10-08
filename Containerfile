FROM node:20-slim

WORKDIR /app

# Ferramentas de compilacao para o modulo nativo better-sqlite3
# (fallback caso nao exista binario pre-compilado para esta versao do Node)
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Dependencias primeiro, para aproveitar o cache de camadas
COPY package.json package-lock.json ./
RUN npm ci

# Codigo e build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Diretorio de persistencia (a suite escondida monta um volume aqui)
RUN mkdir -p /data

EXPOSE 8080

CMD ["node", "dist/index.js"]