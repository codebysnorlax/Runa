import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block flex items-center justify-between">
        <span>{label}</span>
      </label>
      <input
        {...props}
        className={`w-full bg-transparent border border-dashed rounded-lg px-3 py-2 text-white text-sm font-medium focus:outline-none focus:ring-1 transition-all duration-200 placeholder-gray-600 ${
          error 
            ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500 hover:border-red-400' 
            : 'border-gray-700/50 focus:ring-brand-orange focus:border-brand-orange hover:border-gray-500'
        } ${className || ''}`}
      />
      {error && <p className="text-red-400 text-[10px] mt-1 font-semibold">{error}</p>}
    </div>
  );
};
