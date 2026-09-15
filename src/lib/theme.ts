export type ThemeChoice = "system" | "light" | "dark";
export const THEME_STORAGE_KEY = "eafc.theme";

/** Runs in <head> before paint so a saved theme never flashes. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
