#!/bin/bash
set -e

# =============================================================================
# Setup Preview Environment
# =============================================================================
# This script sets up the preview environment namespace and secret.
# It extracts values from Terraform outputs and creates the previews-env secret.
# =============================================================================

echo "Setting up preview environment..."
echo ""

# -----------------------------------------------------------------------------
# Step 1: Create namespace with Istio injection
# -----------------------------------------------------------------------------
echo "1. Creating previews namespace with Istio injection..."
kubectl create namespace previews --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace previews istio-injection=enabled --overwrite
echo "   Namespace created and labeled for Istio injection"
echo ""

# -----------------------------------------------------------------------------
# Step 2: Extract Terraform outputs
# -----------------------------------------------------------------------------
echo "2. Extracting values from Terraform outputs..."
if ! kubectl get secret terraform-outputs-dev -n flux-system &>/dev/null; then
  echo "   ERROR: terraform-outputs-dev secret not found in flux-system namespace"
  echo "   Please ensure Terraform has been applied and outputs are available"
  exit 1
fi

# Extract each value from the Terraform outputs secret
DATABASE_URL=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.postgresql_database_url}' | base64 -d)
REDIS_URL=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.redis_connection_string}' | base64 -d)
AZURE_OPENAI_ENDPOINT=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.ai_foundry_endpoint}' | base64 -d)
AZURE_OPENAI_KEY=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.ai_foundry_primary_key}' | base64 -d)
ACR_LOGIN_SERVER=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.acr_login_server}' | base64 -d)
VIDEO_INDEXER_ACCOUNT_ID=$(kubectl get secret terraform-outputs-dev -n flux-system -o jsonpath='{.data.video_indexer_account_id}' | base64 -d)

echo "   Extracted values:"
echo "   - DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "   - REDIS_URL: ${REDIS_URL:0:30}..."
echo "   - AZURE_OPENAI_ENDPOINT: $AZURE_OPENAI_ENDPOINT"
echo "   - AZURE_OPENAI_KEY: ${AZURE_OPENAI_KEY:0:20}..."
echo "   - ACR_LOGIN_SERVER: $ACR_LOGIN_SERVER"
echo "   - VIDEO_INDEXER_ACCOUNT_ID: $VIDEO_INDEXER_ACCOUNT_ID"
echo ""

# -----------------------------------------------------------------------------
# Step 3: Create previews-env secret
# -----------------------------------------------------------------------------
echo "3. Creating previews-env secret in previews namespace..."
kubectl create secret generic previews-env \
  --namespace=previews \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=REDIS_URL="$REDIS_URL" \
  --from-literal=AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT" \
  --from-literal=AZURE_OPENAI_KEY="$AZURE_OPENAI_KEY" \
  --from-literal=ACR_LOGIN_SERVER="$ACR_LOGIN_SERVER" \
  --from-literal=VIDEO_INDEXER_ACCOUNT_ID="$VIDEO_INDEXER_ACCOUNT_ID" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "   Secret created successfully"
echo ""

# -----------------------------------------------------------------------------
# Step 4: Apply Flux Kustomization
# -----------------------------------------------------------------------------
echo "4. Applying Flux Kustomization for previews..."
if [ ! -f "manifests/flux/previews.yaml" ]; then
  echo "   ERROR: manifests/flux/previews.yaml not found"
  echo "   Please ensure you're running this script from the repository root"
  exit 1
fi

kubectl apply -f manifests/flux/previews.yaml
echo "   Flux Kustomization applied"
echo ""

# -----------------------------------------------------------------------------
# Step 5: Verify setup
# -----------------------------------------------------------------------------
echo "5. Verifying setup..."
echo ""

echo "   Namespace status:"
kubectl get namespace previews
echo ""

echo "   Secret status:"
kubectl get secret previews-env -n previews
echo ""

echo "   Flux Kustomization status:"
kubectl get kustomization previews -n flux-system
echo ""

# -----------------------------------------------------------------------------
# Success message
# -----------------------------------------------------------------------------
echo "========================================================================="
echo "Preview environment setup complete!"
echo "========================================================================="
echo ""
echo "The preview environment is now ready to accept deployments."
echo ""
echo "When Azure Pipelines creates preview manifests, Flux will automatically:"
echo "  1. Detect new manifests in manifests/previews/{SHA}/"
echo "  2. Deploy services to the previews namespace"
echo "  3. Services will use the previews-env secret for configuration"
echo ""
echo "To check preview deployments:"
echo "  kubectl get pods -n previews"
echo "  kubectl get virtualservices -n previews"
echo ""
echo "To check Flux reconciliation:"
echo "  flux get kustomizations"
echo "  kubectl describe kustomization previews -n flux-system"
echo ""
