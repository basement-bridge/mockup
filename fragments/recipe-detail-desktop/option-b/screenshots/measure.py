import sys, json, itertools
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/fragments/recipe-detail-desktop/option-b/index.html'
SIZES=[(1440,900),(1280,720),(1920,1080)]
STATES=['typical','long','notes','short','nocooked','cooked']
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for (w,h),st,th in itertools.product(SIZES,STATES,['dark','light']):
        pg=b.new_page(viewport={'width':w,'height':h})
        pg.goto(f'{BASE}?r={st}&t={th}'); pg.wait_for_timeout(250)
        info=pg.evaluate('RDinfo()')
        if th=='dark' or True:
            pg.screenshot(path=f'screenshots/{w}x{h}-{st}-{th}.png')
        out[f'{w}x{h} {st} {th}']=info
        pg.close()
    b.close()
for k,v in out.items(): print(k,v)
json.dump(out,open('screenshots/measured.json','w'),indent=1)
