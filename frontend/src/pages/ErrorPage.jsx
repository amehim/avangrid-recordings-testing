import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
    const navigate=useNavigate();
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-red-500">404</h1>
                <p className="text-2xl font-semibold mt-4">Oops! Page not found</p>
                <p className="mt-2 text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
                
                <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                onClick={()=>{
                    navigate('/')
                }}
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;