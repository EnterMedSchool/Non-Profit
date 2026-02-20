"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import dagre from "dagre";
import AlgorithmNodeComponent from "./AlgorithmNode";
import type { AlgorithmDefinition, PathEntry } from "@/lib/algorithmTypes";

import "@xyflow/react/dist/style.css";

const nodeTypes: NodeTypes = {
  algorithmNode: AlgorithmNodeComponent,
};

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;

function layoutGraph(
  definition: AlgorithmDefinition,
  path: PathEntry[],
  currentNodeId: string | null,
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 60, nodesep: 40 });

  const visitedNodeIds = new Set(path.map((p) => p.nodeId));
  const visitedEdgeIds = new Set(
    path.map((p) => p.edgeId).filter(Boolean) as string[],
  );

  for (const node of definition.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of definition.edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const nodes: Node[] = definition.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      type: "algorithmNode",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: {
        label: node.label,
        nodeType: node.type,
        active: node.id === currentNodeId,
        visited: visitedNodeIds.has(node.id),
        hasEducation: !!node.educationalContent?.why,
      },
    };
  });

  const edges: Edge[] = definition.edges.map((edge) => {
    const isOnPath = visitedEdgeIds.has(edge.id);
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: isOnPath,
      style: {
        stroke: isOnPath ? "#6c5ce7" : "#94a3b8",
        strokeWidth: isOnPath ? 2.5 : 1.5,
      },
      labelStyle: {
        fontSize: 10,
        fontWeight: isOnPath ? 700 : 500,
        fill: isOnPath ? "#6c5ce7" : "#64748b",
      },
      labelBgStyle: {
        fill: "white",
        fillOpacity: 0.85,
      },
    };
  });

  return { nodes, edges };
}

interface AlgorithmFlowchartProps {
  definition: AlgorithmDefinition;
  currentNodeId: string | null;
  path: PathEntry[];
  onNodeClick: (nodeId: string) => void;
  compact?: boolean;
}

export default function AlgorithmFlowchart({
  definition,
  currentNodeId,
  path,
  onNodeClick,
  compact,
}: AlgorithmFlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => layoutGraph(definition, path, currentNodeId),
    [definition, path, currentNodeId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const prevPathLen = useRef(path.length);

  useEffect(() => {
    const { nodes: n, edges: e } = layoutGraph(
      definition,
      path,
      currentNodeId,
    );
    setNodes(n);
    setEdges(e);

    if (path.length !== prevPathLen.current) {
      prevPathLen.current = path.length;
      setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 50);
    }
  }, [definition, path, currentNodeId, setNodes, setEdges, fitView]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick],
  );

  return (
    <div
      className={`w-full bg-white rounded-2xl border-2 border-showcase-navy/10 overflow-hidden ${
        compact ? "h-[350px]" : "h-[500px] lg:h-full lg:min-h-[600px]"
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={0.8}
          color="#e2e8f0"
        />
        <Controls
          showInteractive={false}
          className="!bg-white !border-2 !border-showcase-navy/10 !rounded-xl !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
