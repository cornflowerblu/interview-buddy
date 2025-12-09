# -----------------------------------------------------------------------------
# Interview Buddy - Azure Infrastructure
# -----------------------------------------------------------------------------
# This root module orchestrates all Azure resources for the Interview Buddy
# platform. Resources are provisioned via TF-Controller with manual approval.
# -----------------------------------------------------------------------------

locals {
  common_tags = merge(var.tags, {
    Environment = var.environment
    Project     = "interview-buddy"
    ManagedBy   = "terraform"
  })

  name_prefix = "ib-${var.environment}"
}

# -----------------------------------------------------------------------------
# Resource Group (if not pre-existing)
# -----------------------------------------------------------------------------

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

# -----------------------------------------------------------------------------
# PostgreSQL Flexible Server
# -----------------------------------------------------------------------------

module "postgresql" {
  source = "./modules/postgresql"

  name_prefix         = local.name_prefix
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.location

  sku_name               = var.postgresql_config.sku_name
  storage_mb             = var.postgresql_config.storage_mb
  backup_retention_days  = var.postgresql_config.backup_retention_days
  geo_redundant_backup   = var.postgresql_config.geo_redundant_backup
  high_availability_mode = var.postgresql_config.high_availability_mode
  postgres_version       = var.postgresql_config.postgres_version

  databases        = var.postgresql_databases
  allowed_ip_ranges = var.allowed_ip_ranges

  # Entra ID authentication
  entra_admin_object_id      = var.postgresql_entra_admin_object_id
  entra_admin_principal_name = var.postgresql_entra_admin_principal_name
  entra_admin_principal_type = var.postgresql_entra_admin_principal_type

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Azure Cache for Redis
# -----------------------------------------------------------------------------

module "redis" {
  source = "./modules/redis"

  name_prefix         = local.name_prefix
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.location

  sku_name   = var.redis_config.sku_name
  family     = var.redis_config.family
  capacity   = var.redis_config.capacity
  enable_tls = var.redis_config.enable_tls

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Azure Container Registry
# -----------------------------------------------------------------------------

module "acr" {
  source = "./modules/acr"

  name_prefix         = local.name_prefix
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.location

  sku                   = var.acr_config.sku
  admin_enabled         = var.acr_config.admin_enabled
  public_network_access = var.acr_config.public_network_access

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Azure Video Indexer
# -----------------------------------------------------------------------------

module "video_indexer" {
  source = "./modules/video-indexer"

  name_prefix         = local.name_prefix
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.location

  sku_name = var.video_indexer_config.sku_name

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Azure AI Foundry (OpenAI Service)
# -----------------------------------------------------------------------------

module "ai_foundry" {
  source = "./modules/ai-foundry"

  name_prefix         = local.name_prefix
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.location

  sku_name    = var.ai_foundry_config.sku_name
  deployments = var.ai_foundry_config.deployments

  tags = local.common_tags
}
