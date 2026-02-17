# ERD Designer 📊

A specialized React-based tool for designing Entity Relationship Diagrams (ERDs) with precision and ease. This application allows users to model database structures using professional Crow's foot notation.

## 🚀 Key Features

### 📐 Precise Crow's Foot Notation
* **Flush Geometry:** Custom-calculated trident (fork) connectors that sit perfectly flush against entity borders, regardless of the connection angle.
* **Dynamic Cardinality:** Support for standard ERD relationships, including **1:1**, **1:M**, **M:1**, and **M:M**.
* **Smart Connectors:** Unit-vector-based pathing ensures connectors stay aligned even when entities are moved or tilted.

### 🏢 Entity Management
* **Custom Entity Nodes:** Create and label database entities with an intuitive, on-node text interface.
* **Keyboard Shortcuts:**
    * `Delete` / `Backspace`: Remove selected entities or relationships.
    * `Ctrl + D` (or `Cmd + D`): Quickly duplicate selected entity nodes.

### 📁 Project & File Handling
* **Project Persistence:** Save your entire workspace as a `.erd` project file to resume work later.
* **Named Exports:** Prompt-based naming for both project files and image exports.
* **High-Quality PNG Export:** Generate professional-grade diagrams with a solid white background (not transparent).
* **Professional Mode:** Automatic suppression of connection handles during save/export for a cleaner final look.

### 🛠️ User Interface
* **Interactive Sidebar:** Dedicated toolbar for adding entities, managing files, and adjusting relationship cardinality.
* **Fluid Canvas:** Built on React Flow, providing a smooth panning, zooming, and drag-and-drop experience.

---

## 🛠️ Built With

* [React](https://reactjs.org/) - UI Framework
* [React Flow](https://reactflow.dev/) - Powerful diagramming library
* [html-to-image](https://www.npmjs.com/package/html-to-image) - High-quality image generation

---
