import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AwsEcsCluster } from "../constructs/ecsCluster";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";

export interface IEcsClusterStackProps extends StackProps {
  vpc: ec2.Vpc;
  clusterName: string;
  environment: string;
  orgName: string;
  namespace: string;
}

export class ClusterStack extends Stack {
  clusterInformation: AwsEcsCluster;
  clusterName: string;
  namespace: servicediscovery.PrivateDnsNamespace;
  constructor(scope: Construct, id: string, props: IEcsClusterStackProps) {
    super(scope, id, props);
    this.clusterName = props.clusterName;

    const ecsCluster = new AwsEcsCluster(this, "cluster", {
      clusterName: `${props.orgName}-${this.clusterName}-${props.environment}`,
      vpc: props.vpc,
      env: props.environment,
    });

    this.clusterInformation = ecsCluster;

    const dnsNamespace = new servicediscovery.PrivateDnsNamespace(
      this,
      "DnsNamespace",
      {
        name: props.namespace,
        vpc: props.vpc,
        description: "Private DnsNamespace for Microservices",
      }
    );

    this.namespace = dnsNamespace;
  }
}
