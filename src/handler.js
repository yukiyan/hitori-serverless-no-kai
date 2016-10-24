const AWS = require('aws-sdk');
const autoScaling = new AWS.AutoScaling();

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
      callback(null, response);
    })
    .catch((error) => {
      console.log(error, error.stack);
      callback(error);
    });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
