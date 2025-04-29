import { createContext, useContext, useState } from "react";

// Create Context
const AppContext = createContext();

const HomeProvider=({children})=>{

    const [activeNav, setActiveNav] = useState("TALKDESK");
    const [selectedRow, setSelectedRow]=useState({});
    return <AppContext.Provider
    value={{
        activeNav,setActiveNav,
        selectedRow, setSelectedRow

    }}
    >
        {children}
    </AppContext.Provider>

}

 const useVarState = () => {
    return useContext(AppContext);
};

export {useVarState}
export default HomeProvider;
