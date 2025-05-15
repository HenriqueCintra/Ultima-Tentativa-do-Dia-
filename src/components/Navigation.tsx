import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <div className="absolute top-6 left-6 flex space-x-2">
      <button className="flex items-center justify-center w-14 h-14 bg-white border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]">
        <ArrowLeft size={24} />
      </button>
      <button className="flex items-center justify-center w-14 h-14 bg-white border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]">
        <Home size={24} />
      </button>
    </div>
  );
};

export default Navigation;