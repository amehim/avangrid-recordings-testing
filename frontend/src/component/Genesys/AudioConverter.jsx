import React, { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const AudioConverter = () => {
  const [wavFile, setWavFile] = useState(null);
  const [mp3Url, setMp3Url] = useState(null);
  const ffmpeg = createFFmpeg({ log: true });

  // Load FFmpeg
  const loadFFmpeg = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
  };

  // Handle File Upload
  const handleFileChange = (event) => {
    setWavFile(event.target.files[0]);
  };

  // Convert WAV to MP3
  const convertToMp3 = async () => {
    if (!wavFile) return;

    await loadFFmpeg(); // Load FFmpeg if not already loaded

    ffmpeg.FS("writeFile", "input.wav", await fetchFile(wavFile)); // Write file to FS
    await ffmpeg.run("-i", "input.wav", "-b:a", "192k", "output.mp3"); // Convert to MP3
    const mp3Data = ffmpeg.FS("readFile", "output.mp3"); // Read output file

    // Create a URL for the converted MP3
    const mp3Blob = new Blob([mp3Data.buffer], { type: "audio/mp3" });
    const mp3Url = URL.createObjectURL(mp3Blob);
    setMp3Url(mp3Url);
  };

  return (
    <div>
      <h2>WAV to MP3 Converter</h2>
      <input type="file" accept=".wav" onChange={handleFileChange} />
      <button onClick={convertToMp3} disabled={!wavFile}>
        Convert to MP3
      </button>

      {mp3Url && (
        <div>
          <h3>Converted MP3:</h3>
          <audio controls>
            <source src={mp3Url} type="audio/mp3" />
          </audio>
          <a href={mp3Url} download="converted.mp3">
            Download MP3
          </a>
        </div>
      )}
    </div>
  );
};

export default AudioConverter;
