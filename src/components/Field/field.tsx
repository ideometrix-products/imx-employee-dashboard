import React, { ReactNode } from 'react';

const Field = ({
  children,
  label,
  htmlFor,
  error,
  isDisabled,
  isRequired = true,
  errorSpace = true,
}: {
  children: ReactNode;
  label: string;
  htmlFor: string;
  error?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  errorSpace?: boolean;
}) => {
  const isInvalid = !!error?.length;

  return (
    <div className={`${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label htmlFor={htmlFor} className="uppercase block mb-1">
        <div className="flex gap-1">
          <span className="capitalize text-[14px] font-medium text-[#07090D]">
            {label}
          </span>
          {isRequired && (
            <span className="text-red-500 text-[14px] leading-[20px]">*</span>
          )}
        </div>
      </label>

      {children}

      {errorSpace ? (
        <div className="h-[20px]">
          {isInvalid && (
            <p className="text-red-500 text-[11px] mt-1">{error}</p>
          )}
        </div>
      ) : (
        isInvalid && <p className="text-red-500 text-[11px] mt-1">{error}</p>
      )}
    </div>
  );
};

export default Field;
