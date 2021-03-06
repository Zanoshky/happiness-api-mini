# ######################
# PRODUCTION ENVIRONMENT
# ######################
FROM node:10-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

# Bind to all network interfaces so that it can be mapped to the host OS
ENV PORT=9443 NODE_ENV=production

EXPOSE ${PORT}
CMD [ "./node_modules/.bin/nodemon", "server.js" ]
