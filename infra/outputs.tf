output "site_url" {
  value = "https://${local.site_domain}"
}

output "cloudfront_domain_name" {
  description = "CloudFront domain for testing before DNS propagates."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "Used for cache invalidations after content updates."
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket" {
  description = "The private S3 bucket holding the site content."
  value       = aws_s3_bucket.site.id
}
