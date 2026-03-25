import { useState, useEffect, useRef } from "react"
import ForceGraph3D from "react-force-graph-3d"
import SpriteText from "three-spritetext"
import * as THREE from "three"
import axios from "axios"

const API = "http://127.0.0.1:8000"

export default function App() {
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [popupData, setPopupData] = useState(null)
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I can help you analyze the Order to Cash process." }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const fgRef = useRef(null)
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [showGranular, setShowGranular] = useState(true)

  // Light Mode Metallic & Earthen Colors
  const nodeColorMap = {
    "Orders": "#0ea5e9",     // Light Sky Blue
    "Deliveries": "#10b981", // Soft Emerald
    "Invoices": "#f43f5e",   // Rose Red
    "Payments": "#8b5cf6",   // Muted Purple
    "Customers": "#64748b",  // Slate Steel
    "Journal": "#f59e0b"     // Burnished Amber
  };
  const getNodeColor = n => nodeColorMap[n.type] || "#94a3b8";

  useEffect(() => {
    axios.get(`${API}/graph`).then(r => setGraph(r.data))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const q = input
    setInput("")
    setLoading(true)
    setMessages(m => [...m, { role: "user", text: q }])
    try {
      const r = await axios.post(`${API}/query`, { question: q })
      setMessages(m => [...m, {
        role: "ai",
        text: r.data.answer,
        sql: r.data.sql,
        data: r.data.data
      }])
      
      const h_nodes = r.data.highlight_nodes || []
      if (h_nodes.length > 0) {
        setHighlightNodes(new Set(h_nodes))
        const targetNode = graph.nodes.find(n => h_nodes.includes(n.id))
        if(targetNode) {
            if (fgRef.current) {
                const distance = 100;
                const distRatio = 1 + distance/Math.hypot(targetNode.x, targetNode.y, targetNode.z);
                fgRef.current.cameraPosition(
                  { x: targetNode.x * distRatio, y: targetNode.y * distRatio, z: targetNode.z * distRatio },
                  targetNode,
                  1000
                );
            }
        }
      } else {
        setHighlightNodes(new Set())
      }

      // Display the raw SQL data results or node details globally!
      if (r.data.data && r.data.data.length > 0) {
         setPopupData({ 
           title: h_nodes.length > 0 ? "Target Record Details" : "Query Results", 
           rows: r.data.data 
         })
      } else {
         setPopupData(null)
      }
    } catch {
      setMessages(m => [...m, { role: "ai", text: "Server error. Is backend running?" }])
    }
    setLoading(false)
  }

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <div className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </div>
          <span className="nav-divider">|</span>
          <span>Mapping</span>
          <span className="nav-divider">/</span>
          <span className="nav-current">Order to Cash</span>
        </div>
        
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
            <button className="cmd-btn cmd-light" onClick={() => setChatCollapsed(!chatCollapsed)}>
              <svg className="cmd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {chatCollapsed ? (
                  <>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                ) : (
                  <>
                    <polyline points="4 14 10 14 10 20"></polyline>
                    <polyline points="20 10 14 10 14 4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                )}
              </svg>
              {chatCollapsed ? "Maximize" : "Minimize"}
            </button>
            <button className="cmd-btn cmd-dark" onClick={() => setShowGranular(!showGranular)}>
              <svg className="cmd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 12 12 17 22 12"></polyline>
                <polyline points="2 17 12 22 22 17"></polyline>
                {!showGranular && <line x1="2" y1="2" x2="22" y2="22" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"></line>}
              </svg>
              {showGranular ? "Hide Overlay" : "Show Overlay"}
            </button>
        </div>
      </div>

      {/* Main App Workspace */}
      <div className="workspace-wrapper">
        
        {/* Graph Section */}
        <div className="graph-panel">
          <div className="graph-canvas-bounds">
            <ForceGraph3D
              ref={fgRef}
              graphData={graph}
              nodeLabel={null}
              nodeThreeObject={node => {
                const color = getNodeColor(node);
                const isHighlighted = highlightNodes.has(node.id);
                const isFaded = highlightNodes.size > 0 && !isHighlighted;
                
                const group = new THREE.Group();

                // Physical Matte Metal Spheres (No bioluminescent glowing in architectural mode)
                const geometry = new THREE.SphereGeometry(isHighlighted ? 6 : 4, 32, 32);
                const material = new THREE.MeshPhongMaterial({ 
                  color: isHighlighted ? '#1e293b' : color, // Highlight goes dark slate
                  shininess: 90,
                  specular: new THREE.Color('#ffffff'),
                  transparent: true, 
                  opacity: isFaded ? 0.2 : 1 
                });
                const sphere = new THREE.Mesh(geometry, material);
                group.add(sphere);

                // Clean Corporate Typography hovering
                if (!isFaded && showGranular) {
                  const sprite = new SpriteText(node.type || "");
                  sprite.color = isHighlighted ? '#0f172a' : '#334155';
                  sprite.textHeight = isHighlighted ? 5 : 4.5;
                  sprite.position.set(0, 10, 0);
                  sprite.fontFace = 'Outfit, sans-serif';
                  sprite.fontWeight = isHighlighted ? '700' : '600';
                  group.add(sprite);
                }

                return group;
              }}
              // Straight architectural structure
              linkDirectionalParticles={link => {
                const isFaded = highlightNodes.size > 0 && !highlightNodes.has(typeof link.source === 'object' ? link.source.id : link.source) && !highlightNodes.has(typeof link.target === 'object' ? link.target.id : link.target);
                return (isFaded || !showGranular) ? 0 : 2;
              }}
              linkDirectionalParticleWidth={link => {
                  const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                  if (highlightNodes.size > 0 && (highlightNodes.has(srcId) || highlightNodes.has(tgtId))) return 2;
                  return 1.2;
              }}
              linkDirectionalParticleSpeed={0.008} // Crisp, fast data packet transport
              linkDirectionalParticleColor={() => "#0284c7"} // Bright crisp cyan data particles
              linkWidth={link => {
                if (highlightNodes.size > 0) {
                  const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                  return (highlightNodes.has(srcId) || highlightNodes.has(tgtId)) ? 1.5 : 0.2
                }
                return 0.5
              }}
              linkColor={link => {
                if (highlightNodes.size > 0) {
                  const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                  return (highlightNodes.has(srcId) || highlightNodes.has(tgtId)) ? "rgba(15, 23, 42, 0.4)" : "rgba(15, 23, 42, 0.05)"
                }
                return "rgba(100, 116, 139, 0.25)" // Soft slate framework
              }}
              backgroundColor="rgba(0,0,0,0)" // Crucial for letting the eye-care CSS backing shine through
              onNodeClick={n => {
                setHighlightNodes(new Set([n.id]));
                setPopupData({ title: `${n.type} Details`, rows: [n.data] });
              }}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              cooldownTicks={150}
              warmupTicks={100}
              onEngineStop={() => fgRef.current?.zoomToFit(800, 60)}
            />
          </div>

          {/* Dynamic Data Popup - Frosted Slate Glass */}
          {popupData && (
            <div style={{
              position: "absolute", top: 20, left: 20, background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.9)", 
              borderRadius: 14, padding: 18,
              maxWidth: "50%", maxHeight: "80%", overflow: "auto", zIndex: 20,
              boxShadow: "0 15px 40px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: '#0f172a', letterSpacing: '0.5px' }}>
                {popupData.title}
              </div>
              
              {popupData.rows.map((row, idx) => (
                <div key={idx} style={{ 
                  marginBottom: 12, paddingBottom: 12, 
                  borderBottom: idx < popupData.rows.length - 1 ? "1px solid rgba(15, 23, 42, 0.05)" : "none" 
                }}>
                  {Object.entries(row).slice(0, 15).map(([k, v]) => (
                    <div key={k} style={{
                      fontSize: 12.5, display: "flex", gap: 10, marginBottom: 6
                    }}>
                      <span style={{ color: "#64748b", minWidth: 120, flexShrink: 0, fontWeight: 500 }}>{k}:</span>
                      <span style={{ color: "#0f172a", fontWeight: 600 }}>{String(v).slice(0, 80)}</span>
                    </div>
                  ))}
                </div>
              ))}

              <button onClick={() => {
                  setPopupData(null);
                  setHighlightNodes(new Set());
                }}
                style={{
                  marginTop: 8, fontSize: 13, padding: "8px 20px", display: "block", width: "100%",
                  border: "1px solid #e2e8f0", borderRadius: 8,
                  cursor: "pointer", background: "#f8fafc", color: "#475569", fontWeight: 600,
                  transition: "all 0.3s"
                }}
                onMouseOver={e => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                }}
                onMouseOut={e => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}>
                Close Preview
              </button>
            </div>
          )}
        </div>

        {/* Chat Sidebar Section */}
        {!chatCollapsed && (
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-title">Chat with Graph</div>
              <div className="chat-subtitle">Order to Cash</div>
            </div>

          <div className="chat-scroll">
            {messages.map((m, i) => {
              if (m.role === "ai") {
                return (
                  <div key={i}>
                    {(i === 0 || messages[i-1].role === "user") && (
                      <div className="ai-profile">
                        <div className="ai-avatar">D</div>
                        <div>
                          <div className="ai-name">Dodge AI</div>
                          <div className="ai-role">Graph Agent</div>
                        </div>
                      </div>
                    )}
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                )
              }
              return (
                <div key={i} className="msg-bubble msg-user">{m.text}</div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-wrapper">
            <div className="chat-input-box">
              <div className="input-status">
                <div className="status-dot"></div>
                {loading ? "Dodge AI is thinking..." : "Dodge AI is awaiting instructions"}
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Analyze anything"
                className="chat-textarea"
              />
              <div className="chat-bottom-action">
                <button
                  onClick={send}
                  className={`send-btn ${input.trim() ? "active" : ""}`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  )
}
