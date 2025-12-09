# -----------------------------------------------------------------------------
# Azure AI Foundry (OpenAI Service) Module
# -----------------------------------------------------------------------------

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_cognitive_account" "openai" {
  name                = "${var.name_prefix}-aoai-${random_string.suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location

  kind     = "OpenAI"
  sku_name = var.sku_name

  # Required for OpenAI
  custom_subdomain_name = "${var.name_prefix}-aoai-${random_string.suffix.result}"

  # Network rules - public access for dev
  public_network_access_enabled = true

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Deploy models
resource "azurerm_cognitive_deployment" "models" {
  for_each = { for d in var.deployments : d.name => d }

  name                 = each.value.name
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = each.value.model_name
    version = each.value.version
  }

  scale {
    type     = "Standard"
    capacity = each.value.capacity
  }
}
