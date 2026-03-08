-- ALICE Container Cloud: Domain-specific tables
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    vcpu DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    memory_mb INTEGER NOT NULL DEFAULT 512,
    runtime TEXT NOT NULL DEFAULT 'alice-rt' CHECK (runtime IN ('alice-rt', 'alice-rt-wasm')),
    startup_time_ms INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('creating', 'running', 'stopped', 'failed', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    stopped_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS container_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    image TEXT NOT NULL,
    replicas INTEGER NOT NULL DEFAULT 2,
    region TEXT NOT NULL DEFAULT 'us-east-1',
    auto_scale BOOLEAN NOT NULL DEFAULT false,
    min_replicas INTEGER NOT NULL DEFAULT 1,
    max_replicas INTEGER NOT NULL DEFAULT 10,
    endpoint TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'deploying' CHECK (status IN ('deploying', 'running', 'scaling', 'stopped')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_containers_user ON containers(user_id);
CREATE INDEX idx_container_deployments_user ON container_deployments(user_id);
