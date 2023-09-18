import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2"

import * as ec2 from "aws-cdk-lib/aws-ec2"
import { Construct } from "constructs";
import { ALB, VPC } from "./constants";
import { Resource } from "aws-cdk-lib";

export interface ILoadBalancerConf {
  readonly vpc: ec2.Vpc;
  readonly deletionProtection?: boolean;
  readonly internetFacing: boolean;
  readonly ipAddressType: elb.IpAddressType;
  readonly loadBalancerName: string;
  readonly env: string;
  readonly securityGroup: ec2.ISecurityGroup;
  readonly vpcSubnets: ec2.SubnetSelection
}

export class AwsLoadBalancer extends Construct {
  public readonly vpc: ec2.Vpc;;
  public readonly deletionProtection?: boolean;
  public readonly internetFacing: boolean;
  public readonly ipAddressType: elb.IpAddressType;
  public readonly loadBalancerName: string;
  public readonly env: string;
  public readonly securityGroup: ec2.ISecurityGroup;
  public readonly vpcSubnets: ec2.SubnetSelection
  public readonly albInformation: elb.ApplicationLoadBalancer

  constructor(scope: Construct, id: string, props: ILoadBalancerConf) {
    super(scope, id);

    this.vpc = props.vpc;
    this.deletionProtection = props.deletionProtection;
    this.internetFacing = props.internetFacing
    this.ipAddressType = props.ipAddressType;
    this.loadBalancerName = props.loadBalancerName;
    this.env = props.env;
    this.securityGroup = props.securityGroup;
    this.vpcSubnets = props.vpcSubnets;


    const env = this.env + ALB
    const alb = new elb.ApplicationLoadBalancer(this, env, {
        vpc: this.vpc,
        securityGroup: this.securityGroup,
        internetFacing: this.internetFacing,
        loadBalancerName: this.loadBalancerName,
        deletionProtection: this.deletionProtection,
        vpcSubnets: this.vpcSubnets,
        ipAddressType: this.ipAddressType,
    })

    this.albInformation = alb;
  }
}
