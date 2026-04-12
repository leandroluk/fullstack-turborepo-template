import {Logger} from '@aws-lambda-powertools/logger';
import {Metrics, MetricUnit} from '@aws-lambda-powertools/metrics';
import {Tracer} from '@aws-lambda-powertools/tracer';
import {type APIGatewayProxyEvent, type APIGatewayProxyResult} from 'aws-lambda';

const logger = new Logger();
const metrics = new Metrics();
const tracer = new Tracer();

/**
 * Default handler for the Lambda function using Powertools
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing API Request', {event});
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
