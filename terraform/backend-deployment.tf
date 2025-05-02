
resource "kubernetes_secret" "backend_secret" {
  metadata {
    name      = "backend-secrets"
    namespace = kubernetes_namespace.backend.metadata[0].name
  }

  data = {
    AZURE_BLOB_ACCOUNT_URL        = var.azure_blob_account_url
    AZURE_BLOB_CONTAINER_VPI      = var.azure_blob_container_vpi
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
          image = "${var.acr_name}.azurecr.io/backend:latest"
          port {
            container_port = 8000
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
          env {
            name  = "AZURE_TENANT_ID"
            value = var.azure_tenant_id
          }
          env {
            name  = "AZURE_CLIENT_ID"
            value = var.azure_client_id
          }
          env {
            name  = "AZURE_CLIENT_SECRET"
            value = var.azure_client_secret
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
      port        = 8000
      target_port = 8000
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "backend_ingress" {
  metadata {
    name      = "backend-ingress"
    namespace = "backend"
    annotations = {
      "kubernetes.io/ingress.class"    = "nginx"
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
  }

  spec {
    ingress_class_name = "nginx"

    tls {
      hosts       = ["backend.pachie.biz"]
      secret_name = "backend-tls"
    }

    rule {
      host = "backend.pachie.biz"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "backend"
              port {
                number = 8000
              }
            }
          }
        }
      }
    }
  }
}

