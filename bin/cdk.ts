#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { config } from "../config/config";
import { ClusterStack } from "../src/stacks/EcsCluster.stack";
import { CopanNetworkingStack } from "../src/stacks/Networking.stack";
import { PersistanceStack } from "../src/stacks/Persistance.stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { CopanMicroServicesStack } from "../src/stacks/copanApplications.stack";
import { CopanDevEcrRepositoryStack } from "../src/stacks/copanRepository.stack";
import { S3Stack } from "../src/stacks/copanS3.stack";
import { CodeRepositoryStack } from "../src/stacks/CodeRepository.stack";

const app = new cdk.App();
const network = new CopanNetworkingStack(app, "networkingStack-ecommerce", {
  stackName: "networkingStackLatest",
  env: {
    region: config.aws.region,
    account: config.aws.account,
  },
  environment: config.environment!,
  orgName: config.orgName!,
  vpcName: "ecommerce",
  natGatewayCount: 2,
});

const computeCluster = new ClusterStack(
  app,
  `${config.orgName}-computeClusterStack-${config.environment}`,
  {
    stackName: `${config.orgName}-computeClusterStack-${config.environment}`,
    vpc: network.awsNetwork,
    clusterName: `ecommerce`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    namespace: "ecommerce",
    environment: config.environment!,
    orgName: config.orgName!,
  }
);

const repoStack = new CopanDevEcrRepositoryStack(
  app,
  `${config.orgName}-ecrRespositoryStack-${config.environment}`,
  {
    stackName: `${config.orgName}-ecrRespositoryStack-${config.environment}`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    environment: config.environment!,
    orgName: config.orgName!,
  }
);

const persistance = new PersistanceStack(
  app,
  `${config.orgName}-persistanceStack-${config.environment}`,
  {
    stackName: `${config.orgName}-persistanceStack-${config.environment}`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    vpc: network.awsNetwork,
    environment: config.environment!,
    orgName: config.orgName!,
  }
);

// const codeRepositoryStack = new CodeRepositoryStack(
//   app,
//   `${config.orgName}-codeRepository-${config.environment}`,
//   {
//     environment: config.environment!,
//     orgName: config.orgName!,
//     env: {
//       region: config.aws.region,
//       account: config.aws.account,
//     },
//   }
// );

const microServicesStack = new CopanMicroServicesStack(
  app,
  `${config.orgName}-microservice-${config.environment}`,
  {
    stackName: `${config.orgName}-microservice-${config.environment}`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    network: network,
    computeCluster: computeCluster,
    repository: repoStack,
    config: config,
  }
);

const s3Stack = new S3Stack(app, `${config.orgName}-s3-${config.environment}`, {
  environment: config.environment!,
  orgName: config.orgName!,
  env: {
    region: config.aws.region,
    account: config.aws.account,
  },
});

// Dont deploy

// const role = new CopanDevRoleStack(app, "copan-roleStack");

// const s3Stack = new S3BucketStack(app, "copancs-s3Stack", {
//   role: role.testRole,
//   env: {
//     region: config.aws.region,
//     account: config.aws.account,
//   },
// });

// Dont deploy
