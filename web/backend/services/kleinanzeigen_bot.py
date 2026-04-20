"""
Kleinanzeigen.de Bot — Playwright mit manueller Auth
Nutzer loggt sich selbst ein (sichtbarer Browser), Session wird gespeichert.
"""
import json
import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, BrowserContext, Page, Browser
from datetime import datetime, timezone


AUTH_DIR = Path(__file__).parent.parent / "storage" / "auth"
AUTH_DIR.mkdir(parents=True, exist_ok=True)


class KleinanzeigenBot:
    def __init__(self):
        self._pw = None
        self._browser: Browser = None
        self._contexts: dict[int, BrowserContext] = {}
        self._listings_cache: dict[int, list] = {}
        self._conversations_cache: dict[int, list] = {}

    async def start(self):
        if not self._browser:
            self._pw = await async_playwright().start()
            self._browser = await self._pw.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled"]
            )

    async def stop(self):
        for ctx in self._contexts.values():
            await ctx.close()
        self._contexts.clear()
        if self._browser:
            await self._browser.close()
        if self._pw:
            await self._pw.stop()

    def _state_path(self, account_id: int) -> Path:
        return AUTH_DIR / f"{account_id}.json"

    async def _get_context(self, account_id: int, headless: bool = False) -> BrowserContext:
        if account_id in self._contexts:
            return self._contexts[account_id]

        state_file = self._state_path(account_id)
        opts = {
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "viewport": {"width": 1280, "height": 720},
            "locale": "de-DE",
        }
        if state_file.exists():
            opts["storage_state"] = str(state_file)

        context = await self._browser.new_context(**opts)
        self._contexts[account_id] = context
        return context

    async def open_login_page(self, account_id: int) -> dict:
        if not self._browser:
            self._pw = await async_playwright().start()
            self._browser = await self._pw.chromium.launch(
                headless=False,
                args=["--disable-blink-features=AutomationControlled"]
            )
        context = await self._get_context(account_id)
        page = await context.new_page()
        await page.goto("https://www.kleinanzeigen.de/m-einloggen.html", wait_until="domcontentloaded")
        return {
            "success": True,
            "message": "Browser geöffnet. Bitte logge dich manuell ein.",
            "url": "https://www.kleinanzeigen.de/m-einloggen.html",
        }

    async def save_session(self, account_id: int) -> dict:
        context = await self._get_context(account_id)
        page = await context.new_page()
        await page.goto("https://www.kleinanzeigen.de/m-mein-konto.html", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_selector('body')
        await asyncio.sleep(2)

        if "login" in page.url.lower():
            await page.close()
            return {"success": False, "message": "Nicht eingeloggt. Bitte zuerst einloggen."}

        state = await context.storage_state()
        self._state_path(account_id).write_text(json.dumps(state, indent=2), encoding="utf-8")
        account_info = await self._extract_account_info(page)
        await page.close()

        return {
            "success": True,
            "message": f"Session gespeichert! Eingeloggt als: {account_info.get('email', '')}",
            "account_info": account_info,
        }

    async def _extract_account_info(self, page: Page) -> dict:
        info = {}
        try:
            text = await page.inner_text("body")
            email_match = re.search(r'angemeldet als:\s*(\S+@\S+)', text)
            if email_match:
                info["email"] = email_match.group(1)
            name_match = re.search(r'Profil von\s+(\S+)', text)
            if name_match:
                info["name"] = name_match.group(1)
            follower_match = re.search(r'(\d+)\s+Follower', text)
            if follower_match:
                info["followers"] = int(follower_match.group(1))
            since_match = re.search(r'Aktiv seit\s+([0-9.]+)', text)
            if since_match:
                info["active_since"] = since_match.group(1)
            rating_match = re.search(r'TOP\s+(\S+)', text)
            if rating_match:
                info["rating"] = f"TOP {rating_match.group(1)}"
        except:
            pass
        return info

    async def check_session(self, account_id: int) -> dict:
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"valid": False, "message": "Keine Session gespeichert"}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            await page.goto("https://www.kleinanzeigen.de/m-mein-konto.html", wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_selector('body')
            await asyncio.sleep(2)

            if "login" in page.url.lower():
                await page.close()
                return {"valid": False, "message": "Session abgelaufen"}

            state = await context.storage_state()
            state_file.write_text(json.dumps(state, indent=2), encoding="utf-8")
            account_info = await self._extract_account_info(page)
            await page.close()
            return {"valid": True, "message": "Session gültig", "account_info": account_info}
        except Exception as e:
            await page.close()
            return {"valid": False, "message": f"Fehler: {str(e)}"}

    # ── FIX 1: DOM-basiertes get_listings ──
    async def get_listings(self, account_id: int) -> dict:
        """Liest eigene Inserate aus dem ADS-Tab — DOM-basiert mit Fallback."""
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"listings": [], "error": "Keine Session. Bitte zuerst einloggen."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            await page.goto("https://www.kleinanzeigen.de/m-meine-anzeigen.html?sort=DEFAULT&tab=ADS", wait_until="domcontentloaded", timeout=30000)

            # Warten bis Inserate geladen — KEIN blindes sleep!
            try:
                await page.wait_for_selector('article, [data-testid="ad-list"] article, .aditem, a[href*="/s-anzeige/"]', timeout=15000)
            except Exception:
                await page.wait_for_selector('body', timeout=5000)

            # Stabile IDs aus DOM holen
            # Jedes Inserat hat 2 Links: einer mit Kategorie-Zahl, einer mit Titel
            # Deduplizieren per ID, den Link mit dem laengeren Text (Titel) behalten
            ad_elements = await page.query_selector_all('a[href*="/s-anzeige/"]')

            id_data = {}  # ad_id -> {text, href}
            for el in ad_elements:
                try:
                    href = await el.get_attribute('href') or ''
                    id_match = re.search(r'/(\d{6,})', href)
                    if not id_match:
                        continue
                    ad_id = id_match.group(1)
                    text = (await el.inner_text()).strip()
                    if ad_id not in id_data or len(text) > len(id_data[ad_id]['text']):
                        id_data[ad_id] = {'text': text, 'href': href}
                except Exception:
                    continue

            # Bilder extrahieren (img[srcset] mit hoechster Aufloesung)
            image_urls = []
            img_elements = await page.query_selector_all('img[srcset]')
            for img_el in img_elements:
                try:
                    src = await img_el.get_attribute('src') or ''
                    if 'img.kleinanzeigen.de' not in src:
                        continue
                    srcset = await img_el.get_attribute('srcset') or ''
                    if srcset:
                        candidates = [s.strip().split(' ')[0] for s in srcset.split(',')]
                        image_urls.append(candidates[-1])
                    else:
                        image_urls.append(src)
                except Exception:
                    continue

            listings = []
            for idx, (ad_id, data) in enumerate(id_data.items()):
                text = data['text']
                title = text.split('Anzeige', 1)[1].strip() if 'Anzeige' in text else text
                if len(title) < 3:
                    title = 'Ohne Titel'
                listing = {
                    "id": ad_id,
                    "title": title,
                    "url": data['href'],
                    "original_index": idx,
                    "image": image_urls[idx] if idx < len(image_urls) else ""
                }
                listings.append(listing)

            # Fallback: wenn DOM nichts fand, text-parsing
            if not listings:
                text = await page.inner_text("body")
                listings = self._parse_listings_from_text(text)

            # Account-Info und Stats aus Sidebar-Text
            text = await page.inner_text("body")
            result = {"listings": listings, "account": {}, "stats": {}}

            online_match = re.search(r'(\d+)\s+Anzeigen online\s*/\s*(\d+)\s+gesamt', text)
            if online_match:
                result["stats"]["online"] = int(online_match.group(1))
                result["stats"]["total"] = int(online_match.group(2))

            follower_match = re.search(r'(\d+)\s+Follower', text)
            if follower_match:
                result["stats"]["followers"] = int(follower_match.group(1))

            rating_match = re.search(r'TOP\s+(\S+)', text)
            if rating_match:
                result["stats"]["rating"] = f"TOP {rating_match.group(1)}"

            email_match = re.search(r'angemeldet als:\s*(\S+@\S+)', text)
            if email_match:
                result["account"]["email"] = email_match.group(1)

            name_match = re.search(r'Profil von\s+(\S+)', text)
            if name_match:
                result["account"]["name"] = name_match.group(1)

            since_match = re.search(r'Aktiv seit\s+([0-9.]+)', text)
            if since_match:
                result["account"]["active_since"] = since_match.group(1)

            # Merge mit text-parsed Daten (Preis, Kategorie, Besucher etc.)
            text_listings = self._parse_listings_from_text(text)
            for i, listing in enumerate(listings):
                if i < len(text_listings):
                    tl = text_listings[i]
                    listing["price"] = tl.get("price", "")
                    cat = tl.get("category", "")
                    # Kategorie validieren — kein Sidebar-Text
                    if cat and "eingeben" not in cat and "Suchbegriff" not in cat and len(cat) < 50:
                        listing["category"] = cat
                    else:
                        listing["category"] = ""
                    listing["visitors"] = tl.get("visitors", 0)
                    listing["saved"] = tl.get("saved", 0)
                    listing["ends"] = tl.get("ends", "")

            self._listings_cache[account_id] = listings

            state = await context.storage_state()
            state_file.write_text(json.dumps(state, indent=2), encoding="utf-8")
            await page.close()
            return result

        except Exception as e:
            await page.close()
            return {"listings": [], "error": str(e)}

    def _parse_listings_from_text(self, text: str) -> list:
        """Fallback: Text-basiertes Parsing."""
        lines = [l.strip() for l in text.split('\n')]
        listings = []
        current_ad = None
        ad_state = 'seek_cat_id'
        noise = {'Suchbegriff', 'Alle Kategorien', 'PLZ oder Ort', 'Ganzer Ort',
            'Finden', 'Inserieren', 'Meins', 'Ausloggen', 'Sicher bezahlen',
            'Verkaufsübersicht', 'Deine Einnahmen', 'Privater Nutzer',
            'Mein Profil', 'Meine Anzeigen', 'Hochschieben',
            'Dauer des Hochschiebens', 'einmalig', 'Highlight',
            'Top-Anzeige', 'Galerie', 'Bearbeiten', 'Reservieren',
            'Löschen', 'Verlängern', 'Mehr', 'Direkt kaufen',
            '7 Tage', '10 Tage', 'Zufriedenheit', 'freundlich',
            'zuverlässig', 'innerhalb von', 'Stunden', 'Mein Profil und meine Anzeigen'}
        for line in lines:
            if not line or line in noise:
                continue
            if ad_state == 'seek_cat_id':
                if line.isdigit() and int(line) < 500:
                    current_ad = {"category_id": int(line)}
                    ad_state = 'seek_cat_name'
            elif ad_state == 'seek_cat_name':
                if not line[0].isdigit() and line not in noise:
                    current_ad["category"] = line
                    ad_state = 'seek_anzeige'
            elif ad_state == 'seek_anzeige':
                if line == "Anzeige":
                    ad_state = 'seek_title'
            elif ad_state == 'seek_title':
                if line not in noise and len(line) > 5:
                    current_ad["title"] = line
                    ad_state = 'collect'
            elif ad_state == 'collect':
                if re.match(r'^\d+\s*€\s*(VB)?$', line):
                    current_ad["price"] = line
                elif re.match(r'^Endet am\s', line):
                    current_ad["ends"] = line.replace("Endet am ", "")
                elif re.match(r'^\d+\s+Besucher$', line):
                    current_ad["visitors"] = int(line.split()[0])
                elif re.match(r'^\d+\s+mal gemerkt$', line):
                    current_ad["saved"] = int(line.split()[0])
                elif line.isdigit() and int(line) < 500:
                    if current_ad.get("title"):
                        current_ad["id"] = str(len(listings))
                        current_ad["original_index"] = len(listings)
                        listings.append(current_ad)
                    current_ad = {"category_id": int(line)}
                    ad_state = 'seek_cat_name'
        if current_ad and current_ad.get("title"):
            current_ad["id"] = str(len(listings))
            current_ad["original_index"] = len(listings)
            listings.append(current_ad)
        return listings

    # ── FIX 1: DOM-basiertes get_conversations ──
    async def get_conversations(self, account_id: int) -> dict:
        """Liest alle Konversationen — DOM-basiert mit Fallback."""
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"conversations": [], "error": "Keine Session."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            await page.goto('https://www.kleinanzeigen.de/m-nachrichten.html', wait_until='domcontentloaded', timeout=30000)
            try:
                await page.wait_for_selector('[class*="conversation"], [class*="thread"], [data-testid*="conversation"], a[href*="/m-nachrichten/"]', timeout=15000)
            except Exception:
                await page.wait_for_selector('body', timeout=5000)

            conv_links = await page.query_selector_all('a[href*="/m-nachrichten/"]')
            conversations = []

            if conv_links:
                for idx, link in enumerate(conv_links):
                    try:
                        href = await link.get_attribute('href') or ''
                        id_match = re.search(r'/(\d{6,})', href)
                        conv_id = id_match.group(1) if id_match else str(idx)

                        parent = await link.evaluate_handle('el => el.closest("article, li, div") || el.parentElement')
                        name_el = await parent.query_selector('[class*="name"], [class*="user"], h3, h4, strong')
                        name = await name_el.inner_text() if name_el else 'Unbekannt'

                        msg_el = await parent.query_selector('[class*="message"], [class*="preview"], p')
                        last_msg = await msg_el.inner_text() if msg_el else ''

                        date_el = await parent.query_selector('[class*="date"], [class*="time"], time')
                        date_text = await date_el.inner_text() if date_el else ''

                        conversations.append({
                            "id": conv_id,
                            "name": name.strip(),
                            "listing": "",
                            "last_message": last_msg.strip(),
                            "date": date_text.strip(),
                            "unread": "Heute" in date_text,
                            "original_index": idx
                        })
                    except Exception:
                        continue
            else:
                conversations = await self._parse_conversations_from_text(page)

            self._conversations_cache[account_id] = conversations

            state_data = await context.storage_state()
            state_file.write_text(json.dumps(state_data, indent=2), encoding='utf-8')
            await page.close()
            return {"conversations": conversations, "count": len(conversations)}

        except Exception as e:
            await page.close()
            return {"conversations": [], "error": str(e)}

    async def _parse_conversations_from_text(self, page: Page) -> list:
        """Fallback: Text-basiertes Parsing der Konversationen."""
        text = await page.inner_text('body')
        lines = [l.strip() for l in text.split('\n')]
        start_idx = end_idx = None
        for i, l in enumerate(lines):
            if 'Alle auswählen' in l and start_idx is None:
                start_idx = i + 1
            if 'Du hast alle Konversationen geladen' in l:
                end_idx = i
        if not start_idx or not end_idx:
            return []
        chunk = lines[start_idx:end_idx]
        conversations = []
        conv = None
        state = 'seek_name'
        date_re = re.compile(r'^(Heute|Gestern|[0-9]{2}\.[0-9]{2}\.[0-9]{4})(\s+[0-9]{1,2}:[0-9]{2})?$')
        for line in chunk:
            if not line:
                continue
            if state == 'seek_name':
                if date_re.match(line):
                    continue
                conv = {"name": line, "date": "", "listing": "", "last_message": "", "unread": False, "id": str(len(conversations))}
                state = 'seek_date'
            elif state == 'seek_date':
                if date_re.match(line):
                    conv["date"] = line.split()[0]
                    if conv["date"] == 'Heute':
                        conv["unread"] = True
                    state = 'seek_listing'
            elif state == 'seek_listing':
                conv["listing"] = line
                state = 'seek_message'
            elif state == 'seek_message':
                if line == 'Bewertung abgeben':
                    conv["original_index"] = len(conversations)
                    conversations.append(conv)
                    conv = None
                    state = 'seek_name'
                else:
                    conv["last_message"] = line
                    state = 'seek_end'
            elif state == 'seek_end':
                if line == 'Bewertung abgeben':
                    conv["original_index"] = len(conversations)
                    conversations.append(conv)
                    conv = None
                    state = 'seek_name'
                else:
                    conv["original_index"] = len(conversations)
                    conversations.append(conv)
                    if date_re.match(line):
                        state = 'seek_name'
                    else:
                        conv = {"name": line, "date": "", "listing": "", "last_message": "", "unread": False, "id": str(len(conversations))}
                        state = 'seek_date'
        if conv and conv.get('name'):
            conv["original_index"] = len(conversations)
            conversations.append(conv)
        return conversations

    # ── FIX 6: ID-basiert ──
    async def get_conversation(self, account_id: int, conv_id: str) -> dict:
        """Öffnet eine Konversation und liest alle Nachrichten — ID-basiert."""
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"messages": [], "error": "Keine Session."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            await page.goto('https://www.kleinanzeigen.de/m-nachrichten.html', wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_selector('body', timeout=15000)

            cached_convs = self._conversations_cache.get(account_id, [])
            conv = next((c for c in cached_convs if c["id"] == conv_id), None)
            if conv is None:
                idx = int(conv_id) if conv_id.isdigit() else 0
                if idx < len(cached_convs):
                    conv = cached_convs[idx]

            clicked = False
            if conv and conv.get("name"):
                try:
                    await page.locator(f'text={conv["name"]}').first.click()
                    await asyncio.sleep(1)
                    clicked = True
                except Exception:
                    pass

            if not clicked:
                conv_items = page.locator('[class*="conversation"], [class*="thread"], [data-testid*="conversation"]')
                count = await conv_items.count()
                idx = int(conv_id) if conv_id.isdigit() else 0
                if count > 0 and idx < count:
                    await conv_items.nth(idx).click()
                    await asyncio.sleep(1)
                else:
                    await page.close()
                    return {"messages": [], "error": "Konversation nicht gefunden"}

            # DOM-basiert Nachrichten lesen
            try:
                msg_elements = await page.query_selector_all('[class*="message-content"], [class*="bubble"], [class*="chat-message"]')
                messages = []
                if msg_elements:
                    for el in msg_elements:
                        try:
                            t = await el.inner_text()
                            if t and len(t.strip()) > 0:
                                messages.append({"text": t.strip()})
                        except Exception:
                            continue
                else:
                    messages = await self._parse_chat_messages(page)
            except Exception:
                messages = await self._parse_chat_messages(page)

            partner = conv["name"] if conv else ""
            await page.close()
            return {"messages": messages, "partner": partner}

        except Exception as e:
            await page.close()
            return {"messages": [], "error": str(e)}

    async def _parse_chat_messages(self, page: Page) -> list:
        """Fallback: Text-basiertes Chat-Parsing."""
        text = await page.inner_text('body')
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        messages = []
        in_chat = False
        noise_set = {'Nachricht', 'Sicherheitshinweis', 'Mehr', 'Automatische Nachricht'}
        for line in lines:
            if 'Sicherheitshinweis' in line:
                in_chat = True
                continue
            if not in_chat:
                continue
            if line in ['Kleinanzeigen', 'Über uns', 'Karriere']:
                break
            if line in noise_set or not line:
                continue
            if any(x in line for x in ['Aktiv seit', 'Bitte denke daran', 'Sicher bezahlen', 'Über Sicher', 'informieren']):
                continue
            if re.match(r'^(Heute|Gestern|[0-9]{2}\.[0-9]{2}\.[0-9]{4})$', line):
                continue
            if len(line) > 1:
                messages.append({"text": line})
        return messages

    # ── FIX 6: ID-basiert ──
    async def send_message(self, account_id: int, conv_id: str, message: str) -> dict:
        """Sendet eine Nachricht — ID-basiert."""
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"success": False, "error": "Keine Session."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            await page.goto('https://www.kleinanzeigen.de/m-nachrichten.html', wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_selector('body', timeout=15000)
            await asyncio.sleep(2)

            # Finde Konversation
            cached_convs = self._conversations_cache.get(account_id, [])
            conv = next((c for c in cached_convs if c["id"] == conv_id), None)
            target_name = conv["name"] if conv else None

            # Names-Fallback für text-basierte Navigation
            text = await page.inner_text('body')
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            names_seen = []
            noise = {'Zum Inhalt springen', 'Ausloggen', 'Meine Nachrichten', 'Alle auswählen',
                'Bewertung abgeben', 'Du hast alle Konversationen geladen.'}
            for line in lines:
                if line in noise or not line or line[0].isdigit() or '€' in line:
                    continue
                if any(x in line for x in ['Kleinanzeigen', 'Über uns', 'Datenschutz']):
                    break
                if len(line) > 2 and line not in names_seen:
                    names_seen.append(line)

            clicked = False
            if target_name:
                try:
                    await page.locator(f'text={target_name}').first.click()
                    await asyncio.sleep(1)
                    clicked = True
                except Exception:
                    pass

            if not clicked:
                idx = int(conv_id) if conv_id.isdigit() else 0
                if idx < len(names_seen):
                    await page.locator(f'text={names_seen[idx]}').first.click()
                    await asyncio.sleep(1)
                else:
                    await page.close()
                    return {"success": False, "error": "Konversation nicht gefunden"}

            await asyncio.sleep(1)

            # Nachricht eingeben
            frames = page.frames
            input_el = None
            for frame in frames:
                try:
                    el = frame.locator('[contenteditable="true"], textarea, [role="textbox"]')
                    if await el.count() > 0:
                        input_el = el.first
                        break
                except:
                    continue

            if not input_el or await input_el.count() == 0:
                for sel in [
                    '[contenteditable="true"]', 'textarea', '[role="textbox"]',
                    '[placeholder*="Nachricht"]', '[placeholder*="Schreib"]',
                    '[placeholder*="message"]', '[class*="editor"] [contenteditable]',
                    '#cke_1_contents [contenteditable]',
                ]:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        input_el = el.first
                        break

            if input_el and await input_el.count() > 0:
                await input_el.click()
                await asyncio.sleep(0.2)
                await input_el.fill(message)
                await asyncio.sleep(0.2)

                send_btn = page.locator('[class*="send"], button[type="submit"], [aria-label*="Senden"]')
                if await send_btn.count() > 0:
                    await send_btn.first.click()
                else:
                    await input_el.press('Enter')

                await asyncio.sleep(2)
                partner_name = target_name or (names_seen[int(conv_id)] if conv_id.isdigit() and int(conv_id) < len(names_seen) else conv_id)
                await page.close()
                return {"success": True, "message": f"Nachricht gesendet an {partner_name}"}
            else:
                await page.screenshot(path=str(AUTH_DIR / 'send_msg_debug.png'))
                await page.close()
                return {"success": False, "error": "Eingabefeld nicht gefunden (Screenshot gespeichert)"}

        except Exception as e:
            await page.close()
            return {"success": False, "error": str(e)}

    async def create_listing(self, account_id: int, data: dict) -> dict:
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"success": False, "message": "Keine Session. Bitte zuerst einloggen."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            await page.goto("https://www.kleinanzeigen.de/p-anzeige-aufgeben.html", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_selector('body')
            await asyncio.sleep(1)

            for field, selectors in [
                ("title", ['#postad-title', '[id*="title"] input', '[name*="title"]']),
                ("description", ['#postad-description', '[id*="description"] textarea', '[name*="description"]']),
                ("price", ['#postad-price', '[id*="price"] input', '[name*="price"]']),
                ("plz", ['#postad-zip', '[id*="zip"] input', '[name*="zip"]', '[name*="postal_code"]']),
                ("city", ['#postad-city', '[id*="city"] input', '[name*="city"]']),
            ]:
                locator = page.locator(', '.join(selectors))
                if await locator.count() > 0:
                    await locator.first.fill(str(data.get(field, "")))
                    await asyncio.sleep(0.2)

            return {"success": True, "message": "Inserat vorbereitet. Bitte prüfe im Browser."}
        except Exception as e:
            await page.close()
            return {"success": False, "message": f"Fehler: {str(e)}"}

    # ── FIX 6: ID-basiertes get_listing_detail ──
    async def get_listing_detail(self, account_id: int, listing_id: str) -> dict:
        """Öffnet ein Inserat direkt per URL — ID-basiert."""
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"error": "Keine Session."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            cached = self._listings_cache.get(account_id, [])
            listing = next((l for l in cached if l["id"] == listing_id), None)

            if listing and listing.get("url"):
                url = listing["url"]
            else:
                url = f"https://www.kleinanzeigen.de/s-anzeige/{listing_id}"

            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            try:
                await page.wait_for_selector('h1, [class*="title"], #viewad-title', timeout=10000)
            except Exception:
                pass

            detail = {"id": listing_id}

            # Titel
            for sel in ['h1', '#viewad-title', '[class*="title"]']:
                el = page.locator(sel)
                if await el.count() > 0:
                    detail['title'] = (await el.first.inner_text()).strip()
                    break

            # Preis
            for sel in ['#viewad-price', '[class*="price"]', '[data-testid="ad-price"]']:
                el = page.locator(sel)
                if await el.count() > 0:
                    detail['price'] = (await el.first.inner_text()).strip()
                    break

            # Beschreibung
            for sel in ['#viewad-description', '[class*="description"]', '[itemprop="description"]']:
                el = page.locator(sel)
                if await el.count() > 0:
                    detail['description'] = (await el.first.inner_text()).strip()
                    break

            # PLZ + Ort
            for sel in ['#viewad-locality', '[class*="locality"]', '[itemprop="address"]']:
                el = page.locator(sel)
                if await el.count() > 0:
                    detail['location'] = (await el.first.inner_text()).strip()
                    break

            # Bilder
            img_els = page.locator('[class*="gallery"] img, [class*="image"] img')
            detail['image_count'] = await img_els.count()

            state = await context.storage_state()
            state_file.write_text(json.dumps(state, indent=2), encoding='utf-8')
            await page.close()
            return {"success": True, "detail": detail}

        except Exception as e:
            await page.close()
            return {"error": str(e)}

    # ── FIX 6: ID-basiertes update_listing ──
    async def update_listing(self, account_id: int, listing_id: str, data: dict) -> dict:
        """Aktualisiert ein Inserat — ID-basiert."""
        state_file = self._state_path(account_id)
        if not state_file.exists():
            return {"success": False, "error": "Keine Session."}

        await self.start()
        context = await self._get_context(account_id)
        page = await context.new_page()

        try:
            # Zur Bearbeiten-Seite navigieren
            cached = self._listings_cache.get(account_id, [])
            listing = next((l for l in cached if l["id"] == listing_id), None)

            if listing and listing.get("url"):
                edit_url = listing["url"].replace('/s-anzeige/', '/p-anzeige-aendern.html?adId=')
                await page.goto(edit_url, wait_until='domcontentloaded', timeout=30000)
            else:
                await page.goto(f'https://www.kleinanzeigen.de/p-anzeige-aendern.html?adId={listing_id}', wait_until='domcontentloaded', timeout=30000)

            await page.wait_for_selector('body', timeout=10000)
            await asyncio.sleep(1)

            # Felder aktualisieren
            if 'title' in data:
                for sel in ['#postad-title', '[id*="title"] input', '[name*="title"]']:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill(data['title'])
                        break

            if 'price' in data:
                for sel in ['#postad-price', '[id*="price"] input', '[name*="price"]']:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill(str(data['price']))
                        break

            if 'description' in data:
                for sel in ['#postad-description', '[id*="description"] textarea', '[name*="description"]']:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill(data['description'])
                        break

            await asyncio.sleep(1)
            save_btn = page.locator('button:has-text("Anzeige aufgeben"), button:has-text("Speichern"), button[type="submit"]')
            if await save_btn.count() > 0:
                await save_btn.first.click()
                await asyncio.sleep(1)
                result_msg = "Inserat aktualisiert"
            else:
                result_msg = "Felder gefüllt, aber Speichern-Button nicht gefunden"

            state = await context.storage_state()
            state_file.write_text(json.dumps(state, indent=2), encoding='utf-8')
            await page.close()
            return {"success": True, "message": result_msg}

        except Exception as e:
            await page.close()
            return {"success": False, "error": str(e)}


# Singleton
bot = KleinanzeigenBot()
