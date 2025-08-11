interface OutputDetailsProps {
  outputDetails: any;
}

const OutputDetails = ({ outputDetails }: OutputDetailsProps) => {
  // Function to get status color based on status
  const getStatusColor = (status: any) => {
    if (!status?.description) return "text-gray-900 bg-gray-100";

    const description = status.description.toLowerCase();

    if (description.includes("accepted") || status.id === 3) {
      return "text-green-800 bg-green-100 border border-green-200";
    } else if (
      description.includes("error") ||
      description.includes("wrong") ||
      description.includes("compilation") ||
      description.includes("runtime") ||
      status.id === 6 || // Compilation Error
      status.id === 5 || // Time Limit Exceeded
      status.id === 4 // Wrong Answer
    ) {
      return "text-red-800 bg-red-100 border border-red-200";
    } else if (
      description.includes("processing") ||
      status.id === 1 ||
      status.id === 2
    ) {
      return "text-yellow-800 bg-yellow-100 border border-yellow-200";
    }

    return "text-gray-900 bg-gray-100";
  };

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <h2 className="text-sm font-medium text-gray-700">Execution Details</h2>
      </div>
      <div className="p-4 pb-6">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span
              className={`text-sm font-semibold px-2 py-1 rounded ${getStatusColor(outputDetails?.status)}`}
            >
              {outputDetails?.status?.description || "Not executed"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Memory:</span>
            <span className="text-sm font-semibold text-gray-900 px-2 py-1 rounded bg-gray-100">
              {outputDetails?.memory || "N/A"} KB
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-gray-50 -mx-4 px-4 rounded-b-lg">
            <span className="text-sm font-medium text-gray-700">Time:</span>
            <span className="text-sm font-semibold text-gray-900 px-2 py-1 rounded bg-white border border-gray-200">
              {outputDetails?.time || "N/A"} sec
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputDetails;
