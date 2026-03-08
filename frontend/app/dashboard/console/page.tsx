"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

type Tab = "create" | "deploy" | "logs" | "stats";

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("create");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // create tab
  const [createImage, setCreateImage] = useState("ubuntu:22.04");
  const [createCpu, setCreateCpu] = useState("1.0");
  const [createMemory, setCreateMemory] = useState("512");
  const [createRuntime, setCreateRuntime] = useState("runc");

  // deploy tab
  const [deployContainerId, setDeployContainerId] = useState("");
  const [deployReplicas, setDeployReplicas] = useState("1");
  const [deployPort, setDeployPort] = useState("8080");

  // logs tab
  const [logsContainerId, setLogsContainerId] = useState("");
  const [logsTail, setLogsTail] = useState("100");

  // stats tab (GET)
  const [statsContainerId, setStatsContainerId] = useState("");

  async function post(path: string, body: unknown) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function get(path: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["create", "deploy", "logs", "stats"];

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-300">
        ALICE-Container-Cloud / Console
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); }}
            className={`px-4 py-2 rounded text-sm uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-green-400 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        {/* CREATE */}
        {tab === "create" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Create Container</h2>
            <label className="block text-sm">
              Image
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={createImage}
                onChange={(e) => setCreateImage(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                CPU (cores)
                <input
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                  value={createCpu}
                  onChange={(e) => setCreateCpu(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Memory (MiB)
                <input
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                  value={createMemory}
                  onChange={(e) => setCreateMemory(e.target.value)}
                />
              </label>
            </div>
            <label className="block text-sm">
              Runtime
              <select
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={createRuntime}
                onChange={(e) => setCreateRuntime(e.target.value)}
              >
                <option value="runc">runc (45ms startup)</option>
                <option value="wasm">wasm (5ms startup)</option>
                <option value="gvisor">gVisor</option>
              </select>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  post("/api/v1/container/create", {
                    image: createImage,
                    cpu: parseFloat(createCpu),
                    memory_mib: parseInt(createMemory),
                    runtime: createRuntime,
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Creating..." : "POST /container/create"}
              </button>
              <button
                onClick={() => get("/api/v1/container/runtimes")}
                disabled={loading}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded text-green-400 text-sm disabled:opacity-50"
              >
                GET /container/runtimes
              </button>
            </div>
          </>
        )}

        {/* DEPLOY */}
        {tab === "deploy" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Deploy Container</h2>
            <label className="block text-sm">
              Container ID
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                placeholder="ctr-xxxxxxxx"
                value={deployContainerId}
                onChange={(e) => setDeployContainerId(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                Replicas
                <input
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                  value={deployReplicas}
                  onChange={(e) => setDeployReplicas(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Port
                <input
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                  value={deployPort}
                  onChange={(e) => setDeployPort(e.target.value)}
                />
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  post("/api/v1/container/deploy", {
                    container_id: deployContainerId,
                    replicas: parseInt(deployReplicas),
                    port: parseInt(deployPort),
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Deploying..." : "POST /container/deploy"}
              </button>
              <button
                onClick={() =>
                  post("/api/v1/container/scale", {
                    container_id: deployContainerId,
                    replicas: parseInt(deployReplicas),
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white text-sm disabled:opacity-50"
              >
                POST /container/scale
              </button>
              <button
                onClick={() =>
                  post("/api/v1/container/stop", {
                    container_id: deployContainerId,
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-red-800 hover:bg-red-700 rounded text-white text-sm disabled:opacity-50"
              >
                POST /container/stop
              </button>
            </div>
          </>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Container Logs</h2>
            <label className="block text-sm">
              Container ID
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                placeholder="ctr-xxxxxxxx"
                value={logsContainerId}
                onChange={(e) => setLogsContainerId(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Tail (lines)
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={logsTail}
                onChange={(e) => setLogsTail(e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                post("/api/v1/container/logs", {
                  container_id: logsContainerId,
                  tail: parseInt(logsTail),
                })
              }
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
            >
              {loading ? "Fetching..." : "POST /container/logs"}
            </button>
          </>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Container Stats</h2>
            <label className="block text-sm">
              Container ID (optional — leave blank for all)
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                placeholder="ctr-xxxxxxxx"
                value={statsContainerId}
                onChange={(e) => setStatsContainerId(e.target.value)}
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  get(
                    statsContainerId
                      ? `/api/v1/container/stats?id=${statsContainerId}`
                      : "/api/v1/container/stats"
                  )
                }
                disabled={loading}
                className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Loading..." : "GET /container/stats"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Result */}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Response</p>
        <pre className="text-green-400 text-sm whitespace-pre-wrap break-all min-h-[120px]">
          {loading ? "Waiting for response..." : result || "— no result yet —"}
        </pre>
      </div>
    </div>
  );
}
