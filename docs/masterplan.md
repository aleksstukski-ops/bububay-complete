# BubuBay Masterplan

## Product thesis
BubuBay is not just a multi-listing tool. It is a seller operating system for owner use first:
- one product master
- multiple channel outputs
- one place for operations
- one place for trend discovery
- one place for future automation

## What success looks like
A product can move through this pipeline:
source link or manual entry -> product extraction -> normalized product master -> channel-specific transforms -> draft listings -> publish -> sync -> orders and notifications -> updates and lifecycle actions

## Realistic product scope

### V1
- Stable auth and account vault
- Product master
- Bulk import queue
- eBay adapter
- Amazon adapter
- Shopify adapter
- Central order/notification view where officially available
- Basic dashboard and operational controls
- Documentation discipline and reproducible setup

### V2
- OTTO and Kaufland adapters
- Etsy adapter
- Better reconciliation jobs
- Better media management
- Channel-specific templates, pricing, and compliance rules
- Highlights engine V1 using official or clean data sources

### V3
- TikTok Shop if access and scope are validated
- More advanced messaging support where official APIs exist
- Trend-to-listing automation
- Cost, margin, and repricing strategies
- Better sourcing intelligence

## Phases

### Phase 0 - Source of truth
Deliverables:
- README
- masterplan
- architecture
- progress log
- integration notes
- shared operator prompt

Exit criteria:
- Any model can open the repo and understand product direction within minutes

### Phase 1 - Seller OS core
Deliverables:
- auth
- encrypted account vault
- product master
- import pipeline
- channel adapter interface
- first three channels
- unified dashboard baseline

Exit criteria:
- owner can create products and push them into at least one real marketplace workflow

### Phase 2 - Operational depth
Deliverables:
- stock and price sync
- order sync
- notification center
- selected messaging integrations
- better edit, pause, relist, and reserve flows

Exit criteria:
- BubuBay becomes the default daily control panel

### Phase 3 - Highlights
Deliverables:
- trend ingestion
- product detection
- asset linking
- hype scoring
- merchant and source linking
- quick actions

Exit criteria:
- owner can discover fast-moving products and act from one workspace

### Phase 4 - Automation intelligence
Deliverables:
- pricing policies
- compliance checks
- risk rules
- draft optimization
- reconciliation and repair jobs

Exit criteria:
- system reduces manual work materially while staying understandable

## What is in scope now
- Self-use only
- Focus on channels with official APIs or clean integration surfaces
- Strong internal documentation
- Durable architecture over shortcuts

## What is not in scope now
- Public SaaS
- Universal full-parity support for every marketplace
- Building unsupported messaging integrations without validation
- Feature promises without verified channel support

## Execution rules
- Build the smallest robust slice first
- Separate channel adapters from core domain logic
- Mark uncertain integrations clearly
- Prefer verified official capability over assumptions
- Treat browser automation as a fallback, not the architecture
