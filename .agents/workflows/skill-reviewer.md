---
description: A structured process to audit, de-duplicate, and optimize SKILLS.
---

## Steps

### 1. Audit for Redundancy
Scan the current workspace for existing SKILLS. Compare the proposed SKILL with the existing ones to ensure no functional overlap. 
- If the content is already covered, suggest merging them.
- If it's unique, proceed to the next step.

### 2. Clarity and Precision Check
Review the `name` and `description` of the SKILL. 
- Ensure the description explicitly tells the Agent **exactly** when to trigger the skill.
- Refine the "When to use" and "When NOT to use" sections to eliminate ambiguity.

### 3. Content Enhancement
Analyze the core instructions and suggest the following improvements:
- **Grammar & Tone:** Ensure professional and concise English.
- **Practical Samples:** If missing, generate 2-3 "Input/Output" or "Action" examples.
- **Reference Assets:** Suggest if a `/references` folder or additional documentation is needed for complex logic.
- **Code examples:** All code examples and practical samples must be added to the `./samples` folder and make a reference to them if needed. Do not clutter the main SKILL file with long code blocks.

### 4. Cross-Linking & Relations
Identify related SKILLS within the workspace. 
- Add explicit paths to related documentation using the format: `For [Topic], refer to ./[skill-name]/SKILL.md`.
- Ensure the SKILL fits into the existing ecosystem without breaking logic.

### 5. Final Proposal
Generate a final version of the SKILL in a code block, ready to be saved, followed by a brief summary of the changes made.