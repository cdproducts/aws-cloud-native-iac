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
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";


export interface IPersistanceStackProps extends StackProps {
    environment: string;
    orgName: string;
    vpc: Vpc;
  }

export class PersistanceStack extends Stack {
  constructor(scope: Construct, id: string, props: IPersistanceStackProps) {
    super(scope, id, props);

    const engine = DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_13,
    });
    const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
    const port = 5432;
    const dbName = "my_awesome_db";

    // create database master user secret and store it in Secrets Manager
    // const masterUserSecret = new Secret(this, "db-master-user-secret", {
    //   secretName: "db-master-user-secret",
    //   description: "Database master user credentials",
    //   generateSecretString: {
    //     secretStringTemplate: JSON.stringify({ username: "postgres" }),
    //     generateStringKey: "password",
    //     passwordLength: 16,
    //     excludePunctuation: true,
    //   },
    // });

    // We know this VPC already exists
    // const myVpc = Vpc.fromLookup(this, "my-vpc", { vpcId: "vpc-098sdfs3452" });

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
    const dbInstance = new DatabaseInstance(this, "DB-1", {
      vpc: props.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      instanceType,
      engine,
      port,
      securityGroups: [dbSg],
      databaseName: dbName,
      credentials: rds.Credentials.fromGeneratedSecret("postgres"),
      backupRetention: Duration.days(0), // disable automatic DB snapshot retention
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // DB connection settings will be appended to this secret (host, port, etc.)
    // masterUserSecret.attach(dbInstance);
  }
}
