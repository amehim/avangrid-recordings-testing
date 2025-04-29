import React, { useEffect, useState, useRef } from "react";
import { useTalkDesk } from "../../context/TalkdeskContext";
import { useVarState } from "../../context/Context";
import api from "../../utils/api";
import { Search } from "lucide-react";
import { FileX } from "lucide-react";

const Talkdesktable = () => {
  const { setSelectedRow } = useVarState();
  const { inputValues ,setInputValues} = useTalkDesk();
  const { dateTimeRange } = useTalkDesk();
  const { metadata, setMetadata } = useTalkDesk();
  const { currentPage, setCurrentPage } = useTalkDesk();
  const { paginationTrigger, setPaginationTrigger } = useTalkDesk();

  const [columns, setColumns] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [continuationToken, setContinuationToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialState, setInitialState] = useState(true);

  // Use refs to expose state to other components
  const hasNextPageRef = useRef(false);
  const isLoadingRef = useRef(false);

  const pageSize = 10; // Set manually during development

  const displayedColumns = [
    "Interaction_ID",
    "Call_Type",
    "Start_Time",
    "End_Time",
    "Talkdesk_Phone_Number",
    "Customer_Phone_Number",
    "Tags",
    "Talk_Time",
    "Hangup",
    "In_Business_Hours?",
    "Agent_Name",
    "Phone_Display_Name",
    "Handling_Agent"
  ];

  const columnMap = Object.fromEntries(displayedColumns.map((col) => [col, col]));

  // Make fetchData available on window for other components to access
  const fetchData = async (newSearch = false) => {
    try {
      setError("");
      setLoading(true);
      isLoadingRef.current = true;
      setInitialState(false);
      setSelectedRowIndex(null);
      setSelectedRow(null);
      
      // If starting a new search, reset continuation token and page
      if (newSearch) {
        setContinuationToken(null);
        setCurrentPage(1);
       
      }
      
      const params = {
        start_date: dateTimeRange.from,
        end_date: dateTimeRange.to,
        continuation_token: continuationToken,
        page_size: pageSize,
        Interaction_ID: inputValues?.InteractionID?.[0] || undefined,
        Customer_Phone_Number: inputValues?.CustomerNumber?.[0] || undefined,
        Talkdesk_Phone_Number: inputValues?.TalkdeskNumber?.[0] || undefined,
        Call_Type: inputValues?.CallType?.[0] || undefined,
      };

      const response = await api.get("/talkdesk/metadata", { params });
      const { data: resultData, continuation_token: nextToken } = response.data;

      if (resultData.length > 0) {
        setMetadata(resultData);
        setColumns(Object.keys(resultData[0]));
        setContinuationToken(nextToken || null);
        hasNextPageRef.current = !!nextToken;
      } else {
        setMetadata([]);
        setContinuationToken(null);
        hasNextPageRef.current = false;
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
        console.error("Error fetching metadata:", err);
        setError("Something went wrong fetching data.");
      }
    }
  };

  // Expose methods to window for other components to access
  useEffect(() => {
    // This makes the function and state accessible to other components
    window.talkdeskTable = {
      fetchNextPage: () => fetchData(false),
      resetToFirstPage: () => {
        setContinuationToken(null);
        setCurrentPage(1);
        fetchData(true);
      },
      getHasNextPage: () => hasNextPageRef.current,
      getIsLoading: () => isLoadingRef.current
    };
    
    return () => {
      delete window.talkdeskTable;
    };
  }, [continuationToken, dateTimeRange, inputValues]);

  // React to pagination trigger from paging component
  useEffect(() => {
    if (paginationTrigger.action === 'next') {
      fetchData(false);
      setPaginationTrigger({ action: null });
    } else if (paginationTrigger.action === 'reset') {
      setContinuationToken(null);
      fetchData(true);
      setPaginationTrigger({ action: null });
    }
  }, [paginationTrigger]);

  // Only fetch data when dateTimeRange or inputValues change, and not on initial render
  useEffect(() => {
    // Don't fetch on initial render
    if (initialState) {
      return;
    }
    
    // Reset and fetch new data when filters change
    fetchData(true);
  }, [dateTimeRange, inputValues]);

  // This effect only runs when either dateTimeRange or inputValues changes from their initial values
  useEffect(() => {
    const hasDateTimeValues = dateTimeRange && dateTimeRange.from && dateTimeRange.to;
    const hasInputValues = inputValues && 
      (inputValues.InteractionID?.length || 
       inputValues.CustomerNumber?.length || 
       inputValues.TalkdeskNumber?.length || 
       inputValues.CallType?.length);
    
    // Only exit the initial state if there are actual filters applied
    if (initialState && (hasDateTimeValues || hasInputValues)) {
      fetchData(true);
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
        <p className="text-center text-sm mt-2">Please apply filters and click search to view call records</p>
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

export default Talkdesktable;