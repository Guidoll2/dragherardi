import React from 'react';

export default function ConfirmationModal({ show, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <p className="text-lg text-gray-800 mb-6 text-center">{message}</p>
        <div className="flex justify-around gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-md hover:bg-gray-400 transition-colors duration-200 font-semibold"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}