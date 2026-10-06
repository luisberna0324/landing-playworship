from pathlib import Path
import base64, re, mimetypes, json, sys
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root/'preview-output'
out.mkdir(exist_ok=True)
html=(root/'dist/index.html').read_text()
js_path=re.search(r'<script[^>]*src="([^"]+)"[^>]*></script>',html).group(1)
css_path=re.search(r'<link[^>]*href="([^"]+\.css)"[^>]*>',html).group(1)
js=(root/'dist'/js_path.lstrip('/')).read_text()
css=(root/'dist'/css_path.lstrip('/')).read_text()
assets=set(re.findall(r'"(/assets/[^"\s]+)"',js))
embedded=[]
for asset in sorted(assets):
    p=root/'public'/asset.lstrip('/')
    if not p.is_file(): raise RuntimeError(f'Missing asset: {asset}')
    mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    data='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
    js=js.replace('"'+asset+'"',json.dumps(data))
    embedded.append({'path':asset,'bytes':p.stat().st_size})
for prefix in ['/legal/','/precios.html','/downloads/playworship-android-beta.apk']:
    js=js.replace('"'+prefix,'"https://playworship.app'+prefix)
html=re.sub(r'<script[^>]*src="[^"]+"[^>]*></script>','',html)
html=re.sub(r'<link[^>]*href="[^"]+\.css"[^>]*>',lambda m:'<style>'+css+'</style>',html)
html=html.replace('</body>','<div style="position:fixed;bottom:12px;right:12px;z-index:100;background:#18271ddd;border:1px solid #50745a;color:#cee4d3;border-radius:6px;padding:6px 10px;font:11px system-ui;pointer-events:none">Vista previa · Sin publicar</div><script>'+js.replace('</script','<\\/script')+'</script></body>')
html=html.replace('<title>Play Worship — Multitracks profesionales para tu equipo de alabanza</title>','<title>PlayWorship · Vista previa del rediseño</title>')
(out/'PlayWorship-vista-previa.html').write_text(html)
(out/'embedded-assets.json').write_text(json.dumps(embedded,indent=2))
print(json.dumps({'file':str(out/'PlayWorship-vista-previa.html'),'bytes':len(html.encode()),'embedded_assets':len(embedded)},indent=2))
