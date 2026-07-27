import { CodeBuildStep, CodePipeline, CodePipelineSource, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { AppStage } from './app-stage';
import { sharedConf } from '../config/shared';
import { getDevConfig, getProdConfig } from '../config';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class PipelineStack extends Stack {
  public readonly pipeline: CodePipeline

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    
    const repo = codecommit.Repository.fromRepositoryArn(this, 'CodeCommitRepo', sharedConf.repository.arn);

    this.pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: `${sharedConf.projectName}-pipeline`,
      synth: new CodeBuildStep('Synth', {
        projectName: `${sharedConf.projectName}-synth`,
        primaryOutputDirectory: "infrastructure/cdk.out",
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_7_0,
        },
        installCommands: [
          "bash $CODEBUILD_SRC_DIR/infrastructure/scripts/synth/install.sh",
        ],
        // Install dependencies, build and run cdk synth
        commands: [
          "bash $CODEBUILD_SRC_DIR/infrastructure/scripts/synth/build.sh",
        ],
        input: CodePipelineSource.codeCommit(
          repo,
          sharedConf.repository.branch,
        ),
        partialBuildSpec: BuildSpec.fromObject({
          phases: {
            install: {
              "runtime-versions": {
                nodejs: 20,
              },
            },
          },
        }),
      }),
    });

    const devConfig = getDevConfig();
    const devStage = new AppStage(this, "DevStage", {
      stackName: `dev-${devConfig.projectName}-stack`,
      env: { account: devConfig.account, region: devConfig.region },
      tags: {
        'project': devConfig.projectName,
        'owner': devConfig.owner,
        'env': devConfig.env
      },
      config: devConfig
    });

    this.pipeline.addStage(devStage)

    const prodConfig = getProdConfig();
    
    const prodStage = new AppStage(this, "ProdStage", {
      stackName: `prod-${prodConfig.projectName}-stack`,
      env: { account: prodConfig.account, region: prodConfig.region },
      tags: {
        'project': prodConfig.projectName,
        'owner': prodConfig.owner,
        'env': prodConfig.env
      },
      config: prodConfig
    });

    this.pipeline.addStage(prodStage, {
      pre: [new ManualApprovalStep('PromoteToProd')],
    });
  }
}