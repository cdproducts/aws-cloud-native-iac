import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { CopancsMicroservice } from "../constructs/ecsCompute";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { AwsSecurityGroups } from "../constructs/security";
import { CopanDevEcrRepositoryStack } from "./copanRepository.stack";
import { CodeRepositoryStack } from "./CodeRepository.stack";
import { config } from "dotenv";
import { CopanNetworkingStack } from "./Networking.stack";
import { ClusterStack } from "./EcsCluster.stack";

export interface MicroServiceStackProps extends StackProps {
  network: CopanNetworkingStack;
  repository: CopanDevEcrRepositoryStack;
  computeCluster: ClusterStack;
  config: any;
  secret?: secretsmanager.ISecret;
  // codeRepositoryStack: CodeRepositoryStack;
}

export class CopanMicroServicesStack extends Stack {
  tfPim: CopancsMicroservice;
  constructor(scope: Construct, id: string, props: MicroServiceStackProps) {
    super(scope, id, props);

    const tfPimSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "dev/tradeful/pim",
      "arn:aws:secretsmanager:us-east-1:517557926571:secret:dev/tradeful/pim-CiOB3f"
    );

    this.tfPim = new CopancsMicroservice(
      this,
      `${props.config.orgName}-pim-BffService-${props.config.environment}`,
      {
        branch: props.config.branch,
        environment: props.config.environment,
        orgName: props.config.orgName,
        ecsCluster: props.computeCluster.clusterInformation.clusterInformation,
        pathPattern: "/api/v1/pim/*",
        task: {
          taskRoleName: "tf-pim-bff-taskRole",
          taskFamilyName: "tf-pim-task-family",
          taskRoleDescription: "This is the task role for TF-PIM",
          taskPolicyStatement: {
            effect: iam.Effect.ALLOW,
            actions: ["S3:*"],
            resources: ["*"],
          },
        },
        logging: {
          logGroupName: "tf-pim-log-group",
          logStreamPrefix: "tf-pim-log-stream",
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
        targetGroupName: "tf-pim-tg",
        autoScaling: {
          scaleOnCPUResourcePrefix: "scaleOnCPUResourcePrefix",
          scaleOnMemoryResourcePrefix: "scaleOnMemoryResourcePrefix",
          cpuTargetUtilizationPercent: 70,
          memoryTargetUtilizationPercent: 70,
          cpuTargetUtilizationPolicyName: "TFPimCPUScalingPolicy",
          maxScalingCapacity: 5,
          minScalingCapacity: 0,
          memoryTargetUtilizationPolicyName: "TFPimBffMemoryScalingPolicy",
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
        serviceSecurityGroupName: "tf-pim-sg",
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
          APP_ENV: ecs.Secret.fromSecretsManager(tfPimSecret, "APP_ENV"),
          APP_PORT: ecs.Secret.fromSecretsManager(tfPimSecret, "APP_PORT"),
          DB_HOST: ecs.Secret.fromSecretsManager(tfPimSecret, "DB_HOST"),
          DB_PORT: ecs.Secret.fromSecretsManager(tfPimSecret, "DB_PORT"),
          DB_NAME: ecs.Secret.fromSecretsManager(tfPimSecret, "DB_NAME"),
          DB_USER: ecs.Secret.fromSecretsManager(tfPimSecret, "DB_USER"),
          DB_PASS: ecs.Secret.fromSecretsManager(tfPimSecret, "DB_PASS"),
          JWT_ACCESS_TOKEN_EXP_IN_SEC: ecs.Secret.fromSecretsManager(
            tfPimSecret,
            "JWT_ACCESS_TOKEN_EXP_IN_SEC"
          ),
          JWT_REFRESH_TOKEN_EXP_IN_SEC: ecs.Secret.fromSecretsManager(
            tfPimSecret,
            "JWT_REFRESH_TOKEN_EXP_IN_SEC"
          ),
          JWT_PRIVATE_KEY_BASE64: ecs.Secret.fromSecretsManager(
            tfPimSecret,
            "JWT_PRIVATE_KEY_BASE64"
          ),
          JWT_PUBLIC_KEY_BASE64: ecs.Secret.fromSecretsManager(
            tfPimSecret,
            "JWT_PUBLIC_KEY_BASE64"
          ),
          DEFAULT_ADMIN_USER_PASSWORD: ecs.Secret.fromSecretsManager(
            tfPimSecret,
            "DEFAULT_ADMIN_USER_PASSWORD"
          ),
        },
        priority: 2,
        listner: props.network.listnerInfo,
      }
    );
  }
}
