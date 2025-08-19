import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Shield, Zap, Bug, Terminal } from "lucide-react";

const Projects = () => {
  const projects = [
    {
      title: "PenTest Suite",
      description: "Comprehensive penetration testing framework with automated vulnerability scanning",
      tech: ["Python", "Flask", "PostgreSQL", "Docker"],
      icon: Shield,
      status: "CLASSIFIED",
      github: "#",
      demo: "#"
    },
    {
      title: "Neural Exploit Detector",
      description: "AI-powered malware detection system using machine learning algorithms",
      tech: ["Python", "TensorFlow", "Kubernetes", "Redis"],
      icon: Zap,
      status: "ACTIVE",
      github: "#",
      demo: "#"
    },
    {
      title: "Cyber Command Center",
      description: "Real-time security monitoring dashboard with threat intelligence feeds",
      tech: ["React", "Node.js", "MongoDB", "WebSocket"],
      icon: Terminal,
      status: "DEPLOYED",
      github: "#",
      demo: "#"
    },
    {
      title: "Bug Bounty Hunter",
      description: "Automated bug discovery tool for web applications and APIs",
      tech: ["Go", "Docker", "Elasticsearch", "Grafana"],
      icon: Bug,
      status: "BETA",
      github: "#",
      demo: "#"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLASSIFIED": return "text-destructive";
      case "ACTIVE": return "text-primary";
      case "DEPLOYED": return "text-accent";
      case "BETA": return "text-cyber-purple";
      default: return "text-muted-foreground";
    }
  };

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4">
              <span className="text-neon">Projects.sys</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <div className="terminal-window max-w-md mx-auto">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-muted-foreground ml-2">portfolio.sh</span>
              </div>
              <div className="p-4 text-sm">
                <div className="text-accent">$ find ./projects -type f -name "*.elite"</div>
                <div className="text-muted-foreground">Scanning for elite projects...</div>
                <div className="text-primary">Found {projects.length} classified files</div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, idx) => {
              const IconComponent = project.icon;
              return (
                <Card key={idx} className="terminal-window border-primary/30 hover:border-primary transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded border border-primary/30">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-mono text-foreground group-hover:text-neon transition-colors">
                            {project.title}
                          </CardTitle>
                          <div className="text-xs font-mono mt-1">
                            <span className="text-muted-foreground">STATUS: </span>
                            <span className={`${getStatusColor(project.status)} font-bold`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-foreground">
                      {project.description}
                    </CardDescription>
                    
                    {/* Tech Stack */}
                    <div className="space-y-2">
                      <div className="text-accent text-sm font-mono">$ cat tech-stack.json</div>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, techIdx) => (
                          <span
                            key={techIdx}
                            className="px-2 py-1 bg-muted border border-accent/30 rounded text-xs font-mono text-accent"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-mono"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Source
                      </Button>
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/80 text-accent-foreground font-mono"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Deploy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;