import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { 
  addEdge, Background, Controls, applyEdgeChanges, applyNodeChanges,
  Handle, Position, EdgeLabelRenderer, BaseEdge, ReactFlowProvider, useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

// --- CUSTOM NODE ---
const EntityNode = ({ id, data, selected }) => {
  const handleSize = 8;
  const hStyle = { 
    width: handleSize, height: handleSize, background: '#444', 
    border: '1px solid #fff', zIndex: 10,
    visibility: data.hideHandles ? 'hidden' : 'visible' 
  };

  return (
    <div style={{ 
      padding: '12px', borderRadius: '4px', border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`, 
      background: '#fff', minWidth: '140px', minHeight: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: (selected && !data.hideHandles) ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
    }}>
      <Handle type="target" position={Position.Top} id="top" style={{ ...hStyle, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...hStyle, left: '50%' }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...hStyle, top: '50%' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...hStyle, top: '50%' }} />
      
      <input
        className="nodrag" 
        value={data.label}
        onChange={(e) => data.onChange(id, e.target.value)}
        onKeyDown={(e) => (e.key === 'Backspace' || e.key === 'Delete') && e.stopPropagation()}
        style={{ border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', width: '100%', outline: 'none' }}
      />
    </div>
  );
};

// --- FLUSH CROW EDGE ---
const CrowEdge = ({ id, sourceX, sourceY, targetX, targetY, data, selected, sourceHandleId, targetHandleId }) => {
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const getTridentPath = (sX, sY, tX, tY, handleId) => {
    const forkDepth = 18; 
    const spread = 15;    
    const borderOffset = 4; 

    const dx = tX - sX;
    const dy = tY - sY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    const adjTX = tX + (ux * borderOffset);
    const adjTY = tY + (uy * borderOffset);

    const forkOriginX = adjTX - ux * forkDepth;
    const forkOriginY = adjTY - uy * forkDepth;

    const isVerticalFace = handleId === 'top' || handleId === 'bottom';
    let p1x, p1y, p2x, p2y;

    if (isVerticalFace) {
      p1x = adjTX - spread; p1y = adjTY;
      p2x = adjTX + spread; p2y = adjTY;
    } else {
      p1x = adjTX; p1y = adjTY - spread;
      p2x = adjTX; p2y = adjTY + spread;
    }

    return `
      M ${p1x},${p1y} L ${p2x},${p2y}
      M ${p1x},${p1y} L ${forkOriginX},${forkOriginY}
      M ${p2x},${p2y} L ${forkOriginX},${forkOriginY}
      M ${adjTX},${adjTY} L ${forkOriginX},${forkOriginY}
    `;
  };

  const showTargetTrident = data?.cardinality === '1:M' || data?.cardinality === 'M:M';
  const showSourceTrident = data?.cardinality === 'M:1' || data?.cardinality === 'M:M';

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ strokeWidth: 2, stroke: (selected && !data?.hideHandles) ? '#3b82f6' : '#333' }} />
      {showTargetTrident && (
        <path d={getTridentPath(sourceX, sourceY, targetX, targetY, targetHandleId)} fill="none" stroke={(selected && !data?.hideHandles) ? '#3b82f6' : '#333'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {showSourceTrident && (
        <path d={getTridentPath(targetX, targetY, sourceX, sourceY, sourceHandleId)} fill="none" stroke={(selected && !data?.hideHandles) ? '#3b82f6' : '#333'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}
      <EdgeLabelRenderer>
        <div style={{
            position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #3b82f6',
            fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none', zIndex: 10
          }}>
          {data?.cardinality || '1:1'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = { entity: EntityNode };
const edgeTypes = { crow: CrowEdge };

// --- MAIN APP COMPONENT ---
function ERDDesigner() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);
  const { fitView } = useReactFlow();

  const onNodeLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selectedId) return;
        setNodes((nds) => nds.filter((n) => n.id !== selectedId));
        setEdges((eds) => eds.filter((ed) => ed.id !== selectedId && ed.source !== selectedId && ed.target !== selectedId));
        setSelectedId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const nodeToCopy = nodes.find(n => n.id === selectedId);
        if (nodeToCopy) {
          const newNode = { ...nodeToCopy, id: `e_${Date.now()}`, position: { x: nodeToCopy.position.x + 40, y: nodeToCopy.position.y + 40 }, selected: false };
          setNodes((nds) => [...nds, newNode]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, nodes]);

  const handleCardinalityChange = (value) => {
    setEdges((eds) => eds.map((e) => e.id === selectedId ? { ...e, data: { ...e.data, cardinality: value } } : e));
  };

  const onConnect = useCallback((params) => {
    const newEdge = { ...params, id: `edge_${Date.now()}`, type: 'crow', data: { cardinality: '1:1' } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const toggleHandles = (hide) => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, hideHandles: hide } })));
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, hideHandles: hide } })));
  };

  const saveProject = async () => {
    const projectName = window.prompt("Enter project name:", "my-diagram");
    if (!projectName) return;
    toggleHandles(true);
    setTimeout(() => {
      const blob = new Blob([JSON.stringify({ nodes, edges })], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${projectName}.erd`;
      link.click();
      toggleHandles(false); 
    }, 50);
  };

  const openProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const nodesWithHandlers = data.nodes.map(n => ({
          ...n,
          data: { ...n.data, onChange: onNodeLabelChange, hideHandles: false }
        }));
        setNodes(nodesWithHandlers);
        setEdges(data.edges || []);
      } catch (err) { alert("Invalid file format."); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const exportImage = () => {
    const fileName = window.prompt("Enter image file name:", "erd-diagram");
    if (!fileName) return;
    toggleHandles(true);
    setTimeout(() => {
      const element = document.querySelector('.react-flow__viewport');
      toPng(element, { backgroundColor: '#ffffff', quality: 1 }).then((url) => {
        const a = document.createElement('a');
        a.download = `${fileName}.png`; a.href = url; a.click();
        toggleHandles(false);
      });
    }, 100);
  };

  const currentEdge = edges.find(e => e.id === selectedId);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'sans-serif' }}>
      <div style={{ width: '250px', padding: '20px', background: '#f8fafc', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>ERD Designer</h3>
        
        <button onClick={() => setNodes(n => [...n, { id: `e_${Date.now()}`, type: 'entity', data: { label: 'New Entity', onChange: onNodeLabelChange, hideHandles: false }, position: { x: 100, y: 100 } }])} style={btnStyle('#2563eb')}>+ Add Entity</button>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={saveProject} style={btnStyle('#64748b')}>Save Project</button>
          <button onClick={() => fileInputRef.current.click()} style={btnStyle('#64748b')}>Open Project</button>
        </div>
        <input type="file" ref={fileInputRef} onChange={openProject} style={{ display: 'none' }} accept=".erd" />
        
        <button onClick={exportImage} style={btnStyle('#10b981')}>Export PNG</button>
        
        {/* ZOOM TO FIT BUTTON */}
        <button onClick={() => fitView({ padding: 0.2, duration: 800 })} style={btnStyle('#8b5cf6')}>Zoom to Fit</button>

        <button onClick={() => window.confirm("Clear entire canvas?") && (setNodes([]) || setEdges([]))} style={btnStyle('#ef4444')}>Clear All</button>

        {/* TIPS SECTION */}
        <div style={{ marginTop: '20px', padding: '12px', background: '#fef3c7', borderRadius: '4px', border: '1px solid #f59e0b', fontSize: '12px', color: '#92400e' }}>
          <strong>💡 Pro Tip:</strong><br/>
          Hold <strong>Shift</strong> and drag to select multiple entities.
        </div>

        {currentEdge && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
             <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Cardinality</label>
             <select style={{ width: '100%', padding: '8px' }} onChange={(e) => handleCardinalityChange(e.target.value)} value={currentEdge.data?.cardinality || '1:1'}>
               <option value="1:1">1:1</option><option value="1:M">1:M</option><option value="M:1">M:1</option><option value="M:M">M:M</option>
             </select>
          </div>
        )}
      </div>
      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={(chs) => setNodes((nds) => applyNodeChanges(chs, nds))}
          onEdgesChange={(chs) => setEdges((eds) => applyEdgeChanges(chs, eds))}
          onConnect={onConnect}
          onSelectionChange={({ nodes, edges }) => setSelectedId(edges[0]?.id || nodes[0]?.id || null)}
          nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView
        >
          <Background color="#aaa" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrap the whole thing in ReactFlowProvider so useReactFlow works
export default function App() {
  return (
    <ReactFlowProvider>
      <ERDDesigner />
    </ReactFlowProvider>
  );
}

const btnStyle = (bg) => ({ padding: '10px', background: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' });