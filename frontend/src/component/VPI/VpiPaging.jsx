import React, { useState, useEffect } from "react";
import { useVPI } from "../../context/VPIContext";

function VPIPaging() {
  const { 
    currentPage, 
    setCurrentPage, 
    paginationTrigger, 
    setPaginationTrigger,
    filterPaginationTrigger,
    setFilterPaginationTrigger 
  } = useVPI();
  
  const [tableState, setTableState] = useState({
    hasNextPage: false,
    hasPrevPage: false,
    isLoading: false,
    totalPages: 1,
    currentPage: 1,
    totalRecords: 0,
    hasFilters: false,
    filterSessionId: null
  });

  // Function to refresh table state from the window object
  const refreshTableState = () => {
    if (window.vpiTable) {
      setTableState({
        hasNextPage: window.vpiTable.getHasNextPage(),
        hasPrevPage: window.vpiTable.getHasPrevPage(),
        isLoading: window.vpiTable.getIsLoading(),
        totalPages: window.vpiTable.getTotalPages(),
        currentPage: window.vpiTable.getCurrentPage(),
        totalRecords: window.vpiTable.getTotalRecords(),
        hasFilters: window.vpiTable.getHasFilters(),
        filterSessionId: window.vpiTable.getFilterSessionId?.() || null
      });
    }
  };
  
  // Set up interval to refresh table state
  useEffect(() => {
    refreshTableState();
    
    // Poll for state changes every 250ms
    const intervalId = setInterval(refreshTableState, 250);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle page navigation
  const handleNavigatePage = (targetPage) => {
    if (tableState.isLoading) return;
    
    // Validate target page
    if (targetPage < 1 || targetPage > tableState.totalPages) return;
    
    // Update current page
    setCurrentPage(targetPage);
    
    // If the table has filters applied, use the filter pagination mechanism
    if (tableState.hasFilters) {
      setFilterPaginationTrigger({
        action: 'goto',
        page: targetPage
      });
    } else {
      // Otherwise use the standard pagination mechanism
      setPaginationTrigger({ 
        action: 'goto',
        page: targetPage
      });
    }
  };
  
  // Handle next page click
  const handleNextPage = () => {
    if (!tableState.hasNextPage || tableState.isLoading) return;
    handleNavigatePage(tableState.currentPage + 1);
  };
  
  // Handle previous page click
  const handlePrevPage = () => {
    if (!tableState.hasPrevPage || tableState.isLoading) return;
    handleNavigatePage(tableState.currentPage - 1);
  };
  
  // Handle first page click
  const handleFirstPage = () => {
    if (tableState.currentPage === 1 || tableState.isLoading) return;
    handleNavigatePage(1);
  };
  
  // Handle last page click
  const handleLastPage = () => {
    if (tableState.currentPage === tableState.totalPages || tableState.isLoading) return;
    handleNavigatePage(tableState.totalPages);
  };
  
  // Handle reset
  const handleResetToFirstPage = () => {
    if (tableState.isLoading) return;
    
    // If filters are applied, we need to clear them
    if (tableState.hasFilters) {
      setFilterPaginationTrigger({ action: 'clearFilters' });
    } else {
      // Otherwise just reset to the first page
      setPaginationTrigger({ action: 'reset' });
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const { currentPage, totalPages } = tableState;
    const delta = 1; // How many pages to show before and after current page
    
    let pages = [];
    const range = 2 * delta + 1; // Total number of page buttons to show
    
    if (totalPages <= range) {
      // Show all pages if total is less than our range
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Calculate start and end of page range
      let start = Math.max(1, currentPage - delta);
      let end = Math.min(totalPages, currentPage + delta);
      
      // Adjust if we're at the edges
      if (currentPage <= delta) {
        end = range;
      } else if (currentPage >= totalPages - delta) {
        start = totalPages - range + 1;
      }
      
      pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      
      // Add ellipsis and endpoints
      if (start > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      
      if (end < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  // Calculate the range of records being displayed
  const startRecord = tableState.totalRecords === 0 ? 0 : ((tableState.currentPage - 1) * 5) + 1;
  const endRecord = Math.min(tableState.currentPage * 5, tableState.totalRecords);
  
  // Only render the component if we have pages to show
  if (tableState.totalPages === 0) return null;
  
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-center py-2 px-4 bg-white border-t border-gray-200 gap-2">
      {/* Records info */}
      <div className="text-sm text-gray-500 order-2 sm:order-1 text-center sm:text-left">
        {tableState.totalRecords > 0 ? (
          <span>
            Showing records {startRecord} 
            {" - "} 
            {endRecord} 
            {" of "} 
            {tableState.totalRecords} records
          </span>
        ) : (
          <span>No records found</span>
        )}
        {tableState.currentPage === tableState.totalPages && tableState.totalPages > 0 && (
          <span className="ml-2 text-blue-600">End of results</span>
        )}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        {/* First Page Button */}
        <button
          onClick={handleFirstPage}
          disabled={tableState.currentPage === 1 || tableState.isLoading}
          className={`px-2 py-1 text-sm rounded-md border ${
            tableState.currentPage !== 1 && !tableState.isLoading
              ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="First Page"
        >
          &laquo;
        </button>
        
        {/* Previous Page Button */}
        <button
          onClick={handlePrevPage}
          disabled={!tableState.hasPrevPage || tableState.isLoading}
          className={`px-2 py-1 text-sm rounded-md border ${
            tableState.hasPrevPage && !tableState.isLoading
              ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Previous Page"
        >
          &lsaquo;
        </button>
        
        {/* Page Numbers */}
        <div className="hidden sm:flex space-x-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => handleNavigatePage(page)}
                disabled={tableState.isLoading || page === tableState.currentPage}
                className={`px-3 py-1 text-sm rounded-md border ${
                  page === tableState.currentPage
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        {/* Current Page Indicator for Mobile */}
        <span className="sm:hidden px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
          {tableState.currentPage}
        </span>
        
        {/* Next Page Button */}
        <button
          onClick={handleNextPage}
          disabled={!tableState.hasNextPage || tableState.isLoading}
          className={`px-2 py-1 text-sm rounded-md border ${
            tableState.hasNextPage && !tableState.isLoading
              ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Next Page"
        >
          &rsaquo;
        </button>
        
        {/* Reset Button - Show only if filters are applied or not on first page */}
        {(tableState.hasFilters || tableState.currentPage > 1) && (
          <button
            onClick={handleResetToFirstPage}
            className="ml-2 px-3 py-1 text-sm rounded-md border bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
            disabled={tableState.isLoading}
          >
            {tableState.hasFilters ? "Clear Filters" : "Reset"}
          </button>
        )}
      </div>
    </div>
  );
}

export default VPIPaging;