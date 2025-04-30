pipeline {
  agent any

  environment {
    AZURE_TENANT_ID       = credentials("AZURE_TENANT_ID")
    AZURE_CLIENT_ID       = credentials("AZURE_CLIENT_ID")
    AZURE_CLIENT_SECRET   = credentials("AZURE_CLIENT_SECRET")
    ACR_NAME              = 'callrecordingacr13215'
    RESOURCE_GROUP        = 'avangrid-grp'
    CLUSTER_NAME          = 'callrecordings-avangrid-aks'
    ACR_URL               = "callrecordingacr13215.azurecr.io"
    TF_VAR_acr_name       = 'callrecordingacr13215'
    TF_VAR_azure_blob_account_url         = 'https://avangrid.blob.core.windows.net/'
    TF_VAR_azure_blob_container_vpi       = 'vpi'
    TF_VAR_azure_blob_container_talkdesk  = 'talkdesk'
  }

  stages {
    stage('Checkout Repository') {
      steps {
        git branch: 'main', credentialsId: 'github-ssh-key', url: 'git@github.com:amehim/avangrid-recordings-testing.git'
      }
    }
    
    stage('Login to Azure and ACR') {
      steps {
        sh '''
          az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
          az acr login --name $ACR_NAME
        '''
      }
    }

    stage('Build and Push Backend Image') {
      steps {
        dir('backend') {
          sh '''
            docker build -t $ACR_URL/backend:latest .
            docker push $ACR_URL/backend:latest
          '''
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          sh '''
            npm install
            npm run build
          '''
        }
      }
    }

    stage('Build and Push Frontend Image') {
      steps {
        dir('frontend') {
          sh '''
            docker build -t $ACR_URL/frontend:latest .
            docker push $ACR_URL/frontend:latest
          '''
        }
      }
    }

    stage('Terraform Init & Apply') {
      steps {
        dir('terraform') {
          sh '''
            az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --overwrite-existing

            export TF_VAR_kubernetes_host=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
            export TF_VAR_kubernetes_client_certificate=$(kubectl config view --raw --minify -o jsonpath='{.users[0].user.client-certificate-data}')
            export TF_VAR_kubernetes_client_key=$(kubectl config view --raw --minify -o jsonpath='{.users[0].user.client-key-data}')
            export TF_VAR_kubernetes_cluster_ca_certificate=$(kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

            terraform init
            terraform apply -auto-approve
          '''
        }
      }
    }
  }
}
