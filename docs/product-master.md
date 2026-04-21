# BubuBay Product Master

## Zweck
Der Product Master ist die zentrale, kanaloneutrale Wahrheit eines Produkts in BubuBay.

Ein Produkt darf nicht direkt als eBay-, Amazon-, Shopify- oder OTTO-Produkt modelliert werden.
Stattdessen existiert genau ein kanaloneutrales Kernobjekt, aus dem kanal-spezifische Listings erzeugt werden.

## Ziele
- Eine zentrale Produktquelle
- Mehrere kanal-spezifische Ausgaben
- Klare Trennung zwischen Produktdaten und Kanalregeln
- Wiederverwendbarkeit für Bulk-Import, Highlights und Listing-Automation

## Kernprinzip
Ein Product Master beschreibt:
- was das Produkt ist
- welche Medien dazu gehören
- welche Preis- und Versandgrundlagen gelten
- welche Compliance-/Risiko-Infos vorliegen
- welche kanal-spezifischen Zustände existieren

## Empfohlenes Datenmodell

### 1. Identität
- id
- sku
- source_type
- source_url
- source_reference
- created_at
- updated_at

### 2. Basisdaten
- title
- subtitle
- brand
- manufacturer
- model
- gtin_ean_upc
- mpn
- condition
- condition_notes
- category_hint
- tags

### 3. Beschreibung
- short_description
- long_description
- bullet_points
- included_items
- defects
- legal_notes

### 4. Preis und Wirtschaftlichkeit
- cost_price
- target_price
- min_price
- max_price
- currency
- tax_mode
- margin_target
- fees_estimate

### 5. Versand und Fulfillment
- shipping_mode
- shipping_cost
- shipping_profile_hint
- handling_time
- package_weight
- package_dimensions
- pickup_available
- warehouse_location

### 6. Bestand
- quantity_total
- quantity_reserved
- quantity_available
- inventory_mode

### 7. Medien
- primary_image
- gallery_images
- video_assets
- source_media_urls
- processed_media_assets

### 8. Compliance / Risiko
- restricted_product_flag
- brand_risk_flag
- marketplace_policy_notes
- hazmat_flag
- battery_flag
- adult_flag
- manual_review_required

### 9. AI / Optimierung
- generated_titles
- generated_descriptions
- generated_keywords
- pricing_suggestions
- category_suggestions

### 10. Kanalzustände
- channel_states[]

Jeder channel_state enthält:
- channel_name
- account_id
- external_listing_id
- status
- last_sync_at
- last_push_at
- last_error
- remote_url
- remote_price
- remote_quantity

## Statusmodell
Empfohlen:
- draft
- ready
- queued
- publishing
- live
- paused
- ended
- error
- archived

## Regeln
- Kein Kanal darf den Product Master direkt verbiegen
- Kanaladapter erzeugen nur kanal-spezifische Ableitungen
- Der Product Master bleibt kanaloneutral
- Remote-Zustände werden in channel_states gespeichert
- Alle Bulk-Imports enden zuerst im Product Master, nie direkt im Channel

## Offene Fragen
- Variantenmodell
- Bundles / Sets
- Bild-/Video-Processing
- Mehrsprachigkeit
- Kategorie-Mapping-System
