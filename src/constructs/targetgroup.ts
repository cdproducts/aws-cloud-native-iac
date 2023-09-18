import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2"
import * as ec2 from "aws-cdk-lib/aws-ec2"
import { Construct } from "constructs";
import { Duration, Resource } from "aws-cdk-lib";
import { TG } from "./constants";

export interface ITargetGroupConf {
    enableHealthChecks: boolean;
    port: number;
    protocol: elb.ApplicationProtocol;
    protocolVersion?: elb.ApplicationProtocolVersion;
    targetGroupName: string;
    targetType: elb.TargetType
    vpc: ec2.Vpc
    env: string;
    path?: string;
    healthCheckTimeOut?: Duration;
    healthyThresholdCount?: number;
    unHealthyThresholdCount?: number; 

}

export class AwsTargetGroup extends Construct {
  public readonly enableHealthChecks: boolean;
  public readonly port?: number;
  public readonly protocol?: elb.ApplicationProtocol;
  public readonly protocolVersion?: elb.ApplicationProtocolVersion;
  public readonly targetGroupName: string;
  public readonly targetType: elb.TargetType;
  public readonly vpc?: ec2.Vpc
  public readonly env: string;
  public readonly tgInformation: elb.ApplicationTargetGroup;
  public readonly path: string;
  public readonly healthCheckTimeOut: Duration;
  public readonly healthyThresholdCount: number; 
  public readonly unHealthyThresholdCount: number; 

  constructor(scope: Construct, id: string, props: ITargetGroupConf) {
        super(scope, id);
        this.enableHealthChecks = props.enableHealthChecks;
        this.port = props.port;
        this.protocol = props.protocol;
        this.protocolVersion = props.protocolVersion;
        this.targetGroupName = props.targetGroupName;
        this.targetType = props.targetType;
        this.vpc = props.vpc;
        this.env = props.env;
        this.path = props.path ?? '/';
        this.healthCheckTimeOut = props.healthCheckTimeOut ?? Duration.seconds(40);
        this.healthyThresholdCount = props.healthyThresholdCount ?? 5;
        this.unHealthyThresholdCount = props.unHealthyThresholdCount ?? 7

        const env = this.env + TG
        if(this.enableHealthChecks) {
           const tg = new elb.ApplicationTargetGroup(this, env, {
                targetType: this.targetType,
                targetGroupName: this.targetGroupName,
                port: this.port,
                protocol: this.protocol,
                protocolVersion: this.protocolVersion,
                vpc: this.vpc,
                healthCheck: {
                    enabled: this.enableHealthChecks,
                    path: this.path,
                    timeout: this.healthCheckTimeOut,
                    healthyThresholdCount: this.healthyThresholdCount,
                    healthyHttpCodes: "200",
                    interval: Duration.seconds(50)
                }
            })

            this.tgInformation = tg;
        } else {
            const tg = new elb.ApplicationTargetGroup(this, env, {
                targetType: this.targetType,
                targetGroupName: this.targetGroupName,
                vpc: this.vpc,
                port: this.port,
                protocol: this.protocol,
            })

            this.tgInformation = tg;
        }
    }
}
