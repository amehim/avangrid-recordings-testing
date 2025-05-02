#!/bin/bash

set -e

RG="avangrid-grp"
AKS="callrecordings-avangrid-aks"
IPName="frontend-ingress-ip"
TFVARS_PATH=~/avangrid-recordings-testing/terraform/terraform.tfvars
JENKINSFILE_PATH=~/avangrid-recordings-testing/Jenkinsfile

# Get the node resource group for AKS
echo "🔍 Retrieving node resource group..."
nodeRG=$(az aks show --name "$AKS" --resource-group "$RG" --query nodeResourceGroup -o tsv || echo "")

# Delete AKS cluster (synchronous)
if az aks show --name "$AKS" --resource-group "$RG" &>/dev/null; then
  echo "🗑️  Deleting AKS cluster '$AKS'..."
  az aks delete --name "$AKS" --resource-group "$RG" --yes
else
  echo "✔️  AKS cluster '$AKS' not found or already deleted."
fi

# Wait until the cluster and load balancer are fully cleaned up
echo "⏳ Waiting for AKS and its resources to be fully removed (max 10 mins)..."
for i in {1..60}; do
  sleep 10
  if ! az aks show --name "$AKS" --resource-group "$RG" &>/dev/null; then
    echo "✔️  AKS cluster deleted."
    break
  fi
  echo "⌛  Still waiting for AKS cleanup..."
done

# Delete static public IP after AKS load balancer releases it
if [ -n "$nodeRG" ] && az network public-ip show --resource-group "$nodeRG" --name "$IPName" &>/dev/null; then
  echo "🗑️  Deleting static public IP '$IPName' from '$nodeRG'..."
  az network public-ip delete --resource-group "$nodeRG" --name "$IPName"
else
  echo "✔️  Public IP '$IPName' not found or already deleted."
fi

# Extract ACR name from terraform.tfvars
echo "🔍 Extracting ACR name from terraform.tfvars..."
ACR=$(grep '^acr_name' "$TFVARS_PATH" | awk -F '"' '{print $2}')

# Delete ACR
if az acr show --name "$ACR" --resource-group "$RG" &>/dev/null; then
  echo "🗑️  Deleting ACR '$ACR'..."
  az acr delete --name "$ACR" --resource-group "$RG" --yes
else
  echo "✔️  ACR '$ACR' not found or already deleted."
fi

# Cleanup kubeconfig context
echo "🧹 Removing AKS context from kubeconfig..."
kubectl config delete-cluster "$AKS" 2>/dev/null || true
kubectl config delete-context "$AKS" 2>/dev/null || true

echo "✅ Destroy complete. terraform.tfvars and Jenkinsfile were preserved."