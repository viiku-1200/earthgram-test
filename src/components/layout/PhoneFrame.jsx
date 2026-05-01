import React from 'react';

const PhoneFrame = ({ children }) => (
  <div className="w-full h-dvh max-w-[480px] mx-auto bg-white relative overflow-hidden shadow-2xl">
    {children}
  </div>
);

export default PhoneFrame;
