resource "azurerm_resource_group" "rg" {
  name     = "rg-${local.resource_name_prefix}"
  location = local.location
  tags     = local.tags
}
