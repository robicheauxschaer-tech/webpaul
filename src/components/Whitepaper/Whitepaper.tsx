export default function Whitepaper() {
  const handleDownload = () => {
    window.open('/whitepaper.pdf', '_blank')
  }

  return (
    <section id="whitepaper">
      <div className="container">
        <div className="whitepaper-content">
          <h2 className="whitepaper-title">Whitepaper</h2>
          <img
            src="/whit.png"
            alt="Whitepaper Cover"
            className="whitepaper-logo"
            onClick={handleDownload}
          />
          <div className="whitepaper-text">
            <p>
              Discover the vision behind $PAUL - the cryptocurrency inspired by the legendary oracle octopus.
              Our whitepaper outlines the tokenomics, roadmap, and future plans for the Paul ecosystem.
            </p>
            <p>
              Click the image above to read our comprehensive whitepaper and learn how Paul is set to
              revolutionize the crypto prediction market.
            </p>
            <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="btn">
              Download Whitepaper
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
