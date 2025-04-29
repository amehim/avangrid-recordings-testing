import React from 'react'
import { Info } from 'lucide-react';
import RecordingsList from './RecordingList';

function Nice() {
  return (
    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-center">
      <Info className="mx-auto mb-4 w-12 h-12 text-blue-500" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        No Recordings Found
      </h2>
      <p className="text-gray-600">
        There are currently no recordings available for NICE.
      </p>
    </div>
    {/* <RecordingsList /> */}
  </div>
  // <>nice</>
);
  
}

export default Nice