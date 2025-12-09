# -----------------------------------------------------------------------------
# Azure PostgreSQL Flexible Server Module
# -----------------------------------------------------------------------------

resource "random_password" "admin" {
  length           = 32
  special          = true
  override_special = "!@#$%^&*-_+="
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                = "${var.name_prefix}-psql-${random_string.suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location

  administrator_login    = "ibadmin"
  administrator_password = random_password.admin.result

  sku_name   = var.sku_name
  version    = var.postgres_version
  storage_mb = var.storage_mb

  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup

  dynamic "high_availability" {
    for_each = var.high_availability_mode != "Disabled" ? [1] : []
    content {
      mode = var.high_availability_mode
    }
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [
      zone,
      high_availability[0].standby_availability_zone
    ]
  }
}

# Firewall rules for allowed IP ranges
resource "azurerm_postgresql_flexible_server_firewall_rule" "allowed_ips" {
  for_each = { for idx, cidr in var.allowed_ip_ranges : idx => cidr }

  name             = "allowed-ip-${each.key}"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = cidrhost(each.value, 0)
  end_ip_address   = cidrhost(each.value, -1)
}

# Allow Azure services (for AKS connectivity)
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Create databases
resource "azurerm_postgresql_flexible_server_database" "databases" {
  for_each = toset(var.databases)

  name      = each.value
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Configure server parameters for optimal performance
resource "azurerm_postgresql_flexible_server_configuration" "log_connections" {
  name      = "log_connections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "connection_throttling" {
  name      = "connection_throttle.enable"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

# Enforce minimum TLS version 1.2 for security compliance
resource "azurerm_postgresql_flexible_server_configuration" "ssl_min_protocol_version" {
  name      = "ssl_min_protocol_version"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "TLSv1.2"
}
