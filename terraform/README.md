# Interview Buddy - Terraform Infrastructure

This directory contains Terraform modules for provisioning Azure infrastructure via TF-Controller (GitOps).

## Architecture

```
terraform/
├── modules/                    # Reusable Azure resource modules
│   ├── postgresql/            # Azure Database for PostgreSQL Flexible Server
│   ├── redis/                 # Azure Cache for Redis
│   ├── acr/                   # Azure Container Registry
│   ├── video-indexer/         # Azure Video Indexer + Storage
│   └── ai-foundry/            # Azure OpenAI Service
├── environments/
│   └── dev/                   # Dev environment configuration
├── main.tf                    # Root module (orchestrates all resources)
├── variables.tf               # Input variables
├── outputs.tf                 # Output values (written to K8s secrets)
└── versions.tf                # Provider version constraints
```

## GitOps Workflow with TF-Controller

We use **plan-and-manually-apply** mode for safety:

```
1. Push changes to terraform/ → Flux detects change
2. TF-Controller runs `terraform plan` automatically
3. Review plan: kubectl describe terraform interview-buddy-dev -n flux-system
4. Approve: kubectl annotate terraform interview-buddy-dev \
     -n flux-system \
     infra.contrib.fluxcd.io/approve="plan-main-<revision>"
5. TF-Controller runs `terraform apply`
6. Outputs written to `terraform-outputs-dev` secret
```

## Prerequisites

### 1. Install TF-Controller in your cluster

```bash
# Add the TF-Controller Helm repo
helm repo add tf-controller https://weaveworks.github.io/tf-controller/
helm repo update

# Install TF-Controller
helm install tf-controller tf-controller/tf-controller \
  --namespace flux-system \
  --create-namespace
```

### 2. Create Azure Service Principal

```bash
# Create service principal with Contributor role
az ad sp create-for-rbac \
  --name "interview-buddy-terraform" \
  --role Contributor \
  --scopes /subscriptions/<subscription-id> \
  --output json

# Note the appId, password, and tenant from the output
```

### 3. Create the Azure credentials secret

```bash
kubectl create secret generic azure-credentials \
  --namespace=flux-system \
  --from-literal=ARM_CLIENT_ID=<appId> \
  --from-literal=ARM_CLIENT_SECRET=<password> \
  --from-literal=ARM_SUBSCRIPTION_ID=<subscription-id> \
  --from-literal=ARM_TENANT_ID=<tenant>
```

### 4. Create the Resource Group

```bash
az group create --name interview-buddy-dev --location eastus2
```

## Deploying Infrastructure

### Apply the TF-Controller manifests

```bash
kubectl apply -k manifests/flux-system/tf-controller/
```

### Watch the plan run

```bash
# See TF-Controller status
kubectl get terraform -n flux-system

# View the plan details
kubectl describe terraform interview-buddy-dev -n flux-system

# Or use tfctl CLI
tfctl show plan interview-buddy-dev -n flux-system
```

### Approve the plan

```bash
# Get the plan revision from the describe output (e.g., "plan-main-abc123")
kubectl annotate terraform interview-buddy-dev \
  -n flux-system \
  infra.contrib.fluxcd.io/approve="plan-main-<revision>"

# Or use tfctl
tfctl approve interview-buddy-dev -n flux-system
```

### Verify outputs

```bash
# Check the outputs secret was created
kubectl get secret terraform-outputs-dev -n flux-system -o yaml

# Decode a specific value
kubectl get secret terraform-outputs-dev -n flux-system \
  -o jsonpath='{.data.postgresql_fqdn}' | base64 -d
```

## Using Outputs in Services

The Terraform outputs are written to `terraform-outputs-dev` secret. Mount this in your deployments:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: upload-service
spec:
  template:
    spec:
      containers:
        - name: upload-service
          envFrom:
            - secretRef:
                name: terraform-outputs-dev
          env:
            # Or reference individual values
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: terraform-outputs-dev
                  key: postgresql_database_url
```

## Resources Provisioned

| Resource | SKU (Dev) | Monthly Cost (Est.) |
|----------|-----------|---------------------|
| PostgreSQL Flexible Server | B_Standard_B1ms | ~$13 |
| Azure Cache for Redis | Basic C0 | ~$16 |
| Azure Container Registry | Basic | ~$5 |
| Azure Video Indexer | Free | $0 (10 hrs/mo) |
| Azure OpenAI Service | S0 | Pay per token |

**Estimated dev environment cost: ~$35/month** (excluding AI usage)

## Troubleshooting

### Plan stuck in "Planning"

```bash
# Check TF-Controller pod logs
kubectl logs -n flux-system -l app=tf-controller

# Check the Terraform runner pod
kubectl get pods -n flux-system -l infra.contrib.fluxcd.io/terraform=interview-buddy-dev
kubectl logs -n flux-system <runner-pod-name>
```

### Authentication errors

```bash
# Verify credentials secret exists
kubectl get secret azure-credentials -n flux-system

# Test credentials manually
export ARM_CLIENT_ID=$(kubectl get secret azure-credentials -n flux-system -o jsonpath='{.data.ARM_CLIENT_ID}' | base64 -d)
# ... same for other vars
az login --service-principal -u $ARM_CLIENT_ID -p $ARM_CLIENT_SECRET --tenant $ARM_TENANT_ID
```

### Force re-plan

```bash
# Delete the plan status to trigger a new plan
kubectl annotate terraform interview-buddy-dev \
  -n flux-system \
  reconcile.fluxcd.io/requestedAt="$(date +%s)"
```

## Local Development (without TF-Controller)

For testing Terraform locally without TF-Controller:

```bash
cd terraform/environments/dev

# Login to Azure
az login

# Initialize
terraform init

# Plan
terraform plan -out=tfplan

# Apply (after review)
terraform apply tfplan
```

## Production Environment

To create a production environment:

1. Copy `environments/dev/` to `environments/prod/`
2. Adjust SKUs for production workloads:
   - PostgreSQL: `GP_Standard_D2s_v3` with HA enabled
   - Redis: `Standard C1` or `Premium P1`
   - ACR: `Standard` or `Premium`
3. Create new Terraform CR in `manifests/flux-system/tf-controller/terraform-prod.yaml`
4. Use Azure Key Vault for production secrets instead of K8s secrets
