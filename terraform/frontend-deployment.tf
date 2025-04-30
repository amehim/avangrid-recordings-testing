
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.frontend.metadata[0].name
    labels = {
      app = "frontend"
    }
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "frontend"
      }
    }
    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }
      spec {
        container {
          name  = "frontend"
          image = "${var.acr_name}.azurecr.io/frontend:latest"
          port {
            container_port = 3000
          }
          env {
            name  = "REACT_APP_API_BASE_URL"
            value = "http://backend.backend.svc.cluster.local:8000"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.frontend.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "LoadBalancer"
  }
}

# Frontend service using static public IP in Azure Load Balancer
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.frontend.metadata[0].name
    annotations = {
      "service.beta.kubernetes.io/azure-load-balancer-resource-group" = var.azure_resource_group
      "service.beta.kubernetes.io/azure-load-balancer-ipv4"          = var.frontend_static_ip
    }
    labels = {
      app = "frontend"
    }
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "LoadBalancer"
  }
}

# Ingress for frontend with TLS support
resource "kubernetes_ingress_v1" "frontend_ingress" {
  metadata {
    name      = "frontend-ingress"
    namespace = "frontend"
    annotations = {
      "kubernetes.io/ingress.class"                    = "nginx"
      "cert-manager.io/cluster-issuer"                = "letsencrypt-prod"
    }
  }

  spec {
    tls {
      hosts       = [var.frontend_domain]
      secret_name = "frontend-tls"
    }

    rule {
      host = var.frontend_domain
      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
