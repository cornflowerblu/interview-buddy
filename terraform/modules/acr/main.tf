# -----------------------------------------------------------------------------
# Azure Container Registry Module
# -----------------------------------------------------------------------------

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# ACR names must be globally unique and alphanumeric only
locals {
  acr_name = replace("${var.name_prefix}acr${random_string.suffix.result}", "-", "")
}

resource "azurerm_container_registry" "main" {
  name                = local.acr_name
  resource_group_name = var.resource_group_name
  location            = var.location

  sku           = var.sku
  admin_enabled = var.admin_enabled

  public_network_access_enabled = var.public_network_access

  tags = var.tags
}
