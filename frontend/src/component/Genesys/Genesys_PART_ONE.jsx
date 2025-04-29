import React from 'react'

function Genesys_PART_ONE() {

    return (
        <div className='container grid grid-cols-5 items-center gap-3 w-[100%] ' >
            <div className='startdate'>
                <label className='font-bold text-gray-600'>Start Date</label>
                <input type="date" className="input input-bordered w-full max-w-xs"/>

            </div>
            <div className='end_date'>
            <label className='font-bold text-gray-600'
             
            >End Date</label>

                <input type="date" name="endDate" id="endDate" className="input input-bordered w-full max-w-xs" />

            </div>
            <div className='w-[100%]'>
            <label className='font-bold text-gray-600'>Parameter</label>

               
                <select className="select select-bordered w-full max-w-xs">
                    <option>Recording Id</option>
                    <option>Transaction ID</option>
                    <option>Full Name</option>
                    <option>Workgroup</option>
                    <option>ANI ALI Number</option>
                </select>

            </div>

            <div>
            <label className='font-bold text-gray-600'>value</label>

                <input type="text" className="input input-bordered w-full max-w-xs" />
            </div>

            <div className='w-[100%] flex justify-end'>

                <button className='btn btn-success w-[70%] text-white my-auto'>Search</button>

            </div>

        </div>
    )
}

export default Genesys_PART_ONE