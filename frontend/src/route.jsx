import React, { Suspense, lazy, useEffect } from "react";
import { createBrowserRouter, RouterProvider,useNavigate } from "react-router-dom";
import App from "./App";
import Genesys from "./component/Genesys/Genesys";
import Nice from "./component/NICE/Nice";
import VPI from "./component/VPI/VPI_PARENT";
import TALKDESK from "./component/TALKDESK/Talkdesk";


const SuspenseLoading = () => <div>Loading...</div>;

//route => vpi,nice,genesys




const router = createBrowserRouter([
  {
    path: "/",
    errorElement: (
        <ErrorPage />
    ),
    element: (
        <App />
    ),
    children:[
        {
            path:"/vpi",
            element:(
                <VPI/>
        
            )
          },{
            path:"/nice",
            element:(
                <Nice/>
            )
          },
          {
            path:"/genesys",
            element:(
                <Genesys/>
            )
          },
          {
            path:"/talkdesk",
            element:(
                <TALKDESK/>
            )
          }
    ]
  },

]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
