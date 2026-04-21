# Shopify Integration

## Status
- research_started: true
- implementation_started: false
- confidence: high

## Official access
- auth model: Shopify app auth
- app type: prefer GraphQL Admin API for new work
- sandbox: dev stores / app development flow
- rate limits: yes
- partner approval needed: depends on app/distribution model and scopes

## Supported capabilities
- account connection: yes
- listings create: yes
- listings update: yes
- listings pause/end: partial, depends on product/publication/channel model
- inventory sync: yes
- orders read: yes
- orders update: yes, with resource-specific constraints
- notifications/webhooks: yes, but not yet detailed in this file
- messages read: not treated as a core official marketplace inbox capability here
- messages write: not treated as a core official marketplace inbox capability here

## Verified notes
- REST Admin API is legacy as of 2024-10-01.
- Starting 2025-04-01, all new public apps must use the GraphQL Admin API.
- Shopify GraphQL Admin API uses calculated query-cost rate limiting.
- Rate limits are scoped by app + store combination.
- REST Product CRUD is deprecated as of REST API 2024-04.
- Product work should therefore be planned against GraphQL-first architecture.

## Known constraints
- Do not build new BubuBay Shopify functionality around REST-first assumptions.
- Product model changes and deprecations mean Shopify adapter design should be GraphQL-first from day one.
- Resource behavior varies by scope and store plan.

## Open questions
- Exact webhook set for BubuBay V1
- Exact publication model for “listed everywhere” logic
- Exact inventory-location strategy per store
- Which Shopify actions belong in V1 vs later

## Implementation notes
- Shopify is a phase-1 target.
- Build GraphQL-first adapter only.
- Treat Shopify as one of the strongest official integrations in BubuBay.
- Separate Shopify product sync, inventory sync, and order sync concerns in the adapter.

## Decision
- keep
