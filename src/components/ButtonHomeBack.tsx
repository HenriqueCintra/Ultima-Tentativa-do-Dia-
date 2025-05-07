import { ReactNode } from 'react';

interface ButtonHomeBackProps {
    onClick: () => void;
    children: ReactNode;  
}
/// <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-md items-center justify-center  flex text-black" ><div className="justify-self-center"><ArrowLeft size={25} /></div></button>
export const ButtonHomeBack = ({ 
  onClick, 
  children
}: ButtonHomeBackProps) => {
  return (
    <button 
      onClick={onClick}
      type="button"
      className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-black"
      aria-label="Voltar para página anterior"
    >
        <div className="justify-self-center"> 
            {children}
        </div>
    </button>
  );
};