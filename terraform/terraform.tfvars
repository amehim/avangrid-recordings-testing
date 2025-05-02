# Static configuration values only.
# All dynamic/sensitive values should be injected via TF_VAR_* environment variables.

acr_name = "callrecordingacr8950"
azure_resource_group = "MC_avangrid-grp_callrecordings-avangrid-aks_eastus"
azure_blob_account_url        = "https://avangrid.blob.core.windows.net/"
azure_blob_container_vpi      = "vpi"
azure_blob_container_talkdesk = "talkdesk"
frontend_domain               = "frontend.pachie.biz"
frontend_static_ip = "52.168.39.252"