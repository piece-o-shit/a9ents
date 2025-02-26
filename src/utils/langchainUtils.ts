
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StateGraph, END } from "@langchain/langgraph";
import { RunnableLike } from "@langchain/core/runnables";

export const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// Enhanced workflow types to support LangGraph
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
  condition?: string; // Condition for branching
  branches?: string[]; // Possible next steps
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
  const graph = new StateGraph<WorkflowState>({
    channels: {
      input: {},
      currentStep: {},
      output: {},
      context: {},
    },
  });

  // Add nodes for each step
  workflow.steps.forEach((step) => {
    graph.addNode(step.id, async (state: WorkflowState) => {
      try {
        const chain = createBasicChain(step.prompt || "");
        const result = await chain.invoke({
          input: state.input,
          context: state.context,
        });

        return {
          ...state,
          output: result,
          currentStep: step.id,
        };
      } catch (error: any) {
        return {
          ...state,
          error: error.message,
          currentStep: step.id,
        };
      }
    });
  });

  // Add edges between steps
  workflow.steps.forEach((step) => {
    if (step.next) {
      // Simple linear flow
      graph.addEdge(step.id, step.next);
    } else if (step.branches) {
      // Conditional branching
      graph.addConditionalEdges(
        step.id,
        async (state: WorkflowState) => {
          // Evaluate condition and return next step
          const condition = step.condition || "";
          const chain = createBasicChain(condition);
          const result = await chain.invoke({
            input: state.output,
            context: state.context,
          });
          
          // Find matching branch or return END
          return step.branches?.includes(result) ? result : END;
        }
      );
    } else {
      // End of workflow
      graph.addEdge(step.id, END);
    }
  });

  return graph.compile();
};

// Execute a workflow with state management
export const executeWorkflow = async (
  workflow: Workflow,
  input: string,
  context: Record<string, any> = {}
) => {
  const graph = createWorkflowGraph(workflow);
  
  const initialState: WorkflowState = {
    input,
    currentStep: workflow.steps[0]?.id || "",
    output: "",
    context,
  };

  const result = await graph.invoke(initialState);
  return result;
};
