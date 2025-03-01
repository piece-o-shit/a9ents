import * as React from "react";
import { Plus, Database, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

export const NewAgentDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [temperature, setTemperature] = React.useState([0.7]);

  const llmOptions = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "claude-2", label: "Claude 2" },
    { value: "claude-instant", label: "Claude Instant" },
    { value: "palm", label: "PaLM" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New agent</DialogTitle>
          <DialogDescription>
            Let us know the job to be done for this agent, and we'll generate it for you!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Textarea 
            placeholder="AI task selector and API handling: Experience in handling JSON, XML, CSV, and HTML formats with appropriate parsing.
- **Database Management**: Familiarity with SQL and NoSQL databases (e.g., MySQL, MongoDB) for data storage and retrieval." 
            className="min-h-[150px]"
          />
          
          <div className="space-y-2">
            <Label htmlFor="example">(Optional) Provide an example output of this job</Label>
            <Textarea 
              id="example"
              placeholder="performance_metrics: {\n  \"total_execution_time_seconds\": 8.5,\n  \"average_retrieval_time_per_page\": 3.0,\n  \"requests_per_second\": 0.24,\n  \"cache_hits\": 1\n}" 
              className="min-h-[120px] font-mono text-sm"
            />
          </div>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="ai-provider">AI Provider</Label>
                <Select>
                  <SelectTrigger id="ai-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google AI</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="llm">Language Model</Label>
                <Select>
                  <SelectTrigger id="llm">
                    <SelectValue placeholder="Select a language model" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" className="max-h-[200px]">
                    {llmOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Temperature: {temperature}</Label>
                </div>
                <Slider 
                  id="temperature"
                  min={0} 
                  max={1} 
                  step={0.1} 
                  value={temperature}
                  onValueChange={setTemperature}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};