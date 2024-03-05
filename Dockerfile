FROM node:17-alpine

#Change directory
WORKDIR /app

# cache node_modules
COPY package.json .

# run command to install packages
RUN npm install

# copy my source code
COPY . .


# build js version
RUN npm run build


# run command to start the server
CMD ["npm", "start"]