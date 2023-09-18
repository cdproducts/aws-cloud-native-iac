import * as cdk from "aws-cdk-lib";
import { StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface IS3StackProps extends StackProps {
  environment: string;
  orgName: string;
}

export class S3Stack extends cdk.Stack {
  tfPimFrontend: cdk.aws_s3.Bucket;

  constructor(scope: Construct, id: string, props?: IS3StackProps) {
    super(scope, id, props);

    this.tfPimFrontend = new s3.Bucket(
      this,
      `${props?.orgName}-s3StaticHosting-${props?.environment}`,
      {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
        accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
        websiteIndexDocument: "index.html",
        publicReadAccess: true,
        bucketName: `${props?.orgName}-tf-pim-${props?.environment}`,
      }
    );

    // // Add CORS Policy
    // this.tfPimFrontend.addCorsRule({
    //   allowedHeaders: ["*"],
    //   allowedMethods: [s3.HttpMethods.GET],
    //   allowedOrigins: ["*"],
    //   maxAge: 3000,
    // });

    // // Add Bucket Policy
    // this.tfPimFrontend.addToResourcePolicy(
    //   new cdk.aws_iam.PolicyStatement({
    //     actions: ["s3:GetObject", "s3:PutObject"],
    //     effect: cdk.aws_iam.Effect.ALLOW,
    //     resources: [`${this.tfPimFrontend.bucketArn}/*`],
    //     principals: [new cdk.aws_iam.ArnPrincipal("*")], // Allow all principals (you might want to be more restrictive in production)
    //   })
    // );

    // Output the website URL
    new cdk.CfnOutput(this, "WebsiteURL", {
      value: this.tfPimFrontend.bucketWebsiteUrl,
    });
  }
}
