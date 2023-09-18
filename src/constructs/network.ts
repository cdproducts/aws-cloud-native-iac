import { Resource } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2"
import { Construct } from "constructs";
import { VPC } from "./constants";

export interface IVpcConf {
  readonly subnetConfiguration: ec2.SubnetConfiguration[];
  readonly cidr: string;
  readonly maxAzs: number;
  readonly natGateways: number;
  readonly vpcName: string;
  readonly env: string;
}

export class AwsNetwork extends Construct {
  public readonly subnetConfiguration: ec2.SubnetConfiguration[];
  public readonly cidr: string;
  public readonly maxAzs: number;
  public readonly natGateways: number;
  public readonly vpcName: string;
  public readonly env: string;
  public readonly vpcDetails: ec2.Vpc

  constructor(scope: Construct, id: string, props: IVpcConf) {
    super(scope, id);

    this.subnetConfiguration = props.subnetConfiguration;
    this.cidr = props.cidr;
    this.maxAzs = props.maxAzs
    this.natGateways = props.natGateways;
    this.vpcName = props.vpcName;
    this.env = props.env;

    const env = this.env + VPC
    const vpc = new ec2.Vpc(this, env, {
      maxAzs: this.maxAzs, 
      vpcName: this.vpcName, 
      cidr: this.cidr, 
      subnetConfiguration: this.subnetConfiguration,
      natGateways: this.natGateways
    });

    this.vpcDetails = vpc;
  }
}
