import React, { useState, useEffect, useRef } from "react";
import AudioPlayer from './AudioPlayerVPI';
import Card from './CardVpi';
import VpiPaging from './VpiPaging';
import VpiFilterDisplay from "./VpiFilterDisplay.jsx";
import { useVarState } from "../../context/Context.jsx";
import VpiTable from "./VpiTable";
import VpiDateTimeInput from "./VpiCalender";
import SearchBar from "./VpiSearch";
import { useVPI } from "../../context/VPIContext.jsx";
  

function Vpi() {
  const {selectedRow, setSelectedRow} = useVarState();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('card');
  const {metadata, setMetadata} = useVPI();
  const searchPanelRef = useRef(null);
  const filterButtonRef = useRef(null);
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  // Close search panel when clicking outside, but not when clicking on the dashboard
  useEffect(() => {
    if (!isSearchOpen) return;
    
    const handleClickOutside = (e) => {
      // Don't close if clicking within search panel or filter button
      if (
        searchPanelRef.current?.contains(e.target) ||
        filterButtonRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsSearchOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);
  
  // Check if metadata has values to show the filter button
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  return (
    <div className="relative h-full bg-gray-50 overflow-hidden">
      {/* Main content area */}
      <div className={`transition-all duration-300 ease-in-out ${isSearchOpen ? 'pr-[280px]' : ''}`}>
        <div className="p-3 space-y-3">
          {/* Header with filter toggle button */}
          <div className="flex justify-between items-center bg-blue-600 rounded-md shadow-md p-3">
            <h2 className="text-lg font-bold text-white tracking-wide">VPI Dashboard</h2>
          </div>
          
          {/* Calendar Component with Filter Button */}
          <div className="bg-white rounded-md shadow-sm p-2">
            <div className="flex items-center justify-between">
              <div className="flex-grow mr-4">
                <VpiDateTimeInput />
              </div>
              {hasMetadata && (
                <button
                  ref={filterButtonRef}
                  onClick={toggleSearch}
                  className="filter-button flex items-center justify-center px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filters
                </button>
              )}
            </div>
          </div>
          
          {/* Filter Display Component */}
          <VpiFilterDisplay />
          
          {/* Table Component */}
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            <VpiTable />
            <VpiPaging />
          </div>
          
          {/* Tab Navigation for Card and Audio */}
          <div className="flex bg-white rounded-t-md shadow-sm">
            <button
              onClick={() => setActiveTab('card')}
              className={`py-2 px-5 font-medium text-sm focus:outline-none transition-colors ${
                activeTab === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              Recording Details
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`py-2 px-5 font-medium text-sm focus:outline-none transition-colors ${
                activeTab === 'audio' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              Audio Player
            </button>
          </div>
          
          {/* Conditionally render Card or Audio Component */}
          <div className="shadow-md">
            {activeTab === 'card' ? (
              <Card selectedTableRow={selectedRow}/>
            ) : (
              <AudioPlayer selectedTableRow={selectedRow} />
            )}
          </div>
        </div>
      </div>
      
      {/* Search panel - Right sidebar contained within component */}
      <div
        ref={searchPanelRef}
        className={`search-panel absolute top-0 right-0 h-full w-[280px] transform transition-transform duration-300 ease-in-out ${
          isSearchOpen ? 'translate-x-0' : 'translate-x-full'
        } z-10 shadow-lg`}
      >
        {/* Handle to pull/drag */}
        <div 
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-l-md shadow-md cursor-pointer hidden lg:flex items-center justify-center" 
          onClick={toggleSearch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isSearchOpen ? (
              <path d="M15 18l-6-6 6-6" />
            ) : (
              <path d="M9 18l6-6-6-6" />
            )}
          </svg>
        </div>
        
        {/* Search content */}
        <div className="h-full">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}

export default Vpi;