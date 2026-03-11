import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PaintBrush04Icon,
  LightbulbOffIcon,
  Idea01Icon,
  FastWindIcon,
  ArrowReloadHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { RgbColorPicker } from "react-colorful"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const rgbModes = ["off", "static", "breath", "cycle"]
export function App() {
  const devicesRef = useRef<HIDDevice[] | null>(null)
  const browserSupported =
    typeof navigator !== "undefined" && typeof navigator.hid !== "undefined"
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [colourMode, setColourMode] = useState("off")
  const [colour, setColour] = useState({ r: 50, g: 100, b: 150 })
  // TODO Remove once UI is complete
  // const [deviceConnected, setDeviceConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const connectDevice = async () => {
    setError(null)
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
      })
      if (hidDevices == null || hidDevices.length === 0) {
        setError("No device was selected.")
        return
      } else if (hidDevices.length != 5) {
        setError(`Expected 5 devices, but got ${hidDevices.length}.`)
      } else {
        devicesRef.current = hidDevices
        setDeviceConnected(true)
        console.log(devicesRef.current)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to device"
      )
    }
  }
  const sendReport = (reportId: number, data: number[]) => {
    if (devicesRef.current) {
      devicesRef.current[2].sendReport(reportId, new Uint8Array(data))
    }
  }

  return (
    <div className="flex min-h-svh p-6">
      {browserSupported ? (
        <div className="h-screen w-screen space-y-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-left text-4xl dark:text-white">
              X6 experimental webhid software
            </h1>
            <Button className="p-4 text-xl" onClick={connectDevice}>
              {"Connect Device"}
            </Button>
          </div>

          <Card className="h-fit p-4">
            <Button className="size-10">
              <HugeiconsIcon icon={PaintBrush04Icon} className="size-6" />
            </Button>
            <ToggleGroup
              multiple={false}
              variant="outline"
              // value={rgbModes}
              onValueChange={(value) => setColourMode(value[0])}
            >
              <ToggleGroupItem
                value="off"
                aria-label="Toggle bold"
                className="data-pressed:bg-primary"
              >
                <HugeiconsIcon icon={LightbulbOffIcon} className="size-6" />
              </ToggleGroupItem>

              <ToggleGroupItem
                value="static"
                aria-label="Toggle italic"
                className="data-pressed:bg-primary"
              >
                <HugeiconsIcon icon={Idea01Icon} className="size-6" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="breath"
                aria-label="Toggle strikethrough"
                className="data-pressed:bg-primary"
              >
                <HugeiconsIcon icon={FastWindIcon} className="size-6" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="cycle"
                aria-label="Toggle strikethrough"
                className="data-pressed:bg-primary"
              >
                <HugeiconsIcon
                  icon={ArrowReloadHorizontalIcon}
                  className="size-6"
                />
              </ToggleGroupItem>
            </ToggleGroup>

            <RgbColorPicker
              className={
                colourMode != "off" ? "" : "pointer-events-none opacity-40"
              }
              color={colour}
              onChange={(colour) => {
                setColour({ r: colour.r, g: colour.g, b: colour.b })
                // sendReport(0xb3, [0x00])
              }}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}
          </Card>
          <Button
            className="w-fit p-4 text-lg"
            onClick={() => sendReport(0xb3, [0x00])}
          >
            Send Report
          </Button>
        </div>
      ) : (
        <div>
          This browser does support the WebHID API, please switch to a Chromium
          based browser if you want to use this application.
        </div>
      )}
    </div>
  )
}

export default App
