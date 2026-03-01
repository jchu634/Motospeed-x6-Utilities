fn main() {
    const SET_REPORT_REQUEST_TYPE: u8 = 0x21; // host→device, class, interface
    const SET_REPORT_REQUEST: u8 = 0x09;
    const REPORT_TYPE_OUTPUT: u8 = 0x02;
    const REPORT_ID: u8 = 0xB5;
    const INTERFACE_NUMBER: u8 = 4;
    const REPORT_DATA: [u8; 21] = {
        let mut r = [0u8; 21];
        r[0] = REPORT_ID;
        r[1] = 0x06;
        r
    };
    // Interrupt IN endpoint for the battery response (EP5 IN)
    const BATTERY_ENDPOINT: u8 = 0x85;
    // Report ID in byte 0 of the battery HID payload
    const BATTERY_REPORT_ID: u8 = 0xB4;
    // Battery value offset within the raw HID payload (0x2F - 0x1B = 20)
    const BATTERY_OFFSET: u8 = 20;

    const READ_LENGTH: u8 = 64;
    const READ_TIMEOUT_MS: u16 = 3000;
    const MAX_READ_ATTEMPTS: u8 = 20;

    const VID: u16 = 0x0BDA;
    const PID: u16 = 0xFFE0;

    // let device = rusb::

    for device in rusb::devices().unwrap().iter() {
        let device_desc = device.device_descriptor().unwrap();

        println!(
            "Bus {:03} Device {:03} ID {:04x}:{:04x}",
            device.bus_number(),
            device.address(),
            device_desc.vendor_id(),
            device_desc.product_id()
        );
    }
}
