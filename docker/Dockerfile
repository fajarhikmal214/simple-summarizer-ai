# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port your app will run on (replace 3000 with your app's port)
EXPOSE 3000

# Define the command to run your Node.js application
CMD [ "node", "app.js" ]
