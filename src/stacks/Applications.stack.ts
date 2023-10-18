import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Microservice } from "../constructs/ecsCompute";
import { ImageRepositoryStack } from "./ImageRepository.stack";
import { NetworkingStack } from "./Networking.stack";
import { ClusterStack } from "./EcsCluster.stack";
import { SecretsStack } from "./Secrets.stack";
import { tfCustomerOnboarding } from "./services/tfCustomerOnboarding";

export interface MicroServiceStackProps extends StackProps {
  network: NetworkingStack;
  // repository: ImageRepositoryStack;
  computeCluster: ClusterStack;
  config: any;
  secret: SecretsStack;
  // codeRepositoryStack: CodeRepositoryStack;
}

export class MicroServicesStack extends Stack {
  tfPim: Microservice;
  tfPom: Microservice;
  tfCustomerOnboarding: Microservice;

  constructor(scope: Construct, id: string, props: MicroServiceStackProps) {
    super(scope, id, props);

    this.tfCustomerOnboarding = tfCustomerOnboarding(
      this,
      props,
      props.secret.tfPimSecret.secret
    );
  }
}
