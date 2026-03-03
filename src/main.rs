use rusb::{Context, UsbContext};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use tray_item::{IconSource, TrayItem};
enum Message {
    Quit,
    Green,
    Red,
    BatteryUpdate(i8),
}

// Include generated icon name static array
include!(concat!(env!("OUT_DIR"), "/icon_names.rs"));

const SET_REPORT_REQUEST_TYPE: u8 = 0x21; // host→device, class, interface
const SET_REPORT_REQUEST: u8 = 0x09;
const REPORT_TYPE_OUTPUT: u16 = 0x02;
const REPORT_ID: u8 = 0xB5;
const INTERFACE_NUMBER: u8 = 4;
// Interrupt IN endpoint for the battery response (EP5 IN)
const BATTERY_ENDPOINT: u8 = 0x85;
// Report ID in byte 0 of the battery HID payload
const BATTERY_REPORT_ID: u8 = 0xB4;
// Battery value offset within the raw HID payload (0x2F - 0x1B = 20)
const BATTERY_OFFSET: usize = 20;

const READ_TIMEOUT: Duration = Duration::from_millis(3000);
const POLL_TIMEOUT: Duration = Duration::from_mins(1);
const MAX_READ_ATTEMPTS: u8 = 3;

const VID: u16 = 0x0BDA;
const PID: u16 = 0xFFE0;

fn get_battery_level() -> Option<u8> {
    let context = match Context::new() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to create USB context: {}", e);
            return None;
        }
    };
    let device = match context.devices() {
        Ok(list) => list.iter().find(|d| {
            let desc = d.device_descriptor().unwrap();
            desc.vendor_id() == VID && desc.product_id() == PID
        }),
        Err(e) => {
            eprintln!("Failed to enumerate devices: {}", e);
            return None;
        }
    };

    let device = match device {
        Some(d) => d,
        None => {
            eprintln!("Device {:#06x}:{:#06x} not found", VID, PID);
            return None;
        }
    };

    // println!("Found device {:#06x}:{:#06x}", VID, PID);

    let handle = match device.open() {
        Ok(h) => h,
        Err(e) => {
            eprintln!("Failed to open device: {}", e);
            return None;
        }
    };

    /* Linux Specific
    if let Ok(true) = handle.kernel_driver_active(INTERFACE_NUMBER) {
        if let Err(e) = handle.detach_kernel_driver(INTERFACE_NUMBER) {
            eprintln!("Failed to detach kernel driver: {}", e);
            return;
        }
        println!("Detached kernel driver");
    }
    */

    if let Err(e) = handle.claim_interface(INTERFACE_NUMBER) {
        eprintln!("Failed to claim interface {}: {}", INTERFACE_NUMBER, e);
        return None;
    }

    let w_value: u16 = (REPORT_TYPE_OUTPUT << 8) | (REPORT_ID as u16);
    let report_data: [u8; 21] = {
        let mut r = [0u8; 21];
        r[0] = REPORT_ID;
        r[1] = 0x06;
        r
    };

    if let Err(e) = handle.write_control(
        SET_REPORT_REQUEST_TYPE,
        SET_REPORT_REQUEST,
        w_value,
        INTERFACE_NUMBER as u16,
        &report_data,
        READ_TIMEOUT,
    ) {
        eprintln!("SET_REPORT failed: {}", e);
        return None;
    }

    let mut buf = [0u8; 64];

    for attempt in 1..=MAX_READ_ATTEMPTS {
        match handle.read_interrupt(BATTERY_ENDPOINT, &mut buf, READ_TIMEOUT) {
            Ok(len) => {
                if buf[0] == BATTERY_REPORT_ID {
                    if len > BATTERY_OFFSET {
                        let battery = buf[BATTERY_OFFSET];
                        println!("Battery level: {}%", battery);
                        return Some(battery);
                    } else {
                        eprintln!("Battery report too short: {} bytes", len);
                    }
                }
            }
            Err(rusb::Error::Timeout) => {
                eprintln!("Attempt {}/{}: timed out", attempt, MAX_READ_ATTEMPTS);
            }
            Err(e) => {
                eprintln!("Read error: {}", e);
                break;
            }
        }
    }

    eprintln!("Failed to retrieve battery level.");

    if let Err(e) = handle.release_interface(INTERFACE_NUMBER) {
        eprintln!("Failed to release interface: {}", e);
    }
    return None;
}

fn main() {
    let mut tray = TrayItem::new("X6 Battery Util", IconSource::Resource("battery-00")).unwrap();

    tray.add_label("X6 Battery Utility").unwrap();

    let (tx, rx) = mpsc::sync_channel(1);

    let battery_tx = tx.clone();
    thread::spawn(move || {
        loop {
            let battery_level = get_battery_level()
                .map(|level| level as i8) // Convert u8 to i8
                .unwrap_or(-1); // Use -1 for disconnected

            if battery_tx
                .send(Message::BatteryUpdate(battery_level))
                .is_err()
            {
                break; // Main thread has closed
            }
            thread::sleep(POLL_TIMEOUT);
        }
    });

    let red_tx = tx.clone();
    tray.add_menu_item("Red", move || {
        red_tx.send(Message::Red).unwrap();
    })
    .unwrap();

    let green_tx = tx.clone();
    tray.add_menu_item("Green", move || {
        green_tx.send(Message::Green).unwrap();
    })
    .unwrap();

    tray.inner_mut().add_separator().unwrap();

    let quit_tx = tx.clone();
    tray.add_menu_item("Quit", move || {
        quit_tx.send(Message::Quit).unwrap();
    })
    .unwrap();

    loop {
        match rx.recv() {
            Ok(Message::Quit) => {
                println!("Quit");
                break;
            }
            Ok(Message::BatteryUpdate(level)) => {
                if level >= 0 {
                    let clamped = level.clamp(0, 99);

                    // --- When charging icon variants are ready ---
                    // let charging = is_charging();
                    // let icon_name = if charging {
                    //     format!("battery-{clamped:02}-charging")
                    // } else {
                    //     format!("battery-{clamped:02}")
                    // };

                    let icon_name = format!("battery-{clamped:02}");

                    // Can replace this with a lookup if needed once the icon set is final.
                    tray.set_icon(IconSource::Resource(Box::leak(icon_name.into_boxed_str())))
                        .unwrap();
                } else {
                    // Assume that the device is not connected
                    tray.set_icon(IconSource::Resource("battery-none")).unwrap();
                }
            }
            _ => {}
        }
    }
}
