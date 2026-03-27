use std::fs::File;
use std::io::Write;
use std::path::Path;

fn write_variant_entries(
    rc_file: &mut File,
    rs_file: &mut File,
    variant: &str,
) -> std::io::Result<()> {
    let levels: Vec<u8> = (0..=99).collect();

    // 202 total icons per variant:
    // (00–99) + (00–99 charging) + 2 (none, plugged)
    writeln!(
        rs_file,
        "pub const ICON_NAMES_{}: [&str; {}] = [",
        variant.to_uppercase(),
        (levels.len() * 2 + 2)
    )?;

    for i in &levels {
        let base = format!("battery-{i:02}");
        let base_chg = format!("{base}-charging");

        // Prefix resource identifiers by variant so all names are unique
        let res_base = format!("{variant}-{base}");
        let res_base_chg = format!("{variant}-{base_chg}");

        let icon_path = format!("icons/{variant}/{base}.ico");
        let icon_path_chg = format!("icons/{variant}/{base_chg}.ico");

        writeln!(rc_file, "{res_base} ICON \"{icon_path}\"")?;
        writeln!(rs_file, "    \"{res_base}\",")?;

        writeln!(rc_file, "{res_base_chg} ICON \"{icon_path_chg}\"")?;
        writeln!(rs_file, "    \"{res_base_chg}\",")?;
    }

    let res_none = format!("{variant}-battery-none");
    let res_plugged = format!("{variant}-battery-plugged");

    writeln!(
        rc_file,
        "{res_none} ICON \"icons/{variant}/battery-none.ico\""
    )?;
    writeln!(
        rc_file,
        "{res_plugged} ICON \"icons/{variant}/battery-plugged.ico\""
    )?;

    writeln!(rs_file, "    \"{res_none}\",")?;
    writeln!(rs_file, "    \"{res_plugged}\",")?;
    writeln!(rs_file, "];")?;
    writeln!(rs_file)?;

    Ok(())
}

fn main() {
    let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR is not set");
    let out_dir = Path::new(&out_dir);

    let rc_path = out_dir.join("tray-icons.rc");
    let rs_path = out_dir.join("icon_names.rs");

    let mut rc_file = File::create(&rc_path)
        .unwrap_or_else(|e| panic!("Failed to create {}: {}", rc_path.display(), e));
    let mut rs_file = File::create(&rs_path)
        .unwrap_or_else(|e| panic!("Failed to create {}: {}", rs_path.display(), e));

    write_variant_entries(&mut rc_file, &mut rs_file, "bg")
        .expect("Failed writing bg variant icon entries");
    write_variant_entries(&mut rc_file, &mut rs_file, "nobg")
        .expect("Failed writing nobg variant icon entries");

    // Primary application icon (resource id 1) used by Windows for the executable icon.
    writeln!(rc_file, "1 ICON \"icons/icon.ico\"").expect("Failed writing primary app icon entry");

    // Compile and embed a single RC file containing both variants.
    embed_resource::compile(rc_path, embed_resource::NONE);
}
