import { useEffect } from "react";
import "./App.css";
import { listen } from "@tauri-apps/api/event";
import { FabricCircleFitter } from "@/components/fabric-circle-fitter";

function App() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+R on macOS or Ctrl+R on Windows/Linux
      if ((event.metaKey || event.ctrlKey) && event.key === "r") {
        event.preventDefault();
        // Reload the page
        window.location.reload();
      }
    };

    // Listen for refresh event from Rust backend
    const unlisten = listen("refresh", () => {
      window.location.reload();
    });

    // Add the keyboard event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unlisten.then((cleanup) => cleanup());
    };
  }, []);

  return (
    <main className="">
      <FabricCircleFitter />
    </main>
  );
}

export default App;
