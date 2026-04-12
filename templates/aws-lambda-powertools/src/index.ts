import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

const logger = new Logger();
const metrics = new Metrics();
const tracer = new Tracer();

/**
 * Handler principal da função Lambda usando Powertools
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing API Request', { event });
  metrics.addMetric('SuccessfulRequest', MetricUnit.Count, 1);
  tracer.putAnnotation('path', event.path || '/');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from AWS Lambda Powertools Template!',
      event,
    }),
  };
};
