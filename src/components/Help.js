import React, { useEffect, useState } from "react";
import { support_data } from "../utils/constants.js";
import FAQItem from "./FAQItem.js";

const Help = () => {
  const init = support_data
    .filter((x) => x.title === "General issues")
    .map((x) => x.data);

  const titles = support_data.map((data) => data.title);

  const [helpTitle, setHelpTitle] = useState([]);
  const [FAQ, setFAQ] = useState([]);
  const [activeTitle, setActiveTitle] = useState(false);

  useEffect(() => {
    setHelpTitle(titles);
    setActiveTitle(0);
    setFAQ(...init);
  }, []);

  const handleClick = (event, index) => {
    event.preventDefault();
    const text = event.target.textContent;
    const qna = support_data.filter((x) => x.title === text);
    setFAQ(
      ...qna.map((x) => x.data)
    );
    setActiveTitle(index);
  };

  return (
    <div className="mt-20 min-h-screen min-w-[85%] mx-auto">
      {/* Header Section */}
      <div className="text-orange-500 bg-gray-100 pb-20 px-10">
        <div className="flex flex-col flex-1 pt-14 px-8 xl:max-w-[80%] lg:max-w-[80%] md:max-w-[90%] sm:max-w-[90%] mx-auto text-center">
          <h1 className="mt-5 font-extrabold text-4xl">Help & Support 🍽️</h1>
          <h4 className="pb-12 font-light text-lg">
            Need assistance? We’re here to help!
          </h4>
        </div>

        {/* Help Section */}
        <div className="flex bg-white text-gray-700 mx-auto p-10 shadow-2xl rounded-lg xl:max-w-[80%] lg:max-w-[80%] md:max-w-[90%] sm:max-w-[90%]">
          {/* Sidebar Navigation */}
          <div className="py-5 pl-3 bg-gray-100 rounded-lg list-none min-w-fit h-fit shadow-md">
            {helpTitle.map((curr, index) => (
              <div
                key={index}
                className={`ml-2 px-6 py-4 text-[14px] font-medium cursor-pointer rounded-md transition-all duration-300 hover:bg-orange-400 hover:text-white ${
                  activeTitle === index ? "bg-orange-500 text-white font-bold" : "text-gray-700"
                }`}
                onClick={(event) => handleClick(event, index)}
              >
                {curr}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="w-full pl-10 pt-4">
            {FAQ.map((curr, index, val) => (
              <FAQItem {...val[index]} key={val[index].id} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
