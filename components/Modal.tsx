import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
          <p className="text-gray-300">{children}</p>
        </div>
        <div className="bg-gray-800 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
