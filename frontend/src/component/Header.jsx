import React, { useEffect } from "react";
import LogoHeader from "./LogoHeader";
import { useVarState } from "../context/Context";
import api from "../utils/api";

const Header = ({ activePage, setActivePage }) => {
  
  const { activeNav, setActiveNav } = useVarState();
  const { selectedRow, setSelectedRow } = useVarState();
  
  const navItems = [
    {
      label: "TALKDESK",
      icon: (
        <img 
          src="/talkdesk.png" 
          alt="Talkdesk" 
          className={`h-5 w-5 mr-2 mt-0.5 ${activePage === "TALKDESK" ? "brightness-0 invert" : ""}`}
        />
      ),
      activeClass: "bg-blue-600 text-white shadow-md border-b-2 border-blue-800",
      inactiveClass: "bg-white text-blue-700 hover:bg-blue-50 border-b border-gray-200"
    },
    {
      label: "VPI",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      activeClass: "bg-blue-600 text-white shadow-md border-b-2 border-blue-800",
      inactiveClass: "bg-white text-blue-700 hover:bg-blue-50 border-b border-gray-200"
    },
    {
      label: "NICE",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      activeClass: "bg-blue-600 text-white shadow-md border-b-2 border-blue-800",
      inactiveClass: "bg-white text-blue-700 hover:bg-blue-50 border-b border-gray-200"
    },
    {
      label: "GENESYS",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
      ),
      activeClass: "bg-blue-600 text-white shadow-md border-b-2 border-blue-800",
      inactiveClass: "bg-white text-blue-700 hover:bg-blue-50 border-b border-gray-200"
    }
  ];

  const deleteSession = async () => {
    try {
      const response = await api.get("/delete_session");
      console.log("Session delete response:", response.data);
      if (response.data.success === "deleted") {
        console.log("Session successfully deleted");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const setActivePages = (page) => {
    if (page !== activePage) {
      // Clear selectedRow when changing pages
      setSelectedRow(null);
      
      // Call the API to delete the session
      deleteSession();
      
      // Set the active page and navigation
      setActiveNav(page);
      setActivePage(page);
      
      console.log("Active Page:", page);
      console.log("Active Nav:", page);
      console.log("Selected Row cleared");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Fixed height container to prevent layout shifts */}
        <div className="h-24 flex items-end justify-between">
          {/* Logo section with fixed width and height */}
          <div className="w-48 h-20 flex items-center">
            <LogoHeader />
          </div>
          
          {/* Navigation buttons - fixed height */}
          <div className="w-auto h-10">
            <div className="flex space-x-1">
              {navItems.map((item, index) => {
                // Determine if this is the Talkdesk button
                const isTalkdesk = item.label === "TALKDESK";
                
                return (
                  <button
                    key={index}
                    onClick={() => setActivePages(item.label)}
                    className={`
                      flex items-center justify-center
                      ${isTalkdesk ? 'px-5' : 'px-4'}
                      py-2
                      text-sm
                      font-medium
                      rounded-t-md
                      transition-colors
                      duration-200
                      ${activePage === item.label ? item.activeClass : item.inactiveClass}
                    `}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;