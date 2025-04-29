import React from "react";
import { useTalkDesk } from "../../context/TalkdeskContext";

function TalkdeskPaging() {
  const { currentPage, setCurrentPage } = useTalkDesk();
  const { setPaginationTrigger } = useTalkDesk();
  
  // Access the table methods through the window object
  const getTableState = () => {
    if (window.talkdeskTable) {
      return {
        hasNextPage: window.talkdeskTable.getHasNextPage(),
        isLoading: window.talkdeskTable.getIsLoading()
      };
    }
    return { hasNextPage: false, isLoading: false };
  };
  
  const { hasNextPage, isLoading } = getTableState();
  
  // Handle next page click
  const handleNextPage = () => {
    const { hasNextPage, isLoading } = getTableState();
    if (hasNextPage && !isLoading) {
      setCurrentPage(prevPage => prevPage + 1);
      setPaginationTrigger({ action: 'next' });
    }
  };

  // Handle reset to first page
  const handleResetToFirstPage = () => {
    setCurrentPage(1);
    setPaginationTrigger({ action: 'reset' });
  };

  return (
    <div className="flex justify-between items-center py-2 px-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-500">
        <span>Page {currentPage}</span>
        {!hasNextPage && currentPage > 1 && (
          <span className="ml-2 text-blue-600">End of results</span>
        )}
      </div>
      
      <div className="flex space-x-2">
        {currentPage > 1 && !hasNextPage && (
          <button
            onClick={handleResetToFirstPage}
            className="px-3 py-1 text-sm rounded-md border bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
          >
            Back to First Page
          </button>
        )}
        
        <button
          onClick={handleNextPage}
          disabled={!hasNextPage || isLoading}
          className={`px-3 py-1 text-sm rounded-md border ${
            hasNextPage && !isLoading
              ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Loading..." : hasNextPage ? "Next" : "End of Results"}
        </button>
      </div>
    </div>
  );
}

export default TalkdeskPaging;