"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; label?: string };
type State = { hasError: boolean };

/**
 * Wraps every WebGL <Canvas> on the site. If a context is lost or a
 * shader/geometry throws, this swaps in an animated (never static) gradient
 * field so the section still reads as alive rather than broken.
 */
export class CanvasBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[velario:canvas]", this.props.label ?? "canvas", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="velario-canvas-fallback" role="img" aria-label={this.props.label ?? "VELARIO ambient scene"}>
          <style jsx>{`
            .velario-canvas-fallback {
              position: absolute;
              inset: 0;
              background: radial-gradient(
                circle at 50% 40%,
                var(--color-forest),
                var(--color-obsidian) 70%
              );
              overflow: hidden;
            }
            .velario-canvas-fallback::before {
              content: "";
              position: absolute;
              inset: -20%;
              background: radial-gradient(circle, rgba(197, 160, 89, 0.18), transparent 60%);
              animation: velario-drift 12s ease-in-out infinite alternate;
            }
            @keyframes velario-drift {
              from {
                transform: translate(-6%, -4%) scale(1);
              }
              to {
                transform: translate(6%, 4%) scale(1.15);
              }
            }
          `}</style>
        </div>
      );
    }
    return this.props.children;
  }
}
