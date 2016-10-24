const AWS = require('aws-sdk');
const autoScaling = new AWS.AutoScaling();
const lambda = new AWS.Lambda();

module.exports.hello = (event, context, callback) => {
  const describeAutoScalingGroupsParams = {
    AutoScalingGroupNames: ['yukiyan-autoscaling-group-public'],
  };

  autoScaling.describeAutoScalingGroups(describeAutoScalingGroupsParams).promise()
    .then((response) => {
      console.log(JSON.stringify(response));
      const autoScalingGroup = response.AutoScalingGroups[0];
      const updateAutoScalingGroupParams = {
        AutoScalingGroupName: autoScalingGroup.AutoScalingGroupName,
        DesiredCapacity: autoScalingGroup.DesiredCapacity * 2,
      };
      autoScaling.updateAutoScalingGroup(updateAutoScalingGroupParams).promise();
    })
    .then((response) => {
      console.log(response);
      const invokeParams = {
        FunctionName: 'yukiyan-service-dev-polling',
        InvocationType: 'Event',
      };
      lambda.invoke(invokeParams);
      callback(null, 'ポーリング用のlambda functionを呼びました');
    })
    .catch((error) => {
      console.log(error, error.stack);
      callback(error);
    });
};
