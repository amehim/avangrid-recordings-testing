# K8s Prerequisites Deployment
# Manual Kubernetes Setup (One-Time Tasks)

This document outlines the **Kubernetes resources created manually** during the Avangrid Call Recording App deployment (outside of Terraform).

These are one-time setup steps that should be documented for future reference.

---

## 1. cert-manager CRDs
Install Custom Resource Definitions for cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml
```

## 2. cert-manager Core Components
Create the `cert-manager` namespace and deploy the controller:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
```

Verify:
```bash
kubectl get pods -n cert-manager
```

## 3. IngressClass for nginx
Create the IngressClass resource required by cert-manager for HTTP-01 challenge:
```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
```
Apply with:
```bash
kubectl apply -f <file>.yaml
# or inline
kubectl apply -f - <<EOF
<insert above YAML here>
EOF
```

## 4. DNS Configuration
Ensure that your domain DNS settings point to the Azure LoadBalancer IP:
- A record `<your-frontend-domain>` → `<your-azure-loadbalancer-IP>`

Check DNS propagation:
```bash
dig +short <your-frontend-domain>
```

Ensure the Ingress controller external IP matches the DNS record.

---

### ✅ After these are in place, cert-manager + Ingress + TLS termination will work as expected with Terraform-managed resources.

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
