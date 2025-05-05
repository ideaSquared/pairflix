FROM node:20-alpine

WORKDIR /app

# Add package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Add rest of the code
COPY . .

EXPOSE 3000

# Use ts-node-dev for hot reloading in development
CMD ["npm", "run", "dev"]