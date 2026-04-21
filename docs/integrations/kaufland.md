# Kaufland Integration

## Status
- research_started: true
- implementation_started: false
- confidence: high

## Official access
- auth model: official seller API authentication
- app type: seller integration
- sandbox: not confirmed in this file
- rate limits: yes
- partner approval needed: seller account and API access required

## Supported capabilities
- account connection: yes
- listings create: yes
- listings update: yes
- listings pause/end: partial
- inventory sync: yes
- orders read: yes
- orders update: partial
- notifications/webhooks: yes
- messages read: partial, ticket-related capability exists
- messages write: partial, ticket-related capability exists

## Verified notes
- Official API areas include:
  - Orders
  - Tickets
  - Push Notifications
- Push notifications send HTTP POST events to a callback URL.
- Notification payloads are not necessarily the full business object; follow-up API fetches are part of the model.
- Kaufland has stronger official event support than many smaller marketplace targets.

## Known constraints
- Notification processing must be built as event intake plus follow-up reconciliation.
- Messaging should not be assumed to be a full universal inbox unless verified beyond ticket scope.
- Adapter should distinguish catalog/listing state from event processing state.

## Open questions
- Exact product and inventory endpoints to prioritize for V1
- Exact listing lifecycle endpoints
- Exact scope of ticket workflows relative to buyer messaging
- Exact sandbox/testing path

## Implementation notes
- Kaufland is a phase-2 target.
- Strong candidate for event-driven sync architecture.
- Build callback ingestion separately from marketplace data fetch logic.

## Decision
- keep
