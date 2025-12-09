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

  minimum_tls_version = var.enable_tls ? "1.2" : null


  redis_configuration {
    # Enable Redis Streams (requires maxmemory-policy)
    maxmemory_policy = "noeviction"
  }

  # Public network access disabled to enforce private endpoints (security requirement)
  public_network_access_enabled = false

  tags = var.tags
}
