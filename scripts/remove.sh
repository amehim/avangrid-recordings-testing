#!/bin/bash

# Set variables
RG="avangrid-grp"
#AKV="callrecordings-akv"
LOC="eastus"
AKS="callrecordings-avangrid-aks"
ACR=""  # Will retrieve dynamically

# Optionally: dynamically find the ACR name if not hardcoded
# Uncomment if needed
# echo "Retrieving ACR name associated with Resource Group $RG..."
# ACR=$(az acr list --resource-group $RG --query "[0].name" -o tsv)

# Delete AKS cluster
echo "Deleting AKS cluster: $AKS"
az aks delete --name "$AKS" --resource-group "$RG" --yes --no-wait

# Delete ACR registry
if [ -n "$ACR" ]; then
  echo "Deleting ACR: $ACR"
  az acr delete --name "$ACR" --resource-group "$RG" --yes
else
  echo "Skipping ACR deletion because ACR name is not provided."
fi

# Delete Azure Key Vault
echo "Deleting Azure Key Vault: $AKV"
az keyvault delete --name "$AKV"

# Delete Resource Group (optional - if you want everything under it to be wiped out)
# Uncomment the line below if you want to delete the entire resource group
# echo "Deleting Resource Group: $RG"
# az group delete --name "$RG" --yes --no-wait

echo "Destroy script execution completed."
