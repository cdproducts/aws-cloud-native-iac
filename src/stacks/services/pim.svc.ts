import { Microservice } from "../../constructs/ecsCompute";
import {
  MicroServiceStackProps,
  MicroServicesStack,
} from "../Applications.stack";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export function tfPimService(
  instace: MicroServicesStack,
  props: MicroServiceStackProps,
  secret: secretsmanager.ISecret
): Microservice {
  return new Microservice(
    instace,
    `${props.config.orgName}-pim-svc-${props.config.environment}`,
    {
      branch: props.config.branch,
      environment: props.config.environment,
      orgName: props.config.orgName,
      ecsCluster: props.computeCluster.clusterInformation.clusterInformation,
      pathPattern: "/pim/*",
      task: {
        taskRoleName: "pim-taskRole",
        taskFamilyName: "pim-family",
        taskRoleDescription:
          "This is the task role for TF-customer-onboarding backend svc",
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
      serviceName: "pim-svc",
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
        cpuTargetUtilizationPolicyName: "customerOnboardingSvcCPUScalingPolicy",
        maxScalingCapacity: 5,
        minScalingCapacity: 0,
        memoryTargetUtilizationPolicyName:
          "customerOnboardingSvcMemoryScalingPolicy",
      },
      desiredTaskCount: 1,
      targetGroupPORT: 80,
      elb: props.network.loadBalancerInformation.albInformation,
      serviceDiscoveryNameSpace: props.computeCluster.namespace,
      containerAndHostConfig: {
        containerPort: 80,
        hostPort: 80,
      },
      connectToLoadBalancer: true,
      healthCheckPath: "/pim/health/",
      serviceSecurityGroupName: "pim-sg",
      securityGroupIdsToAllowInboundFrom: [
        {
          securityGroupId:
            props.network.loadBalancerSG.securityGroupInformation
              .securityGroupId!,
          port: 80,
          description: "Allow inbound from ALB on Port 80",
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
      priority: 5,
      listner: props.network.listnerInfo,
    }
  );
}
