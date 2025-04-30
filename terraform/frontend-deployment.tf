
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

# NGINX Ingress Controller service using static public IP in Azure Load Balancer
resource "kubernetes_namespace" "ingress_nginx" {
  metadata {
    name = "ingress-nginx"
  }
}

resource "kubernetes_deployment" "ingress_nginx_controller" {
  metadata {
    name      = "ingress-nginx-controller"
    namespace = kubernetes_namespace.ingress_nginx.metadata[0].name
    labels = {
      app_kubernetes_io_name       = "ingress-nginx"
      app_kubernetes_io_component  = "controller"
      app_kubernetes_io_instance   = "ingress-nginx"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app_kubernetes_io_name      = "ingress-nginx"
        app_kubernetes_io_component = "controller"
      }
    }

    template {
      metadata {
        labels = {
          app_kubernetes_io_name      = "ingress-nginx"
          app_kubernetes_io_component = "controller"
        }
      }

      spec {
        container {
          name  = "controller"
          image = "k8s.gcr.io/ingress-nginx/controller:v1.9.4"

          args = [
            "/nginx-ingress-controller",
            "--election-id=ingress-controller-leader",
            "--controller-class=k8s.io/ingress-nginx",
            "--ingress-class=nginx",
            "--publish-service=$(POD_NAMESPACE)/ingress-nginx-controller"
          ]

          port {
            container_port = 80
          }

          port {
            container_port = 443
          }

          env {
            name  = "POD_NAME"
            value_from {
              field_ref {
                field_path = "metadata.name"
              }
            }
          }

          env {
            name  = "POD_NAMESPACE"
            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "ingress_nginx_controller" {
  metadata {
    name      = "ingress-nginx-controller"
    namespace = kubernetes_namespace.ingress_nginx.metadata[0].name
    annotations = {
      "service.beta.kubernetes.io/azure-load-balancer-resource-group" = var.azure_resource_group
    }
    labels = {
      app_kubernetes_io_name       = "ingress-nginx"
      app_kubernetes_io_component  = "controller"
      app_kubernetes_io_instance   = "ingress-nginx"
    }
  }

  spec {
    selector = {
      "app_kubernetes_io_name"      = "ingress-nginx"
      "app_kubernetes_io_component" = "controller"
    }

    type = "LoadBalancer"

    port {
      name        = "http"
      port        = 80
      target_port = 80
    }

    port {
      name        = "https"
      port        = 443
      target_port = 443
    }

    load_balancer_ip = var.frontend_static_ip
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
              name = "frontend"
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
