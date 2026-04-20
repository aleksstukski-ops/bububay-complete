from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx, re

router = APIRouter(prefix="/api", tags=["image-proxy"])


@router.get("/img-proxy")
async def image_proxy(url: str):
    if not re.match(r'^https?://(img\.)?kleinanzeigen\.de/', url):
        raise HTTPException(400, "Nur Kleinanzeigen-Bilder erlaubt")
    try:
        async with httpx.AsyncClient(verify=False) as client:
            r = await client.get(url, headers={
                'Referer': 'https://www.kleinanzeigen.de/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }, follow_redirects=True, timeout=10)
            if r.status_code != 200 or len(r.content) == 0:
                return Response(content=b'', status_code=502)
            ct = r.headers.get('content-type', 'image/jpeg')
            return Response(content=r.content, media_type=ct)
    except Exception:
        return Response(content=b'', status_code=502)
