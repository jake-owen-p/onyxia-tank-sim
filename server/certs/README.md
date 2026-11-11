Supabase's public database CA certificate, downloaded from
https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt.

The PostgreSQL adapter uses it to verify both the connection certificate and
hostname. This is a public trust certificate, not a private key. See
[Supabase SSL documentation](https://supabase.com/docs/guides/platform/ssl-enforcement).
