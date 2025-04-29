import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import api from "../../utils/api";
import { useVPI } from "../../context/VPIContext";

const AudioPlayer = ({ selectedTableRow }) => {
  // Get VPI context first - this is a hook that must be called unconditionally
  const { selectedCompany } = useVPI();
  
  // All state declarations - must come before any conditional returns
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [retryCounter, setRetryCounter] = useState(0); // Used to trigger re-renders on retry
  
  // All refs - must come before any conditional returns
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const audioRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  
  // Get data from the selected row
  const filename = selectedTableRow?.FileName;
  const result = selectedTableRow?.Result;
  const date = selectedTableRow?.startTime;

  // Clean up function for audio and wavesurfer
  const cleanupAudioResources = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.removeAttribute('src');
    }
    
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    
    setAudioBlob(null);
  };

  // Handle retry action
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCounter(prev => prev + 1); // Increment counter to trigger re-fetch
  };

  // Load audio data when filename changes or retry is triggered
  useEffect(() => {
    // Reset states
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setError(null);
    setAudioBlob(null);
    
    // Clean up previous instances
    cleanupAudioResources();
    
    if (!filename) {
      setError("No Audio file Found");
      setIsLoading(false);
      return;
    }

    // Check if result is not SUCCESS
    if (result !== "SUCCESS") {
      setError("No audio file available for this Call Record");
      setIsLoading(false);
      return;
    }
    
    if (!date) {
      setError("Date information missing");
      setIsLoading(false);
      return;
    }
    
    if (!selectedCompany) {
      setError("Company information missing");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("Loading audio for file:", filename);

    // Fetch the audio file using axios with the new endpoint
    const fetchAudio = async () => {
      try {
        const response = await api.get(`/vpi/recording`, {
          params: {
            filename: filename,
            date: date,
            opco: selectedCompany
          },
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'audio/mpeg' });
        setAudioBlob(blob);
        
        // Create a URL for the blob
        const audioUrl = URL.createObjectURL(blob);
        
        // Create and setup the audio element
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        // Setup audio event listeners
        audio.addEventListener('loadedmetadata', () => {
          console.log("Audio metadata loaded, duration:", audio.duration);
          setDuration(audio.duration);
        });
        
        audio.addEventListener('canplay', () => {
          console.log("Audio can play");
          setIsLoading(false);
          
          // Only initialize WaveSurfer after a short delay to ensure the DOM is ready
          setTimeout(() => {
            initializeWaveSurfer(audioUrl);
          }, 100);
        });
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        
        audio.addEventListener('error', (e) => {
          console.error("Audio element error:", e);
          setError("Error loading audio file. The recording might be unavailable.");
          setIsLoading(false);
        });
        
        // Start loading the audio
        audio.load();
        
      } catch (error) {
        console.error('Failed to load audio:', error);
        setError("Failed to load the recording. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchAudio();
    
    // Set up timeout for loading
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        setError("Timeout loading the audio file. Please try again.");
        setIsLoading(false);
      }
    }, 15000); // 15-second timeout
    
    // Clean up function
    return () => {
      clearTimeout(loadTimeout);
      cleanupAudioResources();
    };
  }, [filename, date, selectedCompany, result, retryCounter]); // Added new dependencies
  
  // Function to update waveform visualization based on playback state
  const updateWaveformVisualization = (playing) => {
    if (!wavesurferRef.current) return;
    
    try {
      if (playing) {
        wavesurferRef.current.setOptions({
          waveColor: '#2196F3',      // More vibrant blue when playing
          progressColor: '#0D47A1',  // Darker blue for progress
          barWidth: 2,               // Thicker bars when playing
          barHeight: 1,              // Taller bars (full height)
          barGap: 3,                 // More defined spacing between bars
        });
      } else {
        wavesurferRef.current.setOptions({
          waveColor: '#ADD8E6',      // Lighter blue when paused
          progressColor: '#0066cc',  // Standard blue for progress
          barWidth: 1,               // Thinner bars when paused
          barHeight: 0.5,            // Half height when paused
          barGap: 1,                 // Minimal gap when paused
        });
      }
    } catch (error) {
      console.warn("Failed to update waveform visualization:", error);
    }
  };
  
  // Function to initialize WaveSurfer after audio is ready
  const initializeWaveSurfer = (audioUrl) => {
    // Double check that waveformRef.current exists
    if (!waveformRef.current) {
      console.error("Waveform container not found");
      fallbackToBasicPlayer();
      return;
    }
    
    if (!audioRef.current) {
      console.error("Audio element not found");
      fallbackToBasicPlayer();
      return;
    }
    
    try {
      console.log("Initializing WaveSurfer...");
      
      // Create WaveSurfer instance with enhanced visualization settings
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ADD8E6",
        progressColor: "#0066cc",
        cursorColor: "transparent",
        height: 70,
        responsive: true,
        normalize: true,
        barWidth: 1,
        barGap: 1,
        barRadius: 3,
        backend: 'MediaElement',
        media: audioRef.current,
        barHeight: 0.5, // Start with a flatter visualization (0.5 = 50% of the normal height)
      });
      
      wavesurferRef.current = wavesurfer;
      
      // Set up WaveSurfer event handlers
      wavesurfer.on("ready", () => {
        console.log("WaveSurfer ready");
        
        // Set initial wave appearance to flat
        updateWaveformVisualization(false);
      });
      
      wavesurfer.on("error", (err) => {
        console.error("WaveSurfer error:", err);
        fallbackToBasicPlayer();
      });
      
      wavesurfer.on("audioprocess", () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });
      
      wavesurfer.on("play", () => {
        setIsPlaying(true);
        updateWaveformVisualization(true);
      });
      
      wavesurfer.on("pause", () => {
        setIsPlaying(false);
        updateWaveformVisualization(false);
      });
      
      wavesurfer.on("seeking", () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });
    } catch (e) {
      console.error("WaveSurfer initialization error:", e);
      fallbackToBasicPlayer();
    }
  };

  // Fallback to basic audio player if WaveSurfer fails
  const fallbackToBasicPlayer = () => {
    console.log("Falling back to basic audio player");
    
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    
    // Set up interval to update current time
    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        
        // Check if audio has ended
        if (audioRef.current.ended) {
          setIsPlaying(false);
        }
      }
    }, 500);
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      updateWaveformVisualization(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          updateWaveformVisualization(true);
        })
        .catch(error => {
          console.error("Play error:", error);
          setError("Could not play audio. Please try again.");
        });
    }
    
    // Also toggle WaveSurfer if available
    if (wavesurferRef.current) {
      try {
        isPlaying ? wavesurferRef.current.pause() : wavesurferRef.current.play();
      } catch (e) {
        console.warn("WaveSurfer play/pause error:", e);
      }
    }
  };

  // Handle time skipping
  const skipTime = (seconds) => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(Math.max(0, currentTime + seconds), duration || 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    // Also update WaveSurfer if available
    if (wavesurferRef.current && duration > 0) {
      try {
        wavesurferRef.current.seekTo(newTime / duration);
      } catch (e) {
        console.warn("WaveSurfer seek error:", e);
      }
    }
  };

  // Format time display (mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Handle audio download - use existing blob if available
  const handleDownload = async () => {
    if (!filename || !date || !selectedCompany) return;
    
    try {
      setIsDownloading(true);
      
      // Use the existing blob if we have it
      let blob = audioBlob;
      
      // If we don't have the blob yet, fetch it
      if (!blob) {
        const response = await api.get(`/vpi/recording`, {
          params: {
            filename: filename,
            date: date,
            opco: selectedCompany
          },
          responseType: 'blob',
        });
        blob = new Blob([response.data], { type: 'audio/mpeg' });
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Use filename for the download
      const downloadFilename = `${filename.replace('.wav', '.mp3')}`;
      
      // Set up and trigger download
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setError("Failed to download the recording. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Render different UI states
  // Note: We're moving all rendering logic below ALL hooks and function declarations
  
  // Render content based on conditions
  let content;
  
  // Empty state - no row selected
  if (!selectedTableRow || Object.keys(selectedTableRow).length === 0) {
    content = (
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
        <p className="text-gray-600 font-medium">Please select a row to view recordings</p>
      </div>
    );
  }
  // Loading state
  else if (isLoading) {
    content = (
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium">Loading recording for: {filename}...</p>
      </div>
    );
  }
  // Error state
  else if (error) {
    content = (
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-gray-600 font-medium">{error}</p>
        {error !== "No audio file available for this interaction" && (
          <button 
            onClick={handleRetry}
            className="mt-3 bg-blue-600 text-white text-xs font-medium py-1 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 shadow-sm"
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  // Main player UI
  else {
    content = (
      <>
        {/* Waveform visualization with enhanced styling */}
        <div className="h-20 bg-gray-50 rounded-md p-2 relative overflow-hidden">
          {isPlaying && <div className="absolute inset-0 bg-blue-50 opacity-20 animate-pulse"></div>}
          <div ref={waveformRef} className="h-full w-full mx-auto transition-all duration-300" />
        </div>

        {/* Time display */}
        <div className="flex justify-center">
          <span className="text-gray-600 text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Playback controls */}
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

        {/* Download button */}
        <button 
          onClick={handleDownload} 
          disabled={isDownloading}
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
      </>
    );
  }

  // Final return - only ONE return statement for the entire component
  return (
    <div className="bg-white rounded-md shadow-md p-4 h-full flex items-center justify-center">
      {!selectedTableRow || Object.keys(selectedTableRow).length === 0 || isLoading || error ? (
        <div className="text-center">
          {content}
        </div>
      ) : (
        <div className="flex flex-col h-full w-full">
          <div className="bg-blue-600 py-2 px-4 text-white font-medium rounded-t-md">
            Audio Recording - {filename}
          </div>
          
          <div className="flex-1 p-4 flex flex-col gap-3">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;