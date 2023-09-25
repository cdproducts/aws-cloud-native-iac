import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AwsEcrRepository } from "../constructs/ecrRepository";

export interface EcrRepositoryStackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class ImageRepositoryStack extends Stack {
  tfPim: AwsEcrRepository;
  tfPom: AwsEcrRepository;

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

    this.tfPom = new AwsEcrRepository(
      this,
      `${props.orgName}-pom-${props.environment}`,
      {
        repoName: "pom",
        clientPrefix: props.environment,
        environment: props.environment,
        orgName: props.orgName,
      }
    );
  }
}
