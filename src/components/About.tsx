const About = () => {
  const skills = [
    { category: "Languages", items: ["Python", "JavaScript", "C++", "Rust", "Go"] },
    { category: "Security", items: ["Penetration Testing", "Malware Analysis", "OSINT", "Reverse Engineering"] },
    { category: "Frameworks", items: ["React", "Node.js", "Django", "FastAPI", "Docker"] },
    { category: "Tools", items: ["Metasploit", "Burp Suite", "Wireshark", "Nmap", "Ghidra"] }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4">
              <span className="text-cyber">About.exe</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Bio Terminal */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-muted-foreground ml-2">profile.sh</span>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="text-accent">$ cat profile.txt</div>
                <div className="space-y-3 text-foreground">
                  <p>
                    Elite cybersecurity professional with 5+ years of experience in 
                    penetration testing, vulnerability assessment, and malware analysis.
                  </p>
                  <p>
                    Specialized in full-stack development with expertise in building 
                    secure, scalable applications. Passionate about ethical hacking 
                    and helping organizations strengthen their security posture.
                  </p>
                  <p>
                    When not hunting bugs or writing code, I contribute to open-source 
                    security tools and mentor aspiring hackers in the community.
                  </p>
                </div>
                <div className="text-primary mt-4">$ _</div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="space-y-6">
              {skills.map((skillGroup, idx) => (
                <div key={idx} className="terminal-window">
                  <div className="terminal-header">
                    <div className="terminal-dot red"></div>
                    <div className="terminal-dot yellow"></div>
                    <div className="terminal-dot green"></div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {skillGroup.category.toLowerCase()}.json
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-accent text-sm mb-2 font-mono">
                      $ ls {skillGroup.category.toLowerCase()}/
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill, skillIdx) => (
                        <span
                          key={skillIdx}
                          className="px-3 py-1 bg-muted border border-primary/30 rounded text-xs font-mono text-foreground hover:border-primary hover:text-neon transition-colors cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;