# OTTO Market Integration

## Status
- research_started: true
- implementation_started: false
- confidence: high

## Official access
- auth model: OAuth2
- app type: seller or service partner integration
- sandbox: yes
- rate limits: yes
- partner approval needed: practical access depends on OTTO Market onboarding and roles

## Supported capabilities
- account connection: yes
- listings create: yes
- listings update: yes
- listings pause/end: partial, depends on product/availability model
- inventory sync: yes
- orders read: yes
- orders update: partial
- notifications/webhooks: not yet documented here
- messages read: unknown in this file
- messages write: unknown in this file

## Verified notes
- Official API areas include:
  - Products
  - Shipping Profiles
  - Availability
  - Orders
  - Returns
  - Receipts
- Official docs include OAuth scopes and sandbox guidance.
- OTTO is a serious candidate for structured marketplace operations, not just simple listing push.

## Known constraints
- Access depends on real marketplace onboarding.
- Channel behavior must be modeled around OTTO's product plus availability plus order concepts.
- Messaging capability is not yet verified here and must not be assumed.

## Open questions
- Exact webhook or notification strategy
- Exact product publication lifecycle
- Exact listing pause/end semantics
- Exact support for post-order operational actions in BubuBay V1

## Implementation notes
- OTTO is a phase-2 target.
- Use dedicated adapter, not generic marketplace logic.
- Separate product, availability, and order flows in adapter design.

## Decision
- keep
