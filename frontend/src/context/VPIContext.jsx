import { createContext, useContext, useState } from "react";

// Create Context
const AppContext = createContext();

const VPIProvider=({children})=>{
    const [inputValues, setInputValues] = useState([]);
    const [metadata,setMetadata]=useState([]);
    const [dateTimeRange, setDateTimeRange] = useState({ from: '', to: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationTrigger, setPaginationTrigger] = useState({ action: null });
    const [filterPaginationTrigger, setFilterPaginationTrigger] = useState({ action: null });
    const [selectedCompany, setSelectedCompany] = useState("RGE");

    return <AppContext.Provider
    value={{
        inputValues,setInputValues,
        metadata,setMetadata,
        dateTimeRange, setDateTimeRange,
        currentPage, setCurrentPage,
        selectedCompany, setSelectedCompany,
        paginationTrigger,setPaginationTrigger,
        filterPaginationTrigger, setFilterPaginationTrigger

    }}
    >
        {children}
    </AppContext.Provider>

}




 const useVPI = () => {
    return useContext(AppContext);
};

export {useVPI}
export default VPIProvider;
