resource "azurerm_key_vault" "kv" {
  name                     = "kv-ib-${var.environment}-${random_string.suffix.result}"
  location                 = azurerm_resource_group.rg.location
  resource_group_name      = azurerm_resource_group.rg.name
  tenant_id                = data.azurerm_client_config.current.tenant_id
  sku_name                 = "standard"
  purge_protection_enabled = false
  soft_delete_retention_days = 90
  enable_rbac_authorization = true

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    # Optionally, restrict to specific subnets:
    # virtual_network_subnet_ids = [azurerm_subnet.example.id]
  }
  tags = local.tags
}

resource "azurerm_application_insights" "app_insights" {
  name                = "appi-${local.resource_name_prefix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"

  tags = local.tags
}

resource "azurerm_cognitive_account" "ai_services" {
  name                = "ai-${local.resource_name_prefix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "AIServices"
  sku_name            = "S0"
  public_network_access_enabled = false
  custom_subdomain_name         = "ai-${local.resource_name_prefix}"

  network_acls {
    default_action = "Deny"
    bypass         = ["AzureServices"]
    # Add private endpoint subnet IDs as needed, e.g.:
    # private_endpoints = [azurerm_private_endpoint.example.id]
  }
  tags = local.tags
}

resource "azurerm_machine_learning_workspace" "ai_hub" {
  name                    = "hub-${local.resource_name_prefix}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = azurerm_application_insights.app_insights.id
  key_vault_id            = azurerm_key_vault.kv.id
  storage_account_id      = azurerm_storage_account.sa.id

  identity {
    type = "SystemAssigned"
  }

  tags = local.tags
}
