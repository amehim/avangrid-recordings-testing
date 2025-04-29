import React from "react";

const LogoHeader = () => {
  return (
    <header className="flex items-center justify-center p-4 bg-white-600">
  <div className="flex items-center justify-center">
    <img 
      src="/AvangridLogo2.png" 
      alt="Logo" 
      className="h-16 w-auto max-w-xs object-contain" 
    />
  </div>
</header>
  );
};

export default LogoHeader;


