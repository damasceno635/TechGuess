FROM node:18

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install


COPY . .

# Copiar os arquivos do frontend para dentro do container

COPY ../frontend ./frontend

EXPOSE 3000

CMD ["node", "server.js"]