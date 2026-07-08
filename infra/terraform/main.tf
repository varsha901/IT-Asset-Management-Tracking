terraform {
  required_version = ">= 1.5.0"
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

data "azurerm_service_plan" "plan" {
  name                = var.app_service_plan_name
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_linux_web_app" "app" {
  name                = var.app_name
  resource_group_name = data.azurerm_resource_group.rg.name
}

variable "resource_group_name" {
  type = string
}

variable "app_service_plan_name" {
  type = string
}

variable "app_name" {
  type = string
}
