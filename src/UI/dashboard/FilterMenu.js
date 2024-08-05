import React, { useState, useRef, useEffect } from 'react';

const FilterMenu = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFilter = (filterType, value) => {
    const updatedFilters = {
      ...filters,
      [filterType]: {
        ...filters[filterType],
        [value]: !filters[filterType][value]
      }
    };
    onFilterChange(updatedFilters);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dimension-theme-colored px-4 py-2 rounded"
      >
        Filter
      </button>
      {isOpen && (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-4 mt-2 right-0">
          <h3 className="font-bold mb-2">Filters</h3>
          <div>
            <h4 className="font-semibold mb-1">Goal Status</h4>
            {Object.entries(filters.status).map(([status, isChecked]) => (
              <div key={status} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`status-${status}`}
                  checked={isChecked}
                  onChange={() => toggleFilter('status', status)}
                  className="mr-2"
                />
                <label htmlFor={`status-${status}`}>{status}</label>
              </div>
            ))}
          </div>
          {/* Add more filter options here in the future */}
        </div>
      )}
    </div>
  );
};

export default FilterMenu;