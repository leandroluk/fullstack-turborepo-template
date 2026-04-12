import {APIGatewayProxyEvent, Context} from 'aws-lambda';
import {handler} from './index';

/**
 * Arquivo para testar e debugar a execução da Lambda localmente
 * Pode ser rodado com tsx ou ts-node e utilizar breakpoints na IDE
 */

const mockEvent: Partial<APIGatewayProxyEvent> = {
  path: '/hello',
  httpMethod: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  queryStringParameters: null,
  body: null,
};

const mockContext: Partial<Context> = {
  awsRequestId: 'local-debug-request-id',
  functionName: 'PowertoolsLocalTemplate',
};

async function runLocal() {
  console.log('--- STARTING LOCAL EXECUTION ---');
  try {
    const response = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      () => {}
    );
    console.log('--- RESPONSE ---');
    console.log(response);
  } catch (error) {
    console.error('--- ERROR ---', error);
  }
}

runLocal();
