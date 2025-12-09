# -----------------------------------------------------------------------------
# Common Variables
# -----------------------------------------------------------------------------

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus2"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# -----------------------------------------------------------------------------
# PostgreSQL Configuration
# -----------------------------------------------------------------------------

variable "postgresql_config" {
  description = "PostgreSQL Flexible Server configuration"
  type = object({
    sku_name               = string
    storage_mb             = number
    backup_retention_days  = number
    geo_redundant_backup   = bool
    high_availability_mode = string
    postgres_version       = string
  })
  default = {
    sku_name               = "B_Standard_B1ms"  # Burstable, cost-effective for dev
    storage_mb             = 32768              # 32GB
    backup_retention_days  = 7
    geo_redundant_backup   = false
    high_availability_mode = "Disabled"
    postgres_version       = "16"
  }
}

variable "postgresql_databases" {
  description = "List of databases to create"
  type        = list(string)
  default     = ["interviewbuddy"]
}

variable "postgresql_entra_admin_object_id" {
  description = "Object ID of the Entra ID user/group to set as PostgreSQL admin"
  type        = string
  default     = null
}

variable "postgresql_entra_admin_principal_name" {
  description = "Principal name (email/UPN) of the Entra ID admin"
  type        = string
  default     = null
}

variable "postgresql_entra_admin_principal_type" {
  description = "Type of Entra ID principal (User, Group, ServicePrincipal)"
  type        = string
  default     = "User"
}

# -----------------------------------------------------------------------------
# Redis Configuration
# -----------------------------------------------------------------------------

variable "redis_config" {
  description = "Azure Cache for Redis configuration"
  type = object({
    sku_name   = string
    family     = string
    capacity   = number
    enable_tls = bool
  })
  default = {
    sku_name   = "Basic"  # Basic for dev, Standard/Premium for prod
    family     = "C"
    capacity   = 0        # 250MB cache
    enable_tls = true
  }
}

# -----------------------------------------------------------------------------
# Container Registry Configuration
# -----------------------------------------------------------------------------

variable "acr_config" {
  description = "Azure Container Registry configuration"
  type = object({
    sku                    = string
    admin_enabled          = bool
    public_network_access  = bool
  })
  default = {
    sku                   = "Basic"  # Basic for dev, Standard/Premium for prod
    admin_enabled         = false
    public_network_access = true
  }
}

# -----------------------------------------------------------------------------
# Video Indexer Configuration
# -----------------------------------------------------------------------------

variable "video_indexer_config" {
  description = "Azure Video Indexer configuration"
  type = object({
    sku_name = string
  })
  default = {
    sku_name = "Free"  # Free tier for dev (10 hours/month)
  }
}

# -----------------------------------------------------------------------------
# AI Foundry Configuration
# -----------------------------------------------------------------------------

variable "ai_foundry_config" {
  description = "Azure AI Foundry (OpenAI) configuration"
  type = object({
    sku_name = string
    deployments = list(object({
      name       = string
      model_name = string
      version    = string
      capacity   = number
    }))
  })
  default = {
    sku_name = "S0"
    deployments = [
      {
        name       = "gpt-4o"
        model_name = "gpt-4o"
        version    = "2024-08-06"
        capacity   = 10  # 10K TPM for dev
      }
    ]
  }
}

# -----------------------------------------------------------------------------
# Networking Configuration
# -----------------------------------------------------------------------------

variable "allowed_ip_ranges" {
  description = "List of IP ranges allowed to access resources (CIDR notation)"
  type        = list(string)
  default     = []
}

variable "aks_subnet_id" {
  description = "Subnet ID of the AKS cluster for private endpoint connectivity"
  type        = string
  default     = ""
}
