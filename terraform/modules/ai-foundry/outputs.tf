output "id" {
  description = "Cognitive account ID"
  value       = azurerm_cognitive_account.openai.id
}

output "name" {
  description = "Cognitive account name"
  value       = azurerm_cognitive_account.openai.name
}

output "endpoint" {
  description = "OpenAI endpoint URL"
  value       = azurerm_cognitive_account.openai.endpoint
}

output "primary_key" {
  description = "Primary access key"
  value       = azurerm_cognitive_account.openai.primary_access_key
  sensitive   = true
}

output "secondary_key" {
  description = "Secondary access key"
  value       = azurerm_cognitive_account.openai.secondary_access_key
  sensitive   = true
}

output "deployment_ids" {
  description = "Map of deployment names to IDs"
  value       = { for d in azurerm_cognitive_deployment.models : d.name => d.id }
}
