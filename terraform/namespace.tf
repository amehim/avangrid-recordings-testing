
resource "kubernetes_namespace" "frontend" {
  metadata {
    name = "frontend"
  }
}

resource "kubernetes_namespace" "backend" {
  metadata {
    name = "backend"
  }
}
