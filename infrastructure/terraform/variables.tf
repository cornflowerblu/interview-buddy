variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "interview-buddy"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus2"
}

variable "postgres_sku_name" {
  description = "SKU for PostgreSQL Flexible Server"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "redis_sku_name" {
  description = "SKU for Redis Cache"
  type        = string
  default     = "Basic"
}

variable "redis_family" {
  description = "Family for Redis Cache"
  type        = string
  default     = "C"
}

variable "redis_capacity" {
  description = "Capacity for Redis Cache"
  type        = number
  default     = 0
}
