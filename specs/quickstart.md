# Quickstart Guide

**Status**: Minimal - update as we build
**Last Updated**: 2025-12-08

Get the Interview Buddy MVP running locally. We'll expand this as we discover what's actually needed.

## Prerequisites

- Node.js 20+
- Docker Desktop (for Minikube)
- Minikube installed
- kubectl installed
- Azure account (for Video Indexer, PostgreSQL, AI Foundry)

## One-Time Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Azure Services Setup

You'll need to create these in Azure Portal:

- **Azure Video Indexer** account
- **Azure Database for PostgreSQL** (Flexible Server, Burstable tier is fine)
- **Azure AI Foundry** API key

Save credentials - you'll need them for `.env` files.

### 3. Start Minikube

```bash
minikube start
minikube addons enable istio
```

### 4. Deploy Redis and PostgreSQL to Kubernetes

```bash
kubectl apply -k manifests/local/
```

Wait for pods to be ready:
```bash
kubectl get pods -w
```

### 5. Database Migrations

```bash
cd packages/prisma-client
npx prisma migrate dev
```

### 6. Environment Variables

Each service needs a `.env` file. Start with these templates:

**apps/web/.env.local**:
```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_FIREBASE_CONFIG="..."
VIDEO_INDEXER_ACCOUNT_ID="..."
```

**apps/upload-service/.env**:
```
DATABASE_URL="postgresql://..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
VIDEO_INDEXER_API_KEY="..."
```

**apps/processor-service/.env**:
```
DATABASE_URL="postgresql://..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
VIDEO_INDEXER_API_KEY="..."
```

**apps/ai-analyzer-service/.env**:
```
DATABASE_URL="postgresql://..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
AZURE_AI_FOUNDRY_KEY="..."
```

## Running Locally

### Option 1: Run All Services

```bash
# Terminal 1: Next.js
cd apps/web && npm run dev

# Terminal 2: Upload Service
cd apps/upload-service && npm run start:dev

# Terminal 3: Processor Service
cd apps/processor-service && npm run start:dev

# Terminal 4: AI Analyzer Service
cd apps/ai-analyzer-service && npm run start:dev
```

### Option 2: Run in Kubernetes

Build and deploy:
```bash
# Build Docker images
docker build -t interviewbuddy.azurecr.io/upload-service:latest -f apps/upload-service/Dockerfile .
docker build -t interviewbuddy.azurecr.io/processor-service:latest -f apps/processor-service/Dockerfile .
docker build -t interviewbuddy.azurecr.io/ai-analyzer-service:latest -f apps/ai-analyzer-service/Dockerfile .

# Load into Minikube
minikube image load interviewbuddy.azurecr.io/upload-service:latest
minikube image load interviewbuddy.azurecr.io/processor-service:latest
minikube image load interviewbuddy.azurecr.io/ai-analyzer-service:latest

# Apply manifests
kubectl apply -k manifests/local/

# Port-forward to access
kubectl port-forward svc/web 3000:3000
```

## Testing the Flow

1. Open http://localhost:3000
2. Upload a test video file
3. Watch the processing status change
4. View analysis results when complete

## Troubleshooting

**Port already in use**: Change port in package.json dev script
**Prisma client not found**: Run `npm run db:generate` in packages/prisma-client
**Redis connection failed**: Make sure Redis pod is running in Kubernetes

## What's Next

- We'll add more details as we build
- Check CLAUDE.md for architectural context
- See tasks.md for implementation order
- Update this guide as you discover gotchas
