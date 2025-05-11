function Widget() {
  return (
    <div className="ml-6 h-[790px]">
      <div className="bg-white border rounded-lg p-4 h-full">
        <h3 className="font-medium mb-4">LinkedIn Clone</h3>
        <p className="text-sm text-gray-600 mb-3">
          Welcome to your personalized LinkedIn Clone experience!
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Connect with friends, share updates, and explore new opportunities.
        </p>
        <div className="border-t pt-3 mt-2">
          <p className="text-xs text-gray-500">
            ©️ {new Date().getFullYear()} LinkedIn Clone
          </p>
        </div>
      </div>
    </div>
  );
}

export default Widget;
