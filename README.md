# BubuBay

BubuBay is a seller operating system for the owner's own use.

## Vision
Enter or import a product once, transform it into channel-specific listings, and manage products, listings, orders, notifications, and selected messaging workflows from one place.

## Primary goals
- Central product master for all channels
- Multi-channel listing and synchronization
- Bulk import from source links or product feeds
- Unified order and notification view
- Channel-specific actions such as update, pause, reserve, relist, and stock sync
- Highlights engine for trend discovery and fast reaction to product hype
- Strong documentation discipline so every model and agent can work from the same source of truth

## Current mode
- Owner-use only
- No external customers yet
- Stability, traceability, and speed are prioritized over SaaS packaging

## Principles
- API-first
- Browser automation only where APIs are missing or incomplete
- One product master, many channel adapters
- No hidden project knowledge in chat only
- Every session writes progress back into the repo

## Planned channel priority
1. eBay
2. Amazon
3. Shopify
4. OTTO Market
5. Kaufland Global Marketplace
6. Etsy
7. TikTok Shop
8. Additional channels later, only after validation

## Core modules
- Auth
- Account vault
- Product master
- Channel adapters
- Listing composer
- Bulk import queue
- Order sync
- Notification center
- Highlights engine
- Policy, pricing, compliance, and reconciliation jobs

## Repo rules
- README.md explains the whole product quickly
- docs/masterplan.md holds roadmap and phases
- docs/architecture.md defines system design
- docs/progress/YYYY-MM-DD.md stores session progress
- prompts/master-operator-prompt.md is the shared working prompt for all models
- docs/integrations/*.md stores channel-specific research and constraints

## How to work on BubuBay
Before coding:
1. Read README.md
2. Read docs/masterplan.md
3. Read docs/architecture.md
4. Read the newest docs/progress file
5. Read relevant docs/integrations files

After coding:
1. Update docs/progress
2. Record open issues and next steps
3. Keep docs and code aligned
4. Commit changes in small increments
