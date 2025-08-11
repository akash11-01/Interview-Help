import { loader } from "@monaco-editor/react";

// Custom theme definitions to avoid external file loading issues
const customThemes: { [key: string]: any } = {
  "oceanic-next": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "65737E", fontStyle: "italic" },
      { token: "keyword", foreground: "C594C5" },
      { token: "string", foreground: "99C794" },
      { token: "number", foreground: "F99157" },
      { token: "type", foreground: "FAC863" },
      { token: "class", foreground: "FAC863" },
      { token: "function", foreground: "6699CC" },
      { token: "variable", foreground: "CDD3DE" },
    ],
    colors: {
      "editor.background": "#1B2B34",
      "editor.foreground": "#CDD3DE",
      "editorLineNumber.foreground": "#65737E",
      "editor.selectionBackground": "#4F5B66",
      "editor.lineHighlightBackground": "#343D46",
      "editorCursor.foreground": "#FFCC00",
      "editorWhitespace.foreground": "#65737E",
    },
  },
  cobalt: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "0088FF", fontStyle: "italic" },
      { token: "keyword", foreground: "FF9D00" },
      { token: "string", foreground: "A5FF90" },
      { token: "number", foreground: "FF628C" },
      { token: "type", foreground: "80FFBB" },
      { token: "class", foreground: "80FFBB" },
      { token: "function", foreground: "FFEE80" },
    ],
    colors: {
      "editor.background": "#002240",
      "editor.foreground": "#FFFFFF",
      "editorLineNumber.foreground": "#0088FF",
      "editor.selectionBackground": "#B36539",
      "editor.lineHighlightBackground": "#003F6B",
      "editorCursor.foreground": "#FFFFFF",
    },
  },
  monokai: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715E", fontStyle: "italic" },
      { token: "keyword", foreground: "F92672" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF" },
      { token: "class", foreground: "A6E22E" },
      { token: "function", foreground: "A6E22E" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editorLineNumber.foreground": "#75715E",
      "editor.selectionBackground": "#49483E",
      "editor.lineHighlightBackground": "#3E3D32",
      "editorCursor.foreground": "#F8F8F0",
    },
  },
};

const defineTheme = (theme: string): Promise<void> => {
  return new Promise((resolve) => {
    // Handle built-in themes
    const builtInThemes = ["vs", "vs-dark", "hc-black", "light", "dark"];

    if (builtInThemes.includes(theme)) {
      resolve();
      return;
    }

    // Initialize Monaco and define custom themes
    loader
      .init()
      .then((monaco) => {
        try {
          if (customThemes[theme]) {
            monaco.editor.defineTheme(theme, customThemes[theme]);
            console.log(`Successfully defined custom theme: ${theme}`);
          } else {
            console.warn(
              `Theme "${theme}" not available, falling back to vs-dark`
            );
          }
          resolve();
        } catch (error) {
          console.warn(`Could not define theme "${theme}":`, error);
          resolve();
        }
      })
      .catch((error) => {
        console.error(`Monaco initialization failed:`, error);
        resolve();
      });
  });
};

export { defineTheme };
