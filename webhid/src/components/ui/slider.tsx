import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

type SliderProps = Omit<
  SliderPrimitive.Root.Props,
  "value" | "defaultValue" | "onValueChange"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  marks?: number[]
  showMarks?: boolean
  snapToMarks?: boolean
  snapThreshold?: number // distance in slider units (e.g. DPI)
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  marks,
  showMarks = true,
  snapToMarks = true,
  snapThreshold,
  onValueChange,
  ...props
}: SliderProps) {
  const normalizedMarks = React.useMemo(() => {
    const source = marks?.length ? marks : [min, max]
    return [...new Set(source)]
      .filter((m) => Number.isFinite(m) && m >= min && m <= max)
      .sort((a, b) => a - b)
  }, [marks, min, max])

  const effectiveSnapThreshold = React.useMemo(() => {
    if (typeof snapThreshold === "number") return snapThreshold
    const step = typeof props.step === "number" ? props.step : 1
    return step * 2
  }, [snapThreshold, props.step])

  const maybeSnapValue = React.useCallback(
    (v: number) => {
      if (!snapToMarks || normalizedMarks.length === 0) return v

      const nearest = normalizedMarks.reduce((closest, current) =>
        Math.abs(current - v) < Math.abs(closest - v) ? current : closest
      )

      return Math.abs(nearest - v) <= effectiveSnapThreshold ? nearest : v
    },
    [snapToMarks, normalizedMarks, effectiveSnapThreshold]
  )

  const handleValueChange = React.useCallback(
    (next: number | number[]) => {
      const raw = Array.isArray(next) ? next[0] : next
      onValueChange?.(maybeSnapValue(raw))
    },
    [onValueChange, maybeSnapValue]
  )

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      value={value !== undefined ? [value] : undefined}
      defaultValue={defaultValue !== undefined ? [defaultValue] : undefined}
      min={min}
      max={max}
      thumbAlignment="edge"
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-none bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
          {showMarks &&
            normalizedMarks.map((mark) => {
              const pct = ((mark - min) / (max - min)) * 100
              return (
                <span
                  key={mark}
                  aria-hidden="true"
                  className="absolute block size-1 rounded-none bg-accent-foreground"
                  style={{
                    left: `calc(${pct}% - 4px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              )
            })}
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="relative block size-3 shrink-0 rounded-none border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-1 focus-visible:ring-1 focus-visible:outline-hidden active:ring-1 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
