resource "azurerm_storage_account" "sa" {
  name                     = "sa${substr(md5(local.resource_name_prefix), 0, 22)}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  # Security configurations
  infrastructure_encryption_enabled    = true
  allow_nested_items_to_be_public     = false
  https_traffic_only_enabled          = true
  min_tls_version                     = "TLS1_2"

  network_rules {
    default_action             = "Deny"
    bypass                     = ["AzureServices"]
    # Add virtual_network_subnet_ids or ip_rules as needed for your environment
  }

  blob_properties {
    delete_retention_policy {
      days = 7
    }
  }
  tags = local.tags
}
