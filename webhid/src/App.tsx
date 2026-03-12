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
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export function App() {
  const devicesRef = useRef<HIDDevice[] | null>(null)
  const browserSupported =
    typeof navigator !== "undefined" && typeof navigator.hid !== "undefined"
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [colourMode, setColourMode] = useState("off")
  const [colour, setColour] = useState({ r: 50, g: 100, b: 150 }) //TODO Fetch current RGB
  const [dpi, setDpi] = useState([1, 2, 3, 4, 5]) //TODO Fetch actual DPI
  const [selectedDpi, setSelectedDPI] = useState(0)

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
  const updateDPI = (index: number, newValue: number) => {
    setDpi((prev) => prev.map((item, i) => (i === index ? newValue : item)))
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
          <Card className="flex h-fit w-100 flex-row items-center p-4">
            <ToggleGroup
              multiple={false}
              variant="outline"
              orientation="vertical"
              defaultValue={[selectedDpi.toString()]}
              className="min-w-20 text-left"
              onValueChange={(value) => setSelectedDPI(parseInt(value[0]))}
            >
              <ToggleGroupItem
                value={"0"}
                aria-label="Toggle bold"
                className="justify-start data-pressed:bg-primary"
              >
                1: {dpi[0]}
              </ToggleGroupItem>

              <ToggleGroupItem
                value={"1"}
                aria-label="Toggle italic"
                className="justify-start data-pressed:bg-primary"
              >
                2: {dpi[1]}
              </ToggleGroupItem>
              <ToggleGroupItem
                value={"2"}
                aria-label="Toggle strikethrough"
                className="justify-start data-pressed:bg-primary"
              >
                3: {dpi[2]}
              </ToggleGroupItem>
              <ToggleGroupItem
                value={"3"}
                aria-label="Toggle strikethrough"
                className="justify-start data-pressed:bg-primary"
              >
                4: {dpi[3]}
              </ToggleGroupItem>
              <ToggleGroupItem
                value={"4"}
                aria-label="Toggle strikethrough"
                className="justify-start data-pressed:bg-primary"
              >
                5: {dpi[4]}
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex w-full flex-col space-y-4">
              <p>{dpi[selectedDpi]}</p>
              <p>{dpi[selectedDpi]}</p>
              <Input></Input>

              <Slider
                value={dpi[selectedDpi]}
                onValueChange={(value) => updateDPI(selectedDpi, value)}
                snapToMarks
                showMarks
                marks={[
                  100, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000,
                  18000, 20000,

                  22000, 24000, 26000,
                ]}
                max={26000}
                min={100}
                step={100}
                className="mx-auto w-full max-w-xs"
              />
            </div>
          </Card>
          <Card className="h-fit w-fit p-4">
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
