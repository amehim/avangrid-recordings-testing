import { useState } from "react";
import { useVPI } from "../../context/VPIContext";

export default function SearchBar() {
  const [filters, setFilters] = useState({
    ObjectId: [],
    AniAliDigits: [],
    Name: [],
    ChannelNumber: [],
    ExtensionNumber: [],
  });
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const { setInputValues } = useVPI();

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value.split(",") }));
  };

  const handleSearch = () => {
    const values = Object.keys(filters).reduce((acc, key) => {
      // Only include selected filters with values
      if (selectedFilters.includes(key) && filters[key].length > 0) {
        acc[key] = filters[key];
      }
      
      return acc;
    }, {});
    setInputValues(values);
    console.log(values);
  };

  const toggleFilterSelector = () => {
    if (showFilterSelector) {
      // If we're closing the selector and removing all filters
      setSelectedFilters([]);
      // Clear all filter values
      const clearedFilters = Object.keys(filters).reduce((acc, key) => {
        acc[key] = [];
        return acc;
      }, {...filters});
      setFilters(clearedFilters);
    }
    setShowFilterSelector(prev => !prev);
  };

  const toggleFilterSelection = (key) => {
    if (selectedFilters.includes(key)) {
      // When unchecking a filter, clear its values
      setFilters(prev => ({
        ...prev,
        [key]: []
      }));
      // And remove it from selectedFilters
      setSelectedFilters(prev => prev.filter(item => item !== key));
    } else {
      // When checking a filter, add it to selectedFilters
      setSelectedFilters(prev => [...prev, key]);
    }
  };

  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 shadow-lg mt-3">
      {/* Header - Added rounded corners with rounded-t-lg */}
      <div className="bg-blue-600 text-white p-3 shadow-md flex items-center justify-between rounded-t-lg">
        <h3 className="text-sm font-medium">Filters</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleFilterSelector}
            className="px-2 py-1 bg-white text-blue-600 text-xs rounded-md font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            {showFilterSelector ? "Remove Filters" : "Select Filters"}
          </button>
          <button
            onClick={handleSearch}
            className="px-2 py-1 bg-white text-blue-600 text-xs rounded-md font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter Selection Checkbox Area */}
      {showFilterSelector && (
        <div className="p-3 bg-white border-b border-gray-200">
          <p className="text-xs font-semibold mb-2 text-gray-600">Choose Filters</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(filters).map((key) => (
              <label key={key} className="text-xs text-gray-700 flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(key)}
                  onChange={() => toggleFilterSelection(key)}
                />
                <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-48px)] p-3 space-y-4">
        {/* Only render filters that are selected */}
        {selectedFilters.map((key) => (
          <div key={key} className="bg-white rounded-lg shadow-sm p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </h4>
            <input
              type="text"
              placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim()}`}
              onChange={(e) => handleChange(key, e.target.value)}
              value={filters[key].join(',')}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}