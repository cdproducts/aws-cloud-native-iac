import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codedeploy from "aws-cdk-lib/aws-codedeploy";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as logs from "aws-cdk-lib/aws-logs";
import { CLUSTER } from "./constants";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import { Protocol } from "aws-cdk-lib/aws-ecs";
import {
  ApplicationProtocol,
  ApplicationProtocolVersion,
  TargetType,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AwsTargetGroup } from "./targetgroup";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";
import { Duration, RemovalPolicy, SecretValue } from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { Repository } from "aws-cdk-lib/aws-codecommit";

export interface IAutoScalingInfo {
  minScalingCapacity: number;
  maxScalingCapacity: number;
  memoryTargetUtilizationPercent: number;
  cpuTargetUtilizationPercent: number;
  memoryTargetUtilizationPolicyName: string;
  cpuTargetUtilizationPolicyName: string;
  scaleOnMemoryResourcePrefix: string;
  scaleOnCPUResourcePrefix: string;
}

export interface IServiceSecurityGroup {
  connectable: ec2.IConnectable;
  port: ec2.Port;
  description: string;
}

export interface ITaskInfo {
  taskRoleDescription: string;
  taskPolicyStatement: iam.PolicyStatementProps;
  taskFamilyName: string;
  taskRoleName: string;
}

// export interface IRepositoryInfo {
//   repository: IRepository;
//   repoImageTag?: string;
// }

export interface ILogInfo {
  logGroupName: string;
  logStreamPrefix: string;
}

export interface ITargetGroupInfo {
  targetGroupName: string;
  targetGroupPORT: number;
}

export interface IContainerAndHostConfig {
  containerPort: number;
  hostPort: number;
}

export interface IEcsComputeProps {
  vpc: ec2.Vpc;
  env: string;
  task: ITaskInfo;
  branch: string;
  cpuUnits: number;
  memoryUnits: number;
  // repository: IRepositoryInfo;
  logging: ILogInfo;
  ecsCluster: ecs.Cluster;
  desiredTaskCount: number;
  serviceName: string;
  autoScaling: IAutoScalingInfo;
  targetGroupName: string;
  targetGroupPORT: number;
  elb: elb.ApplicationLoadBalancer;
  serviceDiscoveryNameSpace: servicediscovery.PrivateDnsNamespace;
  healthCheckPath?: string;
  containerAndHostConfig: IContainerAndHostConfig;
  connectToLoadBalancer: boolean;
  securityGroupIdsToAllowInboundFrom?: IsecurityGroupIdsToAllowInboundFrom[];
  environmentVariables?: string;
  priority: number;
  serviceSecurityGroupName: string;
  plainEnvVars?: { [key: string]: string };
  pathPattern: string;
  healthCheck?: ecs.HealthCheck;
  keyNames?: {
    [key: string]: ecs.Secret;
  };
  listner: elb.ApplicationListener;
  orgName: string;
  environment: string;
  // codeRepository: Repository;
}

export interface IsecurityGroupIdsToAllowInboundFrom {
  securityGroupId: string;
  port: number;
  description: string;
}

export class Microservice extends Construct {
  // public readonly codeRepository: Repository;
  public service: ecs.FargateService;
  public readonly orgName: string;
  public readonly environment: string;
  public readonly vpc: ec2.Vpc;
  public readonly env: string;
  public readonly taskRoleName: string;
  public readonly taskRoleDescription: string;
  public readonly taskPolicyStatement: iam.PolicyStatementProps;
  public readonly taskFamilyName: string;
  public readonly cpuUnits: number;
  public readonly memoryUnits: number;
  // public readonly repository: IRepository;
  public readonly repoImageTag?: string;
  public readonly containerResourcePrefix: string;
  public readonly ecsCluster: ecs.Cluster;
  public readonly desiredTaskCount: number;
  public readonly serviceResourcePrefix: string;
  public readonly serviceName: string;
  public readonly autoScalingInfo: IAutoScalingInfo;
  public readonly scaleOnMemoryResourcePrefix: string;
  public readonly scaleOnCPUResourcePrefix: string;
  public readonly targetGroupName: string;
  public readonly targetGroupPORT: number;
  public readonly elb: elb.ApplicationLoadBalancer;
  public readonly serviceDiscoveryNameSpace: servicediscovery.PrivateDnsNamespace;
  public readonly containerAndHostConfig: IContainerAndHostConfig;
  public readonly logging: ILogInfo;
  public readonly connectToLoadBalancer: boolean;
  public readonly pathPattern: string;
  public readonly securityGroupIdsToAllowInboundFrom?: IsecurityGroupIdsToAllowInboundFrom[];
  public serviceSecurityGroupInfo: ec2.SecurityGroup;
  public readonly environmentVariables?: string;
  private readonly healthCheckPath?: string;
  public readonly listner: elb.IApplicationListener;
  public readonly targetGroupInformation: AwsTargetGroup;
  public readonly serviceInformation: ecs.FargateService;
  public readonly ecsFargateTaskDefinitionInformation: ecs.FargateTaskDefinition;
  public readonly logGroupInformation: logs.LogGroup;
  public readonly containerInformation: ecs.ContainerDefinition;
  public readonly healthCheck?: ecs.HealthCheck;
  public readonly branch: string;
  public readonly taskRoleInformation: iam.Role;
  private readonly serviceSecurityGroupName: string;
  private readonly priority: number;
  private secret: secretsmanager.ISecret;
  private plainEnvVars?: { [key: string]: string };
  private keyNames?: {
    [key: string]: ecs.Secret;
  };

  constructor(scope: Construct, id: string, props: IEcsComputeProps) {
    super(scope, id);
    this.vpc = props.vpc;
    this.env = props.env;
    this.branch = this.branch;
    this.orgName = props.orgName;
    this.environment = props.environment;
    this.taskRoleName = props.task.taskRoleName;
    this.taskRoleDescription = props.task.taskRoleDescription;
    this.taskPolicyStatement = props.task.taskPolicyStatement;
    this.taskFamilyName = props.task.taskFamilyName;
    this.cpuUnits = props.cpuUnits;
    this.memoryUnits = props.memoryUnits;
    // this.repository = props.repository.repository;
    // this.repoImageTag = props.repository.repoImageTag;
    this.ecsCluster = props.ecsCluster;
    this.desiredTaskCount = props.desiredTaskCount;
    this.serviceName = props.serviceName;
    this.autoScalingInfo = props.autoScaling;
    this.targetGroupName = props.targetGroupName;
    this.targetGroupPORT = props.targetGroupPORT;
    this.elb = props.elb;
    this.healthCheck = props.healthCheck;
    this.serviceDiscoveryNameSpace = props.serviceDiscoveryNameSpace;
    this.containerAndHostConfig = props.containerAndHostConfig;
    this.logging = props.logging;
    this.connectToLoadBalancer = props.connectToLoadBalancer;
    this.securityGroupIdsToAllowInboundFrom =
      props.securityGroupIdsToAllowInboundFrom;
    this.environmentVariables = props.environmentVariables;
    this.healthCheckPath = props.healthCheckPath;
    this.serviceSecurityGroupName = props.serviceSecurityGroupName;
    this.plainEnvVars = props.plainEnvVars;
    this.keyNames = props.keyNames;
    this.priority = props.priority;
    this.pathPattern = props.pathPattern;
    // this.codeRepository = props.codeRepository;

    this.taskRoleInformation = this.createNewTaskRole();
    this.ecsFargateTaskDefinitionInformation =
      this.createNewFargateTaskDefinition();
    this.logGroupInformation = this.createNewLogGroup();
    this.containerInformation = this.createNewContainerWithDefinition();

    if (this.connectToLoadBalancer) {
      this.targetGroupInformation = this.createTargetGroup();
      this.listner = props.listner;
      this.createNewListnerRule();
    }

    this.service = this.serviceInformation = this.createNewFargateService();
    if (this.connectToLoadBalancer) {
      this.serviceInformation.attachToApplicationTargetGroup(
        this.targetGroupInformation.tgInformation
      );
    }
    this.createNewAutoScalingForService();
    // this.createPipeline(props);
  }

  private createNewTaskRole() {
    const taskRole = new iam.Role(this, this.environment + "taskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: `${this.orgName}-${this.taskRoleName}-${this.environment}`,
      description: this.taskRoleDescription,
    });

    taskRole.attachInlinePolicy(
      new iam.Policy(this, this.env + "iamInlinePolicy", {
        statements: [new iam.PolicyStatement(this.taskPolicyStatement)],
      })
    );

    return taskRole;
  }

  private createNewFargateTaskDefinition() {
    const td = new ecs.FargateTaskDefinition(
      this,
      this.env + "taskDefinition",
      {
        family: this.taskFamilyName,
        cpu: this.cpuUnits,
        taskRole: this.taskRoleInformation,
        memoryLimitMiB: this.memoryUnits,
      }
    );

    const ecrFullAccessStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ecr:*"],
      resources: ["*"], // This grants access to all ECR repositories. Narrow this down if needed.
    });

    td.addToExecutionRolePolicy(ecrFullAccessStatement);
    return td;
  }

  private createNewLogGroup() {
    return new logs.LogGroup(this, this.env + "logGroup", {
      logGroupName: `${this.logging.logGroupName}-${this.environment}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  private createNewContainerWithDefinition() {
    return this.ecsFargateTaskDefinitionInformation.addContainer(
      this.env + "container",
      {
        image: ecs.RepositoryImage.fromRegistry("nginx"),
        portMappings: [
          {
            containerPort: this.containerAndHostConfig.containerPort,
            hostPort: this.containerAndHostConfig.hostPort,
            protocol: Protocol.TCP,
          },
        ],
        secrets: this.keyNames,
        environment: this.plainEnvVars,
        healthCheck: this.healthCheck ? this.healthCheck : undefined,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: this.logging.logStreamPrefix,
          logGroup: this.logGroupInformation,
        }),
      }
    );
  }

  private createNewFargateService() {
    return new ecs.FargateService(this, this.env + "service", {
      cluster: this.ecsCluster,
      desiredCount: this.desiredTaskCount,
      taskDefinition: this.ecsFargateTaskDefinitionInformation,
      securityGroups: [this.createNewSecurityGroupForService()],
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      assignPublicIp: false,
      enableECSManagedTags: true,
      serviceName: `${this.orgName}-${this.serviceName}-${this.environment}`,
      circuitBreaker: { rollback: true },
      cloudMapOptions: {
        name: this.serviceName,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        cloudMapNamespace: this.serviceDiscoveryNameSpace,
      },
    });
  }

  private createNewSecurityGroupForService() {
    const sg = new ec2.SecurityGroup(this, this.env + "alb-SG", {
      vpc: this.vpc!,
      allowAllOutbound: true,
      securityGroupName: this.serviceSecurityGroupName,
    });

    if (this.securityGroupIdsToAllowInboundFrom) {
      for (const group of this.securityGroupIdsToAllowInboundFrom) {
        sg.addIngressRule(
          ec2.Peer.securityGroupId(group.securityGroupId),
          ec2.Port.tcp(group.port),
          group.description
        );
      }
    }

    this.serviceSecurityGroupInfo = sg;

    return sg;
  }

  private createNewAutoScalingForService() {
    const scalableTaget = this.serviceInformation.autoScaleTaskCount({
      minCapacity: this.autoScalingInfo.minScalingCapacity,
      maxCapacity: this.autoScalingInfo.maxScalingCapacity,
    });

    scalableTaget.scaleOnMemoryUtilization(
      this.autoScalingInfo.scaleOnMemoryResourcePrefix,
      {
        targetUtilizationPercent:
          this.autoScalingInfo.memoryTargetUtilizationPercent,
        policyName: this.autoScalingInfo.memoryTargetUtilizationPolicyName,
      }
    );

    scalableTaget.scaleOnCpuUtilization(
      this.autoScalingInfo.scaleOnCPUResourcePrefix,
      {
        targetUtilizationPercent:
          this.autoScalingInfo.cpuTargetUtilizationPercent,
        policyName: this.autoScalingInfo.cpuTargetUtilizationPolicyName,
      }
    );
  }

  private createTargetGroup() {
    const targetGroup = new AwsTargetGroup(this, this.env + "awsTg", {
      enableHealthChecks: true,
      targetGroupName: this.targetGroupName,
      targetType: TargetType.IP,
      env: this.env,
      vpc: this.vpc!,
      port: this.targetGroupPORT,
      protocol: ApplicationProtocol.HTTP,
      healthyThresholdCount: 5,
      unHealthyThresholdCount: 7,
      protocolVersion: ApplicationProtocolVersion.HTTP1,
      path: this.healthCheckPath,
    });

    return targetGroup;
  }

  private createNewListnerRule() {
    new elb.CfnListenerRule(this, this.env + "listnerRule", {
      listenerArn: this.listner.listenerArn,
      priority: this.priority,
      conditions: [{ field: "path-pattern", values: [this.pathPattern] }],
      actions: [
        {
          targetGroupArn:
            this.targetGroupInformation.tgInformation.targetGroupArn,
          type: "forward",
        },
      ],
    });
  }

  // private createPipeline(props: IEcsComputeProps) {
  //   const sourceOutput = new codepipeline.Artifact("imagedefinitions");

  //   const sourceAction = new codepipeline_actions.EcrSourceAction({
  //     actionName: "ECR",
  //     repository: props.repository.repository,
  //     imageTag: "latest", // optional, default: 'latest'
  //     output: sourceOutput,
  //   });

  //   const deployAction = new codepipeline_actions.EcsDeployAction({
  //     actionName: "deployAction",
  //     service: this.serviceInformation, // Assuming `this.serviceInformation` is defined elsewhere
  //     imageFile: new codepipeline.ArtifactPath(
  //       sourceOutput,
  //       "imagedefinitions"
  //     ),
  //   });

  //   new codepipeline.Pipeline(this, "myecspipeline", {
  //     stages: [
  //       {
  //         stageName: "source",
  //         actions: [sourceAction],
  //       },
  //       {
  //         stageName: "deploy-to-ecs",
  //         actions: [deployAction],
  //       },
  //     ],
  //   });
  // }
}
