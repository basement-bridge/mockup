from playwright.sync_api import sync_playwright
B='http://localhost:8765/fragments/recipe-detail-desktop/option-b/index.html'
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1100,'height':760})
    pg.goto(B+'?r=notes&t=dark'); pg.wait_for_timeout(200)
    pg.screenshot(path='screenshots/1100x760-notes-dark-lane-closed.png')
    pg.click('[data-notes]'); pg.wait_for_timeout(400)
    pg.screenshot(path='screenshots/1100x760-notes-dark-lane-open.png')
    print(pg.evaluate('RDinfo()'))
    pg=b.new_page(viewport={'width':1440,'height':900})
    pg.goto(B+'?r=nocooked&t=dark&empty=keep'); pg.wait_for_timeout(200)
    pg.screenshot(path='screenshots/1440x900-nocooked-dark-rail-kept.png')
    pg.goto(B+'?r=typical&t=light&v=trying'); pg.wait_for_timeout(200)
    pg.click('[data-psp]'); pg.wait_for_timeout(100)
    pg.screenshot(path='screenshots/1440x900-typical-light-trying-photo-open.png')
    print(pg.evaluate('RDinfo()'))
    b.close()
