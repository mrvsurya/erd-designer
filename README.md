# ERD Designer 📊

A specialized React-based tool for designing Entity Relationship Diagrams (ERDs) with precision and ease. This application allows users to model database structures using professional Crow's foot notation and validate them with integrated AI auditing.

## 🚀 Key Features

### 📐 Precise Crow's Foot Notation
* **Flush Geometry:** Custom-calculated trident (fork) connectors that sit perfectly flush against entity borders, regardless of the connection angle.
* **Dynamic Cardinality:** Support for standard ERD relationships, including **1:1**, **1:M**, **M:1**, and **M:M**.
* **Contrast-Optimized Labels:** Cardinality labels are rendered in high-contrast black-on-white for perfect legibility in both the app and exported PNGs.

### 🏢 Entity & Canvas Management
* **Custom Entity Nodes:** Create and label database entities with an intuitive, on-node text interface and optimized slim horizontal widths.
* **Zoom-to-Fit:** Instantly re-center and scale the canvas to view your entire diagram with a single click.
* **Smart Duplication:** `Ctrl + D` (or `Cmd + D`) instantly clones an entity and shifts focus to the new node, preventing the accidental movement of the original.
* **Dual Reset Options:** * **Clear Canvas:** Wipes the diagram nodes and edges while keeping your business context and notes intact.
    * **Clear All:** A full system reset that clears the canvas, business context, and design notes.
* **Keyboard Shortcuts:**
    * `Delete` / `Backspace`: Remove selected entities or relationships.
    * `Ctrl + D` (or `Cmd + D`): Quickly duplicate selected entity nodes.
* **Smart Drop Positioning:** New entities are automatically placed at the center of your current viewport, eliminating the need to hunt for nodes placed far outside the visible area.

### 🤖 AI-Powered Auditing
* **Context-Aware Prompts:** Generates specialized audit prompts that feed your business rules and diagram structure to an AI for verification.
* **Strict Logic Constraints:** The AI is instructed to focus solely on relationship logic and existing entities, ignoring unrelated attributes or fields outside the context.
* **Integrated Notes:** A dedicated "Design Notes" area to store AI feedback and architectural decisions directly within your project file.

### 📁 Project & File Handling
* **Project Persistence:** Save your entire workspace (including context and notes) as a `.erd` project file to resume work later.
* **Smart Naming:** The system remembers the filename of opened projects, defaulting to the same name for subsequent saves.
* **High-Quality PNG Export:** Generate professional-grade diagrams with a solid white background. 
* **Professional Mode:** Automatic suppression of connection handles and grid dots during export for a cleaner final look.

### 🛠️ User Interface
* **Night Mode Support:** Toggle between light and dark themes with a single click to reduce eye strain.
* **Interactive Sidebar:** Dedicated toolbar for adding entities, managing files, scaling the view, and adjusting relationship cardinality.
* **Fluid Canvas:** Built on React Flow, providing a smooth panning, zooming, and drag-and-drop experience.

---

## 🛠️ Built With

* [React](https://reactjs.org/) - UI Framework
* [React Flow](https://reactflow.dev/) - Powerful diagramming library
* [html-to-image](https://www.npmjs.com/package/html-to-image) - High-quality image generation

---