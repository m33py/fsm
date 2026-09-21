import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't let Next append its own agent-rules block to our project CLAUDE.md.
  agentRules: false,
};

export default nextConfig;
