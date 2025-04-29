import { createContext, useContext, useState } from "react";

// Create Context
const AppContext = createContext();

const TalkDeskProvider=({children})=>{
    const [inputValues, setInputValues] = useState([]);
    const [metadata,setMetadata]=useState([]);
    const [dateTimeRange, setDateTimeRange] = useState({ from: '', to: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationTrigger, setPaginationTrigger] = useState({ action: null });
 

    return <AppContext.Provider
    value={{
        inputValues,setInputValues,
        metadata,setMetadata,
        dateTimeRange, setDateTimeRange,
        currentPage,setCurrentPage,
        paginationTrigger,setPaginationTrigger

    }}
    >
        {children}
    </AppContext.Provider>

}


 const useTalkDesk = () => {
    return useContext(AppContext);
};

export {useTalkDesk}
export default TalkDeskProvider;
