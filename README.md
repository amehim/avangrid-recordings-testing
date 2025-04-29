
# AKS Terraform & Jenkins CI/CD Deployment

This project automates deployment of a frontend (React) and backend (Node.js/Python) app on Azure Kubernetes Service using:

- Docker & Azure Container Registry (ACR)
- Jenkins CI/CD pipeline
- Terraform for Kubernetes deployments (pods, services, secrets)

## 📁 Structure

```
.
├── Jenkinsfile
├── terraform/
│   ├── main.tf
│   ├── namespace.tf
│   ├── backend-deployment.tf
│   ├── frontend-deployment.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── backend.tf
├── backend/        # your backend app
├── frontend/       # your frontend app
```

## ⚙️ Prerequisites

- Jenkins with Docker, Azure CLI, kubectl, terraform installed
- Azure AKS and ACR already created
- Backend and frontend folders with Dockerfiles

## 🔐 Azure Credentials (used in Jenkins)

- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- AZURE_TENANT_ID
- RESOURCE_GROUP
- CLUSTER_NAME
- ACR_NAME

## 🚀 Jenkins Pipeline Summary

1. Login to Azure and ACR
2. Build & Push Docker images for frontend/backend
3. Get AKS credentials
4. Run `terraform init` and `terraform apply` to deploy Kubernetes resources

## 📦 Terraform Deployment

To apply manually:

```bash
cd terraform
terraform init
terraform apply -auto-approve
```
