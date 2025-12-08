resource "azurerm_user_assigned_identity" "vi_identity" {
  location            = azurerm_resource_group.rg.location
  name                = "id-vi-${local.resource_name_prefix}"
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.tags
}

# Role assignment for VI identity to access storage
resource "azurerm_role_assignment" "vi_storage_contributor" {
  scope                = azurerm_storage_account.sa.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.vi_identity.principal_id
}

resource "azurerm_video_indexer_account" "vi" {
  name                = "vi-${local.resource_name_prefix}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  storage_account_id  = azurerm_storage_account.sa.id
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.vi_identity.id]
  }

  tags = local.tags

  depends_on = [
    azurerm_role_assignment.vi_storage_contributor
  ]
}
