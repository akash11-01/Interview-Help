import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

interface CodeEditorWindowProps {
  onChange: (key: string, value: string) => void;
  language?: string;
  code?: string;
  theme?: string;
}

const CodeEditorWindow = ({
  onChange,
  language = "javascript",
  code = "",
  theme = "vs-dark",
}: CodeEditorWindowProps) => {
  const [value, setValue] = useState<string>(code || "");

  // Update local value when code prop changes
  useEffect(() => {
    setValue(code || "");
  }, [code]);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || "";
    setValue(newValue);
    onChange("code", newValue);
  };

  // Handle keyboard shortcuts to prevent copy, cut, paste
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A
    if (
      e.ctrlKey &&
      (e.key === "c" || e.key === "x" || e.key === "v" || e.key === "a")
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Prevent F12, Ctrl+Shift+I, Ctrl+U
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Prevent drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="w-full h-full select-none"
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ userSelect: "none" }}
    >
      <Editor
        height="100%"
        width="100%"
        language={language || "javascript"}
        value={value}
        theme={theme}
        defaultValue="// start writing your code here"
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          wordWrap: "on",
          wrappingIndent: "indent",
          renderLineHighlight: "line",
          selectOnLineNumbers: true,
          // Monaco Editor specific options to disable copy/paste
          contextmenu: false, // Disable right-click context menu
          links: false, // Disable clickable links
          selectionHighlight: false, // Disable selection highlighting
          occurrencesHighlight: "off", // Disable occurrence highlighting
          copyWithSyntaxHighlighting: false, // Disable copying with syntax highlighting
          // Disable various editor actions
          readOnly: false, // Keep editing enabled, but restrict clipboard operations
        }}
      />
    </div>
  );
};
export default CodeEditorWindow;
