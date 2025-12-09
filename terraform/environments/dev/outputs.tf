# -----------------------------------------------------------------------------
# Dev Environment Outputs
# -----------------------------------------------------------------------------
# These outputs are written to Kubernetes secrets by TF-Controller
# for consumption by the microservices.
# -----------------------------------------------------------------------------

# PostgreSQL
output "postgresql_fqdn" {
  value = module.interview_buddy.postgresql_fqdn
}

output "postgresql_admin_username" {
  value = module.interview_buddy.postgresql_admin_username
}

output "postgresql_admin_password" {
  value     = module.interview_buddy.postgresql_admin_password
  sensitive = true
}

output "postgresql_database_url" {
  value     = module.interview_buddy.postgresql_database_url
  sensitive = true
}

# Redis
output "redis_hostname" {
  value = module.interview_buddy.redis_hostname
}

output "redis_port" {
  value = module.interview_buddy.redis_port
}

output "redis_primary_key" {
  value     = module.interview_buddy.redis_primary_key
  sensitive = true
}

output "redis_connection_string" {
  value     = module.interview_buddy.redis_connection_string
  sensitive = true
}

# ACR
output "acr_login_server" {
  value = module.interview_buddy.acr_login_server
}

output "acr_admin_username" {
  value = module.interview_buddy.acr_admin_username
}

output "acr_admin_password" {
  value     = module.interview_buddy.acr_admin_password
  sensitive = true
}

# Video Indexer
output "video_indexer_account_id" {
  value = module.interview_buddy.video_indexer_account_id
}

output "video_indexer_account_name" {
  value = module.interview_buddy.video_indexer_account_name
}

# AI Foundry
output "ai_foundry_endpoint" {
  value = module.interview_buddy.ai_foundry_endpoint
}

output "ai_foundry_primary_key" {
  value     = module.interview_buddy.ai_foundry_primary_key
  sensitive = true
}

output "ai_foundry_deployment_ids" {
  value = module.interview_buddy.ai_foundry_deployment_ids
}
