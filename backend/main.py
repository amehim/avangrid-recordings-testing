from fastapi import FastAPI, HTTPException, Query
from datetime import datetime, timedelta
from typing import Optional,List, Dict
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.responses import Response
import io
from fastapi.responses import JSONResponse
from uuid import uuid4
import xmltodict


from blob_utils import list_vpi_blobs, get_vpi_blob_client,list_vpi_blob,list_talkdesk_blobs_tags,get_talkdesk_blob_client,get_talkdesk_blob_metadata
# from xml_parser import parse_xml_cmp, parse_xml_format
from audio_utils import convert_wav_to_mp3
from urllib.parse import quote



app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for blob 
session_cache = {}
cache_session_filter = {}
MAX_RECORDS = 10000
TIMEOUT_SECONDS = 60
Records_count = 0

# logging.basicConfig(level=logging.INFO)

def parse_xml_cmp(xml_data: bytes) -> List[Dict]:
    try:
        parsed = xmltodict.parse(xml_data)
        media_objects = parsed.get("ExportSummary", {}).get("Objects", {}).get("Media", [])
        global Records_count

        # Ensure it's always a list
        if isinstance(media_objects, dict):
            media_objects = [media_objects]

        cleaned_media_objects = []
        for media in media_objects:
            cleaned_media = {}
            for key, value in media.items():
                new_key = key.lstrip("@")  # Remove "@" from keys
                cleaned_media[new_key] = value
            Records_count += 1
            cleaned_media_objects.append(cleaned_media)

        return cleaned_media_objects
    except Exception as e:
        print(f"Failed to parse XML: {e}")
        return []


def parse_xml_format(xml_data: bytes) -> List[Dict]:
    try:
        parsed = xmltodict.parse(xml_data)
        media = parsed.get("Media", {})

        metadata = {}
        global Records_count

        # Extract attributes if present
        if "@Type" in media:
            metadata["Type"] = media.pop("@Type")
        if "@FileName" in media:
            metadata["FileName"] = media.pop("@FileName")
        if "@Result" in media:
            metadata["Result"] = media.pop("@Result")

        # Add the rest of the elements
        for key, value in media.items():
            metadata[key] = value if value is not None else ""
        Records_count += 1
        return [metadata]
    except Exception as e:
        print(f"Failed to parse XML: {e}")
        return []



@app.get("/debug/all", response_model=List[Dict])
async def get_all_metadata():
    metadata_list = []
    pages = list_vpi_blobs("RGE/")

    for page in pages:
        for blob in page:
            if blob.name.endswith(".xml"):
                xml_data = get_vpi_blob_client(blob.name).download_blob().readall()
                metadata_list.extend(parse_xml_format(xml_data))

    return metadata_list

@app.get("/vpi/metadata", response_model=Dict)
async def get_metadata_in_range(
    from_date: str = Query(..., description="YYYY-MM-DD HH:MM"),
    to_date: str = Query(..., description="YYYY-MM-DD HH:MM"),
    opco: str = Query(..., description="OPCO"),
    page_number: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1),
    session_id: str = Query(None, description="Session ID to reuse cached metadata")
):
    print("Running Vpi Metadata")
    try:
        from_dt = datetime.strptime(from_date, "%Y-%m-%d %H:%M:%S")
        to_dt = datetime.strptime(to_date, "%Y-%m-%d %H:%M:%S")
        from_date = from_dt.date()
        to_date = to_dt.date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    if to_dt < from_dt:
        raise HTTPException(status_code=400, detail="`to_date` must be after `from_date`")
    
    if opco not in ["CMP", "RGE", "NYSEG"]:
        raise HTTPException(status_code=400, detail="Invalid `opco` value. Must be 'CMP', 'RGE', or 'NYSEG'")
    # Reuse session if available
    global Records_count
    if session_id and session_id in session_cache:
        filtered_metadata = session_cache[session_id]
    else:
        # Fresh request: generate metadata and create a session
        filtered_metadata = []
        current_date = from_date
        while current_date <= to_date:
            prefix = f"{opco}/" + (
                f"{current_date.year}/{current_date.month}/{current_date.day}/Metadata/"
                if opco == "CMP"
                else f"{current_date.year}/{current_date.month}/{current_date.day}/"
            )
            blobs = list_vpi_blobs(prefix)
            for blob in blobs:
                if blob.name.endswith(".xml"):
                    xml_data = get_vpi_blob_client(blob.name).download_blob().readall()
                    records = parse_xml_cmp(xml_data) if opco == "CMP" else parse_xml_format(xml_data)
                    
                    if current_date == from_date or current_date == to_date:
                        for record in records:
                            start_time_str = record.get("startTime")  # Format: 1/10/2015 10:11:31 PM
                            try:
                                record_dt = datetime.strptime(start_time_str, "%m/%d/%Y %I:%M:%S %p")
                            except Exception:
                                continue
                            if record_dt >= from_dt and record_dt <= to_dt:
                                    filtered_metadata.append(record)
                    else:
                        filtered_metadata.extend(records)
                if Records_count >= 10000:
                    Records_count = 0
                    break               
            current_date += timedelta(days=1)
    

        # Create a new session ID
        session_id = str(uuid4())
        session_cache[session_id] = filtered_metadata

    # Paginate
    start_idx = (page_number - 1) * page_size
    end_idx = start_idx + page_size
    page_data = filtered_metadata[start_idx:end_idx]
    print("completed Vpi Metadata")

    return JSONResponse(content={
        "data": page_data,
        "page_number": page_number,
        "page_size": page_size,
        "total_records": len(filtered_metadata),
        "total_pages": (len(filtered_metadata) + page_size - 1) // page_size,
        "session_id": session_id
    })

@app.get("/cmp/filter")
def filter_session_metadata(
    session_id: str = Query(...),
    extensionNum: Optional[str] = Query(None),
    objectID: Optional[str] = Query(None),
    channelNum: Optional[str] = Query(None),
    AniAliDigits: Optional[str] = Query(None),
    Name: Optional[str] = Query(None),
    page_number: int = Query(1),
    page_size: int = Query(10)
):
    print("running Vpi filter")
    metadata_list = []
    applied_filters = {
        "extensionNum": extensionNum,
        "objectID": objectID,
        "channelNum": channelNum,
        "AniAliDigits": AniAliDigits,
        "Name": Name
    }
    
    
    if session_id in cache_session_filter:
        if cache_session_filter["filters"] == applied_filters:
            metadata_list = cache_session_filter[session_id]
        else:
            for value in session_cache.values():
                metadata_list = value
    else:
        if session_id not in session_cache:
            raise HTTPException(status_code=404, detail="Original session not found")
        
        metadata_list = session_cache[session_id]

        if not any([extensionNum, objectID, channelNum, AniAliDigits, Name]):
            return HTTPException(status_code=404, detail="No Filter applied")

    # Perform filtering
    def match(metadata):
        return (
            (not extensionNum or metadata.get("extensionNum") == extensionNum) and
            (not objectID or metadata.get("objectID") == objectID) and
            (not channelNum or metadata.get("channelNum") == channelNum) and
            (not AniAliDigits or AniAliDigits in str(metadata.get("aniAliDigits") or "")) and
            (not Name or Name in str(metadata.get("fullName") or "") or Name in str(metadata.get("name")))
        )

    filtered = [m for m in metadata_list if match(m)]

    # Generate new session ID for filtered results
    new_session_id = str(uuid4())
    cache_session_filter[new_session_id] = filtered
    

    cache_session_filter["filters"] = applied_filters

    total_records = len(filtered)
    total_pages = (total_records + page_size - 1) // page_size

    start = (page_number - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]
    print("completed Vpi filter")

    return {
        "data": paginated,
        "page_number": page_number,
        "page_size": page_size,
        "total_records": total_records,
        "total_pages": total_pages,
        "session_id": new_session_id
    }


    

@app.get("/vpi/recording")
async def get_recording(
    filename: str = Query(...),
    date: str = Query(..., description="Format: M/D/YYYY H:MM:SS AM/PM"),
    opco: str = Query(..., description="e.g., RGE NYSEG CMP")
):
    try:
        # Parse date like 5/10/2018 4:01:28 PM
        file_date = datetime.strptime(date, "%m/%d/%Y %I:%M:%S %p")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected M/D/YYYY H:MM:SS AM/PM.")

    prefix = f"{opco}/{file_date.year}/{file_date.month}/{file_date.day}/{filename}"
    blobs = list_vpi_blob(prefix)

    for blob in blobs:
        if blob.name.endswith(".wav"):
            print(f"Found WAV file: {blob.name}")
            wav_data = get_vpi_blob_client(blob.name).download_blob().readall()
            try:
                mp3_bytes = convert_wav_to_mp3(wav_data)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error converting WAV to MP3: {str(e)}")
            # Send entire file without streaming
            return Response(
                content=mp3_bytes,
                media_type="audio/mpeg",
                headers={"Content-Disposition": f'inline; filename="{filename.replace(".wav", ".mp3")}"'}
            )

    raise HTTPException(status_code=404, detail="Recording not found")


@app.get("/talkdesk/metadata")
async def get_talkdesk_metadata_page(
    start_date: str = Query(...),
    end_date: str = Query(...),
    continuation_token: str = Query(None),
    page_size: int = Query(50, ge=1),
    Interaction_ID: str = Query(None),
    Customer_Phone_Number: str = Query(None),
    Talkdesk_Phone_Number: str = Query(None),
    Call_Type: str = Query(None)
):
    
    print("running Started")
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    if end_dt < start_dt:
        raise HTTPException(status_code=400, detail="`end_date` must be after `start_date`")

    # Base tag query
    query_parts = [
        f"\"Start_Time\" >= '{start_date}'",
        f"\"Start_Time\" <= '{end_date}'"
    ]

    if Interaction_ID:
        query_parts.append(f"\"Interaction_ID\" = '{Interaction_ID}'")
    if Customer_Phone_Number:
        query_parts.append(f"\"Customer_Phone_Number\" = '{Customer_Phone_Number}'")
    if Talkdesk_Phone_Number:
        query_parts.append(f"\"Talkdesk_Phone_Number\" = '{Talkdesk_Phone_Number}'")
    if Call_Type:
        query_parts.append(f"\"Call_Type\" = '{Call_Type}'")

    query = " AND ".join(query_parts)

    # Get blob pages
    page_iterator = list_talkdesk_blobs_tags(query, page_size, continuation_token)

    metadata_list = []
    next_token = None
    print("Fetching blob metadata...")
    try:
        for page in page_iterator:
            for blob in page:
                blob_properties = get_talkdesk_blob_metadata(blob.name)
                if blob_properties.metadata:
                    metadata_list.append(blob_properties.metadata)
            next_token = page_iterator.continuation_token
            break  # Only one page
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch blob metadata: {str(e)}")

    return JSONResponse(content={
        "data": metadata_list,
        "continuation_token": next_token
    })


@app.get("/talkdesk/recording")
async def get_recording(interactionId: str = Query(...) ):
    blob_name = f"{interactionId}.mp3"
    blob_client = get_talkdesk_blob_client(blob_name)

    if not blob_client.exists():
        return {"error": "Audio file not found"}

   
    stream = blob_client.download_blob()
    content = stream.readall()

    return Response(
                    content,
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": f'inline; filename="{blob_name}"'}
                )

@app.get("/delete_session")
def delete_session():
    deleted = False
    if session_cache or cache_session_filter:
        session_cache.clear()
        cache_session_filter.clear()
        deleted = True

    return {"success": deleted}