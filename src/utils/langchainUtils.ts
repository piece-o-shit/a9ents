
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StateGraph, END, type StateDefinition, ValueChannel } from "@langchain/langgraph";
import { awaitAllCallbacks } from "@langchain/core/callbacks/promises";

export const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// Define workflow channel types
export interface WorkflowStateChannels extends StateDefinition {
  input: ValueChannel<string>;
  currentStep: ValueChannel<string>;
  output: ValueChannel<string>;
  context: ValueChannel<Record<string, any>>;
  error: ValueChannel<string | undefined>;
}

// Define public-facing state type
export type WorkflowState = {
  input: string;
  currentStep: string;
  output: string;
  error?: string;
  context: Record<string, any>;
};

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
  initialState?: WorkflowState;
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
  const graph = new StateGraph<WorkflowStateChannels>({
    channels: {
      input: new ValueChannel(workflow.initialState?.input || ""),
      currentStep: new ValueChannel(workflow.steps[0]?.id || ""),
      output: new ValueChannel(""),
      context: new ValueChannel(workflow.initialState?.context || {}),
      error: new ValueChannel(undefined),
    },
  });

  // Add a single node that processes the current step
  graph.addNode("__start__", async (state) => {
    const step = workflow.steps.find(s => s.id === state.currentStep.value);
    if (!step) {
      return {
        currentStep: END,
      };
    }

    try {
      const chain = createBasicChain(step.prompt || "");
      const result = await chain.invoke({
        input: state.input.value,
        context: state.context.value,
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

  // Add conditional logic for step transitions
  workflow.steps.forEach((step) => {
    if (step.next) {
      graph.addEdge("__start__", "__start__");
    } else if (step.branches) {
      graph.addConditionalEdges(
        "__start__",
        async (state) => {
          if (step.condition) {
            const chain = createBasicChain(step.condition);
            try {
              await chain.invoke({
                input: state.output.value,
                context: state.context.value,
              });
              return "__start__";
            } catch {
              return END;
            }
          }
          return END;
        }
      );
    } else {
      graph.addEdge("__start__", END);
    }
  });

  graph.setEntryPoint("__start__");
  return graph.compile();
};

// Execute a workflow with state management
export const executeWorkflow = async (
  workflow: Workflow,
  input: string,
  context: Record<string, any> = {}
): Promise<WorkflowState> => {
  const graph = createWorkflowGraph(workflow);
  
  try {
    const initialState = {
      input: new ValueChannel(input),
      currentStep: new ValueChannel(workflow.steps[0]?.id || ""),
      output: new ValueChannel(""),
      context: new ValueChannel(context),
      error: new ValueChannel(undefined),
    };

    const result = await graph.invoke(initialState);
    await awaitAllCallbacks();
    
    return {
      input,
      currentStep: workflow.steps[0]?.id || "",
      output: result.output?.value || "",
      context,
      error: result.error?.value,
    };
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
