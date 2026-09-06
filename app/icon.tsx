import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          border: "2px solid #C5A059",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 34,
            color: "#C5A059",
          }}
        >
          V
        </span>
      </div>
    ),
    { ...size }
  );
}
