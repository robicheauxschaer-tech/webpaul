export default function Roadmap() {
  return (
    <section id="roadmap">
      <div className="container">
        <h1 className="roadmap-title">ROADMAP</h1>

        <div className="roadmap-container">
          <div className="roadmap-image left-image">
            <img src="/left.jpg" alt="Paul Octopus Left" />
          </div>

          <div className="roadmap-box">
            <div className="roadmap-content">
              <div className="phase-item">
                <span className="phase-title">Phase 1: Ignite the World with Memes for the 2026 World Cup</span>
              </div>
              <div className="phase-item">
                <span className="phase-title">Phase 2: Command the On-Chain Sports Prediction Empire</span>
              </div>
              <div className="phase-item">
                <span className="phase-title">Phase 3: Launch a New Era of On-Chain Entertainment Empire</span>
              </div>
            </div>
          </div>

          <div className="roadmap-image right-image">
            <img src="/right.jpg" alt="Paul Octopus Right" />
          </div>
        </div>

        <div className="bottom-center-image">
          <img src="/rm.png" alt="RM Logo" />
        </div>
      </div>
    </section>
  )
}
