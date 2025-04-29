import React from "react";
import { useVPI } from "../../context/VPIContext";

function VpiFilterDisplay() {
  const { dateTimeRange, inputValues } = useVPI();

  const hasDateFilter = dateTimeRange && (dateTimeRange.from || dateTimeRange.to);
  const hasInputFilters = inputValues && Object.values(inputValues).some(value => 
    Array.isArray(value) ? value.some(v => v && v.trim() !== "") : (value && value.trim() !== "")
  );

  if (!hasDateFilter && !hasInputFilters) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-md p-2 mb-3 border border-blue-100">
      <div className="text-sm text-blue-700 font-medium mb-1">Active Filters:</div>
      <div className="flex flex-wrap gap-2">
        {/* Date Range Filters */}
        {hasDateFilter && (
          <div className="inline-flex items-center bg-white border border-blue-200 rounded-md px-2 py-1 text-xs">
            <span className="font-medium mr-1">Date Range:</span>
            <span>
              {dateTimeRange.from ? new Date(dateTimeRange.from).toLocaleString() : 'Any'} to {dateTimeRange.to ? new Date(dateTimeRange.to).toLocaleString() : 'Any'}
            </span>
          </div>
        )}

        {/* Input Value Filters */}
        {inputValues && Object.entries(inputValues).map(([key, value]) => {
          if (Array.isArray(value) && value.some(v => v && v.trim() !== "")) {
            return (
              <div key={key} className="inline-flex items-center bg-white border border-blue-200 rounded-md px-2 py-1 text-xs">
                <span className="font-medium mr-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </span>
                <span>
                  {value.filter(v => v && v.trim() !== "").join(", ")}
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default VpiFilterDisplay;
