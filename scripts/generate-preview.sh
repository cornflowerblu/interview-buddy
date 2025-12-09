#!/bin/bash
set -e

# Usage: ./scripts/generate-preview.sh <branch_name> <image_tag> [output_dir]
BRANCH_NAME=$1
IMAGE_TAG=$2
OUTPUT_BASE=${3:-"manifests/previews"}

if [ -z "$BRANCH_NAME" ] || [ -z "$IMAGE_TAG" ]; then
  echo "Usage: $0 <branch_name> <image_tag> [output_dir]"
  exit 1
fi

# Sanitize branch name for k8s labels/names (lowercase, alphanumeric only)
SAFE_BRANCH=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g' | cut -c1-63)

# Variables for templates
export PREVIEW_NAME="$SAFE_BRANCH"
export PREVIEW_NAMESPACE="previews"
export IMAGE_TAG="$IMAGE_TAG"
export HOST_NAME="preview-$SAFE_BRANCH.slingshotgrp.com"
export ACR_LOGIN_SERVER="ibdevacrpuj79a.azurecr.io"

TARGET_DIR="$OUTPUT_BASE/$SAFE_BRANCH"
TEMPLATE_DIR="manifests/templates/preview"

echo "Generating preview for branch: $BRANCH_NAME (Safe: $SAFE_BRANCH)"
echo "Target Directory: $TARGET_DIR"
echo "Preview URL will be: https://$HOST_NAME"

mkdir -p "$TARGET_DIR"

# Process templates
for file in "$TEMPLATE_DIR"/*.yaml; do
  filename=$(basename "$file")
  envsubst < "$file" > "$TARGET_DIR/$filename"
  echo "Generated: $TARGET_DIR/$filename"
done

echo "Manifests generated in $TARGET_DIR"

# Update parent kustomization if not in dry-run/local mode
PARENT_KUSTOMIZATION="$OUTPUT_BASE/kustomization.yaml"
if [ -f "$PARENT_KUSTOMIZATION" ]; then
  if ! grep -q "  - $SAFE_BRANCH/" "$PARENT_KUSTOMIZATION"; then
    echo "Adding $SAFE_BRANCH to parent kustomization..."
    if grep -q "^resources:" "$PARENT_KUSTOMIZATION"; then
       sed -i "/resources:/a\  - $SAFE_BRANCH/" "$PARENT_KUSTOMIZATION"
    else
       echo "resources:" >> "$PARENT_KUSTOMIZATION"
       echo "  - $SAFE_BRANCH/" >> "$PARENT_KUSTOMIZATION"
    fi
  else
    echo "$SAFE_BRANCH already in parent kustomization"
  fi
else
  echo "Creating parent kustomization..."
  cat > "$PARENT_KUSTOMIZATION" <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - $SAFE_BRANCH/
EOF
fi

echo ""
echo "Preview environment ready!"
echo "URL: https://$HOST_NAME"
echo ""
echo "To deploy manually: kubectl apply -k $TARGET_DIR"
