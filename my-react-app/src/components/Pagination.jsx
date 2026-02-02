import React from 'react'

const Pagination = ({ totalPages, currentPage, fetchData}) => {
  return (
    <div className="flex justify-center items-center m-5"><nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
        <span className="text-md font-normal text-white  mb-4 md:mb-0 block w-full md:inline md:w-auto">Showing page <span className="font-semibold text-white ">{currentPage + 1}</span> of <span className="font-semibold text-gray-900" >{totalPages}</span></span>
        
        <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            
            <li>
                <button className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-white bg-black border border-gray-600 rounded-s-lg hover:bg-gray-100 hover:text-gray-700  dark:hover:bg-gray-700 dark:hover:text-white" onClick={() => fetchData(currentPage - 1)}>Previous</button>
            </li>

            
                {Array.from({ length: totalPages}, (_, i) => (
                    <li>
                    <button key={i}  className="flex items-center justify-center px-3 h-8 leading-tight text-white bg-black border border-gray-600 hover:bg-gray-100 hover:text-gray-700   dark:hover:bg-gray-700 dark:hover:text-white" onClick={() => fetchData(i)}>{i + 1}</button>
                     </li>
                ))}
                
        
            
            <li>
        <button className="flex items-center justify-center px-3 h-8 leading-tight text-white bg-black border border-gray-600 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white" disabled={currentPage === totalPages - 1} onClick={() => fetchData(currentPage + 1)}>Next</button>
            </li>
        </ul>
    </nav> </div>
  )
}

export default Pagination