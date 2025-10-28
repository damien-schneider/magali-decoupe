// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Emitter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn refresh_app(window: tauri::Window) -> Result<(), String> {
    window.emit("refresh", ()).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, refresh_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
