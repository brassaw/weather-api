import { Server } from 'hapi';

import { routes } from './weather/weather.routes';

const Hapi = require('hapi');

const server: Server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.route(routes);

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
