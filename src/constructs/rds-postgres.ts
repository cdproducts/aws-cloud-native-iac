import { Construct } from "constructs";
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from "aws-cdk-lib/aws-rds";
import * as rds from "aws-cdk-lib/aws-rds";

export interface IRDSInstanceProps {
  environment: string;
  orgName: string;
  vpc: Vpc;
  dbName: string;
  instanceType: InstanceType;
  engine: rds.IInstanceEngine;
}

export class RDSInstance extends Construct {
  constructor(scope: Construct, id: string, props: IRDSInstanceProps) {
    super(scope, id);

    const engine = DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_13,
    });
    const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
    const port = 5432;
    const dbName = props.dbName;

    // Create a Security Group
    const dbSg = new SecurityGroup(this, "Database-SG", {
      securityGroupName: "Database-SG",
      vpc: props.vpc,
    });

    // Add Inbound rule
    dbSg.addIngressRule(
      Peer.ipv4(props.vpc.vpcCidrBlock),
      Port.tcp(port),
      `Allow port ${port} for database connection from only within the VPC (${props.vpc.vpcId})`
    );

    // create RDS instance (PostgreSQL)
    const dbInstance = new DatabaseInstance(
      this,
      `${props.orgName}-DB-1-${props.environment}`,
      {
        vpc: props.vpc,
        vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
        instanceType: props.instanceType,
        engine: props.engine,
        port,
        securityGroups: [dbSg],
        databaseName: `${props.orgName}${dbName}${props.environment}`,
        credentials: rds.Credentials.fromGeneratedSecret("postgres"),
        backupRetention: Duration.days(0), // disable automatic DB snapshot retention
        deleteAutomatedBackups: true,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );
  }
}
