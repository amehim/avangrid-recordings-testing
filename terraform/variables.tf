variable "kubernetes_host" {
  type        = string
  description = "AKS Kubernetes API server URL"
  validation {
    condition     = length(var.kubernetes_host) > 0
    error_message = "kubernetes_host is required"
  }
}

variable "kubernetes_client_certificate" {
  type        = string
  description = "Base64 client certificate"
  validation {
    condition     = length(var.kubernetes_client_certificate) > 0
    error_message = "kubernetes_client_certificate is required"
  }
}

variable "kubernetes_client_key" {
  type        = string
  description = "Base64 client key"
  validation {
    condition     = length(var.kubernetes_client_key) > 0
    error_message = "kubernetes_client_key is required"
  }
}

variable "kubernetes_cluster_ca_certificate" {
  type        = string
  description = "Base64 cluster CA certificate"
  validation {
    condition     = length(var.kubernetes_cluster_ca_certificate) > 0
    error_message = "kubernetes_cluster_ca_certificate is required"
  }
}

variable "acr_name" {
  type        = string
  description = "Azure Container Registry name"
}

variable "azure_blob_account_url" {
  type        = string
  description = "Azure Blob Storage base URL"
}

variable "azure_blob_container_vpi" {
  type        = string
  description = "Blob container name for VPI"
}

variable "azure_blob_container_talkdesk" {
  type        = string
  description = "Blob container name for Talkdesk"
}

variable "azure_tenant_id" {
  type        = string
  description = "Azure tenant ID"
  validation {
    condition     = length(var.azure_tenant_id) > 0
    error_message = "azure_tenant_id must not be empty."
  }
}

variable "azure_client_id" {
  type        = string
  description = "Azure client ID"
  validation {
    condition     = length(var.azure_client_id) > 0
    error_message = "azure_client_id must not be empty."
  }
}

variable "azure_client_secret" {
  type        = string
  description = "Azure client secret"
  sensitive   = true
  validation {
    condition     = length(var.azure_client_secret) > 0
    error_message = "azure_client_secret must not be empty."
  }
}

variable "azure_resource_group" {
  type        = string
  description = "The Azure resource group containing the reserved public IP for the LoadBalancer"
  validation {
    condition     = length(var.azure_resource_group) > 0
    error_message = "azure_resource_group must not be empty."
  }
}

variable "frontend_static_ip" {
  type        = string
  description = "The reserved static IP address for the frontend LoadBalancer"
  validation {
    condition     = length(var.frontend_static_ip) > 0
    error_message = "frontend_static_ip must not be empty."
  }
}

variable "frontend_domain" {
  type        = string
  description = "The DNS name for the frontend Ingress"
  validation {
    condition     = length(var.frontend_domain) > 0
    error_message = "frontend_domain must not be empty."
  }
}
