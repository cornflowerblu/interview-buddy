output "server_id" {
  description = "PostgreSQL server ID"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_name" {
  description = "PostgreSQL server name"
  value       = azurerm_postgresql_flexible_server.main.name
}

output "fqdn" {
  description = "PostgreSQL server FQDN"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "admin_username" {
  description = "Admin username"
  value       = azurerm_postgresql_flexible_server.main.administrator_login
}

output "admin_password" {
  description = "Admin password"
  value       = random_password.admin.result
  sensitive   = true
}

output "database_url" {
  description = "PostgreSQL connection string for Prisma"
  value       = length(var.databases) > 0 ? "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${random_password.admin.result}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.databases[0]}?sslmode=require" : ""
  sensitive   = true
}

output "database_ids" {
  description = "Map of database names to IDs"
  value       = { for db in azurerm_postgresql_flexible_server_database.databases : db.name => db.id }
}
