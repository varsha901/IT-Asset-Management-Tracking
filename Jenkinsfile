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
                -var="app_name=$APP_NAME"
            '''
          }
        }
      }
    }

    stage('Package') {
  steps {
    sh '''
      rm -rf artifacts package
      mkdir -p artifacts package

      cp package.json package/
      cp package-lock.json package/
      cp -r src package/
      cp -r public package/

      cd package
      npm ci --omit=dev
      zip -r ../artifacts/assettrack.zip .
    '''
  }
}

    stage('Publish artifacts') {
      steps {
        archiveArtifacts artifacts: 'artifacts/assettrack.zip', fingerprint: true
      }
    }

    stage('Deploy to Azure App Service') {
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
              SCM_DO_BUILD_DURING_DEPLOYMENT="false"

             az webapp config set \
               --resource-group "$RESOURCE_GROUP" \
               --name "$APP_NAME" \
               --startup-file "npm start"
  
            az webapp deployment source config-zip \
             --resource-group "$RESOURCE_GROUP" \
             --name "$APP_NAME" \
             --src artifacts/assettrack.zip

            curl -f https://$APP_NAME.azurewebsites.net/api/health
          '''
        }
      }
    }
  }
}
