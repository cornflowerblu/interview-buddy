# -----------------------------------------------------------------------------
# Outputs - These are written to Kubernetes secrets by TF-Controller
# -----------------------------------------------------------------------------

# PostgreSQL Outputs
output "postgresql_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = module.postgresql.fqdn
}

output "postgresql_admin_username" {
  description = "PostgreSQL admin username"
  value       = module.postgresql.admin_username
}

output "postgresql_admin_password" {
  description = "PostgreSQL admin password"
  value       = module.postgresql.admin_password
  sensitive   = true
}

output "postgresql_database_url" {
  description = "PostgreSQL connection string for Prisma"
  value       = module.postgresql.database_url
  sensitive   = true
}

# Redis Outputs
output "redis_hostname" {
  description = "Redis hostname"
  value       = module.redis.hostname
}

output "redis_port" {
  description = "Redis SSL port"
  value       = module.redis.ssl_port
}

output "redis_primary_key" {
  description = "Redis primary access key"
  value       = module.redis.primary_access_key
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = module.redis.connection_string
  sensitive   = true
}

# ACR Outputs
output "acr_login_server" {
  description = "ACR login server URL"
  value       = module.acr.login_server
}

output "acr_admin_username" {
  description = "ACR admin username (if enabled)"
  value       = module.acr.admin_username
}

output "acr_admin_password" {
  description = "ACR admin password (if enabled)"
  value       = module.acr.admin_password
  sensitive   = true
}

# Video Indexer Outputs
output "video_indexer_account_id" {
  description = "Video Indexer account ID"
  value       = module.video_indexer.account_id
}

output "video_indexer_account_name" {
  description = "Video Indexer account name"
  value       = module.video_indexer.account_name
}

# AI Foundry Outputs
output "ai_foundry_endpoint" {
  description = "Azure OpenAI endpoint URL"
  value       = module.ai_foundry.endpoint
}

output "ai_foundry_primary_key" {
  description = "Azure OpenAI primary key"
  value       = module.ai_foundry.primary_key
  sensitive   = true
}

output "ai_foundry_deployment_ids" {
  description = "Map of deployment names to IDs"
  value       = module.ai_foundry.deployment_ids
}
