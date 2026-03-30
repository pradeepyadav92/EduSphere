import React from "react";

const Heading = ({ title }) => {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="border-l-4 border-[#21439c] pl-3 text-[1.45rem] font-semibold tracking-[-0.02em] text-[#233d88] md:text-[1.6rem]">
        {title}
      </p>
    </div>
  );
};

export default Heading;
