import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hacker-hero.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden matrix-bg">
      {/* Matrix Rain Effect Background */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-primary text-xs animate-matrix-rain font-mono"
            style={{
              left: `${(i * 5) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + (i % 5)}s`,
            }}
          >
            {Array.from({ length: 20 }, () => 
              Math.random() > 0.5 ? '1' : '0'
            ).join('')}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-accent font-mono text-lg">
                <span className="animate-typing">$ whoami</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-bold">
                <span className="text-neon glitch" data-text="HACKER">
                  HACKER
                </span>
              </h1>
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot red"></div>
                  <div className="terminal-dot yellow"></div>
                  <div className="terminal-dot green"></div>
                  <span className="text-xs text-muted-foreground ml-2">bash</span>
                </div>
                <div className="p-6 space-y-2 text-sm">
                  <div className="text-accent">$ cat about.txt</div>
                  <div className="text-foreground">
                    Elite cybersecurity specialist & full-stack developer.
                    <br />
                    Penetration testing • Malware analysis • System architecture
                  </div>
                  <div className="text-primary">$ _</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/80 text-primary-foreground border-neon animate-neon-pulse font-mono"
              >
                View Projects
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-mono"
              >
                Contact Me
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg border-neon">
              <img
                src={heroImage}
                alt="Cyberpunk Hacker Portrait"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
            </div>
            {/* Floating Code Elements */}
            <div className="absolute -top-4 -right-4 text-primary/60 text-xs font-mono animate-pulse">
              {'{ "status": "online" }'}
            </div>
            <div className="absolute -bottom-4 -left-4 text-accent/60 text-xs font-mono animate-pulse">
              function hack() {'{ return true; }'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;