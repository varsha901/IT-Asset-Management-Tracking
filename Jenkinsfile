pipeline {
  agent any

  environment {
    APP_NAME = 'assettrack-app'
    RESOURCE_GROUP = 'assettrack-rg'
    AZURE_LOCATION = 'eastus'
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

    stage('Package') {
      steps {
        sh 'mkdir -p artifacts && tar -czf artifacts/assettrack.tar.gz . --exclude=.git --exclude=node_modules'
      }
    }

    stage('Publish artifacts') {
      steps {
        archiveArtifacts artifacts: 'artifacts/assettrack.tar.gz', fingerprint: true
      }
    }

    stage('Deploy to Azure App Service') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'azure-service-principal', usernameVariable: 'AZURE_CLIENT_ID', passwordVariable: 'AZURE_CLIENT_SECRET')]) {
          sh '''
            az login --service-principal -u "$AZURE_CLIENT_ID" -p "$AZURE_CLIENT_SECRET" --tenant "$AZURE_TENANT_ID"
            az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --src-path artifacts/assettrack.tar.gz --type zip
            curl -f https://$APP_NAME.azurewebsites.net/api/health
          '''
        }
      }
    }
  }
}
