
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StateGraph, END, type ChannelDefinition, type UpdateType } from "@langchain/langgraph";
import { awaitAllCallbacks } from "@langchain/core/callbacks/promises";

export const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// Define channel-based state structure
export interface WorkflowChannels extends ChannelDefinition {
  input: string;
  currentStep: string;
  output: string;
  context: Record<string, any>;
  error: string | undefined;
}

// Define public-facing state type
export type WorkflowState = WorkflowChannels;

export type WorkflowStep = {
  id: string;
  type: 'input' | 'process' | 'output';
  name: string;
  prompt?: string;
  next?: string;
  condition?: string;
  branches?: string[];
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'active' | 'draft' | 'archived';
  initialState?: Partial<Pick<WorkflowState, 'input' | 'context'>>;
};

// Create a basic chain with error handling
export const createBasicChain = (systemPrompt: string) => {
  const prompt = PromptTemplate.fromTemplate(`${systemPrompt}
    
    Human: {input}
    Assistant: Let me help you with that.`);

  return RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
  ]);
};

// Create a workflow graph using LangGraph
export const createWorkflowGraph = (workflow: Workflow) => {
  const graph = new StateGraph<WorkflowChannels>({
    channels: {
      input: workflow.initialState?.input || "",
      currentStep: workflow.steps[0]?.id || "",
      output: "",
      context: workflow.initialState?.context || {},
      error: undefined,
    },
  });

  // Add a single node that processes the current step
  graph.addNode("processStep", async (state: WorkflowState): Promise<UpdateType<WorkflowChannels>> => {
    const step = workflow.steps.find(s => s.id === state.currentStep);
    if (!step) {
      return { currentStep: END };
    }

    try {
      const chain = createBasicChain(step.prompt || "");
      const result = await chain.invoke({
        input: state.input,
        context: state.context,
      });

      return {
        output: result,
        currentStep: step.next || END,
      };
    } catch (error: any) {
      return {
        error: error.message,
        currentStep: END,
      };
    }
  });

  // Configure edges based on workflow steps
  workflow.steps.forEach((step) => {
    if (step.next) {
      graph.addEdge(step.id, "processStep");
    } else if (step.branches && step.condition) {
      graph.addConditionalEdges(
        step.id,
        async (state: WorkflowState) => {
          const chain = createBasicChain(step.condition!);
          try {
            await chain.invoke({
              input: state.output,
              context: state.context,
            });
            return step.branches![0]; // Success branch
          } catch {
            return step.branches![1] || END; // Failure branch or end
          }
        },
        step.branches
      );
    } else {
      graph.addEdge(step.id, END);
    }
  });

  graph.setEntryPoint(workflow.steps[0]?.id || "processStep");
  return graph.compile();
};

// Execute a workflow with state management
export const executeWorkflow = async (
  workflow: Workflow,
  input: string,
  context: Record<string, any> = {}
): Promise<WorkflowState> => {
  const graph = createWorkflowGraph(workflow);

  const initialState: WorkflowState = {
    input,
    currentStep: workflow.steps[0]?.id || "",
    output: "",
    context,
    error: undefined,
  };

  try {
    const result = await graph.invoke(initialState);
    await awaitAllCallbacks();
    
    return result;
  } catch (error: any) {
    await awaitAllCallbacks();
    return {
      input,
      currentStep: workflow.steps[0]?.id || "",
      output: "",
      context,
      error: error.message,
    };
  }
};
