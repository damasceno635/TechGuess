FROM node:18

WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código da API
COPY . .

# Copiar os arquivos do frontend para dentro do container
# IMPORTANTE: O caminho ../frontend será relativo ao contexto de build
COPY ../frontend ./frontend

EXPOSE 3000

CMD ["node", "server.js"]