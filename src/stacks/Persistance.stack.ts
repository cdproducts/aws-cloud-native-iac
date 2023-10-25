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
import { RDSInstance } from "../constructs/rds-postgres";
import { RDSCluster } from "../constructs/rds-postgres-cluster";

export interface IPersistanceStackProps extends StackProps {
  environment: string;
  orgName: string;
  vpc: Vpc;
}

export class PersistanceStack extends Stack {
  rdsInstance: RDSInstance;
  rdsCluster: RDSCluster;
  constructor(scope: Construct, id: string, props: IPersistanceStackProps) {
    super(scope, id, props);

    this.rdsInstance = new RDSInstance(
      this,
      `${props.orgName}-RDSInstance-${props.environment}`,
      {
        dbName: "ecommerce",
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_13,
        }),
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
        environment: props.environment,
        orgName: props.orgName,
        vpc: props.vpc,
      }
    );

    // this.rdsCluster = new RDSCluster(
    //   this,
    //   `${props.orgName}-RDSCluster-${props.environment}`,
    //   {
    //     dbName: "ecommerce",
    //     engine: DatabaseInstanceEngine.postgres({
    //       version: PostgresEngineVersion.VER_13,
    //     }),
    //     instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
    //     environment: props.environment,
    //     orgName: props.orgName,
    //     vpc: props.vpc,
    //   }
    // );
  }
}
