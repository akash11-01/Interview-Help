import { useUserRole } from "../hooks/useUserRole";
import { SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";

function DasboardBtn() {
  const { isCandidate, isLoading } = useUserRole();

  if (isCandidate || isLoading) return null;

  return (
    <Link to={"/dashboard"}>
      <button className="flex items-center cursor-pointer gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-md transition-all duration-200 shadow-sm hover:shadow-md border border-emerald-500/20">
        <SparklesIcon className="size-4" />
        <span>Dashboard</span>
      </button>
    </Link>
  );
}
export default DasboardBtn;
