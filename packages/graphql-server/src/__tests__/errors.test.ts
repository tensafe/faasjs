import { Func } from '@faasjs/func';
import { Http } from '@faasjs/http';
import { GraphQLServer } from '../index';

describe('errors', function () {
  test('Unknown method', async function () {
    const handler = new Func({ plugins: [new Http(), new GraphQLServer({ config: { schemas: [] } })] }).export().handler;

    const res = await handler({});

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual('{"error":{"message":"Unknown method"}}');
  });

  test('playground', async function () {
    const handler = new Func({ plugins: [new Http(), new GraphQLServer({ config: { schemas: [] } })] }).export().handler;

    const res = await handler({
      httpMethod: 'GET',
      path: '/'
    });
  
    expect(res.statusCode).toEqual(200);
    expect(res.headers['Content-Type']).toEqual('text/html');
  });

  test('Missing body', async function () {
    const handler = new Func({ plugins: [new Http(), new GraphQLServer({ config: { schemas: [] } })] }).export().handler;

    const res = await handler({
      httpMethod: 'POST',
      path: '/'
    });
  
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual('{"error":{"message":"Missing body"}}');
  });
});
