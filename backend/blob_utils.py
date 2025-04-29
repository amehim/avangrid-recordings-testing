from azure.identity import ClientSecretCredential
from azure.storage.blob import ContainerClient
import os
from dotenv import load_dotenv

load_dotenv()

tenant_id = os.getenv("AZURE_TENANT_ID")
client_id = os.getenv("AZURE_CLIENT_ID")
client_secret = os.getenv("AZURE_CLIENT_SECRET")
account_url = os.getenv("AZURE_BLOB_ACCOUNT_URL")
vpi_container_name = os.getenv("AZURE_BLOB_CONTAINER_VPI")
talkdesk_container_name = os.getenv("AZURE_BLOB_CONTAINER_TALKDESK")

credential = ClientSecretCredential(tenant_id, client_id, client_secret)
vpi_container_client = ContainerClient(account_url, vpi_container_name, credential=credential)
talkdesk_container_client = ContainerClient(account_url, talkdesk_container_name, credential=credential)

print("VPI Container exists:", vpi_container_client.exists())
print("Talkdesk Container exists:", talkdesk_container_client.exists())

def list_vpi_blobs(prefix: str):
    return vpi_container_client.list_blobs(name_starts_with=prefix)

def list_vpi_blob(prefix: str):
    return vpi_container_client.list_blobs(name_starts_with=prefix)

def get_vpi_blob_client(blob_name: str):
    return vpi_container_client.get_blob_client(blob_name)

def list_talkdesk_blobs_tags(query: str, page_size: int = 2,continuation_token: str = None):
    return talkdesk_container_client.find_blobs_by_tags(query, results_per_page=page_size).by_page(continuation_token)

def get_talkdesk_blob_client(blob_name: str):
    return talkdesk_container_client.get_blob_client(blob_name)

def get_talkdesk_blob_metadata(blob_name: str):
    blob_client = talkdesk_container_client.get_blob_client(blob_name)
    return blob_client.get_blob_properties()