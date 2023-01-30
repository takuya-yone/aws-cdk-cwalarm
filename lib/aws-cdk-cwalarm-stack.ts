import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cwactions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as iot from 'aws-cdk-lib/aws-iot';

const ruleNameList: string[] = ['Rpi1', 'Rpi2', 'Rpi3', 'Rpi4', 'Rpi5'];

export class AwsCdkCwalarmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ErrorNotifyTopic = new sns.Topic(this, `ErrorNotifyTopic`, {
      displayName: `ErrorNotifyTopic`,
      topicName: `ErrorNotifyTopic`,
    });

    for (let ruleName in ruleNameList) {
      const metric = new cloudwatch.Metric({
        namespace: 'AWS/IoT',
        metricName: 'TopicMatch',
        statistic: 'SampleCount',
        period: cdk.Duration.minutes(5),

        dimensionsMap: {
          RuleName: ruleName,
        },
      });

      const alarm = new cloudwatch.Alarm(this, 'TopicMatchAlarm' + ruleName, {
        metric: metric,
        alarmName: 'TopicMatchAlarm-' + ruleName,
        actionsEnabled: true,
        threshold: 10,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator:
          cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      });

      const action = new cwactions.SnsAction(ErrorNotifyTopic);

      alarm.addAlarmAction(action);
    }

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
