import { useState, useEffect } from "react";
import "./App.css";

async function getHidDevice() {
  const device = await navigator.hid.requestDevice({ filters: [] });
  console.log(device);
  return device;
}

function App() {
  const [device, setDevice] = useState<HIDDevice[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectDevice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hidDevice = await getHidDevice();
      setDevice(hidDevice);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to device",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendReport = (reportId: number, data: number[]) => {
    if (device) {
      device[2].sendReport(reportId, new Uint8Array(data));
    }
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        {!device ? (
          <button onClick={connectDevice} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect Device"}
          </button>
        ) : (
          <button onClick={() => sendReport(0xb3, [0x00])}>Send Report</button>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
