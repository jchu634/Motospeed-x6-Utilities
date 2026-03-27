#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use notify_rust::Notification;
use rusb::{Context, UsbContext};
use std::fs;
use std::str::FromStr;
use std::sync::{Arc, Mutex, mpsc};
use std::thread;
use std::time::Duration;
use tray_item::{IconSource, TrayItem};

#[cfg(target_os = "windows")]
use windows_registry::CURRENT_USER;

// AUMID (Application User Model Id)
const APP_ID: &str = "jchu634.x6batteryutils";

// display name
const APP_NAME: &str = "X6 Battery Utility";

// Include generated icon name static arrays
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
const MAX_READ_ATTEMPTS: u8 = 3;

const VID: u16 = 0x0BDA;
const PID: [u16; 2] = [0xFFE0, 0xFFF1];
const PLUGGED_PID: [u16; 1] = [0xFFF1];

#[derive(Copy, Clone, PartialEq, Eq, Debug)]
enum IconVariant {
    Bg,
    NoBg,
}
impl FromStr for IconVariant {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.trim().to_ascii_lowercase().as_str() {
            "bg" => Ok(IconVariant::Bg),
            "nobg" | "no_bg" | "no-bg" => Ok(IconVariant::NoBg),
            other => Err(format!("invalid icon variant: {}", other)),
        }
    }
}

/// Gets Battery level from mouse
///
/// Return Values
/// 0-100    Standard battery Level
/// 128-228  Charging battery Level (Charge value is offset by 128)
/// -1       Device not detected
/// -2       Device is plugged in (Charge value is not reported properly)
fn get_battery_level() -> i16 {
    let context = match Context::new() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to create USB context: {}", e);
            return -1;
        }
    };

    let device = match context.devices() {
        Ok(list) => list.iter().find(|d| {
            let desc = d.device_descriptor().unwrap();
            desc.vendor_id() == VID && PID.contains(&desc.product_id())
        }),
        Err(e) => {
            eprintln!("Failed to enumerate devices: {}", e);
            return -1;
        }
    };

    let device = match device {
        Some(d) => d,
        None => {
            eprintln!("Device not found");
            return -1;
        }
    };

    // Plugged in devices will not return the correct battery level
    if PLUGGED_PID.contains(&device.device_descriptor().unwrap().product_id()) {
        return -2;
    }

    let handle = match device.open() {
        Ok(h) => h,
        Err(e) => {
            eprintln!("Failed to open device: {}", e);
            return -1;
        }
    };

    #[cfg(target_os = "linux")]
    if let Ok(true) = handle.kernel_driver_active(INTERFACE_NUMBER) {
        if let Err(e) = handle.detach_kernel_driver(INTERFACE_NUMBER) {
            eprintln!("Failed to detach kernel driver: {}", e);
            return -1;
        }
        println!("Detached kernel driver");
    }

    if let Err(e) = handle.claim_interface(INTERFACE_NUMBER) {
        eprintln!("Failed to claim interface {}: {}", INTERFACE_NUMBER, e);
        return -1;
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
        let _ = handle.release_interface(INTERFACE_NUMBER);
        return -1;
    }

    let mut buf = [0u8; 64];
    for attempt in 1..=MAX_READ_ATTEMPTS {
        match handle.read_interrupt(BATTERY_ENDPOINT, &mut buf, READ_TIMEOUT) {
            Ok(len) => {
                if buf[0] == BATTERY_REPORT_ID {
                    if len > BATTERY_OFFSET {
                        let battery = buf[BATTERY_OFFSET] as i16;
                        let _ = handle.release_interface(INTERFACE_NUMBER);

                        println!("Battery level: {}%", battery);
                        return battery;
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
    let _ = handle.release_interface(INTERFACE_NUMBER);
    return -1;
}

#[derive(Debug)]
struct Config {
    duration: Duration,
    variant: IconVariant,
    battery_warning_level: i16,
}

fn read_config() -> Config {
    let mut config = Config {
        duration: Duration::from_secs(60),
        variant: IconVariant::Bg,
        battery_warning_level: 10,
    };

    let contents = match fs::read_to_string("config.txt") {
        Ok(c) => c,
        Err(_) => return config,
    };

    // Example file line: `polltimeout = 120`
    for line in contents.lines() {
        let line = line.trim();

        if line.starts_with('#') || line.is_empty() {
            continue; // skip comments and blank lines
        }

        if let Some(v) = line.strip_prefix("polltimeout =") {
            if let Ok(secs) = v.trim().parse::<u64>() {
                config.duration = Duration::from_secs(secs);
            }
        }
        if let Some(v) = line.strip_prefix("variant =") {
            if let Ok(variant) = v.trim().parse::<IconVariant>() {
                config.variant = variant;
            }
        }
        if let Some(v) = line.strip_prefix("battery_warning_level =") {
            if let Ok(battery_level) = v.trim().parse::<i16>() {
                config.battery_warning_level = battery_level;
            }
        }
    }

    return config;
}

enum Message {
    Quit,
    BatteryUpdate(i16),
}

fn icon_names_for_variant(variant: IconVariant) -> &'static [&'static str] {
    match variant {
        IconVariant::Bg => &ICON_NAMES_BG,
        IconVariant::NoBg => &ICON_NAMES_NOBG,
    }
}

fn fallback_none_icon(variant: IconVariant) -> &'static str {
    match variant {
        IconVariant::Bg => "bg-battery-none",
        IconVariant::NoBg => "nobg-battery-none",
    }
}

fn icon_for_level(level: i16, variant: IconVariant) -> &'static str {
    match level {
        -2 => match variant {
            IconVariant::Bg => "bg-battery-plugged",
            IconVariant::NoBg => "nobg-battery-plugged",
        },
        -1 => fallback_none_icon(variant),
        0..=228 => {
            let charging = level >= 128;
            let clamped = if charging {
                (level - 128).clamp(0, 99)
            } else {
                level.clamp(0, 99)
            };

            let idx = clamped as usize * 2 + if charging { 1 } else { 0 };
            icon_names_for_variant(variant)
                .get(idx)
                .copied()
                .unwrap_or(fallback_none_icon(variant))
        }
        _ => fallback_none_icon(variant),
    }
}

#[cfg(target_os = "windows")]
fn init_registry() -> windows_registry::Result<()> {
    let icon_path = std::env::current_exe()?
        .parent()
        .expect("executable path should have a parent")
        .join("resources")
        .join("icon.png");

    let key = CURRENT_USER.create(format!(r"SOFTWARE\Classes\AppUserModelId\{APP_ID}"))?;
    key.set_string("DisplayName", APP_NAME)?;
    key.set_string("IconBackgroundColor", "0")?;
    key.set_hstring("IconUri", &icon_path.as_path().into())
}

fn main() {
    let config = read_config();
    let poll_timeout = config.duration;
    let battery_warning_level = config.battery_warning_level;
    let icon_variant = Arc::new(Mutex::new(config.variant));

    #[cfg(target_os = "windows")]
    let _ = init_registry();

    let initial_icon = {
        let icon = *icon_variant.lock().unwrap();
        match icon {
            IconVariant::Bg => "bg-battery-00",
            IconVariant::NoBg => "nobg-battery-00",
        }
    };
    let mut has_battery_warning_played = false;

    let mut tray = TrayItem::new("X6 Battery Util", IconSource::Resource(initial_icon)).unwrap();

    tray.add_label("X6 Battery Utility").unwrap();

    let (tx, rx) = mpsc::sync_channel(1);

    let battery_tx = tx.clone();
    thread::spawn(move || {
        loop {
            let battery_level = get_battery_level();

            if battery_tx
                .send(Message::BatteryUpdate(battery_level))
                .is_err()
            {
                break; // Main thread has closed
            }
            thread::sleep(poll_timeout);
        }
    });

    let battery_manual_tx = tx.clone();
    tray.add_menu_item("Refresh", move || {
        let battery_level = get_battery_level();
        let _ = battery_manual_tx.send(Message::BatteryUpdate(battery_level));
    })
    .unwrap();

    let variant_change = tx.clone();
    let icon_variant_menu = Arc::clone(&icon_variant);

    tray.add_menu_item("Change Icon Background", move || {
        let mut icon = icon_variant_menu.lock().unwrap();

        if *icon == IconVariant::Bg {
            *icon = IconVariant::NoBg;
        } else {
            *icon = IconVariant::Bg;
        }

        drop(icon);
        let battery_level = get_battery_level();
        let _ = variant_change.send(Message::BatteryUpdate(battery_level));
    })
    .unwrap();

    tray.inner_mut().add_separator().unwrap();

    let quit_tx = tx.clone();
    tray.add_menu_item("Quit", move || {
        let _ = quit_tx.send(Message::Quit);
    })
    .unwrap();

    let mut tooltip_text = String::from("Initializing...");
    tray.inner_mut()
        .set_tooltip(&tooltip_text)
        .expect("Failed to set tray tooltip after initialization");

    loop {
        match rx.recv() {
            Ok(Message::Quit) => break,

            Ok(Message::BatteryUpdate(level)) => {
                let variant = {
                    let icon = icon_variant.lock().unwrap();
                    *icon
                };
                let icon = icon_for_level(level, variant);
                tray.set_icon(IconSource::Resource(icon)).unwrap();

                if level <= battery_warning_level && has_battery_warning_played == false {
                    #[cfg(target_os = "windows")]
                    let _ = Notification::new()
                        .summary("X6 Battery is Low")
                        .app_id(APP_ID)
                        .body(
                            format!(r"Your mouse's battery is less than {battery_warning_level}%")
                                .as_str(),
                        )
                        .show();
                    #[cfg(not(target_os = "windows"))]
                    let _ = Notification::new()
                        .summary("X6 Battery is Low")
                        .body(
                            format!(r"Your mouse's battery is less than {battery_warning_level}%")
                                .as_str(),
                        )
                        .show();
                    has_battery_warning_played = true;
                } else {
                    has_battery_warning_played = false;
                }

                tooltip_text.clear();
                match level {
                    -2 => tooltip_text.push_str("Device plugged in"),
                    -1 => tooltip_text.push_str("No device detected"),
                    0..=228 => {
                        use std::fmt::Write as _;
                        let shown = if level >= 128 { level - 128 } else { level };
                        let _ = write!(tooltip_text, "Battery: {}%", shown.clamp(0, 99));
                    }
                    _ => tooltip_text.push_str("Unknown battery state"),
                }

                tray.inner_mut().set_tooltip(tooltip_text.as_str()).unwrap();
            }
            Err(_) => break,
        }
    }
}
