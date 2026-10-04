# Uploads everything under ../site to the bucket, with correct content types so
# the browser renders HTML/CSS/images instead of downloading them.
locals {
  mime_types = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".png"  = "image/png"
    ".txt"  = "text/plain"
  }
}

resource "aws_s3_object" "site" {
  for_each = fileset(local.site_dir, "**")

  bucket       = aws_s3_bucket.site.id
  key          = each.value
  source       = "${local.site_dir}/${each.value}"
  etag         = filemd5("${local.site_dir}/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.[^.]+$|$", each.value), "application/octet-stream")
}
