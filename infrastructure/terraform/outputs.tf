output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "postgres_host" {
  value = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "postgres_user" {
  value = azurerm_postgresql_flexible_server.postgres.administrator_login
}

output "postgres_password" {
  value     = azurerm_postgresql_flexible_server.postgres.administrator_password
  sensitive = true
}

output "postgres_database" {
  value = azurerm_postgresql_flexible_server_database.db.name
}

output "redis_host" {
  value = azurerm_redis_cache.redis.hostname
}

output "redis_port" {
  value = azurerm_redis_cache.redis.ssl_port
}

output "redis_primary_access_key" {
  value     = azurerm_redis_cache.redis.primary_access_key
  sensitive = true
}

output "video_indexer_account_id" {
  value = azurerm_video_indexer_account.vi.id
}

output "ai_services_endpoint" {
  value = azurerm_cognitive_account.ai_services.endpoint
}

output "ai_services_key" {
  value     = azurerm_cognitive_account.ai_services.primary_access_key
  sensitive = true
}
