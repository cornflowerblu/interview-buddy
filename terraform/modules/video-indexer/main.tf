# -----------------------------------------------------------------------------
# Azure Video Indexer Module
# -----------------------------------------------------------------------------
# Note: Video Indexer requires an Azure Media Services account and Storage account.
# This module creates all required dependencies.
# -----------------------------------------------------------------------------

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Storage account for Video Indexer media files
resource "azurerm_storage_account" "media" {
  # Storage account names must be 3-24 chars, lowercase alphanumeric only
  name = "${substr(replace(var.name_prefix, "/[^a-z0-9]/", ""), 0, 24 - length("vimedia") - length(random_string.suffix.result))}vimedia${random_string.suffix.result}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  # Required for Video Indexer
  is_hns_enabled = false

  blob_properties {
    delete_retention_policy {
      days = 7
    }
  }

  tags = var.tags
}

# Video Indexer account (using azapi since azurerm doesn't fully support it)
resource "azapi_resource" "video_indexer" {
  type      = "Microsoft.VideoIndexer/accounts@2024-01-01"
  name      = "${var.name_prefix}-vi-${random_string.suffix.result}"
  location  = var.location
  parent_id = "/subscriptions/${data.azurerm_subscription.current.subscription_id}/resourceGroups/${var.resource_group_name}"

  body = jsonencode({
    properties = {
      mediaServices = {
        # Video Indexer can work without Media Services in ARM-based mode
        # Using the "classic" account type that doesn't require AMS
      }
      storageServices = {
        resourceId = azurerm_storage_account.media.id
      }
    }
    identity = {
      type = "SystemAssigned"
    }
  })

  tags = var.tags

  response_export_values = ["properties.accountId", "properties.accountName"]
}

# Get current subscription
data "azurerm_subscription" "current" {}

# Grant Video Indexer access to storage account
resource "azurerm_role_assignment" "vi_storage_contributor" {
  scope                = azurerm_storage_account.media.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = jsondecode(azapi_resource.video_indexer.output).identity.principalId
}
