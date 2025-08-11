import { classnames } from "../utils/general";

interface CustomInputProps {
  customInput: string;
  setCustomInput: (input: string) => void;
}

const CustomInput = ({ customInput, setCustomInput }: CustomInputProps) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">
        Custom Input
      </label>
      <textarea
        rows={4}
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Enter custom input for your program here...`}
        className={classnames(
          "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
        )}
      />
    </div>
  );
};

export default CustomInput;
