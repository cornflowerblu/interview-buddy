variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "sku_name" {
  description = "SKU name (Free, Basic, Standard)"
  type        = string
  default     = "Free"
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
