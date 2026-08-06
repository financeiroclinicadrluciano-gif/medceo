import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type IntegrationNode = {
  id: string;
  label: string;
  icon?: ReactNode;
};

/**
 * Orbit/constellation of nodes around a centre piece — the "integrations" layout.
 * Purely CSS positioning, so it stays cheap and SSR-safe.
 */
export default function IntegrationsOrbit({
  center,
  nodes,
  className,
}: {
  center: ReactNode;
  nodes: IntegrationNode[];
  className?: string;
}) {
  return (
    <div className={cn("kit-orbit", className)}>
      <div className="kit-orbit-ring" aria-hidden="true" />
      <div className="kit-orbit-ring kit-orbit-ring-outer" aria-hidden="true" />
      <div className="kit-orbit-center">{center}</div>
      <ul className="kit-orbit-nodes">
        {nodes.map((node, index) => {
          const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <li
              key={node.id}
              className="kit-orbit-node"
              style={{
                left: `${50 + Math.cos(angle) * 38}%`,
                top: `${50 + Math.sin(angle) * 38}%`,
              }}
            >
              {node.icon}
              <span>{node.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
