import React, { useState } from 'react';

function Card({selectedTableRow}) {
  const [activeTab, setActiveTab] = useState('basic');
  
  // Check if selectedTableRow is empty or null
  const card = selectedTableRow;
  
  if (!selectedTableRow || Object.keys(selectedTableRow).length === 0) {
    return (
      <div className="component-b bg-gradient-to-br from-gray-50 to-blue-50 shadow-xl rounded-2xl w-full h-64 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="text-gray-600 text-lg">Select a call to view details</p>
          <p className="text-gray-400 text-sm mt-2">Click on a row to see more information</p>
        </div>
      </div>
    );
  }
  
  // Group the data into categories for better organization
  const basicInfo = {
    "Interaction_ID": card["Interaction_ID"] || null,
    "Call_Type": card["Call_Type"] || null,
    "Start_Time": card["Start_Time"] || null,
    "End_Time": card["End_Time"] || null,
    "Talk_Time": card["Talk_Time"] || null,
    "Record": card["Record"] || null
  };
  
  const contactInfo = {
    "Talkdesk_Phone_Number": card["Talkdesk_Phone_Number"] || null,
    "Customer_Phone_Number": card["Customer_Phone_Number"] || null,
    "Phone_Display_Name": card["Phone_Display_Name"] || null,
    "Agent_Name": card["Agent_Name"] || null,
    "Handling_Agent": card["Handling_Agent"] || null,
    "Team": card["Team"] || null
  };
  
  const statusInfo = {
    "Hangup": card["Hangup"] || null,
    "In_Business_Hours": card["In_Business_Hours"] || null,
    "Callback_From_Queue": card["Callback_From_Queue"] || null,
    "Waiting_Time": card["Waiting_Time"] || null,
    "Agent_Speed_to_Answer": card["Agent_Speed_to_Answer"] || null,
    "Holding_Time": card["Holding_Time"] || null,
    "Transfer": card["Transfer"] || null,
    "Agent_Disconnected": card["Agent_Disconnected"] || null,
    "calls_historical_base_data_status": card["calls_historical_base_data_status"] || null
  };
  
  // All other fields go here
  const otherInfo = {};
  Object.keys(card).forEach(key => {
    if (
      !Object.keys(basicInfo).includes(key) && 
      !Object.keys(contactInfo).includes(key) && 
      !Object.keys(statusInfo).includes(key)
    ) {
      otherInfo[key] = card[key];
    }
  });
  
  // Function to render key-value pairs with formatting
  const renderData = (data) => {
    return Object.entries(data).map(([key, value], index) => {
      // Handle null, undefined, or empty string values
      const displayValue = value === null || value === undefined || value === "" 
        ? <span className="text-gray-400 italic">N/A</span> 
        : key === "Record" 
          ? <a href={value} className="text-blue-600 underline truncate block" target="_blank" rel="noopener noreferrer">Recording Link</a> 
          : value;
        
      return (
        <tr
          key={index}
          className="transition-colors duration-200 hover:bg-blue-50 group border-b border-gray-100 last:border-b-0"
        >
          <td className="font-semibold text-blue-700 p-2 w-2/5 bg-blue-50/30 group-hover:bg-blue-100 transition-colors text-xs">
            {key.replace(/_/g, ' ')}
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
      {/* Compact header with call type and ID */}
      <div className="bg-blue-600 text-white px-2 py-1 flex items-center text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span className="font-medium truncate">
          {(card["Call_Type"] || "Call") + ": " + (card["Interaction_ID"] || "")}
        </span>
      </div>
      
      {/* Compact tab navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic
        </button>
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'contact' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact
        </button>
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'status' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
        <button 
          className={`px-2 py-1 text-xs font-medium ${activeTab === 'other' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          onClick={() => setActiveTab('other')}
        >
          Other
        </button>
      </div>
      
      {/* Content area with scrolling */}
      <div className="h-48 overflow-y-auto p-2">
        <table className="styled-table w-full border-collapse">
          <tbody>
            {activeTab === 'basic' && renderData(basicInfo)}
            {activeTab === 'contact' && renderData(contactInfo)}
            {activeTab === 'status' && renderData(statusInfo)}
            {activeTab === 'other' && renderData(otherInfo)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Card;