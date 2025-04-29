
resource "kubernetes_secret" "backend_secret" {
  metadata {
    name      = "backend-secrets"
    namespace = kubernetes_namespace.backend.metadata[0].name
  }

  data = {
    AZURE_BLOB_ACCOUNT_URL     = var.azure_blob_account_url
    AZURE_BLOB_CONTAINER_VPI   = var.azure_blob_container_vpi
    AZURE_BLOB_CONTAINER_TALKDESK = var.azure_blob_container_talkdesk
  }

  type = "Opaque"
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.backend.metadata[0].name
    labels = {
      app = "backend"
    }
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "backend"
      }
    }
    template {
      metadata {
        labels = {
          app = "backend"
        }
      }
      spec {
        container {
          name  = "backend"
          image = "\${var.acr_name}.azurecr.io/backend:latest"
          port {
            container_port = 5000
          }
          env {
            name = "AZURE_BLOB_ACCOUNT_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_secret.metadata[0].name
                key  = "AZURE_BLOB_ACCOUNT_URL"
              }
            }
          }
          env {
            name = "AZURE_BLOB_CONTAINER_VPI"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_secret.metadata[0].name
                key  = "AZURE_BLOB_CONTAINER_VPI"
              }
            }
          }
          env {
            name = "AZURE_BLOB_CONTAINER_TALKDESK"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_secret.metadata[0].name
                key  = "AZURE_BLOB_CONTAINER_TALKDESK"
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.backend.metadata[0].name
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}
