import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { StackProps } from "aws-cdk-lib";
import { Secrets } from "../constructs/secret";

export interface ISecretsStackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class SecretsStack extends cdk.Stack {
  tfPimSecret: Secrets;
  constructor(scope: Construct, id: string, props: ISecretsStackProps) {
    super(scope, id, props);

    this.tfPimSecret = new Secrets(this, "pimSecret", {
      secretName: "tfPim",
      orgName: props.orgName,
      environment: props?.environment,
    });
  }
}
