import { useParams, Link } from "react-router-dom";
import { bedrockCommands } from "@/data/bedrockCommands";
import { ArrowLeft, Shield, Server, GraduationCap, Tag } from "lucide-react";

const CommandPage = () => {
  const { name } = useParams<{ name: string }>();
  const command = bedrockCommands.find((c) => c.name === name);

  if (!command) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl text-primary">Command not found</h1>
        <p className="text-muted-foreground">
          "/{name}" is not a recognized Bedrock Edition command.
        </p>
        <Link to="/" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to all commands
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-6">
        <div className="container max-w-4xl mx-auto px-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-3 w-3" /> mcbCode
          </Link>
          <h1 className="text-3xl md:text-5xl text-primary">/{command.name}</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Description */}
        <section>
          <p className="text-foreground text-base md:text-lg leading-relaxed">
            {command.description}
          </p>
          {command.details && (
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              {command.details}
            </p>
          )}
        </section>

        {/* Metadata badges */}
        <section className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">OP Level:</span>
            <span className="text-foreground">{command.opLevel}</span>
          </div>

          {command.aliases && command.aliases.length > 0 && (
            <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-2 text-sm">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Aliases:</span>
              <span className="text-foreground">
                {command.aliases.map((a) => `/${a}`).join(", ")}
              </span>
            </div>
          )}

          {command.serverOnly && (
            <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-2 text-sm">
              <Server className="h-4 w-4 text-secondary" />
              <span className="text-secondary">Server Only</span>
            </div>
          )}

          {command.bedrockOnly && (
            <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-2 text-sm">
              <span className="text-secondary">⛏ BE Only</span>
            </div>
          )}

          {command.eduOnly && (
            <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-2 text-sm">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-primary">Education Only</span>
            </div>
          )}
        </section>

        {/* Syntax */}
        <section>
          <h2 className="text-xl text-primary mb-4">Syntax</h2>
          <div className="bg-card border border-border rounded overflow-hidden">
            {command.syntax.map((s, i) => (
              <div
                key={i}
                className={`px-4 py-3 font-code text-sm ${
                  i !== command.syntax.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <SyntaxHighlight syntax={s} />
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-8 border-t border-border text-xs text-muted-foreground">
          Data from the{" "}
          <a
            href={`https://minecraft.wiki/w/Commands/${command.name}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Minecraft Wiki
          </a>
        </footer>
      </main>
    </div>
  );
};

const SyntaxHighlight = ({ syntax }: { syntax: string }) => {
  // Tokenize: command, angle brackets (required), square brackets (optional), pipes, keywords
  const tokens = syntax.split(/(<[^>]+>|\[[^\]]+\]|[|])/g);

  return (
    <span>
      {tokens.map((token, i) => {
        if (token.startsWith("<") && token.endsWith(">")) {
          return (
            <span key={i} className="text-secondary">
              {token}
            </span>
          );
        }
        if (token.startsWith("[") && token.endsWith("]")) {
          return (
            <span key={i} className="text-muted-foreground">
              {token}
            </span>
          );
        }
        if (token === "|") {
          return (
            <span key={i} className="text-primary">
              {token}
            </span>
          );
        }
        // Highlight the /command part
        if (token.startsWith("/")) {
          return (
            <span key={i} className="text-primary">
              {token}
            </span>
          );
        }
        return (
          <span key={i} className="text-foreground">
            {token}
          </span>
        );
      })}
    </span>
  );
};

export default CommandPage;
