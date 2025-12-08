# Security Summary: Interview Buddy Platform
**Prepared for**: Phase 1-2 Setup (Terraform Infrastructure & Foundation)  
**Date**: 2025-12-08  
**Author**: Sentinel (Security Guardian)

---

## Executive Summary

Interview Buddy handles **highly sensitive user data** - recorded job interviews containing PII, voice/video biometrics, and competitive business information. The platform's privacy-by-design principle (users never see raw recordings) provides inherent security benefits, but introduces unique risks during storage and processing. This summary identifies critical security considerations for Phase 1-2 infrastructure setup and provides actionable recommendations aligned with our Azure-native, microservices architecture.

---

## 1. Immediate Security Concerns (Phase 1-2)

### 1.1 **Secrets Management in Terraform** 🚨 CRITICAL
**Risk**: Terraform state files and outputs will contain sensitive credentials (PostgreSQL passwords, Redis keys, Azure API keys, Video Indexer credentials).

**Concerns**:
- T026-T031: Terraform outputs for connection strings risk exposing credentials in plain text
- `.tfstate` files contain unencrypted secrets and must never be committed to Git
- Environment variable files (`.env`) generated from Terraform can be accidentally committed

**Recommendations**:
- ✅ **Use Azure Key Vault for all secrets immediately** (don't rely on `.env` files)
- ✅ **Configure Terraform remote backend** with state encryption (Azure Storage with encryption)
- ✅ **Use `azurerm` backend with managed identity** instead of storage account keys
- ✅ **Never export secrets to .env files** - instead, services should fetch from Key Vault at runtime using Managed Identity
- ✅ **Add comprehensive .gitignore patterns** for `*.tfstate`, `*.tfstate.backup`, `.env`, `.env.local`, `terraform.tfvars`
- ✅ **Use Terraform `sensitive = true`** for all credential outputs to prevent console exposure

```hcl
# infrastructure/terraform/backend.tf (REQUIRED)
terraform {
  backend "azurerm" {
    resource_group_name  = "interview-buddy-terraform-state"
    storage_account_name = "ibtfstate"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
    use_azuread_auth     = true  # Use Managed Identity, not access keys
  }
}
```

### 1.2 **Database Security (PostgreSQL)** 🔐
**Risk**: PostgreSQL Flexible Server will contain all interview metadata, transcriptions, and analysis results. Misconfiguration could expose data or allow unauthorized access.

**Concerns**:
- T022: PostgreSQL deployment configuration must enforce encryption and network isolation
- Default PostgreSQL configurations often allow overly permissive access
- Connection strings in plain text enable lateral movement if compromised

**Recommendations**:
- ✅ **Enable SSL/TLS enforcement** on PostgreSQL Flexible Server (set `require_secure_transport = ON`)
- ✅ **Configure Azure Private Endpoint** for PostgreSQL (no public internet access) - services connect via VNet
- ✅ **Use Azure AD authentication** instead of PostgreSQL passwords where possible (Managed Identity for services)
- ✅ **Enable automatic backups** with 7-day retention (NFR23) and geo-redundancy
- ✅ **Set minimum TLS version to 1.2** in PostgreSQL configuration
- ✅ **Implement row-level security (RLS)** in Prisma schema to enforce `userId` isolation (NFR10)
- ✅ **Enable Azure Defender for PostgreSQL** (threat detection) in production

```sql
-- packages/prisma-client/prisma/schema.prisma
-- Add RLS enforcement at application level
model Interview {
  id     String @id @default(cuid())
  userId String
  // ... other fields
  @@index([userId]) // Critical for query performance with RLS
}
```

### 1.3 **Redis Security (Event Streams)** 🔐
**Risk**: Redis Streams will carry sensitive event payloads (interview IDs, user IDs, potentially transcription snippets). Unencrypted Redis is a lateral movement vector.

**Concerns**:
- T023: Redis Cache configuration must enforce TLS and authentication
- Event payloads in Redis could expose data if service is compromised
- Lack of authentication enables any pod to publish/consume events

**Recommendations**:
- ✅ **Enable TLS for all Redis connections** (Azure Cache for Redis supports TLS 1.2+)
- ✅ **Require authentication** with strong passwords (use Key Vault reference)
- ✅ **Use Azure Private Endpoint** for Redis (no public access)
- ✅ **Keep event payloads minimal** - only IDs, not transcription content (store bulk data in Postgres)
- ✅ **Implement Redis ACLs** to restrict each service to specific streams (upload-service can only publish to `interview.uploaded`)
- ✅ **Enable persistence** for Redis Streams to prevent event loss during pod restarts

```typescript
// packages/shared-types/src/events/index.ts
// Keep payloads minimal - no PII in events
export interface InterviewUploadedEvent {
  interviewId: string;      // OK - reference
  userId: string;           // OK - for routing
  // ❌ DON'T include: transcription text, user email, file content
}
```

### 1.4 **Azure Video Indexer Access Control** 🎥
**Risk**: Video Indexer stores raw recordings and processed insights. Improper access controls could expose sensitive video/audio.

**Concerns**:
- Direct upload from browser requires SAS tokens with appropriate scoping
- Video Indexer webhooks must authenticate caller to prevent spoofing
- Recordings should auto-delete after 90 days (compliance requirement)

**Recommendations**:
- ✅ **Generate short-lived SAS tokens** (1-hour expiry) for Video Indexer uploads
- ✅ **Set privacy level to "Private"** for all videos (never "Public" or "Unlisted")
- ✅ **Disable streaming presets** (`NoStreaming`) to prevent playback (aligns with privacy-by-design)
- ✅ **Implement webhook signature validation** (HMAC) for Video Indexer callbacks
- ✅ **Configure auto-delete policy** for videos after 90 days using Azure Policy
- ✅ **Use separate Video Indexer accounts** for dev/staging/prod environments

```typescript
// apps/upload-service/src/modules/video-indexer/webhook.controller.ts
import * as crypto from 'crypto';

@Post('/webhooks/video-indexer')
async handleWebhook(@Headers('x-signature') signature: string, @Body() payload: any) {
  // Validate webhook signature
  const expectedSig = crypto.createHmac('sha256', process.env.VIDEO_INDEXER_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  if (signature !== expectedSig) {
    throw new UnauthorizedException('Invalid webhook signature');
  }
  // ... process webhook
}
```

### 1.5 **Azure AI Foundry API Key Management** 🤖
**Risk**: AI Foundry API keys have broad access to multiple AI models (GPT-4o, Claude, Nova). Compromise enables expensive API abuse and data exfiltration.

**Concerns**:
- T025: AI Foundry credentials in Terraform outputs
- Keys hard-coded in application code or environment variables
- No rate limiting or cost controls on API usage

**Recommendations**:
- ✅ **Store AI Foundry keys in Azure Key Vault**, rotate every 90 days
- ✅ **Use Managed Identity** for AI Foundry access (if supported)
- ✅ **Implement rate limiting** at application level (max 50 requests/min per user)
- ✅ **Set spending alerts** in Azure AI Foundry (notify if >$100/day)
- ✅ **Log all AI API calls** with user context for audit trail (exclude prompt content to avoid PII logging)
- ✅ **Implement prompt injection detection** to prevent abuse of AI models

---

## 2. Authentication & Authorization (Firebase JWT)

### 2.1 **Current Design**
- **Firebase Authentication** manages user sign-up, login, and JWT issuance
- **Next.js middleware** validates Firebase JWT on every API request (T029)
- **Services trust Next.js** to forward validated `userId` in headers

### 2.2 **Security Gaps to Address**
- ❌ **No service-to-service authentication** beyond Istio mTLS (a compromised pod can impersonate any user)
- ❌ **JWT forwarding from Next.js to services** is implicit in current design - needs explicit specification
- ❌ **No authorization beyond user ownership** (no admin roles, no service-specific permissions)

### 2.3 **Recommendations**
- ✅ **Propagate Firebase JWT to all microservices** (don't just send `userId` in header - send full JWT)
- ✅ **Each microservice validates JWT** using Firebase Admin SDK (defense in depth)
- ✅ **Use Istio RequestAuthentication** to validate JWT at gateway level (fail fast)
- ✅ **Implement userId extraction middleware** in NestJS shared library (`packages/shared-utils/src/auth`)
- ✅ **Add RBAC for future admin features** (e.g., user support, moderation) - use Firebase custom claims

```typescript
// packages/shared-utils/src/auth/firebase.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];
    
    if (!token) throw new UnauthorizedException('No token provided');
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = { userId: decodedToken.uid, email: decodedToken.email };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

---

## 3. Data Protection & Privacy

### 3.1 **Privacy-by-Design Principle** ✅
**Current Design**: Users never see/hear their recordings - only structured analysis data.

**Security Benefit**: This architecture inherently prevents data exfiltration via the UI. Even if frontend is compromised, attackers cannot access raw recordings.

**Implementation Notes**:
- ✅ **No API endpoints expose raw video/audio** (no download, no streaming)
- ✅ **Video Indexer set to NoStreaming preset** (disables playback URLs)
- ✅ **Analysis results stored as JSON** in PostgreSQL (text-only, no media references)

### 3.2 **PII Handling (NFR13)**
**Risk**: Application logs, distributed traces, and error messages could leak PII (names, emails, transcription text).

**Recommendations**:
- ✅ **Sanitize logs in shared logging utility** (`packages/shared-utils/src/logging`)
- ✅ **Use structured logging** (JSON format) with PII redaction
- ✅ **Configure Istio to exclude sensitive headers** from traces (Authorization, x-user-email)
- ✅ **Redact email addresses** in error messages (show only domain: user@example.com → ***@example.com)
- ✅ **Never log transcription text or analysis content** - only metadata (length, language, status)

```typescript
// packages/shared-utils/src/logging/logger.ts
export class Logger {
  log(message: string, context?: Record<string, any>) {
    const sanitized = this.sanitizePII(context);
    console.log(JSON.stringify({ message, ...sanitized, timestamp: new Date() }));
  }
  
  private sanitizePII(data: any): any {
    // Redact email, phone, transcription text
    const redactKeys = ['email', 'phone', 'transcriptionText', 'password'];
    // ... implementation
  }
}
```

### 3.3 **Data Retention & Deletion**
**Risk**: GDPR/CCPA require ability to delete user data on request. Recordings stored in Video Indexer need lifecycle management.

**Recommendations**:
- ✅ **Implement soft delete in Prisma** (mark records as `deletedAt` instead of hard delete)
- ✅ **Create data deletion job** that purges Video Indexer recordings after 90 days
- ✅ **Add GDPR compliance endpoint** (`DELETE /api/users/:userId`) to cascade delete all user data
- ✅ **Document data retention policy** in Terms of Service (90 days for recordings, 2 years for analysis results)

---

## 4. Network Security (Istio mTLS)

### 4.1 **Current Design (NFR7)**
- **Istio service mesh** provides automatic mTLS for all service-to-service communication
- **No application code changes** needed for encryption

### 4.2 **Implementation Requirements**
- ✅ **Enable strict mTLS mode** in Istio PeerAuthentication (reject plain-text traffic)
- ✅ **Configure AuthorizationPolicy** to restrict which services can call each other
- ✅ **Disable sidecar injection for PostgreSQL/Redis pods** (they handle their own TLS)

```yaml
# manifests/local/istio-mtls-policy.yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default
spec:
  mtls:
    mode: STRICT  # Enforce mTLS for all services

---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: processor-service-authz
  namespace: default
spec:
  selector:
    matchLabels:
      app: processor-service
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/upload-service"]  # Only upload-service can call processor
```

---

## 5. Compliance & Audit Trail

### 5.1 **Regulatory Considerations**
- **GDPR (EU)**: Right to access, right to deletion, data portability
- **CCPA (California)**: Similar requirements + opt-out of data sale
- **Wiretapping laws**: Users must disclose recording in some jurisdictions (legal disclaimer needed)

### 5.2 **Recommendations**
- ✅ **Add legal disclaimer** on upload page: "By uploading, you confirm you have consent to record this conversation and comply with local laws"
- ✅ **Implement audit log** for all data access (who accessed which interview, when)
- ✅ **Create data export API** for GDPR compliance (JSON export of all user data)
- ✅ **Document data processing** in Privacy Policy (what data is collected, how it's used, retention periods)
- ✅ **Enable Azure Policy compliance scans** for GDPR/HIPAA baselines

---

## 6. Incident Response Plan (Phase 2)

### 6.1 **Preparation for Security Incidents**
Even with strong controls, prepare for potential breaches:

**Action Items**:
- ✅ **Define security incident response team** (on-call rotation)
- ✅ **Create runbook** for common incidents (credential leak, data breach, DDoS)
- ✅ **Set up alerting** for suspicious activity (failed auth attempts, unusual API usage)
- ✅ **Enable Azure Security Center** for threat detection
- ✅ **Plan for emergency key rotation** (can rotate all secrets within 1 hour?)

---

## 7. Security Checklist for Terraform Setup (T020-T031)

Use this checklist when implementing infrastructure tasks:

### Azure Resource Group (T021)
- [ ] Apply Azure Policy for encryption enforcement
- [ ] Enable resource locks to prevent accidental deletion
- [ ] Tag resources with `environment=dev` and `project=interview-buddy`

### PostgreSQL (T022)
- [ ] SSL enforcement enabled (`require_secure_transport = ON`)
- [ ] Azure Private Endpoint configured (no public access)
- [ ] Firewall rules allow only AKS VNet
- [ ] Automatic backups enabled (7-day retention)
- [ ] Azure AD authentication configured
- [ ] Audit logging enabled (log all connections)

### Redis (T023)
- [ ] TLS 1.2+ required for all connections
- [ ] Strong password stored in Key Vault
- [ ] Azure Private Endpoint configured
- [ ] Persistence enabled (RDB + AOF)
- [ ] Firewall rules allow only AKS VNet

### Video Indexer (T024)
- [ ] API keys stored in Key Vault
- [ ] Webhook secret generated and stored securely
- [ ] Auto-delete policy configured (90 days)
- [ ] Separate accounts for dev/staging/prod

### AI Foundry (T025)
- [ ] API keys stored in Key Vault with 90-day rotation policy
- [ ] Spending alerts configured ($100/day threshold)
- [ ] Rate limiting enabled at workspace level
- [ ] Audit logging enabled

### Terraform State (T028)
- [ ] Remote backend configured with Azure Storage
- [ ] State encryption enabled
- [ ] Access restricted via RBAC (only DevOps team)
- [ ] State locking enabled to prevent concurrent modifications

### Key Vault (New - Add to Tasks)
- [ ] Soft delete enabled (recover secrets within 90 days)
- [ ] Purge protection enabled (prevent permanent deletion)
- [ ] RBAC configured (Managed Identity for services, admin for humans)
- [ ] Audit logging enabled
- [ ] Network restrictions (private endpoint or firewall rules)

---

## 8. Concrete Recommendations Summary

### **Immediate Actions (Before Phase 2 Code)**
1. ✅ **Create Azure Key Vault** as first Terraform resource (all other services depend on it)
2. ✅ **Configure Terraform remote backend** with encryption
3. ✅ **Update .gitignore** to exclude all secret files (`.env*`, `*.tfstate`, `terraform.tfvars`)
4. ✅ **Enable Private Endpoints** for PostgreSQL and Redis (block public access from day 1)
5. ✅ **Implement shared FirebaseAuthGuard** in `packages/shared-utils/src/auth` for all services

### **Phase 2 (During Service Implementation)**
6. ✅ **Add Istio security policies** (strict mTLS + AuthorizationPolicy per service)
7. ✅ **Implement PII sanitization** in logging utility
8. ✅ **Add Video Indexer webhook signature validation**
9. ✅ **Create data deletion job** (90-day lifecycle for recordings)
10. ✅ **Add rate limiting** to all public API endpoints (Next.js middleware)

### **Before Production Deployment**
11. ✅ **Security audit** of Terraform configurations
12. ✅ **Penetration testing** of authentication flows
13. ✅ **GDPR compliance review** (data export, deletion, privacy policy)
14. ✅ **Incident response plan** documented and tested
15. ✅ **Azure Defender enabled** for all services

---

## Conclusion

Interview Buddy's privacy-by-design architecture provides a strong security foundation, but the infrastructure setup phase (T020-T031) is **critical** for establishing security baselines. **Do not skip security configurations for the sake of speed** - secrets management, network isolation, and encryption are much harder to retrofit than to build correctly from the start.

**Key Principle**: *Assume breach* - design every layer (Terraform, Kubernetes, application code) to contain damage if one layer is compromised. Defense in depth is essential for handling sensitive interview recordings.

**Questions or concerns?** Escalate to Sentinel (Security Guardian) before proceeding with any security-impacting decisions.

---

**Document Status**: Initial Draft  
**Next Review**: After T020-T031 completion (Terraform infrastructure deployed)
