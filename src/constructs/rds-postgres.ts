import * as ec2 from "aws-cdk-lib/aws-ec2";
import { InstanceClass, InstanceSize } from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as core from "aws-cdk-lib";
import { RDS } from "./constants";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

export interface IRdsConf {
  readonly vpc: ec2.Vpc;
  readonly subnetType: ec2.SubnetType;
  readonly instanceClass: InstanceClass;
  readonly instanceSize: InstanceSize;
  readonly multiAz: boolean;
  readonly allocatedStorage: number;
  readonly maxAllocatedStorage: number;
  readonly allowMajorVersionUpgrade: boolean;
  readonly env: string;
  readonly autoMinorVersionUpgrade: boolean;
  readonly deleteAutomatedBackups: boolean;
  readonly removalPolicy: RemovalPolicy;
  readonly backUpRetention: Duration;
  readonly dbName: string;
  readonly instanceIdentifier: string;
  readonly securityGroup: ec2.ISecurityGroup[];
}

export class AwsRDS extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly subnetType: ec2.SubnetType;
  public readonly instanceClass: InstanceClass;
  public readonly instanceSize: InstanceSize;
  public readonly multiAz: boolean;
  public readonly allocatedStorage: number;
  public readonly maxAllocatedStorage: number;
  public readonly allowMajorVersionUpgrade: boolean;
  public readonly env: string;
  public readonly autoMinorVersionUpgrade: boolean;
  public readonly deleteAutomatedBackups: boolean;
  public readonly removalPolicy: RemovalPolicy;
  public readonly backUpRetention: Duration;
  public readonly dbName: string;
  public readonly dbInformation: rds.DatabaseInstance;
  public readonly dbReplicaInformation: rds.DatabaseInstanceReadReplica;
  public readonly instanceIdentifier: string;
  public readonly securityGroup: ec2.ISecurityGroup[];

  constructor(scope: Construct, id: string, props: IRdsConf) {
    super(scope, id);

    this.vpc = props.vpc;
    this.subnetType = props.subnetType;
    this.instanceClass = props.instanceClass;
    this.instanceSize = props.instanceSize;
    this.multiAz = props.multiAz;
    this.allocatedStorage = props.allocatedStorage;
    this.maxAllocatedStorage = props.maxAllocatedStorage;
    this.allowMajorVersionUpgrade = props.allowMajorVersionUpgrade;
    this.env = props.env;
    this.autoMinorVersionUpgrade = props.autoMinorVersionUpgrade;
    this.deleteAutomatedBackups = props.deleteAutomatedBackups;
    this.removalPolicy = props.removalPolicy;
    this.backUpRetention = props.backUpRetention;
    this.dbName = props.dbName;
    this.instanceIdentifier = props.instanceIdentifier;
    this.securityGroup = props.securityGroup;

    const env = this.env + RDS;
    const dbInstance = new rds.DatabaseInstance(this, env, {
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: this.subnetType,
      },
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: ec2.InstanceType.of(this.instanceClass, this.instanceSize),
      credentials: rds.Credentials.fromGeneratedSecret("postgres"),
      multiAz: this.multiAz,
      allocatedStorage: this.allocatedStorage,
      maxAllocatedStorage: this.maxAllocatedStorage,
      allowMajorVersionUpgrade: this.allowMajorVersionUpgrade,
      autoMinorVersionUpgrade: this.autoMinorVersionUpgrade,
      backupRetention: this.backUpRetention,
      deleteAutomatedBackups: this.deleteAutomatedBackups,
      removalPolicy: this.removalPolicy,
      deletionProtection: false,
      databaseName: this.dbName,
      publiclyAccessible: true,
      enablePerformanceInsights: true,
      storageEncrypted: true,
      instanceIdentifier: this.instanceIdentifier,
      iamAuthentication: false,
      securityGroups: this.securityGroup,
    });

    this.dbInformation = dbInstance;

    const dbReplica = new rds.DatabaseInstanceReadReplica(this, "replica", {
      sourceDatabaseInstance: this.dbInformation,
      instanceType: ec2.InstanceType.of(this.instanceClass, this.instanceSize),
      vpc: this.vpc,
      iamAuthentication: true,
      multiAz: true,
      instanceIdentifier: "replica",
      enablePerformanceInsights: true,
    });

    dbReplica.node.addDependency(this.dbInformation);

    this.dbReplicaInformation = dbReplica;

    new core.aws_cloudwatch.Alarm(this, "HighCPU", {
      metric: this.dbInformation.metricCPUUtilization(),
      threshold: 90,
      evaluationPeriods: 1,
    });

    // dbInstance.connections.allowFrom(ec2Instance, ec2.Port.tcp(5432));

    new core.CfnOutput(this, "dbEndpoint", {
      value: this.dbInformation.instanceEndpoint.hostname,
    });

    new core.CfnOutput(this, "secretName", {
      value: this.dbInformation.secret?.secretName!,
    });
  }
}
