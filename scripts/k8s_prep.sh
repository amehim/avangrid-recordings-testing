#!/bin/bash

set -e

RG="avangrid-grp"
LOC="eastus"
AKS="callrecordings-avangrid-aks"
ACR="callrecordingacr$RANDOM"
IPName="frontend-ingress-ip"
TFVARS_PATH=~/avangrid-recordings-testing/terraform/terraform.tfvars

# Check and create ACR if not exists
if az acr show --name "$ACR" --resource-group "$RG" &>/dev/null; then
  echo "✔️  ACR '$ACR' already exists. Skipping creation."
else
  echo "🚀 Creating ACR '$ACR'..."
  az acr create --name "$ACR" --resource-group "$RG" --sku Basic --admin-enabled true
fi

# Check and create AKS if not exists
if az aks show --name "$AKS" --resource-group "$RG" &>/dev/null; then
  echo "✔️  AKS cluster '$AKS' already exists. Skipping creation."
else
  echo "🚀 Creating AKS cluster '$AKS'..."
  az aks create --resource-group "$RG" --name "$AKS" \
    --enable-oidc-issuer \
    --enable-workload-identity \
    --node-count 2 \
    --generate-ssh-keys \
    --attach-acr "$ACR"
fi

# Get Kubernetes credentials
echo "🔐 Getting AKS credentials..."
az aks get-credentials --resource-group "$RG" --name "$AKS" --overwrite-existing

# Ensure ACR is attached (safe to re-run)
echo "🔗 Attaching ACR to AKS..."
az aks update -n "$AKS" -g "$RG" --attach-acr "$ACR"

# Get Node Resource Group
nodeRG=$(az aks show --name "$AKS" --resource-group "$RG" --query nodeResourceGroup -o tsv)

# Check and create static public IP
echo "🔍 Checking for static public IP '$IPName' in '$nodeRG'..."
if az network public-ip show --resource-group "$nodeRG" --name "$IPName" &>/dev/null; then
  echo "✔️  Public IP '$IPName' already exists."
else
  echo "🌐 Creating public IP '$IPName'..."
  az network public-ip create \
    --resource-group "$nodeRG" \
    --name "$IPName" \
    --sku Standard \
    --allocation-method static \
    --query "publicIp.ipAddress" -o tsv
  echo "⏳ Waiting for IP to be provisioned..."
  sleep 10  # short delay to let the provisioning complete
fi

# Ensure we can retrieve the IP address now
nodeIP=$(az network public-ip show \
  --resource-group "$nodeRG" \
  --name "$IPName" \
  --query "ipAddress" -o tsv)

if [ -z "$nodeIP" ]; then
  echo "❌ Failed to retrieve IP address for '$IPName'. Exiting."
  exit 1
fi

# Update terraform.tfvars with dynamic values
echo "🔧 Updating terraform.tfvars with ACR, nodeRG, and static IP..."
sed -i "s|^acr_name *= *\".*\"|acr_name = \"$ACR\"|" "$TFVARS_PATH"
sed -i "s|^azure_resource_group *= *\".*\"|azure_resource_group = \"$nodeRG\"|" "$TFVARS_PATH"
sed -i "s|^frontend_static_ip *= *\".*\"|frontend_static_ip = \"$nodeIP\"|" "$TFVARS_PATH"

# Git commit & push
cd ~/avangrid-recordings-testing/terraform/
echo "📦 Committing terraform.tfvars updates to Git..."
git add terraform.tfvars
git commit -m "Update terraform.tfvars with dynamic ACR, RG, and IP" || echo "⚠️  No changes to commit."
git push

# Cert-manager Setup
echo "🔐 Installing cert-manager CRDs and components..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml

echo "📡 Creating IngressClass 'nginx' for cert-manager..."
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
EOF

# DNS Reminder
echo "⚠️  Make sure DNS A record for your frontend domain points to: $nodeIP"
echo "🔍 You can verify with: dig +short <your-frontend-domain>"

echo "✅ Done."