import React from "react";
import { useState } from "react";   
import { useRef } from "react";
import { Howl } from "howler";

// function AudioGenesys() {
//     const audioSrc = "/audiowav1.wav";
//     console.log("AudioGenesys");
//     const [audio] = useState(new Audio(audioSrc));

//     const playAudio = () => {
//       audio.play().catch((error) => console.error("Playback error:", error));
//     };

//     const audioRef = useRef(new Audio("/samplewav.wav"));

//   const playAudio2 = () => {
//     audioRef.current.play()
//       .then(() => console.log("Playing audio..."))
//       .catch((error) => console.error("Playback error:", error));
//   };

//   const [sound, setSound] = useState(null);

//   const playAudio3 = () => {
//     if (!sound) {
//       const newSound = new Howl({
//         src: ["/samplewav.wav"], // Ensure the file is in "public/" folder
//         format: ["wav"],
//         html5: true, // Ensures audio works on mobile
//       });
//       setSound(newSound);
//       newSound.play();
//     } else {
//       sound.play();
//     }
//   };

//     return (
//         <div>
//             <h1>Genesys Audio</h1>          
//             <button onClick={playAudio}>Play Audio</button>
//             <audio controls>
//       <source src="/audiowav1.wav" type="audio/x-ms-wma" />
//       Your browser does not support the audio element.
//     </audio>
//      <button onClick={playAudio2}>Play Audio</button>;
//      <button onClick={playAudio3}>Play Audio</button>
//     </div>
    
//     );
// }
// export default AudioGenesys;




const AudioGenesys= () => {
  // Example list of .wmv files
  const audioFiles = [
    { name: "Recording 1", url: "/audiowav1.wav" },
    { name: "Recording 2", url: "/audiowav2.wav" },
    { name: "Recording 3", url: "/samplewav.wav" }
  ];

  const handlePlayAudio = (fileUrl) => {
    // Create a temporary link element to trigger download/open
    window.location.href = fileUrl; 
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">WMV Audio Files</h2>
      <ul className="list-disc pl-5">
        {audioFiles.map((file, index) => (
          <li
            key={index}
            onClick={() => handlePlayAudio(file.url)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AudioGenesys;
