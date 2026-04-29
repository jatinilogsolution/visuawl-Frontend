import { useState } from "react";

const tabs = [
  { id: "overview", label: "🏗 Architecture" },
  { id: "plan", label: "📅 Sprint Plan" },
  { id: "db", label: "🗄 Database Schema" },
  { id: "requirements", label: "✅ Requirements" },
  { id: "encryption", label: "🔐 Encryption" },
  { id: "stack", label: "⚙️ Tech Stack" },
];

const dayPlan = [
  {
    week: "Week 1 — Foundation & Database",
    color: "#6366f1",
    days: [
      {
        day: 1,
        title: "DB Schema + Migrations",
        tasks: [
          "Write all 17 MySQL migration files (raw SQL, no ORM)",
          "Create tenants, users, plans, tenant_plans tables",
          "Create api_keys, encryption_keys tables",
          "Seed default plans: A=100, B=1000, C=5000, D=PAYG",
        ],
        deliverable: "All tables live in MySQL, migrations run clean",
      },
      {
        day: 2,
        title: "ElysiaJS Project Bootstrap",
        tasks: [
          "Init Bun + ElysiaJS project with folder structure",
          "Setup .env config (DB, Groq, Mistral keys, encryption secret)",
          "Setup MySQL2 pool connection (no ORM)",
          "Write base middleware: request-id, logger, error handler",
        ],
        deliverable: "Server boots, health check endpoint works, DB connected",
      },
      {
        day: 3,
        title: "Auth System — Multi-Tenant JWT",
        tasks: [
          "POST /auth/register (tenant + admin user creation)",
          "POST /auth/login (returns access + refresh JWT)",
          "JWT middleware: extract tenant_id + user_id from token",
          "Role system: super_admin, tenant_admin, tenant_user",
        ],
        deliverable: "Register → Login → Protected route working end-to-end",
      },
      {
        day: 4,
        title: "Tenant & Plan Management",
        tasks: [
          "CRUD endpoints for tenants (super_admin only)",
          "Assign plan to tenant endpoint",
          "GET /tenant/me — returns tenant + plan + usage",
          "Execution count validation middleware (check DB, not cache)",
        ],
        deliverable: "Tenant can see plan + remaining executions",
      },
      {
        day: 5,
        title: "AES-256-GCM Encryption Layer",
        tasks: [
          "Implement encrypt(text) / decrypt(cipher) utility using Node crypto",
          "Store per-tenant encryption key in encryption_keys table",
          "Apply encryption to: extracted_data, raw_input_path, email fields",
          "Write decryption helper script for emergency manual use",
        ],
        deliverable: "Sensitive DB fields encrypted at rest, decrypt utility tested",
      },
    ],
  },
  {
    week: "Week 2 — Core OCR Engine",
    color: "#0ea5e9",
    days: [
      {
        day: 6,
        title: "File Ingestion — Single + Bulk",
        tasks: [
          "POST /ingest/upload — single file (image/PDF)",
          "POST /ingest/bulk — multipart array, max 50 files",
          "File validation: type, size, virus check stub",
          "Store file to disk/S3 with encrypted path reference in DB",
        ],
        deliverable: "Files upload, paths stored encrypted in executions table",
      },
      {
        day: 7,
        title: "Groq + Mistral AI Integration",
        tasks: [
          "groqClient.ts — wrapper around Groq SDK (llama-3.2-vision)",
          "mistralClient.ts — wrapper around Mistral API (pixtral-12b)",
          "Fallback logic: try Groq first → fallback Mistral on failure",
          "Token counting: log prompt_tokens + completion_tokens per call",
        ],
        deliverable: "Pass an image → get raw text extraction from AI",
      },
      {
        day: 8,
        title: "Universal JSON Extraction Schema",
        tasks: [
          "Define universal_schema.json (vendor, date, line_items, total, tax, etc.)",
          "Build prompt template that forces AI output to match universal schema",
          "Parse + validate AI response against schema (zod-lite validation)",
          "Store result in executions.extracted_data (encrypted)",
        ],
        deliverable: "Invoice image → Universal JSON output, stored in DB",
      },
      {
        day: 9,
        title: "Custom Schema System",
        tasks: [
          "POST /schemas — tenant uploads their custom JSON schema",
          "Interactive schema builder API: POST /schemas/builder",
          "Merge universal + custom schema into final extraction prompt",
          "GET /schemas — list tenant's saved schemas",
        ],
        deliverable: "Tenant's custom schema produces custom-shaped output",
      },
      {
        day: 10,
        title: "n8n Workflow Integration",
        tasks: [
          "Expose webhook trigger endpoint: POST /webhook/n8n/:tenant_api_key",
          "Map n8n workflow nodes to our execution stages",
          "n8n calls back our /webhook/result with stage updates",
          "Test end-to-end: n8n triggers → OCR runs → result posted back",
        ],
        deliverable: "n8n workflow triggers OCR, stage updates flow back to DB",
      },
    ],
  },
  {
    week: "Week 3 — Multi-Origin, Multi-Destination, Monitoring",
    color: "#10b981",
    days: [
      {
        day: 11,
        title: "Multi-Origin Input Nodes",
        tasks: [
          "input_sources table: type=[upload, webhook, email, api, sftp]",
          "POST /sources — tenant configures a new input source",
          "Email poller service: check IMAP every N minutes per email_config",
          "Route each source type to unified ingest pipeline",
        ],
        deliverable: "4 input types all funnel into the same execution pipeline",
      },
      {
        day: 12,
        title: "Multi-Destination Output Delivery",
        tasks: [
          "output_destinations table: type=[webhook, email, s3, sftp, api_pull]",
          "POST /destinations — tenant configures output destination",
          "Output dispatcher: after extraction, push to all active destinations",
          "Retry logic: 3 attempts with exponential backoff per destination",
        ],
        deliverable: "Extracted JSON delivered to all configured destinations",
      },
      {
        day: 13,
        title: "Execution Logging + Stage Tracking",
        tasks: [
          "execution_stages table: stage_name, status, started_at, ended_at, error",
          "Stages: RECEIVED → QUEUED → PREPROCESSING → AI_EXTRACTION → VALIDATION → DELIVERY → DONE",
          "Write updateStage(execution_id, stage, status) utility",
          "GET /executions/:id/stages — full stage-wise progress",
        ],
        deliverable: "Every execution has 7-stage timeline stored in DB",
      },
      {
        day: 14,
        title: "Token Usage + Time Tracking",
        tasks: [
          "tokens_log table: prompt_tokens, completion_tokens, model, cost_usd",
          "Calculate cost per execution (Groq/Mistral pricing formulas)",
          "processing_time_ms column in executions table",
          "GET /analytics/tokens — tenant-level token summary",
        ],
        deliverable: "Tokens in/out + cost + time tracked per execution",
      },
      {
        day: 15,
        title: "Error Handling + Email Alerts",
        tasks: [
          "Global error handler: catches all unhandled errors, logs to error_logs",
          "Error categorizer: AI_FAILURE, DELIVERY_FAILURE, SCHEMA_ERROR, AUTH_ERROR",
          "Nodemailer setup: send alert email on critical errors",
          "alert_rules table: tenant configures which errors trigger emails",
        ],
        deliverable: "Errors auto-logged, critical ones auto-email tenant",
      },
    ],
  },
  {
    week: "Week 4 — Business Logic, Plans, Wallet",
    color: "#f59e0b",
    days: [
      {
        day: 16,
        title: "Plan Enforcement + Execution Count Validation",
        tasks: [
          "checkExecutionQuota(tenant_id) — pure DB query, no cache",
          "Plan A: 100/month, B: 1000/month, C: 5000/month, D: PAYG (wallet check)",
          "quota_exceeded error with HTTP 429 response",
          "Monthly reset cron: first day of month, reset execution_count",
        ],
        deliverable: "Plan limits enforced from DB on every execution attempt",
      },
      {
        day: 17,
        title: "Wallet + PAYG Billing",
        tasks: [
          "wallet_transactions table: credit/debit with balance running total",
          "Deduct per-execution cost from wallet on PAYG plan",
          "Low balance alert email (configurable threshold)",
          "POST /wallet/topup — admin adds credit (payment gateway stub)",
        ],
        deliverable: "PAYG executions deduct from wallet, low balance alerts work",
      },
      {
        day: 18,
        title: "API Key Generation + Management",
        tasks: [
          "POST /apikeys — generate SHA-256 hashed key, return plaintext once",
          "api_keys table: key_hash, name, last_used, is_active",
          "API key auth middleware (alternative to JWT for automation)",
          "DELETE /apikeys/:id — revoke key",
        ],
        deliverable: "Tenant generates API key, uses it for automation endpoints",
      },
      {
        day: 19,
        title: "Email Source Configuration",
        tasks: [
          "email_configs table: imap_host, email, folder, sender_filter (all encrypted)",
          "CRUD endpoints: POST/GET/PUT/DELETE /email-configs",
          "Email polling worker: connect IMAP, filter by sender, download attachments",
          "Trigger execution for each valid attachment found",
        ],
        deliverable: "Tenant configures Gmail/Outlook folder, attachments auto-process",
      },
      {
        day: 20,
        title: "Auto-Deletion Rules",
        tasks: [
          "auto_deletion_rules table: entity_type, after_days, is_active",
          "Deletion cron: runs nightly, deletes raw files + encrypted data after N days",
          "Soft-delete first (deleted_at), hard-delete after grace period",
          "POST /deletion-rules — tenant configures their retention policy",
        ],
        deliverable: "Data auto-purges per tenant-configured retention policy",
      },
    ],
  },
  {
    week: "Week 5 — Frontend Core",
    color: "#8b5cf6",
    days: [
      {
        day: 21,
        title: "React + TanStack Router Bootstrap",
        tasks: [
          "Init Vite + React + TanStack Router + Tailwind CSS",
          "Route structure: /login, /dashboard, /executions, /settings, /wallet",
          "Auth context: store JWT, auto-refresh, logout on 401",
          "API client (axios/fetch wrapper with auth header injection)",
        ],
        deliverable: "App boots, routing works, auth token persisted + injected",
      },
      {
        day: 22,
        title: "Login + Register + Onboarding",
        tasks: [
          "Login page → JWT → redirect to dashboard",
          "Register page → creates tenant + admin user",
          "Company details form (onboarding step)",
          "Plan selection screen",
        ],
        deliverable: "New tenant can register, pick plan, land on dashboard",
      },
      {
        day: 23,
        title: "Dashboard + Analytics",
        tasks: [
          "Execution summary cards: total, success, failed, pending",
          "Token usage chart (recharts)",
          "Recent executions table with status badges",
          "Wallet balance widget (PAYG tenants)",
        ],
        deliverable: "Dashboard shows live stats pulled from API",
      },
      {
        day: 24,
        title: "Upload + Bulk Upload UI",
        tasks: [
          "Drag-and-drop single upload with schema seler",
          "Bulk upload: file list, progress bars per file",
          "Schema seler dropdown (from tenant's saved schemas)",
          "Execution result modal: shows extracted JSON",
        ],
        deliverable: "Tenant uploads invoice, sees extracted JSON in UI",
      },
      {
        day: 25,
        title: "Execution History + Stage Viewer",
        tasks: [
          "Paginated executions table with filter (status, date, source)",
          "Click execution → timeline view of 7 stages",
          "Download extracted JSON button",
          "Re-run failed execution button",
        ],
        deliverable: "Full execution history with stage-wise drill-down",
      },
    ],
  },
  {
    week: "Week 6 — Frontend Advanced + Polish",
    color: "#ef4444",
    days: [
      {
        day: 26,
        title: "Interactive Schema Builder",
        tasks: [
          "Visual field builder: add field name, type, required, description",
          "Preview pane: shows resulting JSON schema",
          "Save as new schema or overwrite existing",
          "Test schema: upload sample invoice, see output",
        ],
        deliverable: "No-code schema builder works end-to-end",
      },
      {
        day: 27,
        title: "API Key + Email Config UI",
        tasks: [
          "API Keys page: generate, name, copy, revoke",
          "Email Sources page: add IMAP config, test connection button",
          "Output destinations page: add webhook URL, test ping",
          "Input sources overview with status indicators",
        ],
        deliverable: "Tenant fully manages their integrations from UI",
      },
      {
        day: 28,
        title: "Wallet + Billing UI",
        tasks: [
          "Wallet balance + transaction history table",
          "Top-up form (connects to payment gateway)",
          "Usage breakdown: cost per execution",
          "Plan upgrade seler",
        ],
        deliverable: "PAYG tenant manages wallet entirely from UI",
      },
      {
        day: 29,
        title: "Settings + Company Profile",
        tasks: [
          "Company details edit form",
          "User management: invite user, assign role",
          "Notification preferences: which errors send email",
          "Auto-deletion rules configuration UI",
        ],
        deliverable: "All settings manageable from UI without backend dev",
      },
      {
        day: 30,
        title: "QA + Integration Testing",
        tasks: [
          "End-to-end test: register → upload → extract → delivery",
          "Plan limit enforcement test (hit quota → 429)",
          "Multi-tenant isolation test (tenant A cannot see tenant B data)",
          "Encryption verify: confirm DB fields are ciphertext",
        ],
        deliverable: "All 30 days of work verified working as a system",
      },
    ],
  },
];

const dbTables = [
  {
    name: "tenants",
    purpose: "Core company/tenant record",
    columns: [
      "id CHAR(36) PK",
      "name VARCHAR(255) — encrypted",
      "slug VARCHAR(100) UNIQUE",
      "status ENUM(active, suspended, deleted)",
      "created_at, updated_at, deleted_at",
    ],
  },
  {
    name: "users",
    purpose: "Users belonging to a tenant",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "email VARCHAR(255) UNIQUE — encrypted",
      "password_hash VARCHAR(255)",
      "role ENUM(tenant_admin, tenant_user)",
      "created_at, updated_at",
    ],
  },
  {
    name: "plans",
    purpose: "Subscription plan definitions",
    columns: [
      "id CHAR(36) PK",
      "name VARCHAR(50) — A/B/C/D",
      "execution_limit INT NULL (NULL = unlimited/PAYG)",
      "is_payg TINYINT(1) DEFAULT 0",
      "price_per_execution DECIMAL(10,6) — for PAYG",
      "created_at",
    ],
  },
  {
    name: "tenant_plans",
    purpose: "Active plan subscription per tenant",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "plan_id CHAR(36) FK → plans",
      "executions_used INT DEFAULT 0",
      "period_start DATE, period_end DATE",
      "is_active TINYINT(1)",
    ],
  },
  {
    name: "api_keys",
    purpose: "API keys for tenant automation",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "key_hash VARCHAR(64) UNIQUE — SHA-256",
      "name VARCHAR(100)",
      "last_used_at DATETIME",
      "is_active TINYINT(1)",
      "created_at, revoked_at",
    ],
  },
  {
    name: "executions",
    purpose: "Every OCR job record",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "user_id CHAR(36) FK → users NULLABLE",
      "source_type ENUM(upload, webhook, email, api, sftp)",
      "status ENUM(queued, processing, success, failed, stopped)",
      "raw_input_path TEXT — encrypted",
      "extracted_data LONGTEXT — AES encrypted JSON",
      "schema_id CHAR(36) FK → extraction_schemas NULLABLE",
      "processing_time_ms INT",
      "error_message TEXT",
      "created_at, completed_at, deleted_at",
    ],
  },
  {
    name: "execution_stages",
    purpose: "Stage-wise progress per execution",
    columns: [
      "id CHAR(36) PK",
      "execution_id CHAR(36) FK → executions",
      "stage_name ENUM(RECEIVED, QUEUED, PREPROCESSING, AI_EXTRACTION, VALIDATION, DELIVERY, DONE)",
      "status ENUM(pending, running, success, failed, skipped)",
      "started_at DATETIME, ended_at DATETIME",
      "error_detail TEXT",
      "metadata JSON",
    ],
  },
  {
    name: "tokens_log",
    purpose: "AI token usage per execution",
    columns: [
      "id CHAR(36) PK",
      "execution_id CHAR(36) FK → executions",
      "model VARCHAR(100) — groq/mistral model name",
      "prompt_tokens INT",
      "completion_tokens INT",
      "total_tokens INT",
      "cost_usd DECIMAL(10,8)",
      "created_at",
    ],
  },
  {
    name: "input_sources",
    purpose: "Multi-origin input channel configs",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "type ENUM(upload, webhook, email, api, sftp)",
      "config JSON — encrypted (host, credentials, folder, etc.)",
      "is_active TINYINT(1)",
      "created_at, updated_at",
    ],
  },
  {
    name: "output_destinations",
    purpose: "Multi-destination output delivery configs",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "type ENUM(webhook, email, s3, sftp, api_pull)",
      "config JSON — encrypted (URL, credentials, format)",
      "is_active TINYINT(1)",
      "created_at, updated_at",
    ],
  },
  {
    name: "extraction_schemas",
    purpose: "Custom JSON schemas per tenant",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "name VARCHAR(100)",
      "schema_definition JSON",
      "is_default TINYINT(1)",
      "created_at, updated_at",
    ],
  },
  {
    name: "email_configs",
    purpose: "Email source polling configuration",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "email_address VARCHAR(255) — encrypted",
      "imap_host TEXT — encrypted",
      "imap_port INT",
      "password_encrypted TEXT",
      "folder_name VARCHAR(255) — encrypted",
      "sender_filter VARCHAR(255) — encrypted",
      "poll_interval_minutes INT DEFAULT 5",
      "is_active TINYINT(1)",
    ],
  },
  {
    name: "wallet_transactions",
    purpose: "PAYG wallet credits and debits",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "type ENUM(credit, debit)",
      "amount DECIMAL(10,4)",
      "balance_after DECIMAL(10,4)",
      "reference_id CHAR(36) — execution_id or topup_id",
      "note TEXT",
      "created_at",
    ],
  },
  {
    name: "auto_deletion_rules",
    purpose: "Data retention + auto-deletion config",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "entity_type ENUM(execution_data, raw_files, error_logs)",
      "delete_after_days INT",
      "is_active TINYINT(1) DEFAULT 1",
      "created_at, updated_at",
    ],
  },
  {
    name: "error_logs",
    purpose: "Centralised error tracking",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants NULLABLE",
      "execution_id CHAR(36) FK → executions NULLABLE",
      "error_type ENUM(AI_FAILURE, DELIVERY_FAILURE, SCHEMA_ERROR, AUTH_ERROR, SYSTEM)",
      "message TEXT",
      "stack_trace TEXT",
      "is_alerted TINYINT(1) DEFAULT 0",
      "created_at",
    ],
  },
  {
    name: "alert_rules",
    purpose: "Email alert trigger configuration",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants",
      "error_type ENUM(AI_FAILURE, DELIVERY_FAILURE, SCHEMA_ERROR, ALL)",
      "alert_email VARCHAR(255) — encrypted",
      "is_active TINYINT(1) DEFAULT 1",
      "created_at",
    ],
  },
  {
    name: "encryption_keys",
    purpose: "Per-tenant AES encryption keys",
    columns: [
      "id CHAR(36) PK",
      "tenant_id CHAR(36) FK → tenants UNIQUE",
      "key_ciphertext TEXT — master key encrypted",
      "iv VARCHAR(64)",
      "created_at, rotated_at",
    ],
  },
];

const requirements = [
  {
    id: 1,
    title: "Multi-Origin Data Receiving Nodes",
    answer:
      "input_sources table stores configs for: file upload (UI/API), webhook (n8n trigger), email (IMAP polling), SFTP, and direct API. All funnel into a unified ingest pipeline. Day 11.",
    status: "Planned",
  },
  {
    id: 2,
    title: "Multi-Destination Extracted Data Delivery",
    answer:
      "output_destinations table stores webhook URLs, email, S3, SFTP targets. Output dispatcher fires after every successful extraction. Retry with backoff. Day 12.",
    status: "Planned",
  },
  {
    id: 3,
    title: "Data Encryption",
    answer:
      "AES-256-GCM per-tenant key. Sensitive DB fields encrypted at write, decrypted at read. Raw file paths, extracted JSON, email credentials, IMAP passwords all encrypted. Day 5.",
    status: "Planned",
  },
  {
    id: 4,
    title: "Auto-Deletion of Executed Data",
    answer:
      "auto_deletion_rules table + nightly cron job. Tenant configures retention (e.g., delete raw files after 7 days, extracted data after 30 days). Soft-delete then hard-delete. Day 20.",
    status: "Planned",
  },
  {
    id: 5,
    title: "Auto-Email Alert for Errors",
    answer:
      "alert_rules table + Nodemailer. Tenant configures which error types trigger email alerts and to which address. Fires on error_log insert if matching rule exists. Day 15.",
    status: "Planned",
  },
  {
    id: 6,
    title: "Auto-Error Handling",
    answer:
      "Global ElysiaJS error handler catches all exceptions. Categorises into 5 error types. Logs to error_logs table. Returns consistent error shape. Retries AI calls once before marking failed. Day 15.",
    status: "Planned",
  },
  {
    id: 7,
    title: "Time Saving (processing_time_ms)",
    answer:
      "executions.processing_time_ms records total wall time. execution_stages has started_at + ended_at per stage so you can see exactly where time is spent. Day 14.",
    status: "Planned",
  },
  {
    id: 8,
    title: "Token Records per AI Execution",
    answer:
      "tokens_log table: prompt_tokens, completion_tokens, total_tokens, cost_usd, model. One row per AI call. Multiple rows if fallback fires. Tenant analytics endpoint aggregates. Day 14.",
    status: "Planned",
  },
  {
    id: 9,
    title: "Store Execution Data with Stage Progress",
    answer:
      "executions table (overall status) + execution_stages table (7-stage timeline: RECEIVED → QUEUED → PREPROCESSING → AI_EXTRACTION → VALIDATION → DELIVERY → DONE). Day 13.",
    status: "Planned",
  },
  {
    id: 10,
    title: "Multi-Tenant Execution",
    answer:
      "Every table has tenant_id FK. JWT middleware extracts tenant_id and injects it into every query. Middleware guard: tenant can only read their own executions. Day 3-4.",
    status: "Planned",
  },
  {
    id: 11,
    title: "Execution Limits per Plan",
    answer:
      "plans table: Plan A=100, B=1000, C=5000, D=PAYG (wallet-based). checkExecutionQuota() queries tenant_plans.executions_used before every execution. Monthly reset cron. Day 16.",
    status: "Planned",
  },
  {
    id: 12,
    title: "All Data in MySQL",
    answer:
      "MySQL2 pool, raw SQL queries throughout. 17 tables covering all features. No ORM, raw migrations. Day 1.",
    status: "Planned",
  },
  {
    id: 13,
    title: "Execution Count Validated from DB",
    answer:
      "No caching for quota checks. Every execution calls SELECT executions_used, execution_limit FROM tenant_plans JOIN plans live from MySQL. Day 16.",
    status: "Planned",
  },
  {
    id: 14,
    title: "Create Tables for All Features",
    answer:
      "17 tables: tenants, users, plans, tenant_plans, api_keys, executions, execution_stages, tokens_log, input_sources, output_destinations, extraction_schemas, email_configs, wallet_transactions, auto_deletion_rules, error_logs, alert_rules, encryption_keys. Day 1.",
    status: "Planned",
  },
  {
    id: 15,
    title: "Encrypt Data in Database",
    answer:
      "AES-256-GCM. Per-tenant key stored in encryption_keys (master-key-wrapped). Fields encrypted: extracted_data, raw_input_path, email, imap credentials, sender_filter, alert_email. Day 5.",
    status: "Planned",
  },
  {
    id: 16,
    title: "Decryption Key + Manual Recovery",
    answer:
      "See Encryption tab. Master key in .env. Per-tenant key in encryption_keys table. Emergency decrypt script provided. Run: node scripts/decrypt.js --tenant-id=X --field=extracted_data --row-id=Y",
    status: "See Encryption Tab",
  },
];

const stackDecisions = [
  {
    layer: "Backend Runtime",
    choice: "Bun + ElysiaJS",
    why: "Fastest JS runtime, ElysiaJS has Zod-native validation, great DX.  mentioned Go — flag: if team knows Go, use Fiber instead. Same architecture applies.",
    flag: "⚠️  mentioned Golang — align with team before starting.",
  },
  {
    layer: "Database",
    choice: "MySQL 8 + mysql2 (raw SQL)",
    why: "Explicit migrations, full control, no ORM magic hiding N+1 queries. UUID v4 for all PKs (tenant isolation).",
    flag: null,
  },
  {
    layer: "AI Providers",
    choice: "Groq (primary) + Mistral (fallback)",
    why: "Groq llama-3.2-vision-11b for speed. Mistral pixtral-12b as fallback. Fallback fires on HTTP 429, 500 or timeout >8s.",
    flag: null,
  },
  {
    layer: "Workflow Engine",
    choice: "n8n (existing workflow)",
    why: "Already built. Expose webhook endpoints for n8n to trigger. n8n calls back stage updates via our /webhook/result endpoint.",
    flag: null,
  },
  {
    layer: "Frontend",
    choice: "React 19 + TanStack Router v1 + Tailwind v4",
    why: "Type-safe routing, file-based routes, Tailwind v4 is faster. Recharts for analytics. React Query for server state.",
    flag: null,
  },
  {
    layer: "File Storage",
    choice: "Local disk (Phase 1) → S3-compatible (Phase 2)",
    why: "Don't over-engineer storage on day 1. Abstract behind a StorageProvider interface so swapping to S3 is one file change.",
    flag: null,
  },
  {
    layer: "Email",
    choice: "Nodemailer + IMAP (imap-simple library)",
    why: "Nodemailer for sending alerts. imap-simple for polling email sources. Both battle-tested.",
    flag: null,
  },
  {
    layer: "Encryption",
    choice: "Node.js crypto (AES-256-GCM) — built-in, zero deps",
    why: "No external encryption library needed. AES-256-GCM is authenticated encryption (prevents tampering). Per-tenant key rotation possible.",
    flag: null,
  },
  {
    layer: "Queuing",
    choice: "In-process queue (Phase 1) → Bull/Redis (Phase 2)",
    why: "For MVP, in-process async is enough. When bulk uploads hit 50+ files concurrently, add Bull queue. Don't add Redis on day 1.",
    flag: null,
  },
];

export default function Blueprint() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', monospace", background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "32px 40px 0", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ background: "#6366f1", width: 10, height: 10, borderRadius: 2, transform: "rotate(45deg)" }} />
            <span style={{ color: "#6366f1", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>SaaS Architecture Blueprint</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", margin: "0 0 4px", letterSpacing: -1 }}>
            OCR / Invoice Extraction DOM
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>
            ElysiaJS · React · TanStack Router · MySQL · Groq · Mistral · n8n · 17 Tables · 30-Day Build Plan
          </p>

          {/* Warning Banner */}
          <div style={{ background: "#451a03", border: "1px solid #f59e0b", borderRadius: 6, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "#fcd34d", display: "flex", gap: 8 }}>
            <span>⚠️</span>
            <span><strong> flagged Golang</strong> — but your stack below uses ElysiaJS (Bun). Align with your team before Day 1. All architecture patterns apply equally to Go (Fiber/Chi). Tell your .</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id ? "#6366f1" : "transparent",
                  color: activeTab === t.id ? "#fff" : "#64748b",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "6px 6px 0 0",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  letterSpacing: 0.3,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px" }}>

        {/* ARCHITECTURE TAB */}
        {activeTab === "overview" && (
          <div>
            <h2 style={{ color: "#6366f1", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>System Architecture</h2>
            
            {/* Data Flow Diagram */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 28, marginBottom: 28 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>DATA FLOW</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, alignItems: "center" }}>
                {[
                  { label: "INPUTS", items: ["📤 File Upload", "🔗 Webhook", "📧 Email IMAP", "🔌 API Direct", "📁 SFTP"], color: "#0ea5e9" },
                  { label: "INGEST", items: ["Validate", "Encrypt path", "Create execution", "Set QUEUED stage"], color: "#6366f1" },
                  { label: "AI ENGINE", items: ["Groq Vision (primary)", "Mistral (fallback)", "Universal Schema", "Custom Schema", "Token logging"], color: "#10b981" },
                  { label: "POST-PROCESS", items: ["Schema validation", "Stage: DELIVERY", "Encrypt result", "Deduct wallet", "Log tokens"], color: "#f59e0b" },
                  { label: "OUTPUTS", items: ["🔗 Webhook push", "📧 Email delivery", "☁️ S3 upload", "📁 SFTP write", "📥 API pull"], color: "#ef4444" },
                ].map((col, i) => (
                  <div key={i}>
                    <div style={{ color: col.color, fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>{col.label}</div>
                    <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 8px", border: `1px solid ${col.color}33` }}>
                      {col.items.map((item, j) => (
                        <div key={j} style={{ fontSize: 11, color: "#cbd5e1", padding: "4px 0", borderBottom: j < col.items.length - 1 ? "1px solid #0f172a" : "none" }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color: "#475569", fontSize: 11, marginTop: 16, textAlign: "center" }}>
                Every stage updates execution_stages table · Errors → error_logs → alert_rules → Nodemailer
              </div>
            </div>

            {/* Folder Structure */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
                <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>BACKEND STRUCTURE (ElysiaJS)</div>
                <pre style={{ color: "#94a3b8", fontSize: 11, margin: 0, lineHeight: 1.7 }}>
{`src/
├── routes/
│   ├── auth.ts
│   ├── executions.ts
│   ├── ingest.ts
│   ├── schemas.ts
│   ├── apikeys.ts
│   ├── wallet.ts
│   ├── sources.ts
│   ├── destinations.ts
│   └── webhook.ts
├── services/
│   ├── groqClient.ts
│   ├── mistralClient.ts
│   ├── ocrService.ts
│   ├── emailPoller.ts
│   ├── outputDispatcher.ts
│   └── alertService.ts
├── middleware/
│   ├── auth.ts
│   ├── tenantQuota.ts
│   └── errorHandler.ts
├── db/
│   ├── pool.ts
│   └── migrations/ (17 .sql files)
├── utils/
│   ├── encrypt.ts
│   ├── decrypt.ts
│   └── uuid.ts
└── crons/
    ├── resetQuota.ts
    └── autoDeletion.ts`}
                </pre>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
                <div style={{ color: "#8b5cf6", fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>FRONTEND STRUCTURE (React)</div>
                <pre style={{ color: "#94a3b8", fontSize: 11, margin: 0, lineHeight: 1.7 }}>
{`src/
├── routes/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── dashboard/
│   │   ├── index.tsx
│   │   ├── executions/
│   │   │   ├── index.tsx
│   │   │   └── $id.tsx
│   │   ├── upload.tsx
│   │   ├── schemas.tsx
│   │   ├── api-keys.tsx
│   │   ├── sources.tsx
│   │   ├── destinations.tsx
│   │   ├── wallet.tsx
│   │   └── settings.tsx
├── components/
│   ├── ui/ (button, card, badge)
│   ├── SchemaBuilder.tsx
│   ├── ExecutionTimeline.tsx
│   └── WalletWidget.tsx
├── lib/
│   ├── api.ts (axios client)
│   └── auth.ts (JWT store)
└── hooks/`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SPRINT PLAN TAB */}
        {activeTab === "plan" && (
          <div>
            <h2 style={{ color: "#6366f1", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>30-Day Build Sprint</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>
              Core logic first → working system → scale features → polish. Never skip phases.
            </p>
            {dayPlan.map((week) => (
              <div key={week.week} style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 20, background: week.color, borderRadius: 2 }} />
                  <h3 style={{ color: week.color, margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>{week.week}</h3>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {week.days.map((d) => (
                    <div key={d.day} style={{ background: "#0f172a", border: `1px solid ${week.color}22`, borderLeft: `3px solid ${week.color}`, borderRadius: "0 8px 8px 0", padding: "16px 20px", display: "grid", gridTemplateColumns: "60px 1fr 280px", gap: 20, alignItems: "start" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: week.color, fontSize: 20, fontWeight: 700 }}>D{d.day}</div>
                      </div>
                      <div>
                        <div style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{d.title}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {d.tasks.map((t, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8" }}>
                              <span style={{ color: week.color, flexShrink: 0 }}>›</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: "#1e293b", borderRadius: 6, padding: "10px 12px" }}>
                        <div style={{ color: "#475569", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>DELIVERABLE</div>
                        <div style={{ color: "#e2e8f0", fontSize: 11, lineHeight: 1.5 }}>{d.deliverable}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DB SCHEMA TAB */}
        {activeTab === "db" && (
          <div>
            <h2 style={{ color: "#6366f1", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Database Schema — 17 Tables</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>MySQL 8 · Raw SQL migrations · UUID v4 PKs · No ORM</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {dbTables.map((t) => (
                <div key={t.name} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <div style={{ color: "#10b981", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{t.name}</div>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11, marginBottom: 10 }}>{t.purpose}</div>
                  {t.columns.map((c, i) => (
                    <div key={i} style={{ fontSize: 11, color: "#94a3b8", padding: "3px 0", borderBottom: i < t.columns.length - 1 ? "1px solid #1e293b" : "none", fontFamily: "monospace" }}>
                      {c.includes("encrypted") ? <span style={{ color: "#f59e0b" }}>{c}</span> : c}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #f59e0b33", borderRadius: 8, padding: 16, marginTop: 20, fontSize: 12 }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>🔑 Encrypted columns</span>
              <span style={{ color: "#94a3b8", marginLeft: 8 }}>Fields marked "encrypted" store AES-256-GCM ciphertext. The encryption key is per-tenant, stored in encryption_keys table, master-key-wrapped.</span>
            </div>
          </div>
        )}

        {/* REQUIREMENTS TAB */}
        {activeTab === "requirements" && (
          <div>
            <h2 style={{ color: "#6366f1", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 28 }}>All 16 Requirements — How They're Solved</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {requirements.map((r) => (
                <div key={r.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 18, display: "grid", gridTemplateColumns: "36px 1fr", gap: 16 }}>
                  <div style={{ background: "#6366f1", borderRadius: 6, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {r.id}
                  </div>
                  <div>
                    <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{r.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{r.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENCRYPTION TAB */}
        {activeTab === "encryption" && (
          <div>
            <h2 style={{ color: "#6366f1", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>Encryption Strategy + Emergency Decryption</h2>

            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ background: "#0f172a", border: "1px solid #10b981", borderRadius: 10, padding: 24 }}>
                <div style={{ color: "#10b981", fontWeight: 700, marginBottom: 16 }}>How It Works</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 2 }}>
                  <div>1. <strong style={{ color: "#e2e8f0" }}>Master Key</strong> — stored in .env as ENCRYPTION_MASTER_KEY (32 bytes, hex). Never in DB.</div>
                  <div>2. <strong style={{ color: "#e2e8f0" }}>Per-Tenant Key</strong> — generated on tenant create. Encrypted with master key. Stored in encryption_keys table.</div>
                  <div>3. <strong style={{ color: "#e2e8f0" }}>Field Encryption</strong> — AES-256-GCM. Each encrypt() call generates a fresh 12-byte IV. Output = iv:authTag:ciphertext (base64).</div>
                  <div>4. <strong style={{ color: "#e2e8f0" }}>Authenticated</strong> — GCM mode includes an auth tag. If ciphertext is tampered, decryption throws. Prevents silent data corruption.</div>
                </div>
              </div>

              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 24 }}>
                <div style={{ color: "#8b5cf6", fontWeight: 700, marginBottom: 16 }}>encrypt.ts / decrypt.ts</div>
                <pre style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.7, margin: 0, overflow: "auto" }}>
{`// src/utils/encrypt.ts
import crypto from 'crypto';

const MASTER_KEY = Buffer.from(process.env.ENCRYPTION_MASTER_KEY!, 'hex'); // 32 bytes

export function encryptWithKey(text: string, tenantKey: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', tenantKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptWithKey(ciphertext: string, tenantKey: Buffer): string {
  const [ivB64, tagB64, dataB64] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', tenantKey, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return decipher.update(Buffer.from(dataB64, 'base64')).toString('utf8') + decipher.final('utf8');
}

export function encryptMasterKey(tenantKey: Buffer): string {
  return encryptWithKey(tenantKey.toString('hex'), MASTER_KEY);
}

export function decryptTenantKey(ciphertext: string): Buffer {
  return Buffer.from(decryptWithKey(ciphertext, MASTER_KEY), 'hex');
}`}
                </pre>
              </div>

              <div style={{ background: "#0f172a", border: "1px solid #ef4444", borderRadius: 10, padding: 24 }}>
                <div style={{ color: "#ef4444", fontWeight: 700, marginBottom: 16 }}>⚠️ Emergency Manual Decryption Script</div>
                <pre style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.7, margin: 0, overflow: "auto" }}>
{`// scripts/decrypt.js  ← run this if you need to manually recover data
// Usage:
//   ENCRYPTION_MASTER_KEY=<your_key> node scripts/decrypt.js \\
//     --tenant-id=abc-123 \\
//     --table=executions \\
//     --field=extracted_data \\
//     --row-id=exec-456

const crypto = require('crypto');
const mysql = require('mysql2/promise');

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map(a => a.replace('--','').split('='))
  );

  const MASTER_KEY = Buffer.from(process.env.ENCRYPTION_MASTER_KEY, 'hex');
  const db = await mysql.createConnection(process.env.DATABASE_URL);

  // 1. Get per-tenant encrypted key
  const [[keyRow]] = await db.execute(
    'SELECT key_ciphertext FROM encryption_keys WHERE tenant_id = ?',
    [args['tenant-id']]
  );
  const tenantKey = decryptField(keyRow.key_ciphertext, MASTER_KEY);

  // 2. Get encrypted field
  const [[row]] = await db.execute(
    \`SELECT \${args.field} FROM \${args.table} WHERE id = ?\`,
    [args['row-id']]
  );

  // 3. Decrypt and print
  const plaintext = decryptField(row[args.field], Buffer.from(tenantKey, 'hex'));
  console.log('\\n✅ DECRYPTED VALUE:\\n', plaintext);
  await db.end();
}

function decryptField(ciphertext, key) {
  const [ivB64, tagB64, dataB64] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return decipher.update(Buffer.from(dataB64, 'base64')).toString('utf8') + decipher.final('utf8');
}

main().catch(console.error);`}
                </pre>
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#1e293b", borderRadius: 6, fontSize: 11, color: "#fcd34d" }}>
                  🔑 <strong>Your master key</strong> = the value of ENCRYPTION_MASTER_KEY in your .env file.<br />
                  Generate one with: <code style={{ background: "#0f172a", padding: "2px 6px", borderRadius: 3 }}>node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"</code><br />
                  <strong>Back this up offline. Losing it = losing all encrypted data permanently.</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TECH STACK TAB */}
        {activeTab === "stack" && (
          <div>
            <h2 style={{ color: "#6366f1", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 28 }}>Tech Stack Decisions + Reasoning</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {stackDecisions.map((s, i) => (
                <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, minWidth: 120 }}>{s.layer}</span>
                      <span style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>{s.choice}</span>
                    </div>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, marginBottom: s.flag ? 10 : 0 }}>{s.why}</div>
                  {s.flag && (
                    <div style={{ background: "#451a03", border: "1px solid #f59e0b44", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#fcd34d" }}>
                      {s.flag}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #6366f1", borderRadius: 10, padding: 24, marginTop: 24 }}>
              <div style={{ color: "#6366f1", fontWeight: 700, marginBottom: 16 }}>What to Build in Which Order (Core → Scale)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 12 }}>
                {[
                  { phase: "Phase 1 — Core (Days 1-15)", color: "#10b981", items: ["DB + Auth + Encryption", "File upload → AI extraction", "Universal + Custom schemas", "n8n integration", "Stage tracking + error logging"] },
                  { phase: "Phase 2 — Business (Days 16-20)", color: "#f59e0b", items: ["Plan limits from DB", "Wallet + PAYG", "API keys", "Email source polling", "Auto-deletion"] },
                  { phase: "Phase 3 — Frontend (Days 21-30)", color: "#8b5cf6", items: ["Auth + Dashboard", "Upload UI + results", "Schema builder", "API keys + sources UI", "Wallet + settings"] },
                ].map((p) => (
                  <div key={p.phase} style={{ background: "#1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ color: p.color, fontWeight: 700, marginBottom: 10, fontSize: 11 }}>{p.phase}</div>
                    {p.items.map((item, i) => (
                      <div key={i} style={{ color: "#94a3b8", padding: "4px 0", borderBottom: i < p.items.length - 1 ? "1px solid #0f172a" : "none", display: "flex", gap: 6 }}>
                        <span style={{ color: p.color }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}