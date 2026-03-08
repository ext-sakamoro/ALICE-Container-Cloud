import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span className="text-xl font-bold tracking-tight text-green-400">
          ALICE-Container-Cloud
        </span>
        <Link
          href="/dashboard/console"
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-medium transition-colors"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Container Runtime,{" "}
          <span className="text-green-400">Rust-Native Speed</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Launch containers in 45 ms with full cgroup-v2 isolation, or drop to
          WASM micro-isolation for 5 ms cold starts. Auto-scaling and endpoint
          provisioning included.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard/console"
            className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors"
          >
            Open Console
          </Link>
          <a
            href="#features"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-semibold transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-green-300">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Rust-Native Runtime",
              desc: "45 ms container startup with zero JVM overhead. Written in Rust for predictable latency.",
              icon: "⚡",
            },
            {
              title: "WASM Micro-Isolation",
              desc: "5 ms cold starts via WebAssembly sandboxing. Perfect for function-level workloads.",
              icon: "🔬",
            },
            {
              title: "cgroup-v2 Isolation",
              desc: "Hard CPU, memory, and I/O limits enforced by the kernel. No noisy-neighbor problems.",
              icon: "🛡",
            },
            {
              title: "Auto-Scaling",
              desc: "Scale replicas up and down in real time based on queue depth or CPU utilization.",
              icon: "📈",
            },
            {
              title: "Endpoint Provisioning",
              desc: "Each deployment gets a dedicated HTTPS endpoint with TLS termination in under 1 s.",
              icon: "🌐",
            },
            {
              title: "Live Log Streaming",
              desc: "Tail container logs in real time via the console or programmatic API.",
              icon: "📋",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-700 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-green-300">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm">
        ALICE-Container-Cloud — Project A.L.I.C.E. &mdash; AGPL-3.0-or-later
      </footer>
    </div>
  );
}
