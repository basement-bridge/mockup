/* Option E search index (mockup). Loaded on engagement only: when the search box is focused, a query is typed or an example chip is pressed, or the state gallery nears the viewport.
   One row per thing a person can look for. Fields:
     id      stable key             t       label shown in the result       g   group
     sc      who it belongs to: device | member | household | account | info
     where   path in the app        aff     one sentence: what changing it affects
     val     key of the current value (resolved by the page from its state; sample data for household items)
     syn     synonyms and plain-language phrasings, separated by |  (what people type, not what we call it)
     aka     old names this entry replaces (audit knobs that were merged)
     ctl     inline control: theme | mode | emoji | text | rows | motion | bell | checks | reset | themepick   (none = opens a screen, or info)
     go      the screen it opens when it has no inline control        info   true = not a setting, an explanation
     adv     true = search-only: not on any curated page, found only here
     pin     the pinnable segment it belongs to (looks | text)        k   audit ids covered (K01..K35)       pri   tie-break, lower first */
(function () {
  var I = [];
  function add(o) { I.push(o); }
  add({ id: "theme", t: "Theme", g: "Looks", sc: "device", where: "Settings › Looks", aff: "Colours on every screen, in Kitchie, Platform and Recipe.", val: "theme", ctl: "theme", pin: "looks", k: ["K01"], pri: 3,
    syn: "colour|color|colours|colors|look|looks|appearance|palette|skin|style|scheme|background|accent|personalise|personalize|customise|customize|make it pretty|change the colours|change the look|prettier|hard to see|contrast|themes|theme picker|swatches" });
  add({ id: "mode", t: "Light or dark", g: "Looks", sc: "device", where: "Settings › Looks", aff: "Every screen. System follows your phone's own day and night.", val: "mode", ctl: "mode", pin: "looks", k: ["K13", "K02"], pri: 2,
    syn: "dark|light|dark mode|light mode|night|night mode|day mode|day|dark at night|too bright|too dark|eyes hurt|bright|dim|dimmer|follow my phone|auto dark|automatic dark|system theme|black background|white background|hard to see|brightness|screen too bright" });
  add({ id: "emoji", t: "Emoji", g: "Looks", sc: "device", where: "Settings › Looks", aff: "Every screen: item rows, Home, Shopping and Plan.", val: "emoji", ctl: "emoji", pin: "looks", k: ["K04"], pri: 4, aka: ["Show emoji"],
    syn: "emojis|icons|pictures|little pictures|food pictures|symbols|smileys|faces|cartoons|show emoji|hide emoji|remove emoji|turn off emoji|emoticons|images on items" });
  add({ id: "text", t: "Text size", g: "Text and rows", sc: "device", where: "Settings › Looks", aff: "Every screen at once: Home, Pantry, Shopping, Plan, Recipes, Preferences and menus. Replaces Item name size, which only moved the Pantry list.", val: "text", ctl: "text", pin: "text", k: ["K03"], pri: 1, aka: ["Item name size"],
    syn: "font|font size|bigger text|larger text|big text|small text|smaller text|bigger font|larger font|too small|tiny|tiny text|hard to read|cant read|hard to see|readable|readability|zoom|magnify|accessibility|large print|reading glasses|size of letters|name size|enlarge|make it bigger|make text bigger|text too small|letters too small|squint|size|scale|display size|bigger|larger" });
  add({ id: "rows", t: "Rows", g: "Text and rows", sc: "device", where: "Search only (Pantry and Shopping lists)", aff: "What each row shows on the Pantry and Shopping lists. Standard shows amount, spot and use-by date; Names only shows just the name. Replaces four switches.", val: "rows", ctl: "rows", adv: true, k: ["K06", "K07", "K08", "K10"], pri: 6, aka: ["Show the spot", "Show the amount", "Show the use-by date", "Compact rows"],
    syn: "row detail|names only|show less|less detail|simple list|clutter|busy|too busy|too much on screen|compact|tight|density|spot|amount|quantity|how much|use by|use-by|expiry|best before|goes off|shelf|location on rows|hide the date|hide the amount|hide the spot|row height|smaller rows|list too long|crowded" });
  add({ id: "motion", t: "Reduce motion", g: "Text and rows", sc: "device", where: "Search only", aff: "Animations and transitions everywhere. By default Kitchie follows your phone's own Reduce motion setting.", val: "motion", ctl: "motion", adv: true, k: ["K05"], pri: 7,
    syn: "animation|animations|movement|moving|transitions|dizzy|motion sickness|flashing|slide|sliding|bounce|wobble|stop moving|calm|less movement|stop animations|parallax|jumpy" });
  add({ id: "bell", t: "Household activity bell", g: "Notifications", sc: "device", where: "Search only", aff: "The bell with a count that appears when someone else in the household changes something.", val: "bell", ctl: "bell", adv: true, k: ["K09"], pri: 8, aka: ["Show household activity"],
    syn: "bell|badge|notification dot|red dot|alerts|someone changed|activity|housemate changed|who changed|updates|notification bell|count on the bell|hide the bell|turn off the bell" });
  add({ id: "reset", t: "Reset to defaults", g: "Looks", sc: "device", where: "Search only", aff: "This device's looks and display settings only: theme, light or dark, emoji, text size, rows, motion and the bell. Not your household, Preferences or pinned shortcuts.", val: "reset", ctl: "reset", adv: true, k: ["K11"], pri: 9,
    syn: "reset|defaults|default|undo|undo changes|restore|start over|put back|back to normal|revert|i broke it|messed up|messed it up|factory settings|clear my changes|go back to how it was|default settings" });
  add({ id: "sort", t: "Sort order", g: "Lists", sc: "device", where: "Pantry list › Sort", aff: "The order of the Pantry list. Set on the list itself, not here.", val: "sort", go: "the Pantry list", k: ["K12"], pri: 12,
    syn: "sort|sorting|order|arrange|alphabetical|by date|newest|oldest|a to z|reorder|what comes first|sort by use-by|group by" });

  /* theme names: typing a theme's name previews and picks it */
  [["kitchie", "Kitchie Night", "dark|night|default|green|gold|original|black"], ["kitchie-day", "Kitchie Day", "light|day|cream|default light|bright|white"],
   ["marmalade", "Marmalade", "orange|warm|citrus|light|sunny|burnt orange|peach"], ["blueberry", "Blueberry", "blue|purple|dark|pink|berry|night|navy"],
   ["herb", "Herb Garden", "green|garden|plants|fresh|herb|light|leafy|basil"], ["cappuccino", "Cappuccino", "brown|coffee|cream|latte|beige|tan|warm|light|mocha"],
   ["tokyo-midnight", "Tokyo Midnight", "dark|cyan|neon|midnight|blue|teal|city|tokyo"], ["paprika", "Paprika", "dark|red|orange|spicy|warm|brown|chilli"],
   ["sea-salt", "Sea Salt", "teal|blue|sea|beach|ocean|light|cool|green|salt|aqua"], ["lavender-fog", "Lavender Fog", "purple|lilac|violet|soft|light|pastel|lavender|fog"]
  ].forEach(function (x, n) {
    add({ id: "th-" + x[0], t: x[1], g: "Theme names", sc: "device", where: "Settings › Looks › Theme", aff: "Colours on every screen. This theme only; Light or dark is a separate choice.", val: "theme", ctl: "themepick", tid: x[0], k: ["K01"], pri: 20 + n, syn: x[2] + "|" + x[1].toLowerCase() + " theme" });
  });

  /* you */
  add({ id: "me", t: "My name and picture", g: "You", sc: "member", where: "Profile › Me", aff: "How the household sees you: your name and picture on activity and in the member list.", val: "me", go: "Me", k: ["K14", "K15"], pri: 14,
    syn: "name|my name|display name|picture|photo|avatar|profile photo|profile picture|who i am|rename me|change my name|my profile|my details|account name|initial" });
  add({ id: "role", t: "Kitchen role", g: "You", sc: "member", where: "Profile › Me › Kitchen", aff: "The title and icon shown instead of your initial.", val: "role", go: "Me › Kitchen", k: ["K16"], pri: 15,
    syn: "role|title|kitchen title|chef|cook|job|icon|badge|sous chef|what i do in the kitchen|nickname" });
  add({ id: "tz", t: "Time zone", g: "You", sc: "info", where: "No setting: taken from your phone", aff: "Quiet hours and today's date use it. You never set it.", val: "tz", info: "Not a setting. Kitchie reads the time zone from your phone and remembers it, so there is nothing to choose and nothing to get wrong.", k: ["K19"], pri: 16,
    syn: "timezone|zone|clock|time|what time|wrong time|time is wrong|daylight saving|utc|sydney|date wrong|local time|change the time|set the time" });
  add({ id: "units", t: "Units", g: "You", sc: "info", where: "No setting today", aff: "How amounts are shown (g, kg, ml, cups).", val: "units", info: "There is no units setting today (none of the 35 audited knobs). Each item keeps the unit it was added in. Whether to add one is an open question (SR-Q).", pri: 17,
    syn: "metric|imperial|grams|cups|ounces|litres|liters|ml|kg|convert|conversion|measurements|tablespoon|pounds|fahrenheit|celsius|measure" });
  add({ id: "install", t: "Install on the home screen", g: "App", sc: "device", where: "Profile menu", aff: "Adds Kitchie to your phone's home screen so it opens like an app.", val: "install", go: "the install prompt", k: ["K33"], pri: 18,
    syn: "install|add to home screen|app|pwa|shortcut on phone|icon on phone|download the app|make it an app|home screen|add to phone|get the app" });
  add({ id: "csv", t: "Download inventory CSV", g: "Your data", sc: "household", where: "Profile › My data", aff: "Downloads a file of everything in the Pantry. Changes nothing.", val: "csv", go: "the download", k: ["K34"], pri: 19,
    syn: "csv|export|download|backup|back up|spreadsheet|excel|my data|take my data|save a copy|items file|download my pantry|data" });
  add({ id: "signout", t: "Sign out", g: "Account", sc: "account", where: "Profile menu", aff: "Ends your session on this device.", val: "signout", go: "sign out", k: ["K35"], pri: 21,
    syn: "sign out|signout|log out|logout|leave|exit|switch account|sign off|lock|log off|change user|different account" });

  /* household */
  add({ id: "hh", t: "Household name", g: "Household", sc: "household", where: "Household", aff: "The name shown at the top of every screen except Home.", val: "hh", go: "Household", k: ["K28"], pri: 22,
    syn: "kitchen name|home name|family name|rename household|rename the household|whats our kitchen called|name of the house|name of our kitchen|call our kitchen|house name" });
  add({ id: "members", t: "Members and admins", g: "Household", sc: "household", where: "Household", aff: "Who is in the household and who can manage it.", val: "members", go: "Household", k: ["K31"], pri: 23,
    syn: "household|members|people|whos in|housemates|family|admin|admins|make admin|remove someone|roommates|partner|who can edit|permissions|kick out" });
  add({ id: "invite", t: "Invite someone", g: "Household", sc: "household", where: "Household › Invite", aff: "Creates a link or code so another person can join your household.", val: "invite", go: "Household › Invite", k: ["K31"], pri: 24,
    syn: "household|add a person|add someone|share|join|invite link|code|bring in a housemate|add partner|add my wife|add my husband|let someone in|share the kitchen|new member" });
  add({ id: "leave", t: "Leave household", g: "Household", sc: "household", where: "Household (search only)", aff: "Removes you from this household. Items stay with the household.", val: "leave", go: "Household › Leave", adv: true, k: ["K31"], pri: 25,
    syn: "quit household|move out|remove me|leave the kitchen|exit household|stop sharing|go solo|delete me" });
  add({ id: "cats", t: "Categories", g: "Kitchen setup", sc: "household", where: "Kitchen setup › Categories", aff: "Groups for items (Dairy, Meat). Renames change every item in the group; Undo is offered.", val: "cats", go: "Categories", k: ["K29"], pri: 26,
    syn: "groups|rename category|merge categories|sections|aisle|aisles|types of food|organise|organize|dairy|meat|tidy up|too many categories|remove a category" });
  add({ id: "locs", t: "Locations and spots", g: "Kitchen setup", sc: "household", where: "Kitchen setup › Locations", aff: "Where things live (Fridge, Freezer, Pantry) and the spot inside (Shelf 2).", val: "locs", go: "Locations and spots", k: ["K30"], pri: 27,
    syn: "locations|places|fridge|freezer|pantry shelf|cupboard|where things live|shelf|rooms|storage|add a shelf|add a fridge|garage fridge|spots" });
  add({ id: "samples", t: "Sample items", g: "Kitchen setup", sc: "household", where: "Pantry strip (search only here)", aff: "Clears the starter items you have not touched, or shows the reminder again.", val: "samples", go: "the Pantry strip", adv: true, k: ["K32"], pri: 28,
    syn: "starter items|examples|demo items|clear samples|placeholder items|dummy data|remove the starter food|fake items|example food|get rid of the examples|sample data" });

  /* assistants */
  add({ id: "claude", t: "Claude", g: "Assistants", sc: "member", where: "Assistants › Claude", aff: "Lets Claude read your Pantry and recipes, and be asked from Plan.", val: "claude", go: "Assistants › Claude", k: ["K18"], pri: 30,
    syn: "anthropic|connect claude|ai|assistant|assistants|chatbot|mcp|link claude|claude connection|use claude|ask claude" });
  add({ id: "chatgpt", t: "ChatGPT", g: "Assistants", sc: "member", where: "Assistants › ChatGPT", aff: "Lets ChatGPT read your Pantry and recipes, and be asked from Plan.", val: "chatgpt", go: "Assistants › ChatGPT", k: ["K18"], pri: 31,
    syn: "openai|gpt|connect chatgpt|ai|assistant|assistants|chatbot|link chatgpt|chat gpt|use chatgpt" });
  add({ id: "gemini", t: "Gemini", g: "Assistants", sc: "member", where: "Assistants › Gemini", aff: "Lets Gemini read your Pantry and recipes.", val: "gemini", go: "Assistants › Gemini", k: ["K18"], pri: 32,
    syn: "google ai|bard|connect gemini|ai|assistant|assistants|chatbot|google assistant" });
  add({ id: "defassist", t: "Default assistant", g: "Assistants", sc: "member", where: "Assistants (asked only with two connected)", aff: "Which assistant the Plan page's Ask button opens. With one connected, Kitchie just uses it.", val: "defassist", go: "Assistants", adv: true, k: ["K17"], pri: 33, aka: ["My assistant"],
    syn: "which assistant|ask assistant button|plan button|preferred ai|switch assistant|default ai|main assistant|which ai|change assistant" });
  add({ id: "disconnect", t: "Disconnect an assistant", g: "Assistants", sc: "member", where: "Assistants (search only)", aff: "Stops that assistant reading your Pantry. You can connect it again.", val: "disconnect", go: "Assistants", adv: true, k: ["K18"], pri: 34,
    syn: "unlink|remove assistant|stop claude|revoke|disconnect claude|disconnect chatgpt|cut off the ai|stop ai access|remove ai" });

  /* preferences */
  add({ id: "prefs", t: "Preferences", g: "Preferences", sc: "member", where: "Preferences", aff: "Opens the whole Preferences screen: stock checks, quiet hours, food rules and notes.", val: "prefs", go: "Preferences", k: ["K20", "K25"], pri: 5,
    syn: "prefs|preference|my preferences|food rules|rules|what the assistant knows about me|household rules|how kitchie behaves|behaviour|behavior" });
  add({ id: "checks", t: "Ask me to check amounts", g: "Preferences", sc: "member", where: "Preferences › Mine", aff: "Whether the assistant ever asks you to confirm how much is left.", val: "checks", ctl: "checks", k: ["K20"], pri: 40,
    syn: "stock checks|check amounts|questions|asks me|how much is left|nagging|stop asking|too many questions|pestering|confirm quantities|stop the questions|stop pestering me|quiet the assistant|stock check" });
  add({ id: "quiet", t: "Quiet hours", g: "Preferences", sc: "member", where: "Preferences › Quiet hours", aff: "No questions from the assistant between these times, in your time zone.", val: "quiet", go: "Preferences › Quiet hours", k: ["K21"], pri: 41,
    syn: "do not disturb|dnd|night|sleep|silence|mute|no questions at night|focus|bedtime|sleeping|dont ask me at night|quiet time|notifications at night" });
  add({ id: "cap", t: "Most suggestions per day", g: "Preferences", sc: "member", where: "Preferences › Mine", aff: "The most stock checks the assistant may raise in a day (1 to 20, default 3).", val: "cap", go: "Preferences › Mine", k: ["K22"], pri: 42,
    syn: "suggestions per day|limit|cap|daily limit|fewer questions|how often|frequency|too many|max|maximum|ask less|ask me less often|per day" });
  add({ id: "rules", t: "Check rules by place", g: "Preferences", sc: "member", where: "Preferences › Stock level checks (search only)", aff: "How often and how keenly to check, per category, location or item.", val: "rules", go: "Preferences › Stock level checks", adv: true, k: ["K23"], pri: 43,
    syn: "rules by place|per category|per location|how often by fridge|per item rule|check frequency|only check the freezer|different rules|exceptions" });
  add({ id: "stops", t: "Switched-off checks", g: "Preferences", sc: "member", where: "Preferences › Stock level checks (search only)", aff: "Items you told the assistant to stop asking about. You can turn them back on.", val: "stops", go: "Preferences › Switched-off checks", adv: true, k: ["K24"], pri: 44,
    syn: "stopped|stop asking list|turn back on|silenced items|ignored items|items i stopped|start asking again|undo stop" });
  add({ id: "avoids", t: "Food avoids", g: "Food", sc: "member", where: "Preferences › Food", aff: "Foods the assistant must never (Hard) or rather not (Soft) suggest. Hard avoids are enforced in meal ideas.", val: "avoids", go: "Preferences › Food", k: ["K25"], pri: 45,
    syn: "avoid|avoids|allergy|allergies|allergic|intolerance|diet|dietary|vegetarian|vegan|gluten|nuts|cant eat|hard avoid|soft avoid|never suggest|halal|kosher|food rules|dairy free|coeliac|celiac" });
  add({ id: "likes", t: "Dislikes and likes", g: "Food", sc: "member", where: "Preferences › Food", aff: "Foods you or the household like or dislike; used to rank meal ideas, never to block them.", val: "likes", go: "Preferences › Food", k: ["K25"], pri: 46,
    syn: "dislike|dislikes|hate|dont like|favourite|favorite|love|likes|picky|fussy|taste|cant stand|favourites" });
  add({ id: "subs", t: "Substitutions", g: "Food", sc: "member", where: "Preferences › Food", aff: "Swaps you accept (butter for margarine), used when an ingredient is missing.", val: "subs", go: "Preferences › Food", k: ["K25"], pri: 47,
    syn: "substitute|swap|replacement|instead of|alternative ingredient|out of an ingredient|replace" });
  add({ id: "notes", t: "Notes for the assistant", g: "Food", sc: "member", where: "Preferences › Notes", aff: "Free text the assistant reads: yours, and the household's.", val: "notes", go: "Preferences › Notes", k: ["K26"], pri: 48,
    syn: "notes|tell the assistant|remember|memo|instructions|household notes|my notes|write a note|extra info|things the assistant should know" });
  add({ id: "props", t: "Housemate proposals", g: "Food", sc: "member", where: "Preferences › Mine", aff: "Someone proposes a food avoid for you, or you for them; the person reviews it.", val: "props", go: "Preferences › Mine", k: ["K27"], pri: 49,
    syn: "propose|suggest an avoid|for my partner|added for you|review|pending|housemate|proposal|someone added a rule" });

  /* screens and notices */
  add({ id: "history", t: "History", g: "App", sc: "household", where: "History", aff: "A searchable list of what changed, who did it and when.", val: "history", go: "History", pri: 50,
    syn: "activity|log|what changed|audit|who did what|past changes|recent changes|timeline|who moved the milk" });
  add({ id: "notif", t: "Notifications", g: "Notifications", sc: "info", where: "No single switch", aff: "Kitchie has two signals: the bell in the app, and the assistant's stock checks.", val: "notif", info: "There is no single notifications switch. The bell is under Household activity bell; how often the assistant asks is Quiet hours, Most suggestions per day and Ask me to check amounts.", pri: 51,
    syn: "notification|push|alerts|alert|reminders|buzz|ping|messages|emails|stop the pings|too many alerts|sound" });
  add({ id: "planoff", t: "Usual days off for planning", g: "Plan", sc: "member", where: "Plan page", aff: "Days the Plan page leaves out. Set on the Plan page itself.", val: "planoff", go: "Plan", k: [], pri: 52,
    syn: "days off|not cooking|takeaway night|plan days|eat out|which days|skip days|busy days|nights out" });

  window.SR_E_INDEX = I;
})();
