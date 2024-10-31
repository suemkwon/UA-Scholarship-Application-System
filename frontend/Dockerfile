FROM node:16-alpine

WORKDIR /app/frontend/

COPY package*.json /app/frontend/
COPY tsconfig.json /app/frontend/
RUN npm install

COPY . /app/frontend/

CMD ["npm", "start"]