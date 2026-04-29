import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const FAQItem = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border dark:border-gray-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex justify-between items-start gap-4 py-5 text-left text-foreground hover:text-primary-hover transition-colors"
      >
        <span className={`text-base font-medium ${isOpen ? "text-primary" : ""}`}>
          {title}
        </span>
        {description ? (
          <span
            className={`mt-1 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
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
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
