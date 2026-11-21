# SAP Functional and Technical Design Document Generation

## 1. How the FD and TD Agents Work

The Functional Design (FD) and Technical Design (TD) agent solution is a multi-agent AI solution built using GenWizard AI Agent Manager to automate the SAP design document generation workflow.

1. **Input:** Users upload business requirements documents (BRDs), SAP technical specifications, or source code, along with client-specific templates.
2. **Processing:** Specialized AI agents extract requirements, interpret templates, retrieve relevant context through Q++ vector search, and generate structured FD/TD content.
3. **Validation:** A reviewer agent checks document completeness, formatting, and alignment with the provided requirements.
4. **Output:** The system produces downloadable, client-specific functional design or technical design documents.

## 2. How the Solution Is Developed

The solution uses the following components:

- **LLMs (Claude and OpenAI models):** Support requirement interpretation and content generation.
- **GenWizard AI Agent Manager:** Creates specialized utility agents and orchestrates their execution.
- **Python tools:** Handle document processing, API integration, and workflow execution.
- **Q++ vector search:** Retrieves relevant reference information.
- **Prompt engineering:** Defines section-specific generation instructions and validation constraints.
- **Interface integration:** Allows users to initiate workflows and retrieve generated documents through a conversational interface.

> **Term to verify:** The voice note referred to the last component as “CI/CD integration,” while describing a conversational interface. Confirm the intended integration name before using it in an interview.

## 3. Short Explanation of the Overall Solution

I worked on an agentic AI solution that automates SAP functional and technical design document generation. The solution used multiple specialized agents for requirement analysis, template interpretation, context retrieval, document generation, and validation. It was developed using GenWizard AI Agent Manager, LLMs, Python tools, and prompt engineering to reduce manual documentation effort.

## 4. My Actual Contribution: Prompt Engineering

My contribution was specifically prompt engineering for individual agents. My resume and interview explanation should highlight prompt design, optimization, and output accuracy. They should not claim that I developed the overall solution, implemented orchestration, or built the Python tools.

### Option 1: Technical Resume Version (Recommended)

**Project: SAP FD and TD Document Generation Using Agentic AI**

- Engineered and optimized LLM prompts for specialized AI agents to automate SAP functional and technical design document generation.
- Designed role-specific prompts, structured instructions, and output constraints to support accurate requirement interpretation and adherence to client-specific templates.
- Refined prompts through iterative testing to improve document consistency, completeness, and alignment with SAP business requirements.

### Option 2: Concise Resume Version

- Developed agent-specific prompts for automated SAP FD and TD document generation using GenAI.
- Applied prompt engineering techniques to improve requirement analysis and structured content generation.
- Optimized prompts through iterative refinement to enhance output accuracy and template compliance.

### Option 3: Interview Explanation

My primary contribution was prompt engineering for a multi-agent SAP document generation solution. I designed and refined system prompts for individual agents, defining their responsibilities, input handling, processing instructions, and expected outputs. I also worked on improving prompt accuracy and ensuring that the generated documents followed business requirements and client-specific templates.

## 5. Three-Month Experience Story: Planning Notes

Build the experience explanation around the FTTD assignment as the major project, covering:

- What I learned during onboarding and knowledge transfer (KT).
- The business problem the FTTD project addressed.
- How the multi-agent solution was developed.
- My personal contribution through prompt engineering.
- How I tested and refined prompts.

Keep project details separate from the suggested interview narrative so the explanation stays credible.

**Date clarification:** The note identifies August 17 as the joining date and describes activities through November 2026. The opening date range was incomplete, and the timeline also mentioned August 13. Confirm the exact start and end dates before presenting this as a factual experience record.

### Proposed Timeline — Adjust to Actual Activities

This is a suggested structure, not a verified record of monthly activity.

- **August 17–31, 2026 — Onboarding:** Understood the project environment, GenAI concepts, and development processes.
- **September 2026 — Training and KT:** Learned about GenWizard Agent Manager, Agentic Core, utility agents, supervisors, tools, and orchestration.
- **October 2026 — FTTD project:** Understood business requirements, agent workflows, and client templates; developed agent-specific prompts.
- **November 2026 — Prompt refinement:** Focused on prompt testing, output validation, template compliance, and iterative improvement.

## 6. Project Details Described in the Voice Note

The following records the project description from the voice note. References to a project guide have not been independently verified against that guide. FD/FDD and TD/TDD refer here to functional design and technical design documents; FTTD is retained as the assignment name.

### Business Problem and Client Requirement

In SAP implementation projects, functional and technical design documents describe how business requirements will be implemented. Preparing these documents manually involves:

- Understanding business requirements and identifying relevant SAP functionality.
- Analyzing technical information and preparing detailed design sections.
- Following client-specific templates and documentation standards.
- Reviewing documents for completeness and accuracy.

The client wanted to automate SAP FDD and TDD generation using agentic AI. The solution needed to:

1. Accept business requirements or relevant technical inputs.
2. Understand client-specific FD/TD templates.
3. Generate content for the required sections.
4. Avoid introducing unsupported information.
5. Validate the generated content.
6. Produce a downloadable document following the client template.

### Agent Architecture

The voice note describes the following FD workflow. The exact TD agent configuration may differ.

- **Planner agent:** Coordinates the workflow and invokes the required agents.
- **BRD reader agent:** Reads and interprets business requirements.
- **Custom template reader agent:** Extracts the structure of the client-specific template.
- **Q++ integration agent:** Retrieves relevant reference information through vector search.
- **Prompt analyst agent:** Combines requirements, template structure, and retrieved context into generation instructions.
- **Reviewer agent:** Checks generated content against requirements and the template.
- **Download template analyst agent:** Formats and prepares the downloadable document.

### End-to-End Workflow

1. **User provides inputs:** Uploads a BRD and the relevant client template.
2. **Requirements are analyzed:** The BRD reader extracts business requirements.
3. **The template is interpreted:** The template reader identifies required sections and structure.
4. **Context is retrieved:** The Q++ integration agent searches for relevant reference information.
5. **Content is generated:** The prompt analyst prepares structured instructions using the available information to guide generation.
6. **Output is reviewed:** The reviewer checks template compliance, formatting, completeness, and functional accuracy.
7. **The document is prepared for download:** The output agent prepares the final downloadable document.

## 7. Personal Contribution: Prompt Design and Refinement

The contribution to emphasize is designing and refining prompts, rather than developing the complete agentic architecture. The following explanations are drafts to align with work actually completed.

### How I Understood the Project

I initially went through the existing FTTD templates and understood the purpose of each section. I studied the multi-agent workflow to understand how requirements were processed and how each agent contributed to document generation. Once I understood the expected inputs and outputs, I started working on agent-specific prompts.

### How I Wrote Prompts

The voice note describes converting brief template instructions into detailed instructions understandable to an LLM.

**Original template instruction:**

> Describe the functional requirement.

**Example improved prompt:**

> Analyze the provided SAP requirements document and generate the functional requirements section. Include the business process, trigger event, inputs, outputs, and expected system behavior. Use only information explicitly available in the source document. Do not introduce additional requirements or assumptions. Maintain the structure defined in the client template.

This example defines five important elements:

- **Task:** Generate the functional requirements section.
- **Context:** Use the provided SAP requirements document.
- **Content:** Cover the business process, trigger, inputs, outputs, and expected behavior.
- **Constraints:** Use source information without adding unsupported requirements or assumptions.
- **Output:** Follow the structure defined in the client template.

### How Prompts Were Tested and Refined

The refinement process described in the note was:

1. Convert template instructions into detailed prompts.
2. Generate documents using sample input files.
3. Have SAP subject matter experts (SMEs) review the initial output.
4. Update prompts based on identified gaps.
5. Repeat testing and refinement to improve output quality.

The note also mentions guidance about SAP versions, implementation approaches, clean core principles, and project-specific coding guidelines. Confirm which of these applied to the prompts I personally worked on.

## 8. Suggested Interview Narrative

Use this draft only after matching the dates, learning activities, and contributions to actual experience. The precise scope of system prompts versus section-level prompts remains to be clarified below.

**Question: Tell me about your recent project experience.**

I joined the project on August 17 and initially participated in onboarding and knowledge transfer activities. During this period, I learned about GenWizard Agent Manager and Agentic Core, and understood how utility agents, supervisor roles, and orchestration work together in a multi-agent system.

Later, I worked on a SAP functional and technical design document generation project. Its objective was to automate the preparation of SAP design documents using agentic AI. The solution involved multiple specialized agents responsible for requirement analysis, template interpretation, context retrieval, document generation, and validation.

My primary contribution was prompt engineering. I worked on understanding client-specific FDD and TDD templates and converting section-level requirements into structured instructions for LLMs. While designing these prompts, I focused on defining the expected content, output structure, and constraints intended to prevent generation of information absent from the source document.

I also refined prompts to improve the consistency, accuracy, and template alignment of generated documents. This experience helped me understand practical multi-agent workflows, prompt engineering, and how GenAI can automate enterprise documentation.

### Three-Line Resume Description

**Project: SAP FDD/TDD Document Generation Using Agentic AI**

- Contributed to an agentic AI solution for automating SAP functional and technical design documentation using GenWizard Agent Manager.
- Designed and refined agent-specific LLM prompts for requirement interpretation, structured content generation, and client-template adherence.
- Applied prompt engineering, output constraints, and iterative refinement to improve document accuracy, completeness, and consistency.

## 9. Interview Preparation Topics

- **What was the business requirement?** Automating SAP functional and technical design document generation from requirements and client templates.
- **Why did document generation need automation?** Manual preparation involved requirement analysis, detailed drafting, template adherence, and completeness reviews.
- **Why use multiple agents?** To separate responsibilities and control workflow execution.
- **Why use Agent Manager?** For agent creation, configuration, tool attachment, and orchestration.
- **What was my contribution?** Agent-specific prompt engineering; clarify the exact scope before describing it.
- **How did I design prompts?** Define context, instructions, constraints, and expected output.
- **How did I validate prompts?** Explain sample-input testing, output comparison, SME feedback, and refinement where personally performed.

### Recommended Preparation Order

1. **Project understanding:** What FDD and TDD mean, why SAP projects need these documents, and what problem agentic AI addresses.
2. **Technical understanding:** How Agent Manager and Agentic Core work, how the seven agents communicate, and how documents are generated.
3. **Personal contribution:** How I understood client templates, designed prompts, encountered challenges, and improved outputs.
4. **Interview preparation:** Prepare the three-month experience explanation, detailed project explanation, technical questions and answers, and final resume wording.

## 10. Open Question: Exact Prompt-Engineering Scope

When I say I worked on prompt engineering for each agent, did I work on:

- **A. Agent system prompts:** Prompts defining the behavior of agents such as the planner, BRD reader, template reader, and reviewer.
- **B. Section-level prompts inside FTTD templates:** Instructions for sections such as functional requirements, technical overview, error handling, and test cases.
- **C. Both A and B.**

**Answer: To be confirmed.** Earlier wording about system prompts and the suggested narrative about section-level prompts should be adjusted once this scope is confirmed.
