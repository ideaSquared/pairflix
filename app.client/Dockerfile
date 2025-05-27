FROM node:20-alpine

WORKDIR /app

# Add package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Add rest of the client code
COPY . .

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["npm", "run", "dev", "--", "--host"]