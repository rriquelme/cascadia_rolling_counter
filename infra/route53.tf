# The rers.dev hosted zone is created and owned by the rers.dev stack. This
# stack only looks it up and adds the records for its own subdomain.
data "aws_route53_zone" "parent" {
  name         = var.zone_name
  private_zone = false
}

# --- rollingcascadia.rers.dev -> CloudFront, via ALIAS records. ---
resource "aws_route53_record" "site_a" {
  zone_id = data.aws_route53_zone.parent.zone_id
  name    = local.site_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "site_aaaa" {
  zone_id = data.aws_route53_zone.parent.zone_id
  name    = local.site_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
