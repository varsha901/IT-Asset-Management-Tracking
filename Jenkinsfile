pipeline {
  agent any
  
tools {
        nodejs 'NodeJS-20'
    }
  
  environment {
    APP_NAME = 'assettrack-app'
    RESOURCE_GROUP = 'assettrack-rg'
    AZURE_LOCATION = 'Australia East'
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

    stage('Deploy to Azure App Service') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([
          string(credentialsId: 'azure-client-id', variable: 'AZURE_CLIENT_ID'),
          string(credentialsId: 'azure-client-secret', variable: 'AZURE_CLIENT_SECRET'),
          string(credentialsId: 'azure-tenant-id', variable: 'AZURE_TENANT_ID'),
          string(credentialsId: 'azure-subscription-id', variable: 'AZURE_SUBSCRIPTION_ID'),
          string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
          string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
        ]) {
          sh '''
            az login --service-principal \
              -u "$AZURE_CLIENT_ID" \
              -p "$AZURE_CLIENT_SECRET" \
              --tenant "$AZURE_TENANT_ID"

            az account set --subscription "$AZURE_SUBSCRIPTION_ID"

            az webapp config appsettings set \
              --resource-group "$RESOURCE_GROUP" \
              --name "$APP_NAME" \
              --settings \
              MONGODB_URI="$MONGODB_URI" \
              JWT_SECRET="$JWT_SECRET" \
              NODE_ENV="production" \
              SCM_DO_BUILD_DURING_DEPLOYMENT="true"

            az webapp deploy \
              --resource-group "$RESOURCE_GROUP" \
              --name "$APP_NAME" \
              --src-path artifacts/assettrack.zip \
              --type zip

            curl -f https://$APP_NAME.azurewebsites.net/api/health
          '''
        }
      }
    }
  }
}
