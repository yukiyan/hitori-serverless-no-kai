const AWS = require('aws-sdk');
const autoScaling = new AWS.AutoScaling();
const ECS = new AWS.ECS();

module.exports.polling = (event, context, callback) => {
  const describeAutoScalingGroupsParams = {
    AutoScalingGroupNames: ['yukiyan-autoscaling-group-public'],
  };
  const listContainerInstancesParams = {
    cluster: 'yukiyan-public',
  };

  Promise.all([
    autoScaling.describeAutoScalingGroups(describeAutoScalingGroupsParams).promise(),
    ECS.listContainerInstances(listContainerInstancesParams).promise(),
  ])
    .then((responses) => {
      console.log(JSON.stringify(responses));
      const desiredCapacity = responses[0].AutoScalingGroups[0].DesiredCapacity;
      const containerInstances = responses[1].containerInstanceArns.length;
      if (desiredCapacity === containerInstances) {
        callback(null, 'スケール完了');
      } else {
        callback(null, 'スケール未完了');
      }
    })
    .catch((error) => {
      console.log(error, error.stack);
      callback(error);
    });
};
