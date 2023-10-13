import { Construct } from "constructs";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { RemovalPolicy } from "aws-cdk-lib";
import { Rule } from "aws-cdk-lib/aws-events";

export interface ICodePipelineProps {
  name: string;
  service: ecs.FargateService;
  environment: string;
  orgName: string;
  containerDetails: string;
}

export class CodePipeline extends Construct {
  pipeline: codepipeline.Pipeline;
  constructor(scope: Construct, id: string, props: ICodePipelineProps) {
    super(scope, id);

    const repository = new ecr.Repository(
      this,
      `${props.orgName}-${props.name}-repository-${props.environment}`, 
      {
        repositoryName: `${props.orgName}-${props.name}-${props.environment}`,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );

    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.EcrSourceAction({
      actionName: "Source",
      repository: repository,
      imageTag: "latest",
      output: sourceOutput,
    });

    const buildSpec = codebuild.BuildSpec.fromObject({
      version: "0.2",
      phases: {
        build: {
          commands: [
            "apt-get install jq -y",
            props.containerDetails,
            "ImageURI=$(cat imageDetail.json | jq -r '.ImageURI')",
            'printf \'[{"name":"CONTAINER_NAME","imageUri":"IMAGE_URI"}]\' > imagedefinitions.json',
            'sed -i -e "s|CONTAINER_NAME|$ContainerName|g" imagedefinitions.json',
            'sed -i -e "s|IMAGE_URI|$ImageURI|g" imagedefinitions.json',
            "cat imagedefinitions.json",
          ],
        },
      },
      artifacts: {
        files: ["imagedefinitions.json"],
      },
    });

    const buildProject = new codebuild.Project(
      this,
      `build-project-${props.name}`,
      {
        buildSpec: buildSpec,
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
          privileged: true,
        },
      }
    );

    const buildOutput = new codepipeline.Artifact("BuildOutput");

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Build",
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    const deployAction = new codepipeline_actions.EcsDeployAction({
      actionName: "Deploy",
      service: props.service,
      input: buildOutput,
    });

    this.pipeline = new codepipeline.Pipeline(
      this,
      `${props.orgName}-ecspipeline-${props.name}-${props.environment}`,
      {
        pipelineName: `${props.orgName}-${props.name}-${props.environment}`,
        stages: [
          {
            stageName: "source",
            actions: [sourceAction],
          },
          {
            stageName: "build",
            actions: [buildAction],
          },

          {
            stageName: "deploy-to-ecs",
            actions: [deployAction],
          },
        ],
      }
    );

    const customerOnboarding = new Rule(
      this,
      `${props.orgName}-${props.name}-base-ecr-rule-${props.environment}`,
      {
        eventPattern: {
          source: ["aws.ecr"],
          detail: {
            "action-type": ["PUSH"],
            "image-tag": ["latest"],
            "repository-name": [repository.repositoryName],
            result: ["SUCCESS"],
          },
        },
      }
    );
    customerOnboarding.addTarget(
      new events_targets.CodePipeline(this.pipeline)
    );
  }
}
