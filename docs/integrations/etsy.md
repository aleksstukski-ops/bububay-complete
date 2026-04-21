# Etsy Integration

## Status
- research_started: true
- implementation_started: false
- confidence: medium-high

## Official access
- auth model: OAuth2 / personal access depending on usage path
- app type: Etsy Open API v3 integration
- sandbox: not confirmed in this file
- rate limits: yes
- partner approval needed: depends on access path and scope

## Supported capabilities
- account connection: yes
- listings create: yes
- listings update: yes
- listings pause/end: yes, listing lifecycle support exists
- inventory sync: partial
- orders read: partial
- orders update: partial
- notifications/webhooks: yes
- messages read: unknown in this file
- messages write: unknown in this file

## Verified notes
- Etsy Open API v3 is the relevant official API surface.
- Listing workflows are officially documented.
- Listing scopes include read/write/delete style permissions.
- Webhooks exist and should be considered for event-driven sync.

## Known constraints
- Etsy-specific listing and shop model must not be forced into a generic marketplace shape.
- Messaging capability is not verified here and must not be assumed.
- Inventory and order scope still need deeper implementation mapping.

## Open questions
- Exact order endpoints and practical BubuBay V1 scope
- Exact webhook set to use
- Exact publication and deactivate semantics
- Exact variation/inventory model for multi-variant products

## Implementation notes
- Etsy is a phase-2 target.
- Focus first on listing lifecycle and webhook-driven state updates.
- Keep Etsy adapter isolated from eBay/Amazon assumptions.

## Decision
- keep
