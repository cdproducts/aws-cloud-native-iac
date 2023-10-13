import { Construct } from "constructs";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";

import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";

export interface ICodePipelineProps {
  repository: IRepository;
  service: ecs.FargateService;
  environment: string;
  orgName: string;
  containerDetails: string;
}

export class CodePipeline extends Construct {
  pipeline: codepipeline.Pipeline;
  constructor(scope: Construct, id: string, props: ICodePipelineProps) {
    super(scope, id);

    // new ecr.Repository(
    //   this,
    //   `${props.orgName}-repository-${props.environment}`,
    //   {
    //     repositoryName: `${props.orgName}-${props.repoName}-${props.environment}`,
    //     removalPolicy: RemovalPolicy.RETAIN,
    //   }
    // );

    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.EcrSourceAction({
      actionName: "Source",
      repository: props.repository,
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
      `build-project-${props.containerDetails}`,
      {
        buildSpec: buildSpec,
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
          privileged: true, // Required to use Docker
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
      `${props.orgName}-myecspipeline-${props.containerDetails}-${props.environment}`,
      {
        pipelineName: `${props.orgName}-${props.service.serviceName}-${props.environment}`,
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
  }
}
