import React, { Suspense, lazy, useEffect } from "react";
import { createBrowserRouter, RouterProvider,useNavigate } from "react-router-dom";
import App from "./App";
import Genesys from "./component/Genesys/Genesys";
import Nice from "./component/NICE/Nice";
import ReactDOM from 'react-dom/client';
import TALKDESK from "./component/TALKDESK/Talkdesk";
import ErrorPage from "./pages/ErrorPage";
// import HomeProvider from "./context/Context";

ReactDOM.createRoot(document.getElementById('root')).render(
  
    
        <App />
        
  
);