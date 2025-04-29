import React, { useState, useEffect, useRef } from 'react';
import { useTalkDesk } from '../../context/TalkdeskContext';

const DateTimeInput = () => {
  // Core state for date and time values
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [timeRange, setTimeRange] = useState({ from: '12:00 AM', to: '12:00 PM' });
  
  // Input field display values
  const [inputDisplay, setInputDisplay] = useState({ from: '', to: '' });
  
  // Raw input values before processing
  const [rawInputs, setRawInputs] = useState({ from: '', to: '' });
  
  // Calendar display state
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState('');
  
  // Error state
  const [errors, setErrors] = useState({ from: '', to: '' });
  
  // For handling clicks outside calendar
  const calendarRef = useRef(null);
  
  const { setDateTimeRange } = useTalkDesk();

  // Handle outside clicks to close calendar
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target) && 
          !event.target.closest('button[type="button"]')) {
        setShowCalendar(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Time conversion functions
  function convertTo24Hour(time) {
    if (!time) return '00:00:00';
    
    // Handle case where time might already be in 24-hour format
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time;
    }
    
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  function convertTo12Hour(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return '12:00 AM';
    
    // Handle the case where timeStr is already in 12-hour format
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    
    // Parse 24-hour format (assuming HH:MM:SS or HH:MM)
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts.length > 1 ? parts[1].padStart(2, '0') : '00';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }

  function getCombinedDateTime(date, time) {
    if (!date || !time) return '';
    return `${date} ${convertTo24Hour(time)}`;
  }

  // Update display values whenever date/time changes
  useEffect(() => {
    updateDisplayValues();
  }, [dateRange, timeRange]);

  // Function to update display values based on internal state
  const updateDisplayValues = () => {
    setInputDisplay({
      from: dateRange.from ? `${dateRange.from} ${convertTo24Hour(timeRange.from)}` : '',
      to: dateRange.to ? `${dateRange.to} ${convertTo24Hour(timeRange.to)}` : ''
    });
    
    // Also update raw inputs to match the formatted values
    setRawInputs({
      from: dateRange.from ? `${dateRange.from} ${convertTo24Hour(timeRange.from)}` : '',
      to: dateRange.to ? `${dateRange.to} ${convertTo24Hour(timeRange.to)}` : ''
    });
  };

  // Validate date format
  const isValidDate = (dateStr) => {
    // Basic format check: YYYY-MM-DD
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
    
    // Check if it's a valid date
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  // Validate time format
  const isValidTime = (timeStr) => {
    // Check 24-hour format (HH:MM:SS)
    if (timeStr.match(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)) return true;
    
    // Check 12-hour format with AM/PM
    if (timeStr.match(/^(0?\d|1[0-2]):([0-5]\d)\s+(AM|PM)$/i)) return true;
    
    return false;
  };

  // Validate user input format
  const validateInputFormat = (value) => {
    // Check if empty
    if (!value.trim()) return true;
    
    // Extract date part (assuming format is "YYYY-MM-DD HH:MM:SS" or similar)
    const parts = value.split(' ');
    const datePart = parts[0];
    
    // Validate date part
    if (!isValidDate(datePart)) {
      return false;
    }
    
    // If there's time information, validate that too
    if (parts.length > 1) {
      const timePart = parts.slice(1).join(' ');
      
      // Check if it's in 24-hour format or contains AM/PM
      if (timePart.match(/^\d{2}:\d{2}:\d{2}$/) || 
         (timePart.includes(':') && (timePart.includes('AM') || timePart.includes('PM')))) {
        return true;
      }
      
      // If it's not in a recognized format, consider it invalid
      return false;
    }
    
    return true;
  };

  // Validate inputs before searching
  const validateInputs = () => {
    const newErrors = { from: '', to: '' };
    let isValid = true;

    // Check if inputs are provided
    if (!rawInputs.from.trim()) {
      newErrors.from = 'Start date & time required';
      isValid = false;
    }

    if (!rawInputs.to.trim()) {
      newErrors.to = 'End date & time required';
      isValid = false;
    }

    // Validate format of manual entries
    if (rawInputs.from && !validateInputFormat(rawInputs.from)) {
      newErrors.from = 'Invalid format (YYYY-MM-DD HH:MM:SS)';
      isValid = false;
    }

    if (rawInputs.to && !validateInputFormat(rawInputs.to)) {
      newErrors.to = 'Invalid format (YYYY-MM-DD HH:MM:SS)';
      isValid = false;
    }

    // Only compare dates if both inputs are valid
    if (isValid && rawInputs.from && rawInputs.to) {
      try {
        // Extract date parts for comparison
        const fromParts = rawInputs.from.split(' ');
        const toParts = rawInputs.to.split(' ');
        
        if (fromParts.length >= 2 && toParts.length >= 2) {
          const fromDate = new Date(`${fromParts[0]}T${fromParts[1]}`);
          const toDate = new Date(`${toParts[0]}T${toParts[1]}`);
          
          if (fromDate > toDate) {
            newErrors.to = 'End date must be after start date';
            isValid = false;
          }
        }
      } catch (error) {
        console.error("Error comparing dates:", error);
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle search button click
  const handleSearch = () => {
    // Validate inputs without auto-correcting them
    if (!validateInputs()) {
      return;
    }

    // If valid, process the input values to extract date and time
    processInputValues('from');
    processInputValues('to');

    // Clear any existing errors
    setErrors({ from: '', to: '' });

    const from = getCombinedDateTime(dateRange.from, timeRange.from);
    const to = getCombinedDateTime(dateRange.to, timeRange.to);

    setDateTimeRange({ from, to });
    console.log("Final search datetime range:", { from, to });
  };

  // Process and format input values
  const processInputValues = (field) => {
    const value = rawInputs[field];
    
    try {
      // Empty input handling
      if (!value.trim()) {
        setDateRange(prev => ({ ...prev, [field]: '' }));
        setTimeRange(prev => ({ ...prev, [field]: '12:00 AM' }));
        return;
      }
      
      // Split the input value to extract date and time parts
      const parts = value.split(' ');
      
      // Handle date part (should be first part)
      const datePart = parts[0];
      
      // Check if we have a valid date format
      if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setDateRange(prev => ({ ...prev, [field]: datePart }));
        
        // Extract and process time part if it exists
        const timeParts = parts.slice(1).join(' ');
        
        if (timeParts) {
          // Try to parse time information from different formats
          
          // Handle 24-hour format (HH:MM:SS)
          if (timeParts.match(/^\d{2}:\d{2}:\d{2}$/)) {
            const time12 = convertTo12Hour(timeParts);
            setTimeRange(prev => ({ ...prev, [field]: time12 }));
          } 
          // Handle 12-hour format with AM/PM
          else if (timeParts.includes('AM') || timeParts.includes('PM')) {
            // Extract the time and period
            const periodMatch = timeParts.match(/(AM|PM)/i);
            
            if (periodMatch) {
              const period = periodMatch[0].toUpperCase();
              // Extract time value by removing AM/PM
              let timeValue = timeParts.replace(/(AM|PM)/i, '').trim();
              
              // Split into hours and minutes
              let [hours, minutes] = timeValue.split(':');
              
              // Ensure we have valid hours and minutes
              hours = hours ? hours.padStart(2, '0') : '12';
              minutes = minutes ? minutes.padStart(2, '0') : '00';
              
              const formattedTime = `${hours}:${minutes} ${period}`;
              setTimeRange(prev => ({ ...prev, [field]: formattedTime }));
            }
          }
          // Handle 24-hour format without seconds (HH:MM)
          else if (timeParts.match(/^\d{1,2}:\d{2}$/)) {
            const time12 = convertTo12Hour(timeParts);
            setTimeRange(prev => ({ ...prev, [field]: time12 }));
          }
          // Handle other time formats (best effort)
          else {
            try {
              // Try to parse as a time regardless of format
              if (timeParts.includes(':')) {
                const cleanedTimeParts = timeParts.replace(/[^0-9:APMapm]/g, '');
                const time12 = convertTo12Hour(cleanedTimeParts);
                setTimeRange(prev => ({ ...prev, [field]: time12 }));
              }
            } catch (e) {
              console.error("Could not parse time:", timeParts);
            }
          }
        }
        // If no time part found, keep existing time
      }
    } catch (error) {
      console.error("Error parsing input:", error);
    }
  };

  // Handle raw input change - store but don't process immediately
  const handleRawInputChange = (field, value) => {
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    // Just update the raw input value
    setRawInputs(prev => ({ ...prev, [field]: value }));
  };

  // Handle input field blur to process the input
  const handleInputBlur = (field) => {
    // Validate the input format
    if (!validateInputFormat(rawInputs[field]) && rawInputs[field].trim()) {
      setErrors(prev => ({ ...prev, [field]: 'Invalid format ' }));
      return;
    }
    
    // Only process if format is valid
    processInputValues(field);
    
    // Update the display value after processing
    if (dateRange[field]) {
      setInputDisplay(prev => ({
        ...prev,
        [field]: `${dateRange[field]} ${convertTo24Hour(timeRange[field])}`
      }));
    }
  };
  
  // Toggle calendar display
  const toggleCalendar = (field) => {
    setActiveField(field);
    setShowCalendar(prev => !prev);
  };

  // Calendar component
  const Calendar = ({ onSelect, onTimeChange, initialTime, fieldName, selectedDate }) => {
    // Initialize with current date or selected date
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    const [viewDate, setViewDate] = useState(initialDate);
    const [selectedDay, setSelectedDay] = useState(selectedDate ? new Date(selectedDate).getDate() : null);
    
    // Parse the initial time for the time picker
    const parseInitialTime = (timeStr) => {
      if (!timeStr) return { hour: '12', minute: '00', period: 'AM' };
      
      // Handle case where time might be in 24-hour format
      if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
        timeStr = convertTo12Hour(timeStr);
      }
      
      // Split time into components
      let [timePart, periodPart] = ['12:00', 'AM'];
      
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const parts = timeStr.split(' ');
        timePart = parts[0];
        periodPart = parts[1] || 'AM';
      }
      
      const [hour, minute] = timePart.split(':');
      
      return { 
        hour: hour.padStart(2, '0'), 
        minute: minute.padStart(2, '0'), 
        period: periodPart 
      };
    };

    // Extract initial time components
    const initialTimeParts = parseInitialTime(initialTime);
    
    // Time picker state
    const [hourValue, setHourValue] = useState(initialTimeParts.hour);
    const [minuteValue, setMinuteValue] = useState(initialTimeParts.minute);
    const [periodValue, setPeriodValue] = useState(initialTimeParts.period);
    
    // Update time picker when initialTime changes
    useEffect(() => {
      const { hour, minute, period } = parseInitialTime(initialTime);
      setHourValue(hour);
      setMinuteValue(minute);
      setPeriodValue(period);
    }, [initialTime]);
    
    // Set initial selected day if a date is passed
    useEffect(() => {
      if (selectedDate) {
        try {
          const dateParts = selectedDate.split('-').map(Number);
          if (dateParts.length === 3) {
            const [year, month, day] = dateParts;
            setViewDate(new Date(year, month - 1, 1)); // Set month view
            setSelectedDay(day);
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }
    }, [selectedDate]);

    // Handle time picker changes
    const handleTimeChangeLocal = (h, m, p) => {
      setHourValue(h);
      setMinuteValue(m);
      setPeriodValue(p);
    };

    // Handle OK button click
    const handleOk = () => {
      // Construct the current time value
      const newTime = `${hourValue}:${minuteValue} ${periodValue}`;
      
      // Update date if a day was selected
      if (selectedDay) {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), selectedDay);
        const formattedDate = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        // Update both date and time
        onSelect(formattedDate);
        onTimeChange(newTime);
      } else {
        // If only time was changed, just update time
        onTimeChange(newTime);
      }
      
      // Close calendar
      setShowCalendar(false);
    };

    // Handle day selection
    const selectDay = (day) => {
      setSelectedDay(day);
    };

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    // Generate years starting from 2025
    const currentYear = 2025;
    const yearsToDisplay = Array.from({ length: 10 }, (_, i) => currentYear + i);

    return (
      <div className="bg-white p-1 shadow-md rounded border border-gray-200 z-50 relative w-64">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-sm">←</button>
          <div className="flex gap-1">
            <select value={viewDate.getMonth()} onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))} className="text-xs border rounded py-0.5 px-1">
              {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
            </select>
            <select value={viewDate.getFullYear()} onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))} className="text-xs border rounded py-0.5 px-1 w-16">
              {yearsToDisplay.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded text-sm">→</button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
  <div key={`day-${index}`} className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500">{day}</div>
))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {(() => {
            const days = [];
            const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
            const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());

            for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="w-6 h-6" />);
            for (let day = 1; day <= daysInMonth; day++) {
              const isSelected = selectedDay === day;
              days.push(
                <div 
                  key={day} 
                  onClick={() => selectDay(day)} 
                  className={`w-6 h-6 flex items-center justify-center text-xs cursor-pointer hover:bg-blue-100 rounded ${
                    isSelected ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  {day}
                </div>
              );
            }

            return days;
          })()}
        </div>

        <div className="pt-1 border-t border-gray-200">
          <div className="flex items-center justify-between space-x-1">
            <div className="flex items-center">
              <select 
                value={hourValue} 
                onChange={(e) => handleTimeChangeLocal(e.target.value, minuteValue, periodValue)} 
                className="p-0.5 text-xs border rounded w-14"
              >
                {['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-xs px-0.5">:</span>
              <select 
                value={minuteValue} 
                onChange={(e) => handleTimeChangeLocal(hourValue, e.target.value, periodValue)} 
                className="p-0.5 text-xs border rounded w-14"
              >
                {['00', '15', '30', '45'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select 
                value={periodValue} 
                onChange={(e) => handleTimeChangeLocal(hourValue, minuteValue, e.target.value)} 
                className="p-0.5 text-xs border rounded w-14 ml-1"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <button onClick={handleOk} className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">OK</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 relative max-w-xl">
      <div className="flex gap-4">
        <div className="flex flex-1 gap-4">
          {['from', 'to'].map((field) => (
            <div className="flex-1 relative" key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'from' ? 'From Date' : 'To Date'}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="YYYY-MM-DD HH:MM:SS"
                  value={rawInputs[field]}
                  onChange={(e) => handleRawInputChange(field, e.target.value)}
                  onBlur={() => handleInputBlur(field)}
                  className={`px-3 py-2.5 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-400 w-full ${
                    errors[field] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ fontSize: '0.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => toggleCalendar(field)}
                  className={`px-2 py-2 bg-gray-100 border border-l-0 rounded-r hover:bg-gray-200 ${
                    errors[field] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  📅
                </button>
              </div>
              {errors[field] && (
                <div className="text-red-500 text-xs mt-1">{errors[field]}</div>
              )}

              {showCalendar && activeField === field && (
                <div className="absolute z-50 mt-1" ref={calendarRef}>
                  <Calendar
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, [field]: date }));
                      // Also update raw input when using calendar
                      const updatedDate = date;
                      const updatedTime = convertTo24Hour(timeRange[field]);
                      setRawInputs(prev => ({ 
                        ...prev, 
                        [field]: `${updatedDate} ${updatedTime}` 
                      }));
                    }}
                    onTimeChange={(time) => {
                      setTimeRange(prev => ({ ...prev, [field]: time }));
                      // Also update raw input when using calendar time picker
                      const updatedDate = dateRange[field] || '';
                      const updatedTime = convertTo24Hour(time);
                      setRawInputs(prev => ({ 
                        ...prev, 
                        [field]: updatedDate ? `${updatedDate} ${updatedTime}` : '' 
                      }));
                    }}
                    initialTime={timeRange[field]}
                    selectedDate={dateRange[field]}
                    fieldName={field}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-7 mt-6 rounded items-center text-sm"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default DateTimeInput;