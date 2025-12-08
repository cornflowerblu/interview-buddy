resource "random_password" "postgres_password" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "psql-${local.resource_name_prefix}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "16"
  administrator_login    = "psqladmin"
  administrator_password = random_password.postgres_password.result
  storage_mb             = 32768
  storage_tier           = "P4"
  sku_name               = var.postgres_sku_name
  zone                   = "1"

  tags = local.tags
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "interview_buddy"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Allow access from Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.postgres.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Allow all IPs for dev convenience (Optional - restrict in prod)
# resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_all" {
#   name             = "allow-all"
#   server_id        = azurerm_postgresql_flexible_server.postgres.id
#   start_ip_address = "0.0.0.0"
#   end_ip_address   = "255.255.255.255"
# }
