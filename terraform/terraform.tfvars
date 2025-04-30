# Static configuration values only.
# All dynamic/sensitive values should be injected via TF_VAR_* environment variables.

acr_name                      = "callrecordingacr13215"
azure_blob_account_url        = "https://avangrid.blob.core.windows.net/"
azure_blob_container_vpi      = "vpi"
azure_blob_container_talkdesk = "talkdesk"
frontend_domain               = "pachie.biz"
frontend_static_ip            = "172.191.91.33"