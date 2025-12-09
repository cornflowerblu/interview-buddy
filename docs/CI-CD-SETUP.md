# CI/CD Setup Guide

This document outlines the remaining steps to complete the Azure DevOps CI/CD pipeline setup for Interview Buddy.

## What's Been Created

### Pipeline Files

- `azure-pipelines.yml` - Main CI/CD pipeline (test, build, preview deploy)
- `azure-pipelines-cleanup-previews.yml` - Scheduled cleanup every 6 hours
- `templates/setup-bun.yml` - Reusable Bun setup template

### Preview Environment Templates

- `manifests/templates/preview/` - Templates for all 4 services (web, upload-service, processor-service, ai-analyzer-service)
- `manifests/flux/previews.yaml` - Flux Kustomization with `prune: true` for auto-cleanup
- `manifests/previews/` - Parent directory for generated preview manifests

### Infrastructure

- `manifests/base/istio-gateway.yaml` - Wildcard Istio Gateway for `*.slingshotgrp.com`

### Scripts

- `scripts/generate-preview.sh` - Generates preview manifests from templates
- `scripts/terraform-plan-comment.sh` - Posts Terraform plan to Azure DevOps PR comments

---

## Next Steps

### 1. Connect Azure DevOps to GitHub Repository

1. Go to Azure DevOps → Project Settings → Service connections
2. Create a new **GitHub** service connection
3. Authorize with your GitHub account
4. Select the `cornflowerblu/interview-buddy` repository

### 2. Create Azure Subscription Service Connection

1. Go to Azure DevOps → Project Settings → Service connections
2. Create a new **Azure Resource Manager** service connection
3. Name it `devops` (this is referenced in the pipeline)
4. Grant access to the subscription containing your AKS cluster

### 3. Create Pipeline in Azure DevOps

1. Go to Pipelines → New Pipeline
2. Select GitHub as the source
3. Select the `interview-buddy` repository
4. Select "Existing Azure Pipelines YAML file"
5. Choose `azure-pipelines.yml`
6. Save and run

### 4. Create Cleanup Pipeline

1. Go to Pipelines → New Pipeline
2. Select the same repository
3. Choose `azure-pipelines-cleanup-previews.yml`
4. Save (this will run on schedule)

### 5. Create TLS Certificate for Wildcard Domain

Option A: Using cert-manager (recommended):

```bash
# Install cert-manager if not already installed
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - dns01:
          azureDNS:
            subscriptionID: YOUR_SUBSCRIPTION_ID
            resourceGroupName: YOUR_DNS_RESOURCE_GROUP
            hostedZoneName: slingshotgrp.com
            environment: AzurePublicCloud
EOF

# Create Certificate
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: interview-buddy-tls
  namespace: istio-system
spec:
  secretName: interview-buddy-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - "*.slingshotgrp.com"
EOF
```

Option B: Manual certificate:

```bash
# If you have a wildcard cert, create the secret manually
kubectl create secret tls interview-buddy-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem \
  -n istio-system
```

### 6. Create Previews Environment Secret

Create a sealed secret with dev environment connection strings:

```bash
# Create the secret
kubectl create secret generic previews-env \
  --namespace=previews \
  --from-literal=DATABASE_URL="postgresql://ibadmin:PASSWORD@ib-dev-psql-p2bwwk.postgres.database.azure.com:5432/interviewbuddy?sslmode=require" \
  --from-literal=REDIS_URL="rediss://:PASSWORD@ib-dev-redis-XXXXX.redis.cache.windows.net:6380" \
  --from-literal=AZURE_OPENAI_ENDPOINT="https://ib-dev-openai-XXXXX.openai.azure.com/" \
  --from-literal=AZURE_OPENAI_KEY="YOUR_KEY" \
  --dry-run=client -o yaml | kubeseal --format yaml > manifests/previews/previews-env-sealed.yaml
```

Or get the values from Terraform outputs:

```bash
kubectl get secret terraform-outputs-dev -n flux-system -o json | jq -r '.data | to_entries[] | "\(.key): \(.value | @base64d)"'
```

### 7. Apply Istio Gateway

```bash
kubectl apply -f manifests/base/istio-gateway.yaml
```

### 8. Apply Flux Kustomization for Previews

```bash
kubectl apply -f manifests/flux/previews.yaml
```

### 9. Configure DNS

Add a wildcard DNS record pointing to your Istio ingress gateway:

```
*.slingshotgrp.com → <ISTIO_INGRESS_IP>
```

Get your ingress IP:

```bash
kubectl get svc -n aks-istio-ingress aks-istio-ingressgateway-external -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### 10. Configure Azure DevOps Environments (Optional)

For approval gates before deploying to staging/production:

1. Go to Pipelines → Environments
2. Create environments: `dev`, `staging`, `production`
3. Add approval checks to `staging` and `production`

---

## Testing the Pipeline

1. Create a feature branch:

   ```bash
   git checkout -b feature/test-preview
   echo "# Test" >> README.md
   git add . && git commit -m "test: trigger preview"
   git push origin feature/test-preview
   ```

2. Open a PR in GitHub

3. Azure Pipelines will:
   - Run tests
   - Build Docker images tagged `preview-{SHA}`
   - Generate preview manifests
   - Commit to main with `[skip ci]`

4. Flux will deploy the preview within 1 minute

5. Access your preview at: `https://preview-{SHA}.slingshotgrp.com`

---

## Troubleshooting

### Preview not deploying

```bash
# Check Flux status
flux get kustomizations
kubectl get kustomization previews -n flux-system

# Check if manifests were generated
ls manifests/previews/
```

### Images not pushing to ACR

```bash
# Verify ACR access
az acr login --name ibdevacrpuj79a
```

### Istio routing not working

```bash
# Check VirtualService
kubectl get virtualservice -n previews

# Check gateway
kubectl get gateway -n istio-system
```

---

## Architecture Overview

```
Feature branch push
    ↓
Azure Pipelines triggered
    ├─ Run tests (bun run test)
    ├─ Build Docker images (4 services, tag: preview-{SHA})
    ├─ Generate preview manifests via scripts/generate-preview.sh
    └─ Commit to main with [skip ci]
        ↓
Flux detects manifests/previews/{SHA}/
    ↓
Auto-deploys to K8s namespace: previews
    ↓
Preview live at: https://preview-{SHA}.slingshotgrp.com
    ↓
Cleanup pipeline (every 6 hours)
    ↓
Removes old preview directories → Flux prunes K8s resources
```
