import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CodePipeline } from "../constructs/codepipeline";
import { MicroServicesStack } from "./Applications.stack";
import { AwsEcrRepository } from "../constructs/ecrRepository";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import { Rule } from "aws-cdk-lib/aws-events";

export interface CodeRepositoryStackProps extends StackProps {
  environment: string;
  orgName: string;
  microservices: MicroServicesStack;
}

export class CodePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: CodeRepositoryStackProps) {
    super(scope, id, props);

    const tfPimRepo = new AwsEcrRepository(
      this,
      `${props.orgName}-pimrepo-${props.environment}`,
      {
        repoName: "pim",
        clientPrefix: props.environment,
        environment: props.environment,
        orgName: props.orgName,
      }
    );

    const pimPipeline = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfPim.serviceName}-pipeline-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfPim.service,
        repository: tfPimRepo.repoInformation,
        containerDetails: `ContainerName="${props.microservices.tfPim.containerInformation.containerName}"`,
      }
    );

    const eventRule = new Rule(
      this,
      `${props.orgName}-base-ecr-rule-${props.environment}`,
      {
        eventPattern: {
          source: ["aws.ecr"],
          detail: {
            "action-type": ["PUSH"],
            "image-tag": ["latest"],
            "repository-name": [tfPimRepo.repoInformation.repositoryName],
            result: ["SUCCESS"],
          },
        },
      }
    );
    eventRule.addTarget(new events_targets.CodePipeline(pimPipeline.pipeline));

    const tfPomRepo = new AwsEcrRepository(
      this,
      `${props.orgName}-pomrepo-${props.environment}`,
      {
        repoName: "pom",
        clientPrefix: props.environment,
        environment: props.environment,
        orgName: props.orgName,
      }
    );

    new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfPom.serviceName}-pipeline-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfPom.service,
        repository: tfPomRepo.repoInformation,
        containerDetails: `ContainerName="${props.microservices.tfPom.containerInformation.containerName}"`,
      }
    );

    const tfCustomerOnboardingRepo = new AwsEcrRepository(
      this,
      `${props.orgName}-tfCustomerOnboardingRepo-${props.environment}`,
      {
        repoName: "customer-onboarding",
        clientPrefix: props.environment,
        environment: props.environment,
        orgName: props.orgName,
      }
    );

    const tfCustomerOnboardingPipeline = new CodePipeline(
      this,
      `${props.orgName}-${props.microservices.tfPim.serviceName}-customer-onboarding-pipeline-${props.environment}`,
      {
        orgName: `${props.orgName}`,
        environment: `${props.environment}`,
        service: props.microservices.tfPim.service,
        repository: tfCustomerOnboardingRepo.repoInformation,
        containerDetails: `ContainerName="${props.microservices.tfCustomerOnboarding.containerInformation.containerName}"`,
      }
    );

    const customerOnboarding = new Rule(
      this,
      `${props.orgName}-customer-onbparding-base-ecr-rule-${props.environment}`,
      {
        eventPattern: {
          source: ["aws.ecr"],
          detail: {
            "action-type": ["PUSH"],
            "image-tag": ["latest"],
            "repository-name": [
              tfCustomerOnboardingRepo.repoInformation.repositoryName,
            ],
            result: ["SUCCESS"],
          },
        },
      }
    );
    customerOnboarding.addTarget(
      new events_targets.CodePipeline(tfCustomerOnboardingPipeline.pipeline)
    );
  }
}
