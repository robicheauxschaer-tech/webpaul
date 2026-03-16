const teamMembers = [
  {
    image: '/2.jpg',
    name: 'Matthew Swanson',
    role: 'CEO (American)',
    description: 'Investment AdvisorMatthew, an NYU Stern MBA graduate and Harvard resident physician, blends finance and technology expertise with an entrepreneurial mindset. At Adaptor Capital, he focused on public internet and software investments. A published researcher with multiple first-author works, he offers deep financial insights and emerging tech knowledge.'
  },
  {
    image: '/1.jpg',
    name: 'Richard Quan',
    role: 'CTO (American)',
    description: 'Richard has 20 years of development & operation experience in cybersecurity industry, including AI & Blockchain. He previously served as the Software Development Manager at Ixia, and once held an executive position in a core department of the SEC. Leading technical teams in Silicon Valley, China, and India, Ricardo has developed applications utilized by renowned global enterprises such as Wells Fargo bank, Nasdaq, AT&T, and financial companies.'
  },
  {
    image: '/3.jpg',
    name: 'Sara Ruiz Gutiérrez',
    role: 'CMO (ES)',
    description: 'With extensive experience in end-to-end sports event marketing, I have led the full-cycle marketing of multiple top-tier sports IPs. I specialize in developing sponsorship systems, creating cross-border collaborations for viral reach, and deploying omnimedia communication matrices.'
  },
  {
    image: '/4.jpg',
    name: 'Elva Mae',
    role: 'VP (American)',
    description: 'A graduate of the Wharton School, she brings 8 years of media experience spanning both traditional and new media. She built from scratch the city-level marketing campaign for the Harbin Ice and Snow World, which caused a sensation across Asia. She has incubated countless influencers and sparked numerous viral phenomena.'
  },
  {
    image: '/5.jpg',
    name: 'Emanuel Orlando',
    role: 'CLO (American)',
    description: 'Emanuel is an experienced corporate and securities attorney specializing in the industry of blockchain technology. His law firm is a first-mover in structuring and handling S.E.C.-compliant Token Sales both domestically and internationally. He is licensed to practice law in the state of California.'
  },
  {
    image: '/6.jpg',
    name: 'Kai López Ruiz',
    role: 'Head of Business Team (ES)',
    description: 'Led business operations for an NFT collection platform, collaborated with GameFi project parties to launch co-branded collections, and built a global multilingual community, which acquired over 150,000 members within three months and achieved a 92% sell-out rate for collections.'
  },
  {
    image: '/7.jpg',
    name: 'William George Taylor',
    role: 'Head of Investment & Finance Team (UK)',
    description: 'With 15 years of experience in investment banking and investment, he has worked at Morgan Stanley and Mumian Capital. In 2020, he founded his own fund and boutique investment bank, Gaoyuan Capital. He has participated in multiple financing rounds for companies including Meituan, Zhihu, Dada, and Pagoda.'
  },
  {
    image: '/8.jpg',
    name: 'Hu Xinyue',
    role: 'Head of Marketing Team (Singapore)',
    description: 'A veteran in the crypto space with 10 years of operational experience, she has been involved in the founding and operation of several high-profile projects. She also has extensive experience in building business school education and training systems. She has incubated numerous platforms and brands, and has organized over 1,000 offline conferences.'
  }
]

export default function Team() {
  return (
    <section id="coreteam">
      <div className="container">
        <h1 className="coreteam-title">CORE TEAM</h1>

        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img src={member.image} alt={member.name} className="member-image" />
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bottom-center-image">
          <img src="/rm.png" alt="RM Logo" />
        </div>
      </div>
    </section>
  )
}
