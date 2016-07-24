const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
import { CitizenService } from './src/services/citizen/CitizenService';
const log = require('bows')('API');

require('es6-promise').polyfill();
require('isomorphic-fetch');


const server  = new Hapi.Server();
const service = new CitizenService({ useLocalApi: false });

server.connection({ port: 3000, routes: { cors: true }  });

server.register(Inert, function () {});

server.route({
  method: 'GET'
, path: '/buergerservice/{id?}'
, handler: function(req, reply) {
    let id = req.params.id;
    if (id) {
      const date = new Date().toUTCString();
      return service.getPage(id)
                .then(r => r.text())
                .then(data => {
                    log(`[${date}] : [RESPONSE FOR] : ${id}`);
                    return reply(data);
                  })
                .catch(err => {
                  log(JSON.stringify(err, null, 4));
                  return reply({ message: 'error', data: err });
                });
    }
    reply('no result');
  }
});

/* start server */
server.start(function() {
  const date = new Date().toUTCString();
    log(`[${date}] : [SERVER START] : ${server.info.uri}`);
});