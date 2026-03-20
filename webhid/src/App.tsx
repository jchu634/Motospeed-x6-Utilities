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

import { RgbColorPicker, HexColorInput } from "react-colorful"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { NumberField } from "@/components/ui/number-field"
import { Toggle } from "@/components/ui/toggle"
import MouseSVG from "@/components/mouse"
import { cn } from "@/lib/utils"

function HexToRGB(hex: string): { r: number; g: number; b: number } {
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}
function RGBToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function dataViewToHexString(view: DataView) {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(" ")
}
function dataViewToHex(view: DataView) {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  return bytes
}

function toLittleEndian16Arr(values: number[]): number[] {
  return values.flatMap((value) => {
    const v = Math.max(0, Math.min(0xffff, value)) // clamp to uint16
    return [v & 0xff, (v >> 8) & 0xff]
  })
}
function toLittleEndian16(value: number): number[] {
  const v = Math.max(0, Math.min(0xffff, value)) // clamp to uint16
  return [v & 0xff, (v >> 8) & 0xff]
}

export function App() {
  const devicesRef = useRef<HIDDevice[] | null>(null)
  const browserSupported =
    typeof navigator !== "undefined" && typeof navigator.hid !== "undefined"
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [colourMode, setColourMode] = useState("off")
  const [colour, setColour] = useState({ r: 50, g: 100, b: 150 }) //TODO Fetch current RGB
  const [dpi, setDpi] = useState([1, 2, 3, 4, 5]) //TODO Fetch actual DPI
  const [pollRate, setPollRate] = useState(1000) //TODO Fetch actual DPI
  const [selectedDpi, setSelectedDPI] = useState(0)
  const [liftOffLow, setLiftOffLow] = useState(true)
  const [esports, setEsports] = useState(false)
  const [sensorPerf, setSensorPerf] = useState([true, true, false]) //ripple, angle snap, motion sync
  const [scrollDirectionForward, setScrollDirectionForward] = useState(true)
  const [debounce, setDebounce] = useState(5)
  const [sleepTime, setSleepTime] = useState(1)

  const [error, setError] = useState<string | null>(null)

  async function getData(devices: HIDDevice[]) {
    const rootDevice = devices[0]

    try {
      await rootDevice.open()
      console.log(devices)

      const startInputCollector = (device: HIDDevice, timeoutMs = 2000) => {
        const pending: Array<{
          resolve: (event: HIDInputReportEvent) => void
          reject: (reason?: unknown) => void
          timeoutId: ReturnType<typeof setTimeout>
        }> = []

        const onInputReport = (event: HIDInputReportEvent) => {
          const next = pending.shift()
          if (!next) return
          clearTimeout(next.timeoutId)
          next.resolve(event)
        }

        device.addEventListener("inputreport", onInputReport as EventListener)

        const requestNext = () =>
          new Promise<HIDInputReportEvent>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              const idx = pending.findIndex((p) => p.resolve === resolve)
              if (idx >= 0) pending.splice(idx, 1)
              reject(new Error("Timed out waiting for input report"))
            }, timeoutMs)

            pending.push({ resolve, reject, timeoutId })
          })

        const stop = () => {
          device.removeEventListener(
            "inputreport",
            onInputReport as EventListener
          )
          while (pending.length) {
            const p = pending.shift()!
            clearTimeout(p.timeoutId)
            p.reject(new Error("Input collector stopped"))
          }
        }

        return { requestNext, stop }
      }

      const collector = startInputCollector(rootDevice, 2000)

      try {
        // DPI
        let sendData64 = new Uint8Array(60)
        sendData64[0] = 0x06
        const dpiPromise = collector.requestNext()
        await rootDevice.sendReport(0xb3, sendData64)
        const dpiReport = await dpiPromise

        const dpiData = dataViewToHex(dpiReport.data)
        const dpi: number[] = []
        for (let iter = 5; iter <= 13; iter += 2) {
          dpi.push(dpiData[iter] | (dpiData[iter + 1] << 8))
        }
        setDpi(dpi)
        setSelectedDPI(dpiData[4])
        setPollRate(dpiData[2] >> 4)

        // RGB: More Research Needed
        // sendData64 = new Uint8Array(60)
        // const rgbPromise = collector.requestNext()
        // await rootDevice.sendReport(0xb3, sendData64)
        // const rgbReport = await rgbPromise
        // console.log(rgbReport.reportId, rgbReport.data.toString())
        // console.log(dataViewToHexString(rgbReport.data))
      } finally {
        // manually remove listener after your startup config requests
        collector.stop()
      }
    } finally {
      if (rootDevice.opened) await rootDevice.close()
    }
  }

  const connectDevice = async () => {
    setError(null)
    try {
      const hidDevices = await navigator.hid.requestDevice({
        filters: [
          {
            vendorId: 0x0bda,
            productId: 0xffe0,
            usagePage: 65473,
          }, // Wireless
          {
            vendorId: 0x0bda,
            productId: 0xfff1,
            usagePage: 65473,
          }, // Wired
        ],
      })
      if (hidDevices == null || hidDevices.length === 0) {
        setError("No device was selected.")
        return
        // } else if (hidDevices.length != 5) {
        //   setError(`Expected 5 devices, but got ${hidDevices.length}.`)
      } else {
        console.log(hidDevices)
        devicesRef.current = hidDevices
        setDeviceConnected(true)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to device"
      )
    }
  }
  async function sendReport(
    device: HIDDevice,
    reportId: number,
    data: BufferSource
  ) {
    try {
      await device.open()
      console.log("Sending Report")
      await device.sendReport(reportId, data)
      console.log("Sent Report")
    } catch (err) {
      console.error(err)
    } finally {
      await device.close()
    }
  }
  function updateDPIValues(index: number, newValue: number | null = null) {
    const nextDpi =
      newValue != null
        ? dpi.map((item, i) => (i === index ? newValue : item))
        : dpi

    const nextSelectedDpi = newValue != null ? selectedDpi : index

    if (newValue != null) {
      setDpi(nextDpi)
    } else {
      setSelectedDPI(nextSelectedDpi)
    }

    const report = new Uint8Array(20) // Pad to 20 bytes
    const payload = [
      0x40,
      0xff,
      nextSelectedDpi & 0xff,
      0xff,
      ...toLittleEndian16Arr(nextDpi),
    ].slice(0, 20)
    report.set(payload)

    console.log("report bytes:", dataViewToHexString(report))
    if (devicesRef.current != null) {
      sendReport(devicesRef.current[0], 0xb5, report)
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
          </div>
          {!deviceConnected && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Button className="p-4 text-xl" onClick={connectDevice}>
                Connect Mouse
              </Button>
            </div>
          )}

          <div
            className={cn(
              "relative flex max-w-400 justify-between",
              deviceConnected ? "" : "pointer-events-none opacity-20"
            )}
          >
            <MouseSVG />
            <div className="space-y-4">
              <div className="flex h-fit space-x-4">
                <div className="space-y-4">
                  <Card className="flex h-fit w-100 flex-row items-center p-4">
                    <div className="flex w-full flex-col space-y-4">
                      <p>DPI Sensitivity</p>
                      <NumberField
                        step={100}
                        defaultValue={100}
                        value={dpi[selectedDpi]}
                        min={100}
                        max={26000}
                        snapOnStep={true}
                        onValueChange={(value) =>
                          updateDPIValues(selectedDpi, value || 100)
                        }
                      />

                      <Slider
                        value={dpi[selectedDpi]}
                        onValueChange={(value) =>
                          updateDPIValues(selectedDpi, value)
                        }
                        snapToMarks
                        showMarks
                        marks={[
                          100, 2000, 4000, 6000, 8000, 10000, 12000, 14000,
                          16000, 18000, 20000,

                          22000, 24000, 26000,
                        ]}
                        max={26000}
                        min={100}
                        step={100}
                        className="mx-auto w-full max-w-xs"
                      />
                    </div>
                    <ToggleGroup
                      multiple={false}
                      variant="outline"
                      orientation="vertical"
                      value={[selectedDpi.toString()]}
                      className="min-w-20 text-left"
                      onValueChange={(value) =>
                        updateDPIValues(parseInt(value[0]))
                      }
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
                  </Card>
                  <Card className="flex h-fit w-100 flex-col p-4">
                    <p>Polling Rate</p>
                    <ToggleGroup
                      multiple={false}
                      variant="outline"
                      spacing={2}
                      value={[pollRate.toString()]}
                      className="flex flex-col"
                      onValueChange={(value) => setPollRate(parseInt(value[0]))}
                    >
                      <div className="flex w-50 justify-between space-x-2">
                        <ToggleGroupItem
                          value={"0"}
                          aria-label="Toggle bold"
                          className="w-16 data-pressed:bg-primary"
                        >
                          125hz
                        </ToggleGroupItem>

                        <ToggleGroupItem
                          value={"1"}
                          aria-label="Toggle italic"
                          className="w-16 data-pressed:bg-primary"
                        >
                          500hz
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value={"2"}
                          aria-label="Toggle strikethrough"
                          className="w-16 data-pressed:bg-primary"
                        >
                          1000hz
                        </ToggleGroupItem>
                      </div>
                      <div className="flex w-50 justify-between space-x-2">
                        <ToggleGroupItem
                          value={"3"}
                          aria-label="Toggle strikethrough"
                          className="w-16 data-pressed:bg-primary"
                        >
                          2000hz
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value={"4"}
                          aria-label="Toggle strikethrough"
                          className="w-16 data-pressed:bg-primary"
                        >
                          4000hz
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value={"5"}
                          aria-label="Toggle strikethrough"
                          className="w-16 data-pressed:bg-primary"
                        >
                          8000hz
                        </ToggleGroupItem>
                      </div>
                    </ToggleGroup>
                  </Card>
                </div>
                <Card className="h-87 w-fit p-4">
                  <Button className="size-10">
                    <HugeiconsIcon icon={PaintBrush04Icon} className="size-6" />
                  </Button>
                  <ToggleGroup
                    multiple={false}
                    variant="outline"
                    // value={rgbModes}
                    defaultValue={[colourMode]}
                    onValueChange={(value) => setColourMode(value[0])}
                  >
                    <ToggleGroupItem
                      value="off"
                      aria-label="Toggle bold"
                      className="data-pressed:bg-primary"
                    >
                      <HugeiconsIcon
                        icon={LightbulbOffIcon}
                        className="size-6"
                      />
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
                      colourMode != "off"
                        ? ""
                        : "pointer-events-none opacity-40"
                    }
                    color={colour}
                    onChange={(colour) => {
                      setColour({ r: colour.r, g: colour.g, b: colour.b })
                      // sendReport(0xb3, [0x00])
                    }}
                  />
                  <HexColorInput
                    prefixed
                    color={RGBToHex(colour.r, colour.g, colour.b)}
                    onChange={(value) => {
                      setColour(HexToRGB(value))
                    }}
                  />
                </Card>
              </div>

              <Card className="h-fit w-full p-4">
                Settings
                <div className="flex w-60 items-center justify-between">
                  <p>Lift Off Distance</p>
                  <Toggle
                    pressed={liftOffLow}
                    variant="outline"
                    onPressedChange={(value) => setLiftOffLow(value)}
                    className="w-25 cursor-pointer hover:bg-primary"
                  >
                    {liftOffLow ? <>Low</> : <>High</>}
                  </Toggle>
                </div>
                <div className="flex w-60 items-center justify-between">
                  <p>Esports Mode</p>
                  <Toggle
                    pressed={esports}
                    variant="outline"
                    onPressedChange={(value) => setEsports(value)}
                    className="w-25 cursor-pointer hover:bg-primary"
                  >
                    {esports ? <>On</> : <>Off</>}
                  </Toggle>
                </div>
                <div className="flex w-60 items-center justify-between">
                  <p>Scroll Direction</p>
                  <Toggle
                    pressed={scrollDirectionForward}
                    variant="outline"
                    onPressedChange={(value) =>
                      setScrollDirectionForward(value)
                    }
                    className="w-25 cursor-pointer hover:bg-primary"
                  >
                    {scrollDirectionForward ? <>Forward</> : <>Backwards</>}
                  </Toggle>
                </div>
                <div className="flex w-118 items-center justify-between">
                  <p>Sensor Performance</p>
                  <div className="flex flex-row space-x-4">
                    <Toggle
                      pressed={sensorPerf[0]}
                      variant="outline"
                      onPressedChange={(value) =>
                        setSensorPerf((prev) =>
                          prev.map((item, i) => (i === 0 ? value : item))
                        )
                      }
                      className="w-25 cursor-pointer hover:bg-primary"
                    >
                      Ripple
                    </Toggle>
                    <Toggle
                      pressed={sensorPerf[1]}
                      variant="outline"
                      onPressedChange={(value) =>
                        setSensorPerf((prev) =>
                          prev.map((item, i) => (i === 1 ? value : item))
                        )
                      }
                      className="w-25 cursor-pointer hover:bg-primary"
                    >
                      Angle Snap
                    </Toggle>
                    <Toggle
                      pressed={sensorPerf[2]}
                      variant="outline"
                      onPressedChange={(value) =>
                        setSensorPerf((prev) =>
                          prev.map((item, i) => (i === 2 ? value : item))
                        )
                      }
                      className="w-25 cursor-pointer hover:bg-primary"
                    >
                      Motion Sync{" "}
                    </Toggle>
                  </div>
                </div>
                <div className="flex w-60 items-center justify-between">
                  <p>Debounce (ms)</p>
                  <NumberField
                    className="w-25"
                    value={debounce}
                    min={0}
                    max={20}
                    onValueChange={(value) => setDebounce(value || debounce)}
                  />
                </div>
                <div className="flex w-60 items-center justify-between">
                  <p>Sleep Time (mins)</p>
                  <NumberField
                    className="w-25"
                    value={sleepTime}
                    min={1}
                    max={60}
                    onValueChange={(value) => setSleepTime(value || sleepTime)}
                  />
                </div>
              </Card>
              <Card className="p-4">
                Macro Functionality Coming Soon... (Its a lot of work I don't
                wanna do.)
              </Card>
              <Button className="p-4 text-xl" onClick={connectDevice}>
                DEBUG CONNECT DEVICE
              </Button>
              <Button
                className="w-fit p-4 text-lg"
                onClick={() => sendReport(0xb3, [0x00])}
              >
                DEBUG SEND REPORT
              </Button>
              <Button
                className="w-fit p-4 text-lg"
                // @ts-expect-error 2345
                onClick={() => getData(devicesRef.current)}
              >
                DEBUG GET DPI
              </Button>
            </div>
          </div>
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
