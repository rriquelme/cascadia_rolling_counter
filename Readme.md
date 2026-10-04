# Cascadia Rolling Counter

A small web page that replaces the paper tally sheet for Cascadia: Rolling Hills and Cascadia: Rolling Rivers.

Six counters (bear, elk, fox, hawk, salmon, pinecone), each with `-3 -2 -1` and `+1 +2 +3` buttons. The `+` button in the header toggles a second line with `-6 -5 -4` and `+4 +5 +6`. Counts are saved in the browser, so every player tracks their own on their own device and a refresh does not lose them. Each animal starts at 1 and the pinecone at 2, as on the tally sheet; `Reset` returns to those values for a new game.

`History` lists every change since the last reset, newest first. Quick taps on the same counter are logged as one entry (`+3 +3 +1` is `+7`).

## Layout

- `site/` — the static page (no build step). Open `site/index.html` to run it locally.
- `infra/` — Terraform for hosting it at https://rollingcascadia.rers.dev.

The icons in `site/icons/` were extracted from the official Cascadia Rolling tally sheet PDF.

## Hosting

Same stack as [rers.dev](https://github.com/rriquelme/rers.dev): a private S3 bucket served by CloudFront with a free ACM certificate. The `rers.dev` Route 53 zone belongs to the rers.dev stack; this one only looks it up and adds the records for the `rollingcascadia` subdomain.

You need AWS credentials and Terraform.

```bash
cd infra
terraform init
terraform apply
```

The AWS provider pinned here does not read `aws login` sessions. If Terraform reports "No valid credential sources found", hand it the CLI's temporary credentials first (they last about 15 minutes):

```bash
eval "$(aws configure export-credentials --format env)"
```

## Updating the site

Edit files in `site/`, then:

```bash
cd infra
terraform apply          # re-uploads changed files to S3

# bust the CloudFront edge cache so players see the change immediately:
aws cloudfront create-invalidation \
  --distribution-id "$(terraform output -raw cloudfront_distribution_id)" \
  --paths '/*'
```
