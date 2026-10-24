# ALICE-Container-Cloud

Rust-native container runtime as a cloud service. Launch containers in 45 ms with cgroup-v2 isolation, or use WASM micro-isolation for 5 ms cold starts. Part of Project A.L.I.C.E.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ALICE-Container-Cloud                    │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │  Next.js │   │  Rust API    │   │  Container Runtime │  │
│  │ Frontend │──▶│  (Axum)      │──▶│  runc / WASM /     │  │
│  │          │   │  :8081       │   │  gVisor            │  │
│  └──────────┘   └──────────────┘   └────────────────────┘  │
│                        │                      │             │
│                 ┌──────▼──────┐    ┌──────────▼─────────┐  │
│                 │  cgroup-v2  │    │  Auto-Scale Engine  │  │
│                 │  Isolation  │    │  Endpoint Registry  │  │
│                 └─────────────┘    └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Detail |
|---|---|
| Rust-native runtime | 45 ms container startup, zero JVM overhead |
| WASM micro-isolation | 5 ms cold start via WebAssembly sandboxing |
| cgroup-v2 isolation | Hard CPU, memory, I/O limits enforced by kernel |
| Auto-scaling | Scale replicas in real time based on load |
| Endpoint provisioning | Dedicated HTTPS endpoint per deployment in < 1 s |
| Live log streaming | Tail container logs via console or API |
| Multi-runtime support | runc, WASM, gVisor selectable per container |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/container/create` | Create a new container |
| POST | `/api/v1/container/deploy` | Deploy container and provision endpoint |
| POST | `/api/v1/container/scale` | Scale replica count |
| POST | `/api/v1/container/stop` | Stop and remove container |
| POST | `/api/v1/container/logs` | Fetch container logs (tail N lines) |
| GET | `/api/v1/container/runtimes` | List available runtimes |
| GET | `/api/v1/container/stats` | CPU/memory stats for container(s) |

## Quick Start

```bash
# Clone and start
git clone https://github.com/ext-sakamoro/ALICE-Container-Cloud.git
cd ALICE-Container-Cloud

# Start the API (Rust)
cargo run --release

# Start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000

# Create a container via API
curl -X POST http://localhost:8081/api/v1/container/create \
  -H "Content-Type: application/json" \
  -d '{"image":"ubuntu:22.04","cpu":1.0,"memory_mib":512,"runtime":"runc"}'

# Deploy the container
curl -X POST http://localhost:8081/api/v1/container/deploy \
  -H "Content-Type: application/json" \
  -d '{"container_id":"ctr-xxxx","replicas":2,"port":8080}'
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8081` | Backend API base URL |
| `ALICE_CONTAINER_DATA_DIR` | `/var/lib/alice-container` | Container data directory |
| `ALICE_CGROUP_VERSION` | `v2` | cgroup version |

## License

`LicenseRef-Proprietary`. The text is [LICENSE-Proprietary](LICENSE-Proprietary).

Enquiries: https://extoria.co.jp/
