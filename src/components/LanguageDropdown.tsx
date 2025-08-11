import { languageOptions } from "@/constants";
import { customStyles } from "@/constants/customStyles";

import Select from "react-select";

interface LanguagesDropdownProps {
  onSelectChange: (language: any) => void;
}

const LanguagesDropdown = ({ onSelectChange }: LanguagesDropdownProps) => {
  return (
    <Select
      placeholder={`Filter By Category`}
      options={languageOptions}
      styles={customStyles}
      defaultValue={languageOptions[0]}
      onChange={(selectedOption) => onSelectChange(selectedOption)}
    />
  );
};

export default LanguagesDropdown;
