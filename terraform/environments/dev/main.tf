# -----------------------------------------------------------------------------
# Interview Buddy - Dev Environment
# -----------------------------------------------------------------------------
# This environment uses cost-optimized settings for development.
# TF-Controller will run plans and require manual approval before apply.
# -----------------------------------------------------------------------------

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }
    azapi = {
      source  = "azure/azapi"
      version = "~> 1.12"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend for TF-Controller - state stored in Kubernetes secret
  # Alternatively, use Azure Storage backend:
  backend "azurerm" {
    resource_group_name  = "rg-interview-buddy-tfstate"
    storage_account_name = "stibtfstate1765235010"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    cognitive_account {
      purge_soft_delete_on_destroy = true
    }
  }
}

provider "azapi" {}

# Call root module with dev-specific values
module "interview_buddy" {
  source = "../../"

  environment         = "dev"
  location            = "eastus2"
  resource_group_name = "interview-buddy-dev"

  # PostgreSQL - cost-optimized for dev
  postgresql_config = {
    sku_name               = "B_Standard_B1ms"  # Burstable - cheapest
    storage_mb             = 32768              # 32GB minimum
    backup_retention_days  = 7
    geo_redundant_backup   = false
    high_availability_mode = "Disabled"
    postgres_version       = "16"
  }
  postgresql_databases = ["interviewbuddy"]

  # Redis - Basic tier for dev
  redis_config = {
    sku_name   = "Basic"
    family     = "C"
    capacity   = 0  # 250MB - sufficient for dev
    enable_tls = true
  }

  # ACR - Basic tier for dev
  acr_config = {
    sku                   = "Basic"
    admin_enabled         = false  # Disabled for security; use Managed Identity for authentication
    public_network_access = true
  }

  # Video Indexer - Free tier (10 hours/month)
  video_indexer_config = {
    sku_name = "Free"
  }

  # AI Foundry - S0 with GPT-4o
  ai_foundry_config = {
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

  tags = {
    Environment = "dev"
    Project     = "interview-buddy"
    ManagedBy   = "terraform"
    CostCenter  = "development"
  }
}
