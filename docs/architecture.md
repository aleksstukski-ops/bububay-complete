# BubuBay Architecture

## System overview

### Core idea
BubuBay should be designed around one canonical product model and many channel adapters.

### High-level components
- frontend web app
- backend API
- worker layer
- account vault
- product master
- listing composer
- channel adapters
- order sync and notification sync
- highlights pipeline
- media vault
- reconciliation jobs

## Recommended architecture

### 1. Product master
Canonical model that stores:
- source metadata
- normalized product title, description, attributes, category hints
- pricing inputs
- media assets
- compliance and risk flags
- per-channel state

### 2. Channel adapter interface
Each marketplace gets its own adapter with a common contract:
- connect account
- validate permissions
- create draft listing
- publish listing
- update listing
- pause or end listing
- fetch orders
- fetch notifications
- fetch messages if officially supported
- reconcile current state

Never put channel-specific rules directly into the product core.

### 3. Listing composer
Transforms the product master into channel-specific payloads:
- titles
- descriptions
- category mappings
- pricing rules
- shipping rules
- media mapping
- variation logic

### 4. Bulk import queue
Needed for 50 to 1000 source links.
Stages:
- enqueue
- fetch source
- parse
- normalize
- enrich
- create product draft
- channel-ready review
- publish

### 5. Account vault
Store third-party credentials and tokens securely.
Rules:
- encrypt reversible credentials
- hash local app passwords
- separate app auth from marketplace auth
- support later rotation of secrets and keys

### 6. Sync and reconciliation
Do not assume marketplace state equals local state.
Need background jobs for:
- order pull or webhook processing
- stock and price reconciliation
- listing status reconciliation
- repair jobs for failed pushes
- audit trail of changes

### 7. Highlights engine
Pipeline:
- source discovery
- candidate extraction
- hype scoring
- product entity resolution
- media linking
- merchant and source linking
- quick actions

### 8. Notifications and messaging
Treat messaging per channel capability:
- full read/write if official support exists
- read-only if only partial support exists
- notify-only if no safe direct response path exists

## Recommended repo layout
- backend/
- frontend/
- workers/
- adapters/
- docs/
- prompts/
- scripts/

## Non-negotiables
- every integration documented
- every important decision recorded
- every session adds progress notes
- no silent architecture drift
