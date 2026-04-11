import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { bedrockCommands } from "@/data/bedrockCommands";
import { Search } from "lucide-react";

const Index = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bedrockCommands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl text-primary mb-2">
            mcbCode <span className="text-secondary">/</span> Command Vault
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Every Minecraft <span className="text-secondary">Bedrock Edition</span> command — indexed & detailed
          </p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid gap-2">
          {filtered.map((cmd) => (
            <Link
              key={cmd.name}
              to={`/c/${cmd.name}`}
              className="group flex items-baseline gap-3 px-4 py-3 rounded bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <span className="text-primary font-mcb shrink-0">/{cmd.name}</span>
              <span className="text-muted-foreground text-sm truncate">
                {cmd.description}
              </span>
              {cmd.bedrockOnly && (
                <span className="ml-auto text-xs bg-muted text-secondary px-2 py-0.5 rounded shrink-0">
                  BE only
                </span>
              )}
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              No commands found matching "<span className="text-primary">{search}</span>"
            </p>
          )}
        </div>

        <footer className="mt-12 py-6 border-t border-border text-center text-xs text-muted-foreground">
          Data sourced from the <a href="https://minecraft.wiki/w/Commands" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Minecraft Wiki</a>. Not affiliated with Mojang or Microsoft.
        </footer>
      </main>
    </div>
  );
};

export default Index;
