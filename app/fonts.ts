import localFont from "next/font/local";

export const futura = localFont({
  src: [
    {
      path: "./fonts/futura-book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/futura-book-italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/futura-medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/futura-medium-italic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/futura-bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/futura-bold-italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-futura-local",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const hessGothic = localFont({
  src: "./fonts/hess-gothic-round-bold.ttf",
  weight: "700",
  style: "normal",
  variable: "--font-hess-local",
  display: "swap",
  fallback: ["Arial Rounded MT Bold", "Arial", "sans-serif"],
  preload: false,
});

export const zingRust = localFont({
  src: "./fonts/zing-rust-base.otf",
  weight: "400",
  style: "normal",
  variable: "--font-zing-local",
  display: "swap",
  fallback: ["Georgia", "serif"],
  preload: false,
});
