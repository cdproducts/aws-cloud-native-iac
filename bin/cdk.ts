#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { config } from "../config/config";
import { ClusterStack } from "../src/stacks/EcsCluster.stack";
import { NetworkingStack } from "../src/stacks/Networking.stack";
import { PersistanceStack } from "../src/stacks/Persistance.stack";
import { MicroServicesStack } from "../src/stacks/Applications.stack";
import { SecretsStack } from "../src/stacks/Secrets.stack";
import { CodePipelineStack } from "../src/stacks/CodePipeline.stack";

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
  }
);

const computeCluster = new ClusterStack(
  app,
  `${config.orgName}-computeClusterStack-${config.environment}`,
  {
    stackName: `${config.orgName}-computeClusterStack-${config.environment}`,
    vpc: network.awsNetwork,
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
    // repository: repoStack,
    config: config,
    secret: secretStack,
  }
);

const pipelineStack = new CodePipelineStack(
  app,
  `${config.orgName}-pipeline-${config.environment}`,
  {
    environment: config.environment!,
    orgName: config.orgName!,
    microservices: microServicesStack,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
  }
);
