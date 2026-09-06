import { Wordmark3D } from "./Wordmark3D";

export function ActI() {
  return (
    <section className="home-act home-act--center" style={{ height: "150vh" }}>
      <div className="home-act__sticky">
        <span className="eyebrow home-act__index">Act I — The Awakening</span>
        <Wordmark3D />
        <span className="home-act__scroll-cue">Scroll to descend</span>
      </div>
    </section>
  );
}
