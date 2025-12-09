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
  description = "SKU name (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
}

variable "family" {
  description = "SKU family (C for Basic/Standard, P for Premium)"
  type        = string
  default     = "C"
}

variable "capacity" {
  description = "Cache capacity (0-6 for C family, 1-5 for P family)"
  type        = number
  default     = 0
}

variable "enable_tls" {
  description = "Enable TLS/SSL"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
