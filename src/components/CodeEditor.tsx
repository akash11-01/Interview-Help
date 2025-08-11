import {
  // ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";

import Landing from "./Landing";

function CodeEditor() {
  return (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[calc-100vh-4rem-1px]"
    >
      {/* CODE EDITOR */}
      <ResizablePanel defaultSize={60} maxSize={100}>
        <Landing />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
export default CodeEditor;
