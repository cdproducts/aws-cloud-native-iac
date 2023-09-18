import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";

export interface CodeRepositoryStackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class CodeRepositoryStack extends Stack {
  tfPimRepo: Repository;
  constructor(scope: Construct, id: string, props: CodeRepositoryStackProps) {
    super(scope, id, props);

    // Create a CodeCommit repository
    const tfPimRepo = new Repository(
      this,
      `${props.orgName}-codeRepository-${props.environment}`,
      {
        repositoryName: `${props.orgName}_tfpim`,
        description: "Code repo for the TF PIM codebase",
      }
    );

    this.tfPimRepo = tfPimRepo;

    // Optionally, you can configure other properties like triggers, notifications, etc.
  }
}
