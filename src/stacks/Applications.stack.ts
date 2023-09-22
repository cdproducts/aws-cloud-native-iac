import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Microservice } from "../constructs/ecsCompute";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { AwsSecurityGroups } from "../constructs/security";
import { ImageRepositoryStack } from "./ImageRepository.stack";
import { CodeRepositoryStack } from "./CodeRepository.stack";
import { config } from "dotenv";
import { NetworkingStack } from "./Networking.stack";
import { ClusterStack } from "./EcsCluster.stack";
import { tfPimMicroservice } from "./services/tfPim";
import { SecretsStack } from "./Secrets.stack";

export interface MicroServiceStackProps extends StackProps {
  network: NetworkingStack;
  repository: ImageRepositoryStack;
  computeCluster: ClusterStack;
  config: any;
  secret: SecretsStack;
  // codeRepositoryStack: CodeRepositoryStack;
}

export class MicroServicesStack extends Stack {
  tfPim: Microservice;
  constructor(scope: Construct, id: string, props: MicroServiceStackProps) {
    super(scope, id, props);

    this.tfPim = tfPimMicroservice(
      this,
      props,
      props.secret.tfPimSecret.secret
    );
  }
}
