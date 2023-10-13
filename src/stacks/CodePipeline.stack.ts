import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CodePipeline } from "../constructs/codepipeline";
import { MicroServicesStack } from "./Applications.stack";
import { AwsEcrRepository } from "../constructs/ecrRepository";
import { Rule } from "aws-cdk-lib/aws-events";

export interface CodeRepositoryStackProps extends StackProps {
  environment: string;
  orgName: string;
  microservices: MicroServicesStack;
}

export class CodePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: CodeRepositoryStackProps) {
    super(scope, id, props);

    const tfCustomerOnboardingPipeline = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfCustomerOnboarding.serviceName}-customer-onboarding-pipeline-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfCustomerOnboarding.service,
        name: "customer-onboarding", 
        containerDetails: `ContainerName="${props.microservices.tfCustomerOnboarding.containerInformation.containerName}"`,
      }
    );
  }
}
