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

export interface MicroServiceStackProps extends StackProps {
  cluster: ecs.Cluster;
  repository: CopanDevEcrRepositoryStack;
  vpc: ec2.Vpc;
  elb: elb.ApplicationLoadBalancer;
  listnerInfo: elb.ApplicationListener;
  namespace: servicediscovery.PrivateDnsNamespace;
  albSg?: AwsSecurityGroups;
  environment: string;
  orgName: string;
  branch: string;
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
      `${props.orgName}-pim-BffService-${props.environment}`,
      {
        branch: props.branch,
        environment: props.environment,
        orgName: props.orgName,
        ecsCluster: props.cluster,
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
        vpc: props.vpc,
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
        elb: props.elb,
        serviceDiscoveryNameSpace: props.namespace,
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
              props.albSg?.securityGroupInformation.securityGroupId!,
            port: 3000,
            description: "Allow inbound from ALB on Port 3000",
          },
          //   {
          //     securityGroupId:
          //       this.cposDroid.serviceSecurityGroupInfo.securityGroupId,
          //     port: 8080,
          //     description: "Allow inbound from CPOSDroid on Port 8080",
          //   },
          //   {
          //     securityGroupId:
          //       this.cposConsoleDroid.serviceSecurityGroupInfo.securityGroupId,
          //     port: 8080,
          //     description: "Allow inbound from CPOSConsoleDroid on Port 8080",
          //   },
        ],
        // plainEnvVars: {
        //   APP_ENV: "development",
        //   APP_NAME: "Copan SalesPad",
        //   APP_HOST: "0.0.0.0",
        //   APP_PORT: "8080",
        //   APP_LANGUAGE: "en",
        //   APP_VERSIONING: "true",
        //   APP_DEBUG: "true",
        //   APP_TZ: "Asia/Jakarta",
        // },
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
        listner: props.listnerInfo,
      }
    );
  }
}
