import { Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import {
  ApplicationProtocol,
  ApplicationProtocolVersion,
  IpAddressType,
  SslPolicy,
  TargetType,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import { AwsLoadBalancer } from "../constructs/applicationLoadBalancer";
import { AwsNetwork } from "../constructs/network";
import { AwsSecurityGroups } from "../constructs/security";
import { CrossAccountZoneDelegationRecord } from "aws-cdk-lib/aws-route53";
import { AwsTargetGroup } from "../constructs/targetgroup";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export interface INetworkingStackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class NetworkingStack extends Stack {
  public readonly awsNetwork: ec2.Vpc;
  public readonly loadBalancerSG: AwsSecurityGroups;
  public readonly loadBalancerInformation: AwsLoadBalancer;
  public readonly listnerInfo: elb.ApplicationListener;
  constructor(scope: Construct, id: string, props: INetworkingStackProps) {
    super(scope, id, props);

    const subnetConfiguration = [
      {
        subnetType: ec2.SubnetType.PUBLIC,
        name: `${props.orgName}-public_subnet_1-${props.environment}`,
        cidrMask: 24,
      },
      {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        name: `${props.orgName}-private_subnet_1-${props.environment}`,
        cidrMask: 24,
      },
      {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        name: `${props.orgName}-persistance_subnet_1-${props.environment}`,
        cidrMask: 24,
      },
    ];

    const awsNetwork = new AwsNetwork(
      this,
      `${props.orgName}-awsNetwork-${props.environment}`,
      {
        subnetConfiguration: subnetConfiguration,
        cidr: "10.0.0.0/16",
        maxAzs: 2,
        vpcName: `${props.orgName}-ecommerce-${props.environment}`,
        natGateways: 2,
        env: props.environment,
      }
    );

    this.awsNetwork = awsNetwork.vpcDetails;

    const lbSecurityGroup = new AwsSecurityGroups(this, "awsLBSg", {
      env: props.environment,
      vpcDetails: this.awsNetwork,
      allowAllOutbound: true,
      securityGroupDescription: "Security Group for Load Balancer",
      securityGroupIngressRules: [
        {
          peer: ec2.Peer.ipv4("10.0.0.0/16"),
          connection: ec2.Port.tcp(80),
          description: "Allow Traffic from everywhere",
        },
        {
          peer: ec2.Peer.ipv4("0.0.0.0/0"),
          connection: ec2.Port.tcp(443),
          description: "Allow Traffic from everywhere",
        },
      ],
    });

    this.loadBalancerSG = lbSecurityGroup;

    const loadBalancer = new AwsLoadBalancer(this, "awsLB", {
      vpc: this.awsNetwork,
      internetFacing: true,
      loadBalancerName: `${props.orgName}-loadBalancer-${props.environment}`,
      deletionProtection: false,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      env: props.environment,
      securityGroup: lbSecurityGroup.securityGroupInformation,
      ipAddressType: IpAddressType.IPV4,
    });

    this.loadBalancerInformation = loadBalancer;

    // const listner = this.loadBalancerInformation.albInformation.addListener(
    //   "alb-listener",
    //   {
    //     open: true,
    //     port: 443,
    //     protocol: ApplicationProtocol.HTTPS,
    //     sslPolicy: SslPolicy.RECOMMENDED,
    //     certificates: [
    //       Certificate.fromCertificateArn(
    //         this,
    //         "cert",
    //         "arn:aws:acm:us-east-1:517557926571:certificate/7c1266d1-0d8c-4c2f-94fc-0a334b3910cd"
    //       ),
    //     ],
    //   }
    // );

    const listner = this.loadBalancerInformation.albInformation.addListener(
      "alb-listener",
      {
        open: true,
        port: 80,
        protocol: ApplicationProtocol.HTTP,
      }
    );

    this.listnerInfo = listner;

    const targetGroup = new AwsTargetGroup(this, "awsTg", {
      enableHealthChecks: true,
      targetGroupName: `${props.orgName}-default-tg-${props.environment}`,
      targetType: TargetType.IP,
      env: props.environment,
      vpc: this.awsNetwork,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      healthyThresholdCount: 5,
      unHealthyThresholdCount: 7,
      protocolVersion: ApplicationProtocolVersion.HTTP1,
      path: "/",
    });

    listner.addTargetGroups("awsListnerDefaultTg", {
      targetGroups: [targetGroup.tgInformation],
    });
  }
}
