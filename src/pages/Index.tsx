
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold">Flowise</h1>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </header>

        <main className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            Build AI Workflows with{" "}
            <span className="text-primary">No-Code Tools</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create autonomous agents, connect LLMs with memory, and build powerful
            AI workflows using our visual builder.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-3">
                Agents & Assistants
              </h3>
              <p className="text-muted-foreground">
                Create autonomous agents that can use tools to execute different
                tasks.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-3">
                Workflow Builder
              </h3>
              <p className="text-muted-foreground">
                Visual workflow builder with nodes for LLM orchestration and
                integration.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-3">
                100+ Integrations
              </h3>
              <p className="text-muted-foreground">
                Connect with Langchain, LlamaIndex, and many more tools and
                platforms.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
