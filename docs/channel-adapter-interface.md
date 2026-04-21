# BubuBay Channel Adapter Interface

## Zweck
Jeder Verkaufskanal bekommt einen eigenen Adapter mit derselben Grundstruktur.
So bleibt der Core stabil und kanal-spezifische Sonderlogik wandert nicht in das Gesamtsystem.

## Adapter-Prinzip
Ein Adapter ist die einzige Schicht, die kanal-spezifische APIs, Payloads, Limits und Fehler kennt.

## Pflichtmethoden

### Account / Connection
- connect_account()
- validate_account()
- refresh_auth()
- disconnect_account()

### Listing Lifecycle
- create_draft_listing(product_master, account)
- publish_listing(product_master, account)
- update_listing(product_master, account, external_listing_id)
- pause_listing(account, external_listing_id)
- end_listing(account, external_listing_id)
- relist_listing(account, external_listing_id)

### Inventory / Price
- sync_inventory(product_master, account)
- sync_price(product_master, account)
- fetch_listing_state(account, external_listing_id)

### Orders / Notifications
- fetch_orders(account)
- fetch_order_detail(account, external_order_id)
- acknowledge_notification(event)
- reconcile_orders(account)

### Messages
- fetch_conversations(account)
- fetch_messages(account, conversation_id)
- send_message(account, conversation_id, message)

Nur implementieren, wenn offiziell oder stabil realistisch.
Sonst klar als unsupported markieren.

### Utilities
- map_category(product_master)
- build_payload(product_master)
- validate_product(product_master)
- normalize_remote_data(remote_object)

## Adapter Response Contract
Jeder Adapter sollte strukturierte Rückgaben liefern:

- success: bool
- action: string
- channel: string
- external_id: optional string
- status: optional string
- data: optional object
- error_code: optional string
- error_message: optional string
- retryable: bool

## Unterstützungslevel pro Methode
Jede Methode bekommt intern einen Status:
- supported
- partial
- unsupported
- unknown

## Regeln
- Keine kanal-spezifische Logik im Product Master
- Keine UI-Sonderlogik als Ersatz für Adapterlogik
- Jeder Adapter dokumentiert:
  - Auth
  - Listing-Fähigkeiten
  - Inventory-Fähigkeiten
  - Order-Fähigkeiten
  - Notification-Fähigkeiten
  - Messaging-Fähigkeiten
  - Limits / Risiken / Partnerabhängigkeiten

## V1-Adapter-Priorität
1. eBay
2. Shopify
3. Amazon
4. OTTO
5. Kaufland
6. Etsy

## Offene Fragen
- Gemeinsames Fehlerklassensystem
- Gemeinsames Retry-System
- Rate-Limit-Handling
- Eventbus / Queue-Architektur
