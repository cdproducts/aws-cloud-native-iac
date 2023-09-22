#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { config } from "../config/config";
import { ClusterStack } from "../src/stacks/EcsCluster.stack";
import { NetworkingStack } from "../src/stacks/Networking.stack";
import { PersistanceStack } from "../src/stacks/Persistance.stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { MicroServicesStack } from "../src/stacks/Applications.stack";
import { ImageRepositoryStack } from "../src/stacks/ImageRepository.stack";
import { S3Stack } from "../src/stacks/S3.stack";
import { CodeRepositoryStack } from "../src/stacks/CodeRepository.stack";
import { SecretsStack } from "../src/stacks/Secrets.stack";

const app = new cdk.App();

const network = new NetworkingStack(
  app,
  `${config.orgName}-networkingStack-${config.environment}`,
  {
    stackName: `${config.orgName}-networkingStack-${config.environment}`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    environment: config.environment!,
    orgName: config.orgName!,
    vpcName: "ecommerce",
    natGatewayCount: 2,
    cidr: "10.0.0.0/16",
  }
);

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

const repoStack = new ImageRepositoryStack(
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

const secretStack = new SecretsStack(
  app,
  `${config.orgName}-secret-${config.environment}`,
  {
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    environment: config.environment!,
    orgName: config.orgName!,
  }
);

const microServicesStack = new MicroServicesStack(
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
    secret: secretStack,
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
