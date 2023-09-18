import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { RemovalPolicy, aws_iam } from "aws-cdk-lib";
import { IManagedPolicy, IRole, PolicyDocument } from "aws-cdk-lib/aws-iam";

export interface IAwsRoleProps {
  roleName: string;
  description?: string;
  assumedBy: aws_iam.IPrincipal;
  inlinePolicies?: { [name: string]: PolicyDocument };
  managedPolicies?: IManagedPolicy[];
}

export class AwsRole extends Construct {
  public readonly roleName: string;
  public readonly description?: string;
  public readonly roleInformation: IRole;
  public readonly assumedBy: aws_iam.IPrincipal;
  public readonly inlinePolicies?: { [name: string]: PolicyDocument };
  public readonly managedPolicies?: IManagedPolicy[];
  constructor(scope: Construct, id: string, props: IAwsRoleProps) {
    super(scope, id);

    this.roleName = props.roleName;
    this.description = props.description;

    const role = new aws_iam.Role(this, "role", {
      assumedBy: this.assumedBy,
      description: this.description,
      inlinePolicies: this.inlinePolicies,
      managedPolicies: this.managedPolicies,
    });

    this.roleInformation = role;
  }
}
