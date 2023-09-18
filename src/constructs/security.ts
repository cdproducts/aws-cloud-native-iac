import { Resource } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2"
import { Construct } from "constructs";
import { SG } from "./constants";

export interface ISecurityGroupIngressRule {
    peer: ec2.IPeer;
    connection: ec2.Port;
    description: string;
}

export interface ISecurityGroupConf {
    vpcDetails: ec2.Vpc;
    allowAllOutbound?: boolean;
    securityGroupDescription: string;
    securityGroupIngressRules: ISecurityGroupIngressRule[],
    env: string;
}

export class AwsSecurityGroups extends Construct {
  public readonly env: string;
  public readonly vpcDetails: ec2.Vpc
  public readonly allowOutbound?: boolean
  public readonly securityGroupDescription: string;
  public readonly securityGroupIngressRules: ISecurityGroupIngressRule[];
  public readonly securityGroupInformation: ec2.SecurityGroup

  constructor(scope: Construct, id: string, props: ISecurityGroupConf) {
    super(scope, id);
    this.vpcDetails = props.vpcDetails;
    this.allowOutbound = props?.allowAllOutbound;
    this.securityGroupDescription = props.securityGroupDescription;
    this.securityGroupIngressRules = props.securityGroupIngressRules;
    this.env = props.env


    const env = this.env + SG
    const sg = new ec2.SecurityGroup(this, env, {
        vpc: this.vpcDetails,
        allowAllOutbound: this.allowOutbound ? this.allowOutbound : true,
        description:  this.securityGroupDescription
    })

    for(const rule of this.securityGroupIngressRules) {
        sg.addIngressRule(rule.peer, rule.connection, rule.description)
    }

    this.securityGroupInformation = sg;


  }
}
