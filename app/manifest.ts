import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baby Beacon",
    short_name: "BabyBeacon",
    description: "Smart monitoring and health tracking for your little ones.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbf6",
    theme_color: "#99b8a8",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
