import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex justify-center items-center gap-3 mb-20">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
            >
                <ChevronLeft size={16} />
                Previous
            </button>

            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm ${
                                page === currentPage
                                    ? "bg-gray-200 text-gray-800 font-medium"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
            >
                Next
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;
