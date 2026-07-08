terraform {
  required_version = ">= 1.5.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_service_plan" "plan" {
  name                = "${var.app_name}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

resource "azurerm_linux_web_app" "app" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    WEBSITES_PORT                  = "3000"
  }
}

variable "resource_group_name" {
  type = string
}

variable "app_name" {
  type = string
}

variable "location" {
  type = string
  default = "Australia East"
}
