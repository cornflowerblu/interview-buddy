output "account_id" {
  description = "Video Indexer account ID"
  value       = jsondecode(azapi_resource.video_indexer.output).properties.accountId
}

output "account_name" {
  description = "Video Indexer account name"
  value       = azapi_resource.video_indexer.name
}

output "resource_id" {
  description = "Video Indexer resource ID"
  value       = azapi_resource.video_indexer.id
}

output "storage_account_name" {
  description = "Media storage account name"
  value       = azurerm_storage_account.media.name
}

output "storage_account_key" {
  description = "Media storage account primary key"
  value       = azurerm_storage_account.media.primary_access_key
  sensitive   = true
}
