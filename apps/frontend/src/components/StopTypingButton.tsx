import React from 'react'

function StopTypingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed bottom-[calc(100vh-380px)] right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition z-50 cursor-pointer"
      onClick={onClick}
    >
      Stop Typing
    </button>
  );
}

export default StopTypingButton
