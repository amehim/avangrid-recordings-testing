import React from 'react';

function Card({selectedTableRow}) {
  // Check if selectedTableRow is empty or null
  const card = selectedTableRow;
  
  if (!selectedTableRow || Object.keys(selectedTableRow).length === 0) {
    return (
      <div className="component-b bg-gradient-to-br from-gray-50 to-blue-50 shadow-xl rounded-2xl w-full h-[300px] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-lg">Select a recording to view details</p>
          <p className="text-gray-400 text-sm mt-2">Click on a row to see more information</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="component-b bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-xl rounded-2xl overflow-hidden w-full max-h-[300px]">
      {/* Removed the card-header div with "Recording Details" */}
      
      {/* Adjusted the max-height to use full available space */}
      <div className="max-h-[300px] overflow-y-auto px-2 py-2">
        <table className="styled-table text-xs w-full border-collapse">
          <tbody>
            {Object.entries(card).map(([key, value], index) => (
              <tr
                key={index}
                className="transition-colors duration-200 hover:bg-blue-50 hover:rounded-lg group"
              >
                <td className="font-bold text-blue-700 p-3 w-2/5 bg-blue-50/30 group-hover:bg-blue-100 transition-colors">
                  {key}
                </td>
                <td className="text-gray-900 p-3 w-3/5 font-medium group-hover:text-blue-800 transition-colors">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Card;