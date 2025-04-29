
terraform {
  backend "azurerm" {
    resource_group_name  = "avangrid-grp"
    storage_account_name = "avangrid"
    container_name       = "tfstate"
    key                  = "aks-deployment.tfstate"
  }
}
