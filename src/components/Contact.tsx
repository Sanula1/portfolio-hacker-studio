import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "hacker@elite.sec",
      href: "mailto:hacker@elite.sec"
    },
    {
      icon: Phone,
      label: "Signal",
      value: "+1 (555) HACK-NOW",
      href: "tel:+15554225669"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Cyberspace, Matrix",
      href: "#"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4">
              <span className="text-accent">Contact.sh</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <div className="terminal-window max-w-md mx-auto">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-muted-foreground ml-2">connection.log</span>
              </div>
              <div className="p-4 text-sm space-y-1">
                <div className="text-accent">$ ping elite.hacker</div>
                <div className="text-primary">PONG - Connection established</div>
                <div className="text-muted-foreground">Ready for secure transmission...</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot red"></div>
                  <div className="terminal-dot yellow"></div>
                  <div className="terminal-dot green"></div>
                  <span className="text-xs text-muted-foreground ml-2">contact-info.json</span>
                </div>
                <div className="p-6 space-y-6">
                  <div className="text-accent text-sm font-mono mb-4">$ cat contact-methods.json</div>
                  {contactMethods.map((method, idx) => {
                    const IconComponent = method.icon;
                    return (
                      <div key={idx} className="flex items-center space-x-4 group">
                        <div className="p-3 bg-primary/20 border border-primary/30 rounded">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {method.label.toUpperCase()}
                          </div>
                          <a
                            href={method.href}
                            className="text-foreground group-hover:text-neon transition-colors font-mono"
                          >
                            {method.value}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Terminal */}
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot red"></div>
                  <div className="terminal-dot yellow"></div>
                  <div className="terminal-dot green"></div>
                  <span className="text-xs text-muted-foreground ml-2">status.log</span>
                </div>
                <div className="p-6 space-y-2 text-sm">
                  <div className="text-accent">$ systemctl status hacker.service</div>
                  <div className="text-primary">● hacker.service - Elite Cybersecurity Specialist</div>
                  <div className="text-foreground ml-4">Loaded: loaded (/dev/brain)</div>
                  <div className="text-foreground ml-4">Active: <span className="text-primary">active (running)</span></div>
                  <div className="text-foreground ml-4">Uptime: 24/7/365</div>
                  <div className="text-muted-foreground ml-4">Available for hire & collaboration</div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-muted-foreground ml-2">secure-message.form</span>
              </div>
              <div className="p-6">
                <div className="text-accent text-sm font-mono mb-6">$ ./send-encrypted-message.sh</div>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      From: [REQUIRED]
                    </label>
                    <Input
                      placeholder="your.name@domain.com"
                      className="bg-muted border-primary/30 focus:border-primary font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      Subject: [OPTIONAL]
                    </label>
                    <Input
                      placeholder="Collaboration Opportunity"
                      className="bg-muted border-primary/30 focus:border-primary font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      Message: [ENCRYPTED]
                    </label>
                    <Textarea
                      placeholder="Your message will be encrypted with AES-256..."
                      rows={6}
                      className="bg-muted border-primary/30 focus:border-primary font-mono text-sm resize-none"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground border-neon animate-neon-pulse font-mono"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Execute Transmission
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;