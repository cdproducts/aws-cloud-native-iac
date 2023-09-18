import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AwsEcrRepository } from "../constructs/ecrRepository";

export interface EcrRepositoryStackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class CopanDevEcrRepositoryStack extends Stack {
  tfPim: AwsEcrRepository;
  constructor(scope: Construct, id: string, props: EcrRepositoryStackProps) {
    super(scope, id, props);

    this.tfPim = new AwsEcrRepository(
      this,
      `${props.orgName}-pim-${props.environment}`,
      {
        repoName: "pim",
        clientPrefix: props.environment,
        environment: props.environment,
        orgName: props.orgName,
      }
    );
  }
}
