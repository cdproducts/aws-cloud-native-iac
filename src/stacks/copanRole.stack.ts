import { Duration, RemovalPolicy, Stack, StackProps, aws_iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AwsEcrRepository } from "../constructs/ecrRepository";
import { AwsRole } from "../constructs/role";

export class CopanDevRoleStack extends Stack {
  testRole: AwsRole;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.testRole = new AwsRole(this, "test-role", {
      roleName: "test-role",
      description: "dev",
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com')
    });
  }
}
