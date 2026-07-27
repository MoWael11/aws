export interface Config {
  owner: string;
  projectName: string;
  region: string;
  account: string;
  env: string;
  bucketName: string;
  dynamodbTableName: string;
  repository: {
    arn: string;
    branch: string;
  }
}