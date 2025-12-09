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
  description = "SKU name for the PostgreSQL server"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  description = "Storage size in MB"
  type        = number
  default     = 32768
}

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "geo_redundant_backup" {
  description = "Enable geo-redundant backups"
  type        = bool
  default     = false
}

variable "high_availability_mode" {
  description = "High availability mode (Disabled, ZoneRedundant, SameZone)"
  type        = string
  default     = "Disabled"
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"
}

variable "databases" {
  description = "List of databases to create"
  type        = list(string)
  default     = []
}

variable "allowed_ip_ranges" {
  description = "List of IP CIDR ranges to allow"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}

variable "entra_admin_object_id" {
  description = "Object ID of the Entra ID user/group to set as PostgreSQL admin"
  type        = string
  default     = null
}

variable "entra_admin_principal_name" {
  description = "Principal name (email) of the Entra ID admin"
  type        = string
  default     = null
}

variable "entra_admin_principal_type" {
  description = "Type of Entra ID principal (User, Group, ServicePrincipal)"
  type        = string
  default     = "User"
}
