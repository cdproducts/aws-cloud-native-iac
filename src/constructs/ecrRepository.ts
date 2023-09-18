import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { RemovalPolicy } from "aws-cdk-lib";

export interface IAwsEcrRepoProps {
  repoName: string;
  clientPrefix: string;
  environment: string;
  orgName: string;
}

export class AwsEcrRepository extends Construct {
  public readonly repoName: string;
  public readonly clientPrefix: string;
  public readonly repoInformation: ecr.Repository;
  constructor(scope: Construct, id: string, props: IAwsEcrRepoProps) {
    super(scope, id);

    this.repoName = props.repoName;
    this.clientPrefix = props.clientPrefix;

    const repository = new ecr.Repository(
      this,
      `${this.clientPrefix}-repository`,
      {
        repositoryName: `${props.orgName}-${this.repoName}-${props.environment}`,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    this.repoInformation = repository;
  }
}
