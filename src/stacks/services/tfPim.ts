import { Microservice } from "../../constructs/ecsCompute";
import {
  MicroServiceStackProps,
  MicroServicesStack,
} from "../Applications.stack";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";


export function tfPimMicroservice(
  instace: MicroServicesStack,
  props: MicroServiceStackProps,
  secret: secretsmanager.ISecret
): Microservice {
  return new Microservice(
    instace,
    `${props.config.orgName}-pim-BffService-${props.config.environment}`,
    {
      branch: props.config.branch,
      environment: props.config.environment,
      orgName: props.config.orgName,
      ecsCluster: props.computeCluster.clusterInformation.clusterInformation,
      pathPattern: "/api/v1/pim/*",
      task: {
        taskRoleName: "pim-bff-taskRole",
        taskFamilyName: "pim-task-family",
        taskRoleDescription: "This is the task role for TF-PIM",
        taskPolicyStatement: {
          effect: iam.Effect.ALLOW,
          actions: ["S3:*"],
          resources: ["*"],
        },
      },
      logging: {
        logGroupName: "pim-log-group",
        logStreamPrefix: "pim-log-stream",
      },
      healthCheck: {
        command: [
          "CMD-SHELL",
          "curl -f http://localhost:3000/swagger || exit 1",
        ],
        interval: Duration.seconds(30),
        retries: 3,
        startPeriod: Duration.seconds(30),
        timeout: Duration.seconds(5),
      },
      // codeRepository: props.codeRepositoryStack.tfPimRepo,
      repository: {
        repository: props.repository.tfPim.repoInformation,
        repoImageTag: "latest",
      },
      serviceName: "pim",
      cpuUnits: 512,
      memoryUnits: 1024,
      env: "dev",
      vpc: props.network.awsNetwork,
      targetGroupName: "pim-tg",
      autoScaling: {
        scaleOnCPUResourcePrefix: "scaleOnCPUResourcePrefix",
        scaleOnMemoryResourcePrefix: "scaleOnMemoryResourcePrefix",
        cpuTargetUtilizationPercent: 70,
        memoryTargetUtilizationPercent: 70,
        cpuTargetUtilizationPolicyName: "PimCPUScalingPolicy",
        maxScalingCapacity: 5,
        minScalingCapacity: 0,
        memoryTargetUtilizationPolicyName: "PimBffMemoryScalingPolicy",
      },
      desiredTaskCount: 1,
      targetGroupPORT: 3000,
      elb: props.network.loadBalancerInformation.albInformation,
      serviceDiscoveryNameSpace: props.computeCluster.namespace,
      containerAndHostConfig: {
        containerPort: 3000,
        hostPort: 3000,
      },
      connectToLoadBalancer: true,
      healthCheckPath: "/swagger",
      serviceSecurityGroupName: "pim-sg",
      securityGroupIdsToAllowInboundFrom: [
        {
          securityGroupId:
            props.network.loadBalancerSG.securityGroupInformation
              .securityGroupId!,
          port: 3000,
          description: "Allow inbound from ALB on Port 3000",
        },
      ],
      plainEnvVars: {
        APP_LANGUAGE: "en",
        APP_VERSIONING: "true",
        APP_DEBUG: "true",
      },
      keyNames: {
        APP_ENV: ecs.Secret.fromSecretsManager(secret, "APP_ENV"),
        APP_PORT: ecs.Secret.fromSecretsManager(secret, "APP_PORT"),
        DB_HOST: ecs.Secret.fromSecretsManager(secret, "DB_HOST"),
        DB_PORT: ecs.Secret.fromSecretsManager(secret, "DB_PORT"),
        DB_NAME: ecs.Secret.fromSecretsManager(secret, "DB_NAME"),
        DB_USER: ecs.Secret.fromSecretsManager(secret, "DB_USER"),
        DB_PASS: ecs.Secret.fromSecretsManager(secret, "DB_PASS"),
        JWT_ACCESS_TOKEN_EXP_IN_SEC: ecs.Secret.fromSecretsManager(
          secret,
          "JWT_ACCESS_TOKEN_EXP_IN_SEC"
        ),
        JWT_REFRESH_TOKEN_EXP_IN_SEC: ecs.Secret.fromSecretsManager(
          secret,
          "JWT_REFRESH_TOKEN_EXP_IN_SEC"
        ),
        JWT_PRIVATE_KEY_BASE64: ecs.Secret.fromSecretsManager(
          secret,
          "JWT_PRIVATE_KEY_BASE64"
        ),
        JWT_PUBLIC_KEY_BASE64: ecs.Secret.fromSecretsManager(
          secret,
          "JWT_PUBLIC_KEY_BASE64"
        ),
        DEFAULT_ADMIN_USER_PASSWORD: ecs.Secret.fromSecretsManager(
          secret,
          "DEFAULT_ADMIN_USER_PASSWORD"
        ),
      },
      priority: 2,
      listner: props.network.listnerInfo,
    }
  );
}
