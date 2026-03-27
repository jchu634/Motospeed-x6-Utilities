import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const FEATURES = {
  MOUSE: 0x01,
  MULTIMEDIA: 0x03,
  DPI: 0x05,
  RGB: 0x06,
  SYSTEM_SHORTCUT: 0x08,
  DISABLE: 0x09,
} as const

const MOUSE_CODES = {
  LEFT_CLICK: 0x010000,
  RIGHT_CLICK: 0x020000,
  MIDDLE_CLICK: 0x040000,
  DOUBLE_CLICK: 0x800000,
  FORWARD: 0x080000,
  BACKWARDS: 0x100000,
  SCROLL_UP: 0x000200,
  SCROLL_DOWN: 0x00fe00,
  SCROLL_LEFT: 0x0000fe,
  SCROLL_RIGHT: 0x000002,
} as const

const DPI_CODES = {
  LOOP: 0x010000,
  INCREASE: 0x020000,
  DECREASE: 0x030000,
} as const

const MULTIMEDIA_CODES = {
  VOLUME_UP: 0xe90000,
  VOLUME_DOWN: 0xea0000,
  MUTE: 0xe20000,
  PLAY_PAUSE: 0xcd0000,
  NEXT_TRACK: 0xb50000,
  PREVIOUS_TRACK: 0xb60000,
  STOP: 0xb70000,
  OPEN_PLAYER: 0x830100,
} as const

const SYSTEM_SHORTCUT_CODES = {
  SCREEN_BRIGHTNESS_UP: 0x0c6f00,
  SCREEN_BRIGHTNESS_DOWN: 0x0c7000,
  SWITCH_APPLICATION: 0x07042b,
  REFRESH: 0x07003e,
  CUT: 0x07011b,
  COPY: 0x070106,
  PASTE: 0x070119,
} as const

const RGB_CODES = {
  CHANGE_EFFECT: 0x010000,
  SPEED_SWITCH: 0x020000,
  COLOUR_SWITCH: 0x030000,
  BRIGHTNESS_UP: 0x040000,
  BRIGHTNESS_DOWN: 0x050000,
} as const

const DISABLE_CODE = 0x000000

type ButtonRemapDropdownProps = {
  keyId: number
  label: string
  className?: string
  remapKey: (Key: number, Feature: number, FeatureCode: number) => void
}

export function ButtonRemapDropdown({
  keyId,
  label,
  className,
  remapKey,
}: ButtonRemapDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className={className} />}>
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Mouse Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.LEFT_CLICK)
                }
              >
                Left-Click
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.RIGHT_CLICK)
                }
              >
                Right-Click
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.MIDDLE_CLICK)
                }
              >
                Middle-Click
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.DOUBLE_CLICK)
                }
              >
                Double Click
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.FORWARD)
                }
              >
                Mouse Forward
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.BACKWARDS)
                }
              >
                Mouse Backwards
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.SCROLL_UP)
                }
              >
                Scroll Up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.SCROLL_DOWN)
                }
              >
                Scroll Down
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.SCROLL_LEFT)
                }
              >
                Scroll Left
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MOUSE, MOUSE_CODES.SCROLL_RIGHT)
                }
              >
                Scroll Right
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>DPI Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => remapKey(keyId, FEATURES.DPI, DPI_CODES.LOOP)}
              >
                DPI Loop
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.DPI, DPI_CODES.INCREASE)
                }
              >
                DPI +
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.DPI, DPI_CODES.DECREASE)
                }
              >
                DPI -
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Multimedia Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.MULTIMEDIA,
                    MULTIMEDIA_CODES.VOLUME_UP
                  )
                }
              >
                Volume +
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.MULTIMEDIA,
                    MULTIMEDIA_CODES.VOLUME_DOWN
                  )
                }
              >
                Volume -
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MULTIMEDIA, MULTIMEDIA_CODES.MUTE)
                }
              >
                Mute
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.MULTIMEDIA,
                    MULTIMEDIA_CODES.PLAY_PAUSE
                  )
                }
              >
                Play/Pause
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.MULTIMEDIA,
                    MULTIMEDIA_CODES.NEXT_TRACK
                  )
                }
              >
                Next Track
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.MULTIMEDIA,
                    MULTIMEDIA_CODES.PREVIOUS_TRACK
                  )
                }
              >
                Previous Track
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.MULTIMEDIA, MULTIMEDIA_CODES.STOP)
                }
              >
                Stop
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.MULTIMEDIA,
                    MULTIMEDIA_CODES.OPEN_PLAYER
                  )
                }
              >
                Open Player
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            System Shortcut Options
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.SCREEN_BRIGHTNESS_UP
                  )
                }
              >
                Screen Brightness +
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.SCREEN_BRIGHTNESS_DOWN
                  )
                }
              >
                Screen Brightness -
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.SWITCH_APPLICATION
                  )
                }
              >
                Switch Application
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.REFRESH
                  )
                }
              >
                Refresh
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.CUT
                  )
                }
              >
                Cut
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.COPY
                  )
                }
              >
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(
                    keyId,
                    FEATURES.SYSTEM_SHORTCUT,
                    SYSTEM_SHORTCUT_CODES.PASTE
                  )
                }
              >
                Paste
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>RGB Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.RGB, RGB_CODES.CHANGE_EFFECT)
                }
              >
                Change Effect
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.RGB, RGB_CODES.SPEED_SWITCH)
                }
              >
                Speed Switch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.RGB, RGB_CODES.COLOUR_SWITCH)
                }
              >
                Colour Switch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.RGB, RGB_CODES.BRIGHTNESS_UP)
                }
              >
                Brightness +
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  remapKey(keyId, FEATURES.RGB, RGB_CODES.BRIGHTNESS_DOWN)
                }
              >
                Brightness -
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => remapKey(keyId, FEATURES.DISABLE, DISABLE_CODE)}
          >
            Disable
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
