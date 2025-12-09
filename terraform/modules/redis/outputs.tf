output "id" {
  description = "Redis cache ID"
  value       = azurerm_redis_cache.main.id
}

output "hostname" {
  description = "Redis hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "port" {
  description = "Redis non-SSL port"
  value       = azurerm_redis_cache.main.port
}

output "ssl_port" {
  description = "Redis SSL port"
  value       = azurerm_redis_cache.main.ssl_port
}

output "primary_access_key" {
  description = "Primary access key"
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
}

output "secondary_access_key" {
  description = "Secondary access key"
  value       = azurerm_redis_cache.main.secondary_access_key
  sensitive   = true
}

output "connection_string" {
  description = "Redis connection string for NestJS"
  value       = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}"
  sensitive   = true
}
