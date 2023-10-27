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

    const tfCom = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfCustomerOnboarding.serviceName}-tf-com-svc-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfCustomerOnboarding.service,
        name: "com-svc",
        containerDetails: `ContainerName="${props.microservices.tfCom.containerInformation.containerName}"`,
      }
    );

    const tfAuth = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfCustomerOnboarding.serviceName}-tf-auth-svc-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfAuth.service,
        name: "auth-svc",
        containerDetails: `ContainerName="${props.microservices.tfAuth.containerInformation.containerName}"`,
      }
    );

    const tfPim = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfPim.serviceName}-tf-pim-svc-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfPim.service,
        name: "pim-svc",
        containerDetails: `ContainerName="${props.microservices.tfPim.containerInformation.containerName}"`,
      }
    );

    const tfOms = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfOms.serviceName}-tf-oms-svc-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfOms.service,
        name: "oms-svc",
        containerDetails: `ContainerName="${props.microservices.tfOms.containerInformation.containerName}"`,
      }
    );
  }
}
