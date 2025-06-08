function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-800 mb-6">
      Error: {message}
    </div>
  );
}

export default ErrorMessage
