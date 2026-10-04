variable "aws_region" {
  description = "AWS region for the S3 bucket and regional resources."
  type        = string
  default     = "us-east-1"
}

variable "zone_name" {
  description = "Existing Route 53 hosted zone the site lives under. The zone itself is managed by the rers.dev stack."
  type        = string
  default     = "rers.dev"
}

variable "subdomain" {
  description = "Subdomain of the zone that serves the site."
  type        = string
  default     = "rollingcascadia"
}

variable "tags" {
  description = "Tags applied to every resource."
  type        = map(string)
  default = {
    Project   = "cascadia_rolling_counter"
    ManagedBy = "terraform"
  }
}

locals {
  site_domain = "${var.subdomain}.${var.zone_name}"
  site_dir    = "${path.module}/../site"
}
