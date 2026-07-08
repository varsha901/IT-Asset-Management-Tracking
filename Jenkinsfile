pipeline {
  agent any
  
tools {
        nodejs 'NodeJS-20'
    }
  
  environment {
    APP_NAME = 'mywebapp9632'
    RESOURCE_GROUP = 'assettrack-rg'
    APP_SERVICE_PLAN = 'myplan'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Provision Azure with Terraform') {
      steps {
        withCredentials([
          string(credentialsId: 'azure-client-id', variable: 'ARM_CLIENT_ID'),
          string(credentialsId: 'azure-client-secret', variable: 'ARM_CLIENT_SECRET'),
          string(credentialsId: 'azure-tenant-id', variable: 'ARM_TENANT_ID'),
          string(credentialsId: 'azure-subscription-id', variable: 'ARM_SUBSCRIPTION_ID')
        ]) {
          dir('infra/terraform') {
            sh '''
              terraform init

              terraform plan \
                -var="resource_group_name=$RESOURCE_GROUP" \
                -var="app_name=$APP_NAME" \
                -var="location=$AZURE_LOCATION" \
                -out=tfplan

              terraform apply -auto-approve tfplan
            '''
          }
        }
      }
    }

    stage('Package') {
      steps {
        sh '''
          rm -rf artifacts
          mkdir artifacts
          zip -r artifacts/assettrack.zip . \
            -x ".git/*" "node_modules/*" "artifacts/*"
        '''
      }
    }

    stage('Publish artifacts') {
      steps {
        archiveArtifacts artifacts: 'artifacts/assettrack.zip', fingerprint: true
      }
    }

    stage('Validate Existing Azure Infrastructure') {
  steps {
    withCredentials([
      string(credentialsId: 'azure-client-id', variable: 'ARM_CLIENT_ID'),
      string(credentialsId: 'azure-client-secret', variable: 'ARM_CLIENT_SECRET'),
      string(credentialsId: 'azure-tenant-id', variable: 'ARM_TENANT_ID'),
      string(credentialsId: 'azure-subscription-id', variable: 'ARM_SUBSCRIPTION_ID')
    ]) {
      dir('infra/terraform') {
        sh '''
          terraform init
          terraform plan \
            -var="resource_group_name=$RESOURCE_GROUP" \
            -var="app_service_plan_name=$APP_SERVICE_PLAN" \
            -var="app_name=$APP_NAME" \
            -out=tfplan

          terraform apply -auto-approve tfplan
        '''
      }
    }
  }
}
  }
