import React, { useState, useEffect } from "react";

const RecordingsList = () => {
  const [metadata, setMetadata] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch metadata on component mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch metadata from FastAPI backend
  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/fetch_metadata?interaction_id=12345&start_date=2025-03-10&end_date=2025-03-15"
      );
      const data = await response.json();
      setMetadata(data.metadata);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
    setLoading(false);
  };

  // Fetch recording URL when selected
  const fetchRecording = async (blobName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/fetch_recording?blob_name=${blobName}`
      );
      const data = await response.json();
      setSelectedRecording(data.url);
    } catch (error) {
      console.error("Error fetching recording:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>📂 Audio Recordings</h2>

      {loading && <p>Loading...</p>}

      {metadata.length === 0 && !loading && <p>No recordings found.</p>}

      <ul>
        {metadata.map((item, index) => (
          <li key={index} onClick={() => fetchRecording(item.blob_name)}>
            {item.blob_name} - {item.start_time}
          </li>
        ))}
      </ul>

      {selectedRecording && (
        <div>
          <h3>🎵 Now Playing:</h3>
          <audio controls>
            <source src={selectedRecording} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default RecordingsList;
