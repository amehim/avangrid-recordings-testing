import React, { useState, useEffect } from "react";
import Talkdesktable from './Talkdesktable';
import AudioPlayer from './AudioPlayerTD';
import SearchBar from './Search';
import Card from '../Card';
import TalkdeskPaging from './TalkdeskPaging';
import TalkdeskFilterDisplay from './TalkdeskFilterDisplay';
import DateTimeInput from "./Calender.jsx";
import { useVarState } from "../../context/Context.jsx";  

function Talkdesk() {
  const {selectedRow, setSelectedRow} = useVarState();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('card');
  
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  // Close search panel when clicking outside
  useEffect(() => {
    if (!isSearchOpen) return;
    
    const handleClickOutside = (e) => {
      if (e.target.closest('.search-panel') || e.target.closest('.filter-button')) return;
      setIsSearchOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);
  
  return (
    <div className="relative h-full bg-gray-50 overflow-hidden">
      {/* Main content area */}
      <div className={`transition-all duration-300 ease-in-out ${isSearchOpen ? 'pr-[280px]' : ''}`}>
        <div className="p-3 space-y-3">
          {/* Header with filter toggle button */}
          <div className="flex justify-between items-center bg-blue-600 rounded-md shadow-md p-3">
            <h2 className="text-lg font-bold text-white tracking-wide">Talkdesk Dashboard</h2>
          </div>
          
          {/* Calendar Component with Filter Button */}
          <div className="bg-white rounded-md shadow-sm p-2">
            <div className="flex items-center justify-between">
              <div className="flex-grow mr-4">
                <DateTimeInput />
              </div>
              <button
                onClick={toggleSearch}
                className="filter-button flex items-center justify-center px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filters
              </button>
            </div>
          </div>
          
          {/* Filter Display Component */}
          <TalkdeskFilterDisplay />
          
          {/* Table Component */}
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            <Talkdesktable />
            <TalkdeskPaging />
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

export default Talkdesk;