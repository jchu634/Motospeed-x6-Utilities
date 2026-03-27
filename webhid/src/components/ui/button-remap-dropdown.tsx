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
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x010000)}>
                Left-Click
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x020000)}>
                Right-Click
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x040000)}>
                Middle-Click
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x800000)}>
                Double Click
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x080000)}>
                Mouse Forward
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x100000)}>
                Mouse Backwards
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x000200)}>
                Scroll Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x00fe00)}>
                Scroll Down
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x0000fe)}>
                Scroll Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x01, 0x000002)}>
                Scroll Right
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>DPI Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x05, 0x010000)}>
                DPI Loop
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x05, 0x020000)}>
                DPI +
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x05, 0x030000)}>
                DPI -
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Multimedia Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xe90000)}>
                Volume +
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xea0000)}>
                Volume -
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xe20000)}>
                Mute
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xcd0000)}>
                Play/Pause
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xb50000)}>
                Next Track
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xb60000)}>
                Previous Track
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0xb70000)}>
                Stop
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x03, 0x830100)}>
                Open Player
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>System Shortcut Options</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x0c6f00)}>
                Screen Brightness +
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x0c7000)}>
                Screen Brightness -
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x07042b)}>
                Switch Application
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x07003e)}>
                Refresh
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x07011b)}>
                Cut
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x070106)}>
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x08, 0x070119)}>
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
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x06, 0x010000)}>
                Change Effect
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x06, 0x020000)}>
                Speed Switch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x06, 0x030000)}>
                Colour Switch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x06, 0x040000)}>
                Brightness +
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => remapKey(keyId, 0x06, 0x050000)}>
                Brightness -
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => remapKey(keyId, 0x09, 0x000000)}>
            Disable
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
