import "dotenv/config";

const {
  REGION,
  STACK_NAME,
  BUCKET_NAME,
  VPC_NAME,
  VPC_CIDR,
  ACCOUNT_ID,
  ENVIRONMENT,
  ORG_NAME,
  BRANCH,
} = process.env;

export const config = {
  aws: {
    region: REGION ?? "ap-south-1",
    account: ACCOUNT_ID,
  },
  cloudFormation: {
    stackName: STACK_NAME ?? "dev_stack",
  },
  s3: {
    masterBucketName: BUCKET_NAME,
  },
  vpc: {
    name: VPC_NAME,
    cidr: VPC_CIDR,
  },
  environment: ENVIRONMENT,
  orgName: ORG_NAME,
  environmentBranch: BRANCH,
};
