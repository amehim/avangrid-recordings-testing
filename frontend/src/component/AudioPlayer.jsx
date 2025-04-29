import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioPlayer = ({ selectedTableRow }) => {
  if (!selectedTableRow || Object.keys(selectedTableRow).length === 0) {
    return (
      <div className="bg-white rounded-md shadow-md p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          <p className="text-gray-600 font-medium">Please select a row to view recordings</p>
        </div>
      </div>
    );
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  // const audioPath = selectedTableRow?.url;
  const audioPath = "/talkdeskaudio.mp3";

  useEffect(() => {
    if (!audioPath) return;

    // Reset state when audioPath changes
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);

    // Initialize WaveSurfer
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ADD8E6",
      progressColor: "#00008B",
      cursorColor: "transparent",
      height: 70,
      responsive: true,
      normalize: true,
      barRadius: 3,
    });

    wavesurferRef.current.load(audioPath);

    wavesurferRef.current.on("ready", () => {
      setDuration(wavesurferRef.current.getDuration());
      setCurrentTime(0);
      updateWaveformVisualization(false);
    });

    wavesurferRef.current.on("audioprocess", () => {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    });

    wavesurferRef.current.on("play", () => {
      setIsPlaying(true);
      updateWaveformVisualization(true);
    });

    wavesurferRef.current.on("pause", () => {
      setIsPlaying(false);
      updateWaveformVisualization(false);
    });

    wavesurferRef.current.on("seeking", () => {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioPath]);

  const updateWaveformVisualization = (playing) => {
    if (!wavesurferRef.current) return;

    if (playing) {
      wavesurferRef.current.setOptions({
        barWidth: 2,
        barHeight: 1,
        barGap: 3,
      });
    } else {
      wavesurferRef.current.setOptions({
        barWidth: 1,
        barHeight: 0.01,
        barGap: 0,
      });
    }
  };

  const togglePlay = () => {
    if (wavesurferRef.current) {
      isPlaying ? wavesurferRef.current.pause() : wavesurferRef.current.play();
    }
  };

  const skipTime = (seconds) => {
    if (wavesurferRef.current) {
      const newTime = Math.min(Math.max(0, currentTime + seconds), duration);
      setCurrentTime(newTime);
      setTimeout(() => {
        wavesurferRef.current.seekTo(newTime / duration);
      }, 0);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleDownload = async () => {
    if (!audioPath) return;
    
    try {
      setIsDownloading(true);
      
      // Fetch the audio file
      const response = await fetch(audioPath);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Get filename from the URL or use a default name
      const filename = audioPath.substring(audioPath.lastIndexOf('/') + 1) || 'audio-recording.mp3';
      
      // Set up and trigger download
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Handle error (could add error state and message)
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-md">
      <div className="bg-blue-600 py-2 px-4 text-white font-medium rounded-t-md">
        Audio Recording
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="h-[80px] bg-gray-50 rounded-md p-2 relative overflow-hidden">
          {isPlaying && <div className="absolute inset-0 bg-blue-50 opacity-20 animate-pulse"></div>}
          <div ref={waveformRef} className="h-full w-full mx-auto transition-all duration-100" />
        </div>

        <div className="flex justify-center">
          <span className="text-gray-600 text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex justify-center items-center gap-3 mt-1">
          <button 
            onClick={() => skipTime(-10)} 
            className="w-14 h-8 rounded-md text-white text-xs font-medium bg-gray-500 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-1 shadow-sm"
          >
            -10s
          </button>

          <button 
            onClick={togglePlay} 
            className={`w-16 h-8 rounded-md text-white text-xs font-medium transition-colors ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-1 shadow-sm`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button 
            onClick={() => skipTime(10)} 
            className="w-14 h-8 rounded-md text-white text-xs font-medium bg-gray-500 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-1 shadow-sm"
          >
            +10s
          </button>
        </div>

        <button 
          onClick={handleDownload} 
          disabled={isDownloading || !audioPath}
          className={`bg-blue-600 text-white text-xs font-medium py-2 px-4 mx-auto mt-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 shadow-sm flex items-center justify-center gap-1 ${isDownloading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isDownloading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;