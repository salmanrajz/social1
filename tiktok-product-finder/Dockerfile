FROM apify/actor-node:18

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=prod

# Copy the source code
COPY . ./

# Set environment variables
ENV NODE_ENV=production

# Run the actor
CMD ["node", "main.js"]





