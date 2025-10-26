FROM apify/actor-node:20

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --only=prod

# Copy source code
COPY . ./

# Run the actor
CMD ["node", "main.js"]





