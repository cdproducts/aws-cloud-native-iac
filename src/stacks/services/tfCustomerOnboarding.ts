import { Microservice } from "../../constructs/ecsCompute";
import {
  MicroServiceStackProps,
  MicroServicesStack,
} from "../Applications.stack";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export function tfCustomerOnboarding(
  instace: MicroServicesStack,
  props: MicroServiceStackProps,
  secret?: secretsmanager.ISecret
): Microservice {
  return new Microservice(
    instace,
    `${props.config.orgName}-customer-onboarding-fe-${props.config.environment}`,
    {
      branch: props.config.branch,
      environment: props.config.environment,
      orgName: props.config.orgName,
      ecsCluster: props.computeCluster.clusterInformation.clusterInformation,
      pathPattern: "/customer-onboarding/*",
      task: {
        taskRoleName: "customer-onboarding-taskRole",
        taskFamilyName: "customer-onboarding-family",
        taskRoleDescription: "This is the task role for TF-customer-onboarding",
        taskPolicyStatement: {
          effect: iam.Effect.ALLOW,
          actions: ["S3:*"],
          resources: ["*"],
        },
      },
      logging: {
        logGroupName: "customer-onboarding-log-group",
        logStreamPrefix: "customer-onboarding-log-stream",
      },
      // healthCheck: {
      //   command: [
      //     "CMD-SHELL",
      //     "curl -f http://localhost:80/customer-onboarding/dashboard || exit 1",
      //   ],
      //   interval: Duration.seconds(30),
      //   retries: 3,
      //   startPeriod: Duration.seconds(30),
      //   timeout: Duration.seconds(5),
      // },
      serviceName: "customer-onboarding",
      cpuUnits: 1024,
      memoryUnits: 2048,
      env: "dev",
      vpc: props.network.awsNetwork,
      targetGroupName: "customer-onboarding-tg",
      autoScaling: {
        scaleOnCPUResourcePrefix: "scaleOnCPUResourcePrefix",
        scaleOnMemoryResourcePrefix: "scaleOnMemoryResourcePrefix",
        cpuTargetUtilizationPercent: 70,
        memoryTargetUtilizationPercent: 70,
        cpuTargetUtilizationPolicyName: "customerOnboardingCPUScalingPolicy",
        maxScalingCapacity: 5,
        minScalingCapacity: 0,
        memoryTargetUtilizationPolicyName:
          "customerOnboardingMemoryScalingPolicy",
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
      healthCheckPath: "/customer-onboarding/dashboard",
      serviceSecurityGroupName: "customer-onboarding-sg",
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
      priority: 2,
      listner: props.network.listnerInfo,
    }
  );
}
