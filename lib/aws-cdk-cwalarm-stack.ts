import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cwactions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as iot from 'aws-cdk-lib/aws-iot';

const ruleNameList: string[] = ['Rpi1', 'Rpi2', 'Rpi3', 'Rpi4', 'Rpi5'];
const metricNameList: string[] = [
  'Connect.ClientIDThrottle',
  'Connect.ClientError',
  'PublishIn.ClientError',
];

export class AwsCdkCwalarmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ErrorNotifyTopic = new sns.Topic(this, `ErrorNotifyTopic`, {
      displayName: `ErrorNotifyTopic`,
      topicName: `ErrorNotifyTopic`,
    });

    for (let ruleName of ruleNameList) {
      const metric = new cloudwatch.Metric({
        namespace: 'AWS/IoT',
        metricName: 'TopicMatch',
        statistic: 'SampleCount',
        period: cdk.Duration.minutes(5),

        dimensionsMap: {
          RuleName: ruleName,
        },
      });

      const alarm = new cloudwatch.Alarm(
        this,
        'iot-twin-monitoring-TopicMatch-' + ruleName,
        {
          metric: metric,
          alarmName: 'iot-twin-monitoring-TopicMatch-' + ruleName,

          actionsEnabled: true,
          threshold: 10,
          evaluationPeriods: 1,
          datapointsToAlarm: 1,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
          comparisonOperator:
            cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
        }
      );

      const action = new cwactions.SnsAction(ErrorNotifyTopic);

      alarm.addAlarmAction(action);
    }

    for (let metricName of metricNameList) {
      const metric = new cloudwatch.Metric({
        namespace: 'AWS/IoT',
        metricName: metricName,
        statistic: 'SampleCount',
        period: cdk.Duration.minutes(5),
      });

      const alarm = new cloudwatch.Alarm(
        this,
        'iot-twin-monitoring-11' + metricName,
        {
          metric: metric,
          alarmName: 'iot-twin-monitoring-11' + metricName,

          actionsEnabled: true,
          threshold: 1,
          evaluationPeriods: 1,
          datapointsToAlarm: 1,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
          comparisonOperator:
            cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        }
      );

      const action = new cwactions.SnsAction(ErrorNotifyTopic);

      alarm.addAlarmAction(action);
    }

    // iot-twin-monitoring-Connect.ClientIDThrottle
    // // Chatbot Slack Notification Integration
    // const bot = new chatbot.CfnSlackChannelConfiguration(
    //   this,
    //   "sample-slack-notification",
    // {
    //   configurationName: "sample-slack-notification",
    //   iamRoleArn: chatbotRole.roleArn,
    //   slackChannelId: "<YOUR_CHANNEL_ID>",
    //   slackWorkspaceId: "<YOUR_WS_ID>",
    //   snsTopicArns: [topic.topicArn],
    // }
    // );
  }
}
