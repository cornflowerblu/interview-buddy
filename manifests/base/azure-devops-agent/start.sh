#!/bin/bash
set -e

# Azure DevOps Agent Start Script
# This script downloads, configures, and runs the Azure DevOps agent
# Optimized for Kubernetes with KEDA ScaledJob (--once flag)

# Check required environment variables
if [ -z "${AZP_URL}" ]; then
  echo "Error: AZP_URL environment variable is required"
  exit 1
fi

if [ -z "${AZP_TOKEN}" ]; then
  echo "Error: AZP_TOKEN environment variable is required"
  exit 1
fi

# Set defaults
if [ -z "${AZP_POOL}" ]; then
  export AZP_POOL="Default"
fi

if [ -z "${AZP_WORK}" ]; then
  export AZP_WORK="_work"
fi

# Generate unique agent name (uses pod hostname if available)
if [ -z "${AZP_AGENT_NAME}" ]; then
  export AZP_AGENT_NAME="$(hostname)-agent"
fi

# Download the latest Azure Pipelines agent
echo "Downloading Azure Pipelines agent..."
AZP_AGENT_PACKAGES=$(curl -fsSL -u "user:${AZP_TOKEN}" "${AZP_URL}/_apis/distributedtask/packages/agent?platform=linux-x64&top=1" | jq -r '.value[0].downloadUrl')

if [ -z "${AZP_AGENT_PACKAGES}" ] || [ "${AZP_AGENT_PACKAGES}" == "null" ]; then
  echo "Error: Failed to download agent package"
  exit 1
fi

curl -fsSL "${AZP_AGENT_PACKAGES}" -o vsts-agent.tar.gz

# Extract agent
echo "Extracting agent..."
tar -xzf vsts-agent.tar.gz
rm vsts-agent.tar.gz

# Skip installdependencies.sh - all deps already installed in Dockerfile
# This script requires sudo which we don't have as non-root user
echo "Skipping dependency installation (pre-installed in container image)"

# Configure the agent
echo "Configuring Azure Pipelines agent..."
./config.sh \
  --unattended \
  --url "${AZP_URL}" \
  --auth pat \
  --token "${AZP_TOKEN}" \
  --pool "${AZP_POOL}" \
  --agent "${AZP_AGENT_NAME}" \
  --work "${AZP_WORK}" \
  --replace \
  --acceptTeeEula

# Cleanup function to remove agent on exit
cleanup() {
  echo "Removing agent from pool..."
  ./config.sh remove --unattended --auth pat --token "${AZP_TOKEN}" || true
}

trap cleanup EXIT

# Run the agent
# AZP_AGENT_MODE=continuous: Run continuously (for Deployment - always-on agents)
# Otherwise: Use --once flag (for ScaledJob - ephemeral agents)
if [ "${AZP_AGENT_MODE}" = "continuous" ]; then
  echo "Starting Azure Pipelines agent (continuous mode)..."
  ./run.sh
else
  echo "Starting Azure Pipelines agent (--once mode)..."
  ./run.sh --once
  echo "Agent completed job and is exiting."
fi
