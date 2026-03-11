import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "./components/ui/card";

function App() {
  const devicesRef = useRef<HIDDevice[] | null>(null);
  const [browserSupported, setBrowserSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator.hid != "undefined") {
      setBrowserSupported(true);
    }
    return () => {
      console.log("Component unmounted, cleaning up...");
    };
  }, []); // The empty dependency array [] is key

  const connectDevice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hidDevices = await navigator.hid.requestDevice({
        filters: [
          {
            vendorId: 0x0bda,
            productId: 0xffe0,
          }, // Wireless
          {
            vendorId: 0x0bda,
            productId: 0xfff1,
          }, // Wired
        ],
      });
      if (hidDevices == null || hidDevices.length === 0) {
        setError("No device was selected.");
        return;
      } else if (hidDevices.length != 5) {
        setError(`Expected 5 devices, but got ${hidDevices.length}.`);
      } else {
        devicesRef.current = hidDevices;
        console.log(devicesRef.current);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to device",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendReport = (reportId: number, data: number[]) => {
    if (devicesRef.current) {
      devicesRef.current[2].sendReport(reportId, new Uint8Array(data));
    }
  };

  return (
    <div className="p-10 bg-background">
      {browserSupported ? (
        <div className="space-y-4 w-screen h-screen">
          <Button onClick={() => sendReport(0xb3, [0x00])}>Send Report</Button>
          <Button variant="secondary">Secondary</Button>
          <Card>
            <Button onClick={() => sendReport(0xb3, [0x00])}>
              Send Report
            </Button>

            <Button variant="secondary">Secondary</Button>
          </Card>

          <Button
            variant={"outline"}
            className="font-bold"
            onClick={() => sendReport(0xb3, [0x00])}
          >
            Send Report
          </Button>

          <h1 className="text-left dark:text-white">
            X6 experimental webhid software
          </h1>
          <div className="card">
            {!devicesRef.current ? (
              <Button
                className="h-10 bg-white"
                onClick={connectDevice}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect Device"}
              </Button>
            ) : (
              <Button onClick={() => sendReport(0xb3, [0x00])}>
                Send Report
              </Button>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      ) : (
        <div>
          This browser does support the WebHID API, please switch to a Chromium
          based browser if you want to use this application.
        </div>
      )}
    </div>
  );
}

export default App;
