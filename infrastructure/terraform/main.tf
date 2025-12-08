terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    azapi = {
      source  = "azure/azapi"
      version = "~> 1.13"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "azurerm" {
    # Configured via backend-config or Flux
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  subscription_id = var.subscription_id
}

provider "azapi" {
}

data "azurerm_client_config" "current" {}


resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  # Generate a unique name for resources: ib-dev-xyz123
  resource_name_prefix = "${var.project_name}-${var.environment}-${random_string.suffix.result}"
  location             = var.location
  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}
