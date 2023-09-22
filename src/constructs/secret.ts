import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { RemovalPolicy, aws_iam } from "aws-cdk-lib";
import { IManagedPolicy, IRole, PolicyDocument } from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export interface ISecretProps {
  secretName: string;
  description?: string;
  environment: string;
  orgName: string;
}

export class Secrets extends Construct {
  public readonly secret: secretsmanager.Secret;
  public readonly secretName: string;
  public readonly description?: string;
  constructor(scope: Construct, id: string, props: ISecretProps) {
    super(scope, id);

    this.secretName = props.secretName;
    this.description = props.description;

    this.secret = new secretsmanager.Secret(
      this,
      `${props.orgName}-secret-${props.environment}`,
      {
        secretName: `${props.orgName}-${this.secretName}-${props.environment}`,
        description: this.description,
        removalPolicy: RemovalPolicy.RETAIN,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            APP_ENV: "postgres",
            APP_PORT: "3000",
            DB_HOST: "",
            DB_PORT: "5432",
            DB_NAME: "",
            DB_USER: "postgres",
            DB_PASS: "",
            JWT_ACCESS_TOKEN_EXP_IN_SEC: "3600",
            JWT_REFRESH_TOKEN_EXP_IN_SEC: "7200",
            JWT_PUBLIC_KEY_BASE64: "dwdd",
            JWT_PRIVATE_KEY_BASE64: "dwddwdws",
            DEFAULT_ADMIN_USER_PASSWORD: "admin-example",
            DB_SSL__REJECT_UNAUTHORIZED: "false",
          }),
          generateStringKey: "password",
          excludeCharacters: '/@"',
        },
      }
    );
  }
}
