// Who this app is: plain data, no kit code, so vite.config.ts can import it too (for the manifest and
// /seo.json). src/app.ts hands it to the kit; main.tsx imports that first.
import type { AppConfig } from "@tinymachines/kit/app";
import { THEMES } from "./theme";
// the app's words (the kit's lib/copy): English the source, Spanish and Japanese in full
import en from "./copy/en.json";
import es from "./copy/es.json";
import ja from "./copy/ja.json";

declare const __APP_VERSION__: string;
declare const __GIT_COMMIT__: string;
declare const __BUILD_DATE__: string;
const build = typeof __APP_VERSION__ === "string" ? { version: __APP_VERSION__, commit: __GIT_COMMIT__, date: __BUILD_DATE__ } : { version: "0.0.0", commit: "node", date: new Date().toISOString() };

export const APP: AppConfig = {
  name: "MAD Protocol",
  tagline: "pilot an eight-foot armored robot and hold the hill",
  site: "https://pixeldodge.com",
  prefix: "pixeldodge",
  yourFiles: "/files",
  logo: "/logo.svg",
  protocol: "web+pixeldodge",
  build,
  copy: { en, es, ja },
  // the app's own API (api/, pixeldodge-api.service), FastAPI on the kit's kitapi: the base routes; app.yaml says the same port
  api: { port: 8340 },
  theme: { default: "mad-steel", light: "mad-day", dark: "mad-steel", extra: THEMES },
  pages: [
    { path: "/", title: "MAD Protocol", card: "home", index: true, kicker: "the game",
      description: "MAD Protocol, a king-of-the-hill shooter in the browser: pilot an eight-foot armored robot with one AI squadmate and hold a pit in no-man's-land against human infantry. First side to 100 points wins." },
    { path: "/theme", title: "Themes", card: "theme", index: true, kicker: "theme", description: "Pick, build and share a theme, set the text size and the font. Every theme is checked for contrast before it can be kept." },
    { path: "/sensors", title: "Sensors", card: "plain", index: true, kicker: "sensors", description: "Everything your phone can sense that a web page may read, live. Nothing is recorded or sent." },
    { path: "/scan", title: "Scan a code", card: "plain", index: true, kicker: "scan", description: "Read a QR code with the camera or from a photo, on the phone, and see what it holds before anything opens." },
    { path: "/app", title: "This app", card: "plain", index: true, kicker: "app", description: "Install MAD Protocol on your phone or computer. It works offline." },
    { path: "/developers", title: "Use it from a program", card: "plain", index: true, kicker: "from a program",
      description: "An AI assistant (MCP), a script or a spreadsheet using MAD Protocol as you, with a token: how to get one, how to connect, and every endpoint of its API." },
    { path: "/account", title: "Your account", card: "plain", index: false, kicker: "account", description: "Sign in to MAD Protocol with a passkey: one account for every tinymachines app." },
    { path: "/files", title: "Your files", card: "plain", index: false, kicker: "files", description: "Your files: kept on this device and, signed in, in your account, so every device you sign in on has them." },
    { path: "/share", title: "Shared with MAD Protocol", card: "plain", index: false, kicker: "share", description: "What you have shared here from other apps. It lands in Your files." },
  ],
  // the game is a page of its own (site/, copied to /play/ by scripts/game.sh): a full load, never the app's shell
  outside: /^\/(api|play)(\/|$)/,
  notHere: "MAD Protocol, a king-of-the-hill shooter, and how to play it.",
  doors: [
    { id: "play", title: "Play", hint: "The game.", pages: [
      { href: "/", title: "Home", hint: "What the game is and how to play." },
      { href: "/play/index.html", title: "Play MAD Protocol", hint: "Opens the game, full screen." },
    ] },
    { id: "you", title: "You", hint: "Your account, your files, how the app looks, this device.", pages: [
      { href: "/account", title: "Your account", hint: "A passkey.", me: true },
      { href: "/files", title: "Your files", hint: "Kept here and in your account." },
      { href: "/theme", title: "Themes", hint: "Colours, text size, the reading font." },
      { href: "/sensors", title: "Sensors", hint: "Everything the phone can sense that a page may read." },
      { href: "/scan", title: "Scan a code", hint: "A QR code, with the camera or from a photo." },
      { href: "/share", title: "Shared with MAD Protocol", hint: "What other apps sent here." },
      { href: "/app", title: "This app", hint: "Install it, and it works offline." },
      { href: "/developers", title: "Use it from a program", hint: "An AI assistant or a script, with a token." },
    ] },
  ],
  shortcuts: [
    { id: "play", label: "Play", href: "/play/index.html" },
    { id: "theme", label: "Themes", href: "/theme" },
    { id: "app", label: "This app", href: "/app" },
    { id: "account", label: "Account", href: "/account" },
  ],
  defaultShortcuts: ["play", "theme"],
  frame: { header: { look: true } },
};
