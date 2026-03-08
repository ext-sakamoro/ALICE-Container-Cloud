use axum::{extract::State, response::Json, routing::{get, post, delete}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_containers: u64, total_starts: u64, total_stops: u64, total_deploys: u64, vcpu_hours: f64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct CreateContainerRequest { image: String, name: Option<String>, vcpu: Option<f64>, memory_mb: Option<u32>, env: Option<serde_json::Value> }
#[derive(Serialize)]
struct CreateContainerResponse { container_id: String, name: String, image: String, vcpu: f64, memory_mb: u32, status: String, startup_time_ms: u64 }

#[derive(Deserialize)]
struct DeployRequest { image: String, replicas: Option<u32>, region: Option<String>, auto_scale: Option<bool>, min_replicas: Option<u32>, max_replicas: Option<u32> }
#[derive(Serialize)]
struct DeployResponse { deployment_id: String, image: String, replicas: u32, region: String, endpoint: String, auto_scale: bool, status: String }

#[derive(Deserialize)]
struct ScaleRequest { deployment_id: String, replicas: u32 }
#[derive(Serialize)]
struct ScaleResponse { deployment_id: String, previous_replicas: u32, target_replicas: u32, status: String }

#[derive(Deserialize)]
struct StopRequest { container_id: String }
#[derive(Serialize)]
struct StopResponse { container_id: String, status: String, runtime_secs: u64 }

#[derive(Deserialize)]
struct LogsRequest { container_id: String, lines: Option<u32> }
#[derive(Serialize)]
struct LogsResponse { container_id: String, lines: Vec<String>, total_lines: u64 }

#[derive(Serialize)]
struct RuntimeInfo { name: String, version: String, isolation: String, startup_ms: u32, description: String }
#[derive(Serialize)]
struct StatsResponse { total_containers: u64, total_starts: u64, total_stops: u64, total_deploys: u64, vcpu_hours: f64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "container_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_containers: 0, total_starts: 0, total_stops: 0, total_deploys: 0, vcpu_hours: 0.0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/container/create", post(create_container))
        .route("/api/v1/container/deploy", post(deploy))
        .route("/api/v1/container/scale", post(scale))
        .route("/api/v1/container/stop", post(stop))
        .route("/api/v1/container/logs", post(logs))
        .route("/api/v1/container/runtimes", get(runtimes))
        .route("/api/v1/container/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("CONTAINER_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Container Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_starts + st.total_deploys })
}

async fn create_container(State(s): State<Arc<AppState>>, Json(req): Json<CreateContainerRequest>) -> Json<CreateContainerResponse> {
    let name = req.name.unwrap_or_else(|| format!("container-{}", &uuid::Uuid::new_v4().to_string()[..8]));
    let vcpu = req.vcpu.unwrap_or(0.25); let mem = req.memory_mb.unwrap_or(512);
    { let mut st = s.stats.lock().unwrap(); st.total_containers += 1; st.total_starts += 1; }
    Json(CreateContainerResponse { container_id: uuid::Uuid::new_v4().to_string(), name, image: req.image, vcpu, memory_mb: mem, status: "running".into(), startup_time_ms: 45 })
}

async fn deploy(State(s): State<Arc<AppState>>, Json(req): Json<DeployRequest>) -> Json<DeployResponse> {
    let replicas = req.replicas.unwrap_or(2);
    let region = req.region.unwrap_or_else(|| "us-east-1".into());
    let auto_scale = req.auto_scale.unwrap_or(false);
    s.stats.lock().unwrap().total_deploys += 1;
    Json(DeployResponse { deployment_id: uuid::Uuid::new_v4().to_string(), image: req.image.clone(), replicas, region: region.clone(), endpoint: format!("https://{}.container.alicelaw.net", req.image.split('/').last().unwrap_or("app")), auto_scale, status: "deploying".into() })
}

async fn scale(State(_s): State<Arc<AppState>>, Json(req): Json<ScaleRequest>) -> Json<ScaleResponse> {
    Json(ScaleResponse { deployment_id: req.deployment_id, previous_replicas: 2, target_replicas: req.replicas, status: "scaling".into() })
}

async fn stop(State(s): State<Arc<AppState>>, Json(req): Json<StopRequest>) -> Json<StopResponse> {
    let mut st = s.stats.lock().unwrap(); st.total_stops += 1; st.vcpu_hours += 0.5;
    Json(StopResponse { container_id: req.container_id, status: "stopped".into(), runtime_secs: 1800 })
}

async fn logs(State(_s): State<Arc<AppState>>, Json(req): Json<LogsRequest>) -> Json<LogsResponse> {
    let count = req.lines.unwrap_or(20) as usize;
    let lines: Vec<String> = (0..count).map(|i| format!("[2026-02-23T00:00:{}Z] INFO container runtime: request processed", i)).collect();
    Json(LogsResponse { container_id: req.container_id, lines, total_lines: 15000 })
}

async fn runtimes() -> Json<Vec<RuntimeInfo>> {
    Json(vec![
        RuntimeInfo { name: "alice-rt".into(), version: "1.0.0".into(), isolation: "cgroup-v2 + namespaces".into(), startup_ms: 45, description: "Rust-native container runtime with direct namespace control".into() },
        RuntimeInfo { name: "alice-rt-wasm".into(), version: "0.5.0".into(), isolation: "WebAssembly sandbox".into(), startup_ms: 5, description: "WASM-based micro-isolation for serverless functions".into() },
    ])
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse { total_containers: st.total_containers, total_starts: st.total_starts, total_stops: st.total_stops, total_deploys: st.total_deploys, vcpu_hours: st.vcpu_hours })
}
