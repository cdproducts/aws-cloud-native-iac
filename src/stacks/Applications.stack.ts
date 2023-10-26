import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Microservice } from "../constructs/ecsCompute";
import { NetworkingStack } from "./Networking.stack";
import { ClusterStack } from "./EcsCluster.stack";
import { SecretsStack } from "./Secrets.stack";
import { tfCustomerOnboarding } from "./services/tfCustomerOnboarding";
import { tfCustomerOnboardingSvc } from "./services/com.svc";
import { tfAuthService } from "./services/auth.svc";

export interface MicroServiceStackProps extends StackProps {
  network: NetworkingStack;
  computeCluster: ClusterStack;
  config: any;
  secret: SecretsStack;
}

export class MicroServicesStack extends Stack {
  tfCom: Microservice;
  tfCustomerOnboarding: Microservice;
  tfAuth: Microservice;

  constructor(scope: Construct, id: string, props: MicroServiceStackProps) {
    super(scope, id, props);

    this.tfCustomerOnboarding = tfCustomerOnboarding(this, props);

    this.tfCom = tfCustomerOnboardingSvc(
      this,
      props,
      props.secret.tfComSvcSecret.secret
    );

    this.tfAuth = tfAuthService(
      this,
      props,
      props.secret.tfAuthSvcSecret.secret
    );
  }
}
