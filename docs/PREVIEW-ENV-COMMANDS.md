# Preview Environment Commands Cheatsheet

Quick reference for managing preview environments.

## Initial Setup

```bash
# Run the setup script (recommended)
chmod +x scripts/setup-preview-env.sh
./scripts/setup-preview-env.sh
```

## Monitoring Preview Deployments

```bash
# List all preview pods
kubectl get pods -n previews

# List all preview deployments
kubectl get deployments -n previews

# List all preview services
kubectl get services -n previews

# List all preview VirtualServices (Istio routing)
kubectl get virtualservices -n previews

# Get detailed info about a specific preview
kubectl get pods -n previews -l preview=abc1234
```

## Checking Preview Status

```bash
# Check Flux Kustomization status
kubectl get kustomization previews -n flux-system

# Force Flux to reconcile immediately
flux reconcile kustomization previews

# View Flux logs
kubectl logs -n flux-system -l app=kustomize-controller --tail=50

# Check which previews are currently deployed
ls manifests/previews/
```

## Viewing Logs

```bash
# View logs for a specific service in a preview
kubectl logs -n previews -l app=web,preview=abc1234 --tail=50

# Follow logs in real-time
kubectl logs -n previews -l app=web,preview=abc1234 -f

# View logs for all containers in a pod (including Istio sidecar)
kubectl logs -n previews <POD_NAME> --all-containers=true

# View logs for a specific container
kubectl logs -n previews <POD_NAME> -c web
```

## Debugging

```bash
# Describe a pod to see events and status
kubectl describe pod <POD_NAME> -n previews

# Check if environment variables are set correctly
kubectl exec -n previews <POD_NAME> -c web -- env | grep DATABASE_URL

# Get a shell inside a preview container
kubectl exec -it -n previews <POD_NAME> -c web -- /bin/sh

# Check Istio sidecar injection
kubectl get pod <POD_NAME> -n previews -o jsonpath='{.spec.containers[*].name}'

# View Istio proxy logs
kubectl logs -n previews <POD_NAME> -c istio-proxy
```

## Managing Secrets

```bash
# View the previews-env secret (without decoding values)
kubectl get secret previews-env -n previews

# Describe the secret to see keys
kubectl describe secret previews-env -n previews

# Get a specific value from the secret
kubectl get secret previews-env -n previews -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Update the secret (after Terraform outputs change)
./scripts/setup-preview-env.sh
```

## Manual Preview Management

```bash
# Manually create a preview (for testing)
./scripts/generate-preview.sh feature-test-preview preview-abc1234

# Apply a preview manually
kubectl apply -k manifests/previews/abc1234/

# Delete a specific preview
rm -rf manifests/previews/abc1234/
git add manifests/previews/
git commit -m "chore: cleanup preview abc1234 [skip ci]"
git push origin main

# Flux will automatically delete the Kubernetes resources (prune: true)
```

## Network Debugging

```bash
# Test connectivity between services
kubectl exec -it -n previews <POD_NAME> -c web -- curl http://upload-service

# Check Istio VirtualService routing
kubectl get virtualservice -n previews -o yaml

# View Istio Gateway configuration
kubectl get gateway -n aks-istio-ingress

# Check Istio ingress IP
kubectl get svc -n aks-istio-ingress aks-istio-ingressgateway-external
```

## Resource Usage

```bash
# Check CPU and memory usage
kubectl top pods -n previews

# View resource limits and requests
kubectl get pods -n previews -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].resources}{"\n"}{end}'

# Count active previews
kubectl get deployments -n previews --no-headers | wc -l
```

## Cleanup Operations

```bash
# Run the cleanup pipeline manually
# (This is normally scheduled to run every 6 hours)
# Option 1: Via Azure DevOps UI (Pipelines > Run pipeline > azure-pipelines-cleanup-previews.yml)

# Option 2: List previews older than 7 days
find manifests/previews/ -mindepth 1 -maxdepth 1 -type d -mtime +7

# Option 3: Manually delete old previews
cd manifests/previews/
for dir in */; do
  if [ -d "$dir" ] && [ "$dir" != "namespace.yaml" ] && [ "$dir" != "kustomization.yaml" ]; then
    echo "Removing preview: $dir"
    rm -rf "$dir"
  fi
done
cd ../..

# Update kustomization and commit
git add manifests/previews/
git commit -m "chore: cleanup old previews [skip ci]"
git push origin main
```

## Terraform Integration

```bash
# View Terraform outputs that feed into preview environments
kubectl get secret terraform-outputs-dev -n flux-system -o json | jq -r '.data | to_entries[] | "\(.key)"'

# Get a specific Terraform output
kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.postgresql_database_url}' | base64 -d

# Check Terraform CR status
kubectl get terraform interview-buddy-dev -n flux-system
kubectl describe terraform interview-buddy-dev -n flux-system
```

## Troubleshooting Common Issues

### Issue: Preview pods stuck in "Pending" state

```bash
# Check pod events
kubectl describe pod <POD_NAME> -n previews

# Common causes:
# 1. Image pull errors (check ACR credentials)
# 2. Resource constraints (check Virtual Nodes)
# 3. Missing secret (check previews-env secret exists)
```

### Issue: Preview URL returns 404 or 502

```bash
# Check VirtualService
kubectl get virtualservice -n previews

# Check if pods are running
kubectl get pods -n previews -l preview=abc1234

# Check Istio proxy logs
kubectl logs -n previews <POD_NAME> -c istio-proxy

# Verify DNS (should point to Istio ingress)
dig preview-abc1234.slingshotgrp.com
```

### Issue: Services can't connect to database/Redis

```bash
# Check if secret exists and has correct values
kubectl get secret previews-env -n previews
kubectl get secret previews-env -n previews -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Test connectivity from a pod
kubectl exec -it -n previews <POD_NAME> -c web -- sh
# Inside the pod:
# ping ib-dev-psql-p2bwwk.postgres.database.azure.com
# nc -zv ib-dev-psql-p2bwwk.postgres.database.azure.com 5432
```

### Issue: Flux not deploying new previews

```bash
# Check Flux Kustomization status
kubectl describe kustomization previews -n flux-system

# Force reconciliation
flux reconcile kustomization previews

# Check if manifests were committed to Git
git log --oneline --all | grep preview

# View Flux controller logs
kubectl logs -n flux-system -l app=kustomize-controller --tail=100
```

## Health Checks

```bash
# Overall preview environment health
echo "=== Namespace ==="
kubectl get namespace previews --show-labels
echo ""
echo "=== Secret ==="
kubectl get secret previews-env -n previews
echo ""
echo "=== Flux Kustomization ==="
kubectl get kustomization previews -n flux-system
echo ""
echo "=== Active Previews ==="
kubectl get deployments -n previews
echo ""
echo "=== Pod Status ==="
kubectl get pods -n previews
```

## Advanced Operations

```bash
# Scale a preview deployment (for load testing)
kubectl scale deployment web -n previews --replicas=3

# Restart all services in a preview
kubectl rollout restart deployment -n previews -l preview=abc1234

# Port-forward to access a preview locally (bypass Istio)
kubectl port-forward -n previews svc/web 8080:80

# Copy files to/from a preview pod
kubectl cp local-file.txt previews/<POD_NAME>:/tmp/file.txt -c web
kubectl cp previews/<POD_NAME>:/app/logs/error.log ./error.log -c web

# Execute commands in a preview pod
kubectl exec -n previews <POD_NAME> -c web -- npm run migrate
```

## Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
alias kp='kubectl get pods -n previews'
alias kpl='kubectl logs -n previews'
alias kpd='kubectl describe pod -n previews'
alias kpe='kubectl exec -it -n previews'
alias kpf='kubectl port-forward -n previews'
alias flux-preview='flux reconcile kustomization previews'
alias preview-logs='kubectl logs -n flux-system -l app=kustomize-controller --tail=50'
```

## Monitoring Dashboard

```bash
# If you have k9s installed (recommended)
k9s -n previews

# View all resources in the previews namespace
kubectl get all -n previews
```
