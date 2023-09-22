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
  public readonly repoInformation: ecr.Repository;
  constructor(scope: Construct, id: string, props: IAwsEcrRepoProps) {
    super(scope, id);

    this.repoInformation = new ecr.Repository(
      this,
      `${props.orgName}-repository-${props.environment}`,
      {
        repositoryName: `${props.orgName}-${props.repoName}-${props.environment}`,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );
  }
}
