
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StateGraph, END } from "@langchain/langgraph";
import { awaitAllCallbacks } from "@langchain/core/callbacks/promises";

export const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

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
  type WorkflowConfig = {
    channels: {
      input: { value: string };
      currentStep: { value: string };
      output: { value: string };
      context: { value: Record<string, any> };
      error: { value: string | undefined };
    };
  };

  const graph = new StateGraph<WorkflowConfig>({
    channels: {
      input: { value: workflow.initialState?.input || "" },
      currentStep: { value: workflow.steps[0]?.id || "" },
      output: { value: "" },
      context: { value: {} },
      error: { value: undefined },
    },
  });

  // Add a single node that processes the current step
  graph.addNode("__start__", async (config) => {
    const step = workflow.steps.find(s => s.id === config.channels.currentStep.value);
    if (!step) return { channels: config.channels };

    try {
      const chain = createBasicChain(step.prompt || "");
      const result = await chain.invoke({
        input: config.channels.input.value,
        context: config.channels.context.value,
      });

      return {
        channels: {
          ...config.channels,
          output: { value: result },
        },
      };
    } catch (error: any) {
      return {
        channels: {
          ...config.channels,
          error: { value: error.message },
        },
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
        async (config) => {
          if (step.condition) {
            const chain = createBasicChain(step.condition);
            try {
              await chain.invoke({
                input: config.channels.output.value,
                context: config.channels.context.value,
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
) => {
  const graph = createWorkflowGraph(workflow);
  
  try {
    const result = await graph.invoke({
      channels: {
        input: { value: input },
        currentStep: { value: workflow.steps[0]?.id || "" },
        output: { value: "" },
        context: { value: context },
        error: { value: undefined },
      },
    });
    await awaitAllCallbacks();
    
    return {
      input,
      currentStep: workflow.steps[0]?.id || "",
      output: result.channels.output.value || "",
      context,
      error: result.channels.error.value,
    } as WorkflowState;
  } catch (error: any) {
    await awaitAllCallbacks();
    return {
      input,
      currentStep: workflow.steps[0]?.id || "",
      output: "",
      context,
      error: error.message,
    } as WorkflowState;
  }
};
