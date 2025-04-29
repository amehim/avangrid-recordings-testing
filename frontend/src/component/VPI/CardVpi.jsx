import React, { useState } from 'react';

function Card({selectedTableRow}) {
  const [activeTab, setActiveTab] = useState('essential');
  
  // Check if selectedTableRow is empty or null
  const card = selectedTableRow;
  
  if (!selectedTableRow || Object.keys(selectedTableRow).length === 0) {
    return (
      <div className="component-b bg-gradient-to-br from-gray-50 to-blue-50 shadow-xl rounded-2xl w-full h-64 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 text-lg">Select a recording to view details</p>
          <p className="text-gray-400 text-sm mt-2">Click on a row to see more information</p>
        </div>
      </div>
    );
  }
  
  // Group the data into categories for better organization
  const essentialInfo = {
    "Type": card["Type"] || null,
    "FileName": card["FileName"] || null,
    "Result": card["Result"] || null,
    "startTime": card["startTime"] || null,
    "duration": card["duration"] ? `${card["duration"]} sec` : null,
    "direction": card["direction"] === "True" ? "Inbound" : card["direction"] === "False" ? "Outbound" : null,
    "channelName": card["channelName"] || null,
    "fullName": card["fullName"] || null
  };
  
  const technicalInfo = {
    "mediaFileID": card["mediaFileID"] || null,
    "objectID": card["objectID"] || null,
    "mediaManagerID": card["mediaManagerID"] || null,
    "extensionNum": card["extensionNum"] || null,
    "channelNum": card["channelNum"] || null,
    "audioChannels": card["audioChannels"] || null,
    "sensitivityLevel": card["sensitivityLevel"] || null,
    "hasTalkover": card["hasTalkover"] || null
  };
  
  const timeInfo = {
    "startTime": card["startTime"] || null,
    "gmtStartTime": card["gmtStartTime"] || null,
    "gmtOffset": card["gmtOffset"] || null,
    "dateAdded": card["dateAdded"] || null
  };
  
  // All other fields go here
  const otherInfo = {};
  Object.keys(card).forEach(key => {
    if (
      !Object.keys(essentialInfo).includes(key) && 
      !Object.keys(technicalInfo).includes(key) && 
      !Object.keys(timeInfo).includes(key)
    ) {
      otherInfo[key] = card[key];
    }
  });
  
  // Remove duplicate startTime from essentialInfo since it's also in timeInfo
  if (essentialInfo["startTime"]) {
    delete essentialInfo["startTime"];
  }
  
  // Function to render key-value pairs with formatting
  const renderData = (data) => {
    return Object.entries(data).map(([key, value], index) => {
      // Handle null, undefined, or empty string values
      const displayValue = value === null || value === undefined || value === "" 
        ? <span className="text-gray-400 italic">Not Available</span> 
        : value;
        
      return (
        <tr
          key={index}
          className="transition-colors duration-200 hover:bg-blue-50 group border-b border-gray-100 last:border-b-0"
        >
          <td className="font-semibold text-blue-700 p-2 w-2/5 bg-blue-50/30 group-hover:bg-blue-100 transition-colors text-xs">
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
          </td>
          <td className="text-gray-900 p-2 w-3/5 font-medium group-hover:text-blue-800 transition-colors text-xs">
            {displayValue}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="component-b bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-xl rounded-2xl overflow-hidden w-full h-64">
      {/* Compact header with filename */}
      <div className="bg-blue-600 text-white px-2 py-1 flex items-center text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span className="font-medium truncate">
          {card["FileName"] || "Audio Recording"}
        </span>
      </div>
      
      {/* Compact tab navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'essential' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('essential')}
        >
          Details
        </button>
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'technical' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('technical')}
        >
          Technical
        </button>
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'time' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('time')}
        >
          Time
        </button>
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'other' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('other')}
        >
          Other
        </button>
      </div>
      
      {/* Content area with scrolling - increased height due to smaller header/tabs */}
      <div className="h-48 overflow-y-auto p-2">
        <table className="styled-table w-full border-collapse">
          <tbody>
            {activeTab === 'essential' && renderData(essentialInfo)}
            {activeTab === 'technical' && renderData(technicalInfo)}
            {activeTab === 'time' && renderData(timeInfo)}
            {activeTab === 'other' && renderData(otherInfo)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Card;