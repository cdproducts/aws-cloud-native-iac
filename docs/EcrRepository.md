# ECR Repository Stack Configuration 🏬

The ECR Repository Stack facilitates the creation of an Elastic Container Registry (ECR) repository, allowing you to store, manage, and deploy Docker images securely.

```typescript (./bin/cdk.ts)
// Code snippet for ECR repository stack
const repoStack = new CopanDevEcrRepositoryStack(
  app,
  `${config.orgName}-ecrRespositoryStack-${config.environment}`,
  {
    stackName: `${config.orgName}-ecrRespositoryStack-${config.environment}`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    environment: config.environment!,
    orgName: config.orgName!,
  }
);
```

This code snippet illustrates the setup of an ECR Repository Stack using the `CopanDevEcrRepositoryStack` constructor. It's designed to seamlessly create an Elastic Container Registry (ECR) repository, enabling secure management and deployment of Docker images.



## Create a new Instance of the AwsEcrReposity for each of your services and assign in to a variable to later use it


```typescript (./src/stacks/Repository.stack.ts)
// Code snippet for ECR repository stack
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AwsEcrRepository } from "../constructs/ecrRepository";

export interface EcrRepositoryStackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class RepositoryStack extends Stack {
  tfPim: AwsEcrRepository;
  constructor(scope: Construct, id: string, props: EcrRepositoryStackProps) {
    super(scope, id, props);

    this.tfPim = new AwsEcrRepository(
      this,
      `${props.orgName}-pim-${props.environment}`,
      {
        repoName: "pim",
        clientPrefix: props.environment,
        environment: props.environment,
        orgName: props.orgName,
      }
    );
  }
}
```

---

*Note: For detailed usage instructions and further information, please refer to the [documentation](docs/README.md) provided in this repository.*