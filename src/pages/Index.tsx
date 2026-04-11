import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { bedrockCommands } from "@/data/bedrockCommands";
import { Search, Filter, X } from "lucide-react";

const opLevels = ["0", "1", "2", "3", "4"];
const tags = [
  { key: "hasAliases", label: "Has Aliases" },
  { key: "bedrockOnly", label: "BE Only" },
  { key: "eduOnly", label: "Edu Only" },
  { key: "serverOnly", label: "Server Only" },
] as const;

type TagKey = (typeof tags)[number]["key"];

const Index = () => {
  const [search, setSearch] = useState("");
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<TagKey>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggleTag = (key: TagKey) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const activeFilterCount =
    (selectedOp ? 1 : 0) + selectedTags.size;

  const clearFilters = () => {
    setSelectedOp(null);
    setSelectedTags(new Set());
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bedrockCommands.filter((cmd) => {
      if (q && !cmd.name.toLowerCase().includes(q) && !cmd.description.toLowerCase().includes(q)) return false;
      if (selectedOp && String(cmd.opLevel) !== selectedOp) return false;
      if (selectedTags.has("hasAliases") && (!cmd.aliases || cmd.aliases.length === 0)) return false;
      if (selectedTags.has("bedrockOnly") && !cmd.bedrockOnly) return false;
      if (selectedTags.has("eduOnly") && !cmd.eduOnly) return false;
      if (selectedTags.has("serverOnly") && !cmd.serverOnly) return false;
      return true;
    });
  }, [search, selectedOp, selectedTags]);

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
        {/* Search + filter toggle */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground font-mcb">Filters</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            {/* OP Level */}
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">OP Level</span>
              <div className="flex flex-wrap gap-2">
                {opLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedOp(selectedOp === level ? null : level)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      selectedOp === level
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => toggleTag(tag.key)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      selectedTags.has(tag.key)
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} command{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid gap-2">
          {filtered.map((cmd) => (
            <Link
              key={cmd.name}
              to={`/c/${cmd.name}`}
              className="group flex items-baseline gap-3 px-4 py-3 rounded bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <span className="text-primary font-mc shrink-0">{cmd.name}</span>
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
              No commands found matching your criteria.
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
