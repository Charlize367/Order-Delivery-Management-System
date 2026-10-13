import React from 'react'

const Pagination = ({ totalPages, currentPage, fetchData}) => {
  return (
    <div className="flex justify-center items-center m-5">
      <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between gap-4 pt-4" aria-label="Table navigation">
        <span className="text-sm font-normal text-[#3B2A20] mb-4 md:mb-0 block w-full md:inline md:w-auto">
          Showing page <span className="font-semibold text-[#3B2A20]">{currentPage + 1}</span> of <span className="font-semibold text-[#3B2A20]">{totalPages}</span>
        </span>

        <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-9 rounded-lg overflow-hidden shadow-sm">

            <li>
                <button className="flex cursor-pointer items-center justify-center px-4 h-9 text-[#3B2A20] bg-white border border-[#A65A34]/25 rounded-s-lg hover:bg-[#A65A34]/10 transition-colors duration-150" onClick={() => fetchData(currentPage - 1)}>Previous</button>
            </li>

                {Array.from({ length: totalPages}, (_, i) => (
                    <li key={i}>
                    <button
                      className={`flex cursor-pointer items-center justify-center px-4 h-9 border transition-colors duration-150 ${
                        i === currentPage
                          ? "bg-[#A65A34] text-[#F7F1E8] border-[#A65A34] font-semibold"
                          : "bg-white text-[#3B2A20] border-[#A65A34]/25 hover:bg-[#A65A34]/10"
                      }`}
                      onClick={() => fetchData(i)}
                    >
                      {i + 1}
                    </button>
                     </li>
                ))}

            <li>
                <button className="flex items-center cursor-pointer justify-center px-4 h-9 text-[#3B2A20] bg-white border border-[#A65A34]/25 rounded-e-lg hover:bg-[#A65A34]/10 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed" disabled={currentPage === totalPages - 1} onClick={() => fetchData(currentPage + 1)}>Next</button>
            </li>
        </ul>
    </nav>
    </div>
  )
}

export default Pagination