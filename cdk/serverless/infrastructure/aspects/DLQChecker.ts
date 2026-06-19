import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cdk from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export class DLQChecker implements cdk.IAspect {

  public visit(node: IConstruct): void {
    if (node instanceof sqs.Queue) {
      const cfnQueue = node.node.defaultChild as sqs.CfnQueue;

      if (!cfnQueue) return;

      if (!cfnQueue.redrivePolicy) {
        if (node.node.id.toLowerCase().includes('dlq') || node.node.id.toLowerCase().includes('deadletter')) {
          return;
        }

        cdk.Annotations.of(node).addError("SQS Queue must have a Dead Letter Queue configured via redrivePolicy.");
      }
    }
  }
}