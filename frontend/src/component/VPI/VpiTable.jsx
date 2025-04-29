import React, { useEffect, useState, useRef } from "react";
import { useVPI } from "../../context/VPIContext";
import { useVarState } from "../../context/Context";
import api from "../../utils/api";
import { Search } from "lucide-react";
import { FileX } from "lucide-react";

const Vpitable = () => {
  const { setSelectedRow } = useVarState();
  const { inputValues ,setInputValues} = useVPI();
  const { dateTimeRange } = useVPI();
  const { metadata, setMetadata } = useVPI();
  const { currentPage, setCurrentPage } = useVPI();
  const { paginationTrigger, setPaginationTrigger } = useVPI();
  const { filterPaginationTrigger, setFilterPaginationTrigger } = useVPI();
  const { selectedCompany } = useVPI();

  const [columns, setColumns] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialState, setInitialState] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasFilters, setHasFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  // Use refs to expose state to other components
  const hasNextPageRef = useRef(false);
  const hasPrevPageRef = useRef(false);
  const isLoadingRef = useRef(false);
  const totalPagesRef = useRef(0);
  const currentPageRef = useRef(1);
  const totalRecordsRef = useRef(0);
  const hasFiltersRef = useRef(false);
  const filterSessionIdRef = useRef(null);

  const pageSize = 6; // Set manually during development

  const displayedColumns = [
    "FileName",
    "objectID",
    "startTime",
    "channelName",
    "direction",
    "duration",
    "extensionNum",
    "gmtStartTime",
    "name",
    "agentID",
    "mediaManagerID",
    "mediaFileID"
  ];

  const columnMap = Object.fromEntries(displayedColumns.map((col) => [col, col]));

  // Check if there are any active filters
  const checkForActiveFilters = () => {
    return !!(
      inputValues?.ExtensionNumber?.[0] || 
      inputValues?.ObjectId?.[0] || 
      inputValues?.ChannelNumber?.[0] || 
      inputValues?.AniAliDigits?.[0] || 
      inputValues?.Name?.[0]
    );
  };

  // Initial fetch using /vpi/metadata
  const fetchInitialData = async () => {
    try {
      setError("");
      setLoading(true);
      isLoadingRef.current = true;
      setInitialState(false);
      setSelectedRowIndex(null);
      setSelectedRow(null);
      
      // Reset session and page when doing a new search
      setSessionId(null);
      filterSessionIdRef.current = null;
      setCurrentPage(1);
      currentPageRef.current = 1;
      setActiveFilters(null);
      setInputValues({}); // Clear input values in context
      
      const params = {
        from_date: dateTimeRange.from,
        to_date: dateTimeRange.to,
        opco: selectedCompany,
        page_number: 1, // Always start at page 1 for initial data
        page_size: pageSize,
      };

      const response = await api.get("/vpi/metadata", { params });
      const { 
        data: resultData, 
        session_id: newSessionId, 
        total_pages, 
        total_records 
      } = response.data;

      setSessionId(newSessionId);
      setMetadata(resultData || []);
      setTotalPages(total_pages);
      totalPagesRef.current = total_pages;
      setTotalRecords(total_records);
      totalRecordsRef.current = total_records;
      
      if (resultData && resultData.length > 0) {
        setColumns(Object.keys(resultData[0]));
        hasNextPageRef.current = 1 < total_pages;
        hasPrevPageRef.current = false; // Initial page has no previous
      } else {
        setMetadata([]);
        hasNextPageRef.current = false;
        hasPrevPageRef.current = false;
      }
      
      setLoading(false);
      isLoadingRef.current = false;
    } catch (err) {
      setLoading(false);
      isLoadingRef.current = false;
      hasNextPageRef.current = false;
      hasPrevPageRef.current = false;
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail);
      } else {
        console.error("Error fetching metadata:", err);
        setError("Something went wrong fetching data.");
      }
    }
  };

  // Continue fetching with session using /vpi/metadata or /cmp/filter for subsequent pages
  const fetchPageData = async (pageNum) => {
    try {
      if (!sessionId) {
        return fetchInitialData();
      }

      setError("");
      setLoading(true);
      isLoadingRef.current = true;
      setSelectedRowIndex(null);
      setSelectedRow(null);
      
      // Determine if we should use filtered pagination
      if (hasFilters && activeFilters) {
        // Use filter endpoint with active filters
        const params = {
          session_id: sessionId,
          page_number: pageNum,
          page_size: pageSize,
          ...activeFilters
        };

        const response = await api.get("/cmp/filter", { params });
        const { 
          data: resultData, 
          session_id: newSessionId, 
          total_pages, 
          total_records 
        } = response.data;

        setSessionId(newSessionId);
        filterSessionIdRef.current = newSessionId;
        setMetadata(resultData || []);
        setTotalPages(total_pages);
        totalPagesRef.current = total_pages;
        setTotalRecords(total_records);
        totalRecordsRef.current = total_records;
        
        if (resultData && resultData.length > 0) {
          setColumns(Object.keys(resultData[0]));
          hasNextPageRef.current = pageNum < total_pages;
          hasPrevPageRef.current = pageNum > 1;
        } else {
          setMetadata([]);
          hasNextPageRef.current = false;
          hasPrevPageRef.current = pageNum > 1;
        }
      } else {
        // Use standard metadata endpoint for non-filtered pagination
        const params = {
          session_id: sessionId,
          from_date: dateTimeRange.from,
          to_date: dateTimeRange.to,
          opco: selectedCompany,
          page_number: pageNum,
          page_size: pageSize,
        };
        setInputValues({}); 
        const response = await api.get("/vpi/metadata", { params });
        const { 
          data: resultData, 
          session_id: newSessionId, 
          total_pages, 
          total_records 
        } = response.data;

        setSessionId(newSessionId);
        setMetadata(resultData || []);
        setTotalPages(total_pages);
        totalPagesRef.current = total_pages;
        setTotalRecords(total_records);
        totalRecordsRef.current = total_records;
        
        if (resultData && resultData.length > 0) {
          setColumns(Object.keys(resultData[0]));
          hasNextPageRef.current = pageNum < total_pages;
          hasPrevPageRef.current = pageNum > 1;
        } else {
          setMetadata([]);
          hasNextPageRef.current = false;
          hasPrevPageRef.current = pageNum > 1;
        }
      }
      
      setLoading(false);
      isLoadingRef.current = false;
    } catch (err) {
      setLoading(false);
      isLoadingRef.current = false;
      hasNextPageRef.current = false;
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail);
      } else {
        console.error("Error fetching page data:", err);
        setError("Something went wrong fetching data.");
      }
    }
  };

  // Apply filters to data
  const applyFilters = async () => {
    try {
      if (!sessionId) {
        // If no session ID, fallback to initial fetch
        return fetchInitialData();
      }

      setError("");
      setLoading(true);
      isLoadingRef.current = true;
      setSelectedRowIndex(null);
      setSelectedRow(null);
      
      // Always start at page 1 when applying new filters
      const pageNum = 1;
      setCurrentPage(pageNum);
      currentPageRef.current = pageNum;
      
      // Create filter parameters
      const filterParams = {
        extensionNum: inputValues?.ExtensionNumber?.[0] || undefined,
        objectID: inputValues?.ObjectId?.[0] || undefined,
        channelNum: inputValues?.ChannelNumber?.[0] || undefined,
        AniAliDigits: inputValues?.AniAliDigits?.[0] || undefined,
        Name: inputValues?.Name?.[0] || undefined,
      };
      
      // Store active filters for reuse in pagination
      setActiveFilters(filterParams);
      
      const params = {
        session_id: sessionId,
        page_number: pageNum,
        page_size: pageSize,
        ...filterParams
      };

      const response = await api.get("/cmp/filter", { params });
      const { 
        data: resultData, 
        session_id: newSessionId, 
        total_pages, 
        total_records 
      } = response.data;

      setSessionId(newSessionId);
      filterSessionIdRef.current = newSessionId;
      setMetadata(resultData || []);
      setTotalPages(total_pages);
      totalPagesRef.current = total_pages;
      setTotalRecords(total_records);
      totalRecordsRef.current = total_records;
      
      if (resultData && resultData.length > 0) {
        setColumns(Object.keys(resultData[0]));
        hasNextPageRef.current = pageNum < total_pages;
        hasPrevPageRef.current = false; // First page has no previous
      } else {
        setMetadata([]);
        hasNextPageRef.current = false;
        hasPrevPageRef.current = false;
      }
      
      setLoading(false);
      isLoadingRef.current = false;
    } catch (err) {
      setLoading(false);
      isLoadingRef.current = false;
      hasNextPageRef.current = false;
      hasPrevPageRef.current = false;
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail);
      } else {
        console.error("Error applying filters:", err);
        setError("Something went wrong applying filters.");
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setInputValues({}); // Clear input values in context
    setHasFilters(false);
    setActiveFilters(null);
    filterSessionIdRef.current = null;
    fetchInitialData();
  };

  // Update refs when state changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    hasFiltersRef.current = hasFilters;
  }, [hasFilters]);

  // Check for active filters whenever inputValues change
  useEffect(() => {
    const newHasFilters = checkForActiveFilters();
    setHasFilters(newHasFilters);
  }, [inputValues]);

  // Expose methods to window for other components to access
  useEffect(() => {
    // This makes the function and state accessible to other components
    window.vpiTable = {
      goToPage: (pageNum) => {
        setCurrentPage(pageNum);
        fetchPageData(pageNum);
      },
      fetchNextPage: () => {
        const nextPage = currentPageRef.current + 1;
        setCurrentPage(nextPage);
        fetchPageData(nextPage);
      },
      fetchPrevPage: () => {
        const prevPage = Math.max(1, currentPageRef.current - 1);
        setCurrentPage(prevPage);
        fetchPageData(prevPage);
      },
      resetToFirstPage: () => {
        setCurrentPage(1);
        fetchInitialData();
      },
      clearFilters: () => {
        clearFilters();
      },
      getHasNextPage: () => hasNextPageRef.current,
      getHasPrevPage: () => hasPrevPageRef.current,
      getIsLoading: () => isLoadingRef.current,
      getTotalPages: () => totalPagesRef.current,
      getCurrentPage: () => currentPageRef.current,
      getTotalRecords: () => totalRecordsRef.current,
      getHasFilters: () => hasFiltersRef.current,
      getFilterSessionId: () => filterSessionIdRef.current
    };
    
    return () => {
      delete window.vpiTable;
    };
  }, [sessionId, currentPage, dateTimeRange, inputValues, totalPages, hasFilters, activeFilters]);

  // React to standard pagination trigger
  useEffect(() => {
    if (!paginationTrigger.action) return;
    
    switch (paginationTrigger.action) {
      case 'next':
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchPageData(nextPage);
        break;
      case 'prev':
        const prevPage = Math.max(1, currentPage - 1);
        setCurrentPage(prevPage);
        fetchPageData(prevPage);
        break;
      case 'goto':
        if (typeof paginationTrigger.page === 'number') {
          setCurrentPage(paginationTrigger.page);
          fetchPageData(paginationTrigger.page);
        }
        break;
      case 'reset':
        fetchInitialData();
        break;
      default:
        break;
    }
    
    setPaginationTrigger({ action: null });
  }, [paginationTrigger]);

  // React to filter pagination trigger
  useEffect(() => {
    if (!filterPaginationTrigger.action) return;
    
    switch (filterPaginationTrigger.action) {
      case 'apply':
        applyFilters();
        break;
      case 'goto':
        if (typeof filterPaginationTrigger.page === 'number') {
          setCurrentPage(filterPaginationTrigger.page);
          fetchPageData(filterPaginationTrigger.page);
        }
        break;
      case 'clearFilters':
        clearFilters();
        break;
      default:
        break;
    }
    
    setFilterPaginationTrigger({ action: null });
  }, [filterPaginationTrigger]);

  // Effect for date range changes - always fetch initial data
  useEffect(() => {
    // Don't fetch on initial render
    if (initialState) {
      return;
    }
    
    // Reset and fetch new data when date range changes
    fetchInitialData();
  }, [dateTimeRange]);

  // Effect for input value changes - trigger filter application
  useEffect(() => {
    // Don't fetch on initial render
    if (initialState) {
      return;
    }
    
    // Only apply filter if there are actual filter values and we already have a session
    if (checkForActiveFilters() && sessionId) {
      setFilterPaginationTrigger({ action: 'apply' });
    }
  }, [inputValues]);

  // This effect only runs when either dateTimeRange or inputValues changes from their initial values
  useEffect(() => {
    const hasDateTimeValues = dateTimeRange && dateTimeRange.from && dateTimeRange.to;
    const hasInputValues = checkForActiveFilters();
    
    // Only exit the initial state if there are actual filters applied
    if (initialState && (hasDateTimeValues || hasInputValues)) {
      fetchInitialData();
    }
  }, [dateTimeRange, inputValues]);

  const handleRowClick = (index, item) => {
    console.log("Row clicked:", item);
    setSelectedRowIndex(index);
    setSelectedRow(item);
  };

  const tableContainerStyle = {
    height: "38vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0.375rem",
    overflow: "hidden",
    border: "1px solid #e5e7eb"
  };

  const renderTableContent = () => {
    if (initialState) {
      return (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-white text-gray-500 p-6">
        <div className="mb-4 p-3 bg-gray-100 rounded-full">
          <Search size={28} className="text-gray-400" />
        </div>
        <p className="text-center font-medium">No call recordings to display</p>
        <p className="text-center text-sm mt-2">Please select date range and click search to view call records</p>
      </div>
      );
    }

    if (loading) {
      return (
        <div className="flex-grow flex items-center justify-center bg-white text-gray-500 text-base">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading call records...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="text-red-500 bg-red-50 px-6 py-4 rounded-md border border-red-200 max-w-lg">
            <div className="font-medium text-lg mb-1">Error loading data</div>
            <div className="text-base">{error}</div>
          </div>
        </div>
      );
    }

    if (!metadata || metadata.length === 0) {
      setSelectedRow(null);
      return (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-white text-gray-500 p-6">
      <div className="mb-4 p-3 bg-gray-100 rounded-full">
        <FileX size={28} className="text-gray-400" />
      </div>
      <p className="text-center font-medium">No records found</p>
      <p className="text-center text-sm mt-2">No call recordings found matching your search criteria</p>
    </div>
      );
    }

    return (
      <div className="flex-grow overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-blue-700 text-white">
            <tr>
              {displayedColumns.map((col, index) => (
                <th key={index} className="px-3 py-2.5 font-medium text-left whitespace-nowrap border-b border-blue-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metadata.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors duration-200 ${selectedRowIndex === rowIndex ? 'bg-blue-500 text-white hover:bg-blue-400' : 'hover:bg-blue-50'}`}
                onClick={() => handleRowClick(rowIndex, row)}
              >
                {displayedColumns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-3 py-2.5 cursor-pointer whitespace-nowrap ${selectedRowIndex === rowIndex ? 'border-blue-100' : 'border-gray-100 hover:bg-blue-100'}`}
                    title={row[columnMap[col]]}
                  >
                    <div className="inline-block min-w-full">{row[columnMap[col]]}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto w-full" style={tableContainerStyle}>
      {renderTableContent()}
    </div>
  );
};

export default Vpitable;