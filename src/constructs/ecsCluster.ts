import * as ecs from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2"
import { CLUSTER } from "./constants";


export interface IClusterProps {
    vpc: ec2.Vpc,
    clusterName: string;
    env: string;
}

export class AwsEcsCluster extends Construct {
    public readonly vpc: ec2.Vpc;
    public readonly clusterName: string;
    public readonly clusterInformation: ecs.Cluster
    public readonly env: string;
    constructor(scope: Construct, id: string, props: IClusterProps) {
        super(scope, id);

        this.clusterName = props.clusterName;
        this.vpc = props.vpc;
        this.env = props.env;


        const env = this.env + CLUSTER
        const cluster = new ecs.Cluster(this, env, {
            clusterName: this.clusterName,
            containerInsights: true,
            vpc: this.vpc
        })

        this.clusterInformation = cluster;
    }
    
}