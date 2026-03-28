import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import type { Edge, EdgeProps } from "@xyflow/react";
import type { CognitiveEdgeData } from "./cognitiveTypes";

export function CognitiveEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<Edge<CognitiveEdgeData, "cognitive">>) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const weight = data?.weight ?? "medium";
  const w = weight === "thick" ? 3 : weight === "medium" ? 2 : 1;
  const dash = weight === "thin-dashed" ? "6 4" : undefined;
  const color = data?.strokeColor ?? "var(--edu-gray)";
  const opacity = data?.edgeOpacity ?? 0.6;
  const animated = Boolean(data?.animated);

  return (
    <>
      <BaseEdge
        path={path}
        className={animated ? "edu-edge-animated" : undefined}
        style={{
          stroke: color,
          strokeWidth: w,
          strokeDasharray: animated && !dash ? "10 6" : dash,
          opacity,
        }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              fontSize: 11,
              color: "#64748b",
              background: "#fff",
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.5)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
