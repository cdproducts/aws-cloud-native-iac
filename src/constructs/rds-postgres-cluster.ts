import { Construct } from "constructs";
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";

export interface IRDSInstanceProps {
  environment: string;
  orgName: string;
  vpc: Vpc;
  dbName: string;
  instanceType: InstanceType;
  engine: rds.IInstanceEngine;
}

export class RDSCluster extends Construct {
  constructor(scope: Construct, id: string, props: IRDSInstanceProps) {
    super(scope, id);
    const port = 5432;
    const dbName = props.dbName;

    // Create a Security Group
    const dbSg = new SecurityGroup(this, `${props.orgName}-DB-cluster-SG-${props.environment}`, {
      securityGroupName: "Database-Cluster-SG",
      vpc: props.vpc,
    });

    // Add Inbound rule
    dbSg.addIngressRule(
      Peer.ipv4(props.vpc.vpcCidrBlock),
      Port.tcp(port),
      `Allow port ${port} for database connection from only within the VPC (${props.vpc.vpcId})`
    );

    // create RDS instance (PostgreSQL)
    const dbCluster = new rds.DatabaseCluster(
      this,
      `${props.orgName}-DB-cluster-${props.environment}`,
      {
        backup: {
          retention: Duration.days(10),
        },
        instances: 3,
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_13_4,
        }),
        port,
        storageEncrypted: true,
        credentials: rds.Credentials.fromGeneratedSecret("postgres"),
        removalPolicy: RemovalPolicy.RETAIN,
        deletionProtection: true,
        defaultDatabaseName: props.dbName,
        instanceProps: {
          vpc: props.vpc,
          vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
          instanceType: props.instanceType,
          securityGroups: [dbSg],
          enablePerformanceInsights: true,
          publiclyAccessible: false,
        },
      }
    );
  }
}
