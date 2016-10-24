const AWS = require('aws-sdk');
const autoScaling = new AWS.AutoScaling();
const ECS = new AWS.ECS();
const S3 = new AWS.S3();

module.exports.polling = (event, context, callback) => {
  console.log('ポーリング中です...');
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
        console.log('スケール完了');
        callback(null, 'スケール完了');
      } else {
        const putObjectParams = {
          Bucket: 'yukiyan-lambda-polling',
          Key: 'kick',
          Body: 'invoke...',
        };
        setTimeout(() => {
          console.log('ポーリング中です...');
        }, 10000);
        S3.putObject(putObjectParams).promise();
        callback(null, 'ポーリング中です...');
      }
    })
    .catch((error) => {
      console.log(error, error.stack);
      callback(error);
    });
};
