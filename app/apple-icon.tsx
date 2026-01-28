import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 110,
        background: "#99b8a8",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        // Apple icons usually don't have transparency or rounded corners (OS does it),
        // but valid PNG is fine. Square is best for Apple auto-masking.
      }}
    >
      👶
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  );
}
