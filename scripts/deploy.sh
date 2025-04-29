#!/bin/bash
RG="avangrid-grp"
AKV="callrecordings-akv"
LOC="eastus"
AKS="callrecordings-avangrid-aks"
ACR="callrecordingacr$RANDOM"

# Create resource group
#az group create --name $RG --location $LOC

# Create Azure Key Vault for secrets and Key Object storage
#az keyvault create --name $AKV --resource-group $RG --location $LOC
# Create a secret in the Key Vault for the Azure Storage Account
# Map secret names to environment variable names
declare -A secrets=(
  ["AZURE-STORAGE-ACCOUNT"]="AZURE_STORAGE_ACCOUNT"
  ["AZURE-STORAGE-CONTAINER"]="AZURE_STORAGE_CONTAINER"
  ["AZURE-TENANT-ID"]="AZURE_TENANT_ID"
  ["AZURE-CLIENT-ID"]="AZURE_CLIENT_ID"
  ["AZURE-CLIENT-SECRET"]="AZURE_CLIENT_SECRET"
)

for secret_name in "${!secrets[@]}"; do
  env_var_name="${secrets[$secret_name]}"
  az keyvault secret set --vault-name "$AKV" --name "$secret_name" --value "${!env_var_name}"
done



# Create ACR
az acr create --name $ACR --resource-group $RG --sku Basic --admin-enabled true

# Create AKS with OIDC for workload identity
az aks create --resource-group $RG --name $AKS \
  --enable-oidc-issuer \
  --enable-workload-identity \
  --node-count 2 \
  --generate-ssh-keys \
  --attach-acr $ACR