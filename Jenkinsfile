pipeline {
  agent any

  environment {
    ACR_NAME        = 'callrecordingacr19031'
    RESOURCE_GROUP  = 'avangrid-grp'
    CLUSTER_NAME    = 'callrecordings-avangrid-aks'
  }

  stages {
    stage('Checkout Repository') {
      steps {
        git branch: 'main', credentialsId: 'github-ssh-key', url: 'git@github.com:amehim/avangrid-recordings-testing.git'
      }
    }

    stage('Login to Azure and Build/Push Images') {
      steps {
        withCredentials([
          string(credentialsId: 'AZURE_CLIENT_ID', variable: 'AZURE_CLIENT_ID'),
          string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'AZURE_CLIENT_SECRET'),
          string(credentialsId: 'AZURE_TENANT_ID', variable: 'AZURE_TENANT_ID')
        ]) {
          sh '''
            az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
            az acr login --name $ACR_NAME

            # Build and push backend image
            cd backend
            docker build -t $ACR_NAME.azurecr.io/backend:latest .
            docker push $ACR_NAME.azurecr.io/backend:latest
            cd ..

            # Build frontend
            cd frontend
            npm install
            npm run build
            docker build -t $ACR_NAME.azurecr.io/frontend:latest .
            docker push $ACR_NAME.azurecr.io/frontend:latest
            cd ..
          '''
        }
      }
    }

    stage('Terraform Init & Apply') {
      steps {
        withCredentials([
          string(credentialsId: 'AZURE_CLIENT_ID', variable: 'AZURE_CLIENT_ID'),
          string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'AZURE_CLIENT_SECRET'),
          string(credentialsId: 'AZURE_TENANT_ID', variable: 'AZURE_TENANT_ID')
        ]) {
          dir('terraform') {
            sh '''
              az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --overwrite-existing

              export TF_VAR_kubernetes_host=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
              export TF_VAR_kubernetes_client_certificate=$(kubectl config view --raw --minify -o jsonpath='{.users[0].user.client-certificate-data}')
              export TF_VAR_kubernetes_client_key=$(kubectl config view --raw --minify -o jsonpath='{.users[0].user.client-key-data}')
              export TF_VAR_kubernetes_cluster_ca_certificate=$(kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

              export TF_VAR_azure_tenant_id=$AZURE_TENANT_ID
              export TF_VAR_azure_client_id=$AZURE_CLIENT_ID
              export TF_VAR_azure_client_secret=$AZURE_CLIENT_SECRET

              terraform init
              terraform apply -auto-approve
            '''
          }
        }
      }
    }
  }
}
