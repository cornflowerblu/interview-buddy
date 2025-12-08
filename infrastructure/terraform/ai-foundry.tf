resource "azurerm_key_vault" "kv" {
  name                     = "kv-${local.resource_name_prefix}"
  location                 = azurerm_resource_group.rg.location
  resource_group_name      = azurerm_resource_group.rg.name
  tenant_id                = data.azurerm_client_config.current.tenant_id
  sku_name                 = "standard"
  purge_protection_enabled = false

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
