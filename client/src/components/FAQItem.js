import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const FAQItem = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex justify-between items-start gap-4 py-5 text-left text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-colors"
      >
        <span className={`text-base font-medium ${isOpen ? "text-orange-500" : ""}`}>
          {title}
        </span>
        {description ? (
          <span
            className={`mt-1 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-orange-500" : ""
            }`}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </span>
        ) : (
          <span className="w-4 h-4" />
        )}
      </button>
      {isOpen && description && (
        <div className="pb-6 pr-4 md:pr-12">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
