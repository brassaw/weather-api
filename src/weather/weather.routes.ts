import { ReplyNoContinue, Request, RouteConfiguration } from 'hapi';

const data:{}[] = [];

export const routes: RouteConfiguration[] = [
  {
    method: 'GET',
    path: '/',
    handler: function (_request: Request, reply: ReplyNoContinue) {
      reply(JSON.stringify(data));
    }
  },
  {
    method: 'POST',
    path: '/add',
    handler: function (request: Request, reply: ReplyNoContinue) {
      data.push(JSON.parse(request.payload));
      reply('data added');
    }
  }
];
