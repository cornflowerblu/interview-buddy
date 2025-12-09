# Preview Environment Setup Instructions

This document provides step-by-step instructions for setting up the Kubernetes preview environment.

## Overview

The preview environment allows feature branches to be automatically deployed to temporary environments for testing. Each preview gets its own subdomain and isolated deployment.

## Prerequisites

- `kubectl` configured to access your AKS cluster
- Terraform outputs are available in the `flux-system` namespace
- Flux CD is installed and running

## Quick Setup (Automated)

The easiest way to set up the preview environment is to use the provided script:

```bash
chmod +x scripts/setup-preview-env.sh
./scripts/setup-preview-env.sh
```

This script will:
1. Create the `previews` namespace with Istio injection
2. Extract values from Terraform outputs
3. Create the `previews-env` secret
4. Apply the Flux Kustomization
5. Verify the setup

## Manual Setup

If you prefer to run the commands manually or if the script fails, follow these steps:

### Step 1: Create the Previews Namespace

```bash
# Create the namespace
kubectl create namespace previews --dry-run=client -o yaml | kubectl apply -f -

# Enable Istio sidecar injection
kubectl label namespace previews istio-injection=enabled --overwrite
```

Verify:
```bash
kubectl get namespace previews --show-labels
```

You should see `istio-injection=enabled` in the labels.

### Step 2: Get Terraform Output Values

First, verify the Terraform outputs secret exists:

```bash
kubectl get secret terraform-outputs-dev -n flux-system
```

View all available outputs (for reference):
```bash
kubectl get secret terraform-outputs-dev -n flux-system -o json | jq -r '.data | to_entries[] | "\(.key): \(.value | @base64d)"'
```

Extract the specific values needed for preview environments:

```bash
# PostgreSQL Database URL
DATABASE_URL=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.postgresql_database_url}' | base64 -d)

# Redis Connection String
REDIS_URL=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.redis_connection_string}' | base64 -d)

# Azure OpenAI Endpoint
AZURE_OPENAI_ENDPOINT=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.ai_foundry_endpoint}' | base64 -d)

# Azure OpenAI API Key
AZURE_OPENAI_KEY=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.ai_foundry_primary_key}' | base64 -d)

# Azure Container Registry Login Server
ACR_LOGIN_SERVER=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.acr_login_server}' | base64 -d)

# Video Indexer Account ID
VIDEO_INDEXER_ACCOUNT_ID=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.video_indexer_account_id}' | base64 -d)
```

### Step 3: Create the Previews Environment Secret

```bash
kubectl create secret generic previews-env \
  --namespace=previews \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=REDIS_URL="$REDIS_URL" \
  --from-literal=AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT" \
  --from-literal=AZURE_OPENAI_KEY="$AZURE_OPENAI_KEY" \
  --from-literal=ACR_LOGIN_SERVER="$ACR_LOGIN_SERVER" \
  --from-literal=VIDEO_INDEXER_ACCOUNT_ID="$VIDEO_INDEXER_ACCOUNT_ID" \
  --dry-run=client -o yaml | kubectl apply -f -
```

Verify the secret was created:
```bash
kubectl get secret previews-env -n previews
kubectl describe secret previews-env -n previews
```

### Step 4: Apply the Flux Kustomization

```bash
kubectl apply -f /Users/rurich/development/interview-buddy/manifests/flux/previews.yaml
```

Verify the Kustomization was created:
```bash
kubectl get kustomization previews -n flux-system
```

Wait for Flux to reconcile:
```bash
flux reconcile kustomization previews
```

### Step 5: Verify the Setup

Check namespace:
```bash
kubectl get namespace previews --show-labels
```

Check secret:
```bash
kubectl get secret previews-env -n previews
```

Check Flux Kustomization:
```bash
kubectl get kustomization previews -n flux-system
kubectl describe kustomization previews -n flux-system
```

## What Happens Next?

Once the preview environment is set up, the Azure DevOps CI/CD pipeline will:

1. **On Feature Branch Push:**
   - Build Docker images tagged with `preview-{SHA}`
   - Push images to ACR
   - Generate Kubernetes manifests in `manifests/previews/{SHA}/`
   - Commit manifests to the main branch with `[skip ci]`

2. **Flux Detects Changes:**
   - Flux monitors the `manifests/previews/` directory
   - Automatically deploys new preview environments
   - Each preview gets:
     - Unique subdomain: `https://preview-{SHA}.slingshotgrp.com`
     - Isolated pods in the `previews` namespace
     - Shared dev infrastructure (database, redis, etc.)

3. **Automatic Cleanup:**
   - Cleanup pipeline runs every 6 hours
   - Removes preview manifests older than 7 days
   - Flux automatically deletes corresponding Kubernetes resources (thanks to `prune: true`)

## Preview Environment Architecture

```
manifests/previews/
├── namespace.yaml              # Previews namespace definition
├── kustomization.yaml          # Parent kustomization (lists all previews)
├── abc1234/                    # Preview for commit abc1234
│   ├── web-deployment.yaml
│   ├── upload-service-deployment.yaml
│   ├── processor-service-deployment.yaml
│   ├── ai-analyzer-service-deployment.yaml
│   ├── virtualservice.yaml
│   └── kustomization.yaml
└── def5678/                    # Preview for commit def5678
    ├── ...
```

## Troubleshooting

### Secret Not Found Error

If you get "secret not found" when trying to create `previews-env`:

```bash
# Check if Terraform outputs exist
kubectl get secret terraform-outputs-dev -n flux-system

# If missing, check TF-Controller status
kubectl get terraform interview-buddy-dev -n flux-system
kubectl describe terraform interview-buddy-dev -n flux-system

# The Terraform resource may need approval
kubectl annotate terraform interview-buddy-dev \
  -n flux-system \
  infra.contrib.fluxcd.io/approve="plan-main-<revision>"
```

### Flux Not Reconciling

If Flux doesn't deploy preview environments:

```bash
# Check Flux status
flux get kustomizations

# Force reconciliation
flux reconcile kustomization previews

# Check for errors
kubectl describe kustomization previews -n flux-system
kubectl logs -n flux-system -l app=kustomize-controller
```

### Pods Not Starting

If preview pods fail to start:

```bash
# Check pod status
kubectl get pods -n previews

# Check pod logs
kubectl logs -n previews -l app=web --tail=50

# Check secret is mounted correctly
kubectl get pod <POD_NAME> -n previews -o yaml | grep -A 10 envFrom
```

### Istio Sidecar Not Injected

If services can't communicate:

```bash
# Verify namespace label
kubectl get namespace previews --show-labels

# Check if sidecar is injected
kubectl get pod <POD_NAME> -n previews -o jsonpath='{.spec.containers[*].name}'
# Should show both the service container and "istio-proxy"

# Re-label if needed
kubectl label namespace previews istio-injection=enabled --overwrite

# Restart pods to inject sidecar
kubectl rollout restart deployment -n previews
```

## Security Considerations

### Shared Dev Infrastructure

Preview environments share the same dev database and Redis instance. This means:

- Preview environments can see each other's data
- Database migrations should be tested carefully
- Use separate user IDs or prefixes to isolate test data

### Secret Management

The `previews-env` secret contains sensitive credentials. To rotate:

```bash
# Delete the old secret
kubectl delete secret previews-env -n previews

# Re-run the setup script to create a new one
./scripts/setup-preview-env.sh
```

### Access Control

Consider limiting who can:
- Create preview environments (via branch protection)
- Access the preview namespace (via RBAC)
- View preview URLs (via authentication)

## Cost Optimization

Preview environments run on Virtual Nodes (Azure Container Instances) for cost savings:

- **Pay-per-second billing** (no idle costs)
- **Automatic cleanup** after 7 days
- **Shared infrastructure** (database, Redis, etc.)

Estimated cost per preview:
- ~$0.01/hour for 4 containers (128MB RAM, 0.1 CPU each)
- ~$1.68 for a 7-day preview
- With 5 active previews: ~$8.40/week

## Additional Resources

- [CI/CD Setup Guide](./CI-CD-SETUP.md)
- [Flux CD Documentation](https://fluxcd.io/docs/)
- [Istio Documentation](https://istio.io/latest/docs/)
- [Azure DevOps Pipelines](https://learn.microsoft.com/en-us/azure/devops/pipelines/)
