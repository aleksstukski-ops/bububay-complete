# Amazon Integration

## Status
- research_started: true
- implementation_started: false
- confidence: medium-high

## Official access
- auth model: SP-API auth
- app type: Amazon Selling Partner API integration
- sandbox: partial / API-dependent
- rate limits: yes
- partner approval needed: seller account and SP-API app access required

## Supported capabilities
- account connection: yes
- listings create: yes
- listings update: yes
- listings pause/end: partial
- inventory sync: yes
- orders read: yes
- orders update: partial
- notifications/webhooks: yes
- messages read: not verified in this file as a general unified inbox capability
- messages write: not verified in this file as a general unified inbox capability

## Verified notes
- Amazon SP-API is the relevant official integration surface.
- Listings, orders, notifications, and seller participation are documented areas.
- Amazon is a phase-1 or early phase-2 core target because of its commercial importance.
- Messaging should not be promised until explicitly verified for BubuBay's use case.

## Known constraints
- Amazon integration complexity is significantly higher than simpler marketplace targets.
- Marketplace, account role, and scope differences matter.
- Adapter design must separate catalog/listing logic from order and notification logic.

## Open questions
- Exact listing feed/workflow to use first
- Exact notification subscriptions for BubuBay V1
- Exact inventory update path
- Exact feasible messaging scope, if any, for owner-use operations

## Implementation notes
- Build Amazon adapter after eBay + Shopify direction is stable.
- Treat Amazon as a major supported channel, but with stricter scope control.
- Do not oversell feature parity before exact workflows are verified.

## Decision
- keep
