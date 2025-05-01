#!/bin/bash

# One-Time Kubernetes Setup for Call Recording App (Manual Setup)

# Step 1: Install cert-manager CRDs (Custom Resource Definitions)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml

# Step 2: Install cert-manager components (controller, webhook, cainjector)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml

# Step 3: Create the IngressClass "nginx" (required for cert-manager HTTP01 challenges)
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
EOF

# Step 4: Ensure DNS A record "<your-frontend-domain>" points to AKS ingress public IP (e.g. 1.2.3.4)
echo "⚠️  Make sure DNS A record for <your-frontend-domain> is set to your LoadBalancer IP."
echo "You can verify with: dig +short <your-frontend-domain>"

# Done.