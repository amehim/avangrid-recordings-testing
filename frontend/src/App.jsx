import React, { useState } from 'react';
import "./index.css";
import Header from './component/Header';
import VPI from "./component/VPI/Vpi";
import Nice from "./component/NICE/Nice";
import Genesys from "./component/Genesys/Genesys";
import TALKDESK from "./component/TALKDESK/Talkdesk";
import LogoHeader from './component/LogoHeader';
import HomeProvider from "./context/Context";
import { Home } from 'lucide-react';
import TalkDeskProvider from './context/TalkdeskContext';
import VPIProvider from './context/VPIContext';

function App() {
  const [activePage , setActivePage ] = useState("TALKDESK");
  

  const renderCurrentPage = () => {
    switch(activePage) {
      case "VPI":
        return (
          <VPIProvider>
            <VPI />
          </VPIProvider>
        );
      case "NICE":
        return <Nice />;
      case "GENESYS":
        return <Genesys />;
      case "TALKDESK":
        return (
          <TalkDeskProvider>
            <TALKDESK />
          </TalkDeskProvider>
        );
      default:
        return (
          <TalkDeskProvider>
            <TALKDESK />
          </TalkDeskProvider>
        );
    }
  };

  return (
    <HomeProvider>
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-none">
        {/* <LogoHeader /> */}
        <Header activePage={activePage} setActivePage={setActivePage} />
      </div>
      <div className="flex-grow">
        {renderCurrentPage()}
      </div>
    </div>
  </HomeProvider>
  );
}

export default App;