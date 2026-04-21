# eBay Integration

## Status
- research_started: true
- implementation_started: false
- confidence: high

## Official access
- auth model: OAuth for eBay APIs
- app type: official eBay developer app
- sandbox: yes
- rate limits: yes, API-specific
- partner approval needed: not generally for baseline Sell APIs, but seller/account prerequisites apply

## Supported capabilities
- account connection: yes
- listings create: yes
- listings update: yes
- listings pause/end: partial, handled via offer/listing management flows
- inventory sync: yes
- orders read: yes
- orders update: partial
- notifications/webhooks: not yet documented here
- messages read: unknown in this file
- messages write: unknown in this file

## Verified notes
- Inventory API data model:
  - Location
  - Inventory Item
  - Offer
  - Inventory Item Group
- An offer becomes the live eBay listing.
- Inventory API listings must be revised through the Inventory API.
- Business policies are required for publishing offers.
- Fulfillment API covers:
  - get orders
  - shipping fulfillments
  - refunds
  - payment disputes
- Fulfillment API supports many marketplaces including EBAY_DE.

## Known constraints
- Seller must be opted in to business policies for Inventory API listing flows.
- Inventory API created listings are not meant to be edited through Seller Hub or other listing platforms.
- Listing architecture should be adapter-based and built around Inventory API + Fulfillment API together.

## Open questions
- Exact notifications/webhook strategy
- Exact messaging capability for buyer/seller communication
- Exact pause/end listing flow to use in our adapter
- Whether additional eBay APIs are needed for complete lifecycle parity

## Implementation notes
- eBay is a phase-1 target.
- Use Inventory API for product/listing state.
- Use Fulfillment API for orders and post-checkout operational flows.
- Build product-to-offer transformation in the listing composer.
- Keep eBay-specific policy requirements out of the product core.

## Decision
- keep
