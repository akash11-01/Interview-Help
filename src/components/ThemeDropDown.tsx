import Select from "react-select";
import { customStyles } from "@/constants/customStyles";

// Simple theme options since monaco-themes might not be available
const themeOptions = [
  { label: "Cobalt", value: "cobalt" },
  { label: "VS Dark", value: "vs-dark" },
  { label: "Light", value: "light" },
  { label: "Oceanic Next", value: "oceanic-next" },
];

interface ThemeDropdownProps {
  handleThemeChange: (theme: any) => void;
  theme: any;
}

const ThemeDropdown = ({ handleThemeChange, theme }: ThemeDropdownProps) => {
  return (
    <Select
      placeholder={`Select Theme`}
      options={themeOptions}
      value={theme}
      styles={customStyles}
      onChange={handleThemeChange}
    />
  );
};

export default ThemeDropdown;
