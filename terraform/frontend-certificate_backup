# This Terraform resource defines the TLS certificate for the frontend Ingress
# using cert-manager and Let's Encrypt ClusterIssuer.

resource "kubernetes_manifest" "frontend_tls_certificate" {
  manifest = {
    "apiVersion" = "cert-manager.io/v1"
    "kind"       = "Certificate"
    "metadata" = {
      "name"      = "frontend-tls"
      "namespace" = "frontend"
    }
    "spec" = {
      "secretName" = "frontend-tls"
      "issuerRef" = {
        "name" = "letsencrypt-prod"
        "kind" = "ClusterIssuer"
      }
      "commonName" = var.frontend_domain
      "dnsNames"   = [var.frontend_domain]
    }
  }
}
