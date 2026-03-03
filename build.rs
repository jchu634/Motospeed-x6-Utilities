use std::fs::File;
use std::io::Write;
use std::path::Path;

fn main() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let rc_path = Path::new(&out_dir).join("tray-icons.rc");
    let rs_path = Path::new(&out_dir).join("icon_names.rs");

    let mut rc_file = File::create(&rc_path).expect("Failed to create tray-icons.rc");
    let mut rs_file = File::create(&rs_path).expect("Failed to create icon_names.rs");

    // Battery Levels 00–99
    let levels: Vec<u8> = (0..=99).collect();

    // 100 Total icons: (00–99) + 1 ("none")
    writeln!(
        rs_file,
        "pub const ICON_NAMES: [&str; {}] = [",
        levels.len() + 1 /* none */
    )
    .unwrap();

    for i in &levels {
        let base = format!("battery-{i:02}");
        let icon_path = format!("icons/{base}.ico");

        // Write into resource file
        writeln!(rc_file, "{base} ICON \"{icon_path}\"").unwrap();

        // Write to Rust const array
        writeln!(rs_file, "    \"{base}\",").unwrap();

        // --- Charging variant (to be added soon) ---
        // let base_chg = format!("{base}-charging");
        // let icon_path_chg = format!("icons/{base}-charging.ico");
        // writeln!(rc_file, "{base_chg} ICON \"{icon_path_chg}\"").unwrap();
        // writeln!(rs_file, "    \"{base_chg}\",").unwrap();
    }

    writeln!(rc_file, "battery-none ICON \"icons/battery-none.ico\"").unwrap();
    writeln!(rs_file, "    \"battery-none\",").unwrap();

    writeln!(rs_file, "];").unwrap();

    // Compile and embed all resources
    embed_resource::compile(rc_path, embed_resource::NONE);
}
