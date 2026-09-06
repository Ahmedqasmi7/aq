import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 30%, #0E1411 0%, #050505 60%, #000000 100%)",
          color: "#F5F4F0",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 84,
            height: 84,
            border: "1px solid #C5A059",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <span style={{ fontFamily: "Georgia, serif", fontSize: 44, color: "#C5A059" }}>V</span>
        </div>
        <div style={{ display: "flex", fontFamily: "Georgia, serif", fontSize: 84, letterSpacing: 18 }}>
          VELARIO
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 22,
            letterSpacing: 6,
            color: "#C5A059",
            textTransform: "uppercase",
          }}
        >
          The Architecture of Scent
        </div>
      </div>
    ),
    { ...size }
  );
}
