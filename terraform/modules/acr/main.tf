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
  # Ensure the ACR name is <= 50 characters and alphanumeric
  acr_prefix_max_length = 50 - length("acr") - length(random_string.suffix.result)
  acr_prefix_clean = substr(replace(var.name_prefix, "-", ""), 0, local.acr_prefix_max_length)
  acr_name = "${local.acr_prefix_clean}acr${random_string.suffix.result}"
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
