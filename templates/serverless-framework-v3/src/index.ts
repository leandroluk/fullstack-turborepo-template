import {type APIGatewayProxyEvent, type APIGatewayProxyResult} from 'aws-lambda';

/**
 * Handler principal da função Lambda
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Serverless Framework v3 Template!',
      event,
    }),
  };
};
