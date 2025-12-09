# -----------------------------------------------------------------------------
# Azure Cache for Redis Module
# -----------------------------------------------------------------------------

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_redis_cache" "main" {
  name                = "${var.name_prefix}-redis-${random_string.suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location

  sku_name = var.sku_name
  family   = var.family
  capacity = var.capacity

  enable_non_ssl_port = !var.enable_tls
  minimum_tls_version = var.enable_tls ? "1.2" : null

  redis_configuration {
    # Enable Redis Streams (requires maxmemory-policy)
    maxmemory_policy = "noeviction"
  }

  # Public network access (for dev - disable in prod with private endpoints)
  public_network_access_enabled = true

  tags = var.tags
}
