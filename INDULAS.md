# Így indítsd el ingyen a Kalandasztalt 0.2

Ha a korábbi változatot már használod, a [FRISSITES-v0.2.md](FRISSITES-v0.2.md) útmutatót kövesd.

A weboldalt a GitHub Pages szolgálja ki. A játékosok és a mesélő összekapcsolását a PeerJS ingyenes szolgáltatása segíti. Nem kell bankkártya, PeerJS-fiók, API-kulcs, domainvásárlás, saját szerver vagy fizetős tárhely.

## 1. Csomagold ki a letöltött fájlt

Csomagold ki a `kalandasztal.zip` fájlt. Az alkalmazás fájljait fogod látni: `index.html`, `style.css`, `app.js`, további JavaScript-fájlok, `assets` és `vendor` mappák, illetve útmutatók.

## 2. Hozz létre egy GitHub-kódtárat

1. Jelentkezz be a [github.com](https://github.com) oldalon. Ha nincs fiókod, hozz létre egy ingyeneset.
2. Jobb felül a **+ → New repository** menüt válaszd.
3. A **Repository name** mezőbe például ezt írd: `kalandasztal`.
4. Láthatóság: **Public**. A GitHub Pages az ingyenes csomagban nyilvános repóval használható.
5. Bekapcsolhatod az **Add README** lehetőséget.
6. Kattints a **Create repository** gombra.

A nyilvános kódtár az alkalmazás kódját teszi láthatóvá. A böngészőben tárolt saját térképtáradat és a futó játékszobád tartalmát nem tölti fel a GitHubra.

## 3. Töltsd fel az alkalmazás fájljait

1. A repó **Code** lapján kattints az **Add file → Upload files** lehetőségre. Üres repónál az „uploading an existing file” hivatkozás is használható.
2. Húzd be a kicsomagolt alkalmazás **összes fájlját és almappáját**.
3. Ellenőrizd, hogy az `index.html` közvetlenül a repó gyökerébe kerül, és az `assets/`, illetve `vendor/` mappák is feltöltődnek.
4. Kattints a **Commit changes** gombra, és mentsd a változtatást a `main` ágra.

**Ne magát a ZIP-et töltsd fel.** Ha az `index.html` egy külön `kalandasztal/` almappába kerül, a gyökérből publikált oldal nem fog megfelelően elindulni. A `.nojekyll` fájl rejtett lehet; a többi fájlt mindenképp töltsd fel.

## 4. Kapcsold be a GitHub Pages-t

1. Nyisd meg a repó **Settings** lapját.
2. A bal oldali menüben keresd meg a **Pages** pontot.
3. A **Build and deployment** részben a **Source** legyen **Deploy from a branch**.
4. A **Branch** mezőben válaszd: **main**.
5. A mappa legyen **/ (root)**.
6. Kattints a **Save** gombra.
7. Amikor elkészült a közzététel, itt jelenik meg az oldal címe. Jellemzően: `https://FELHASZNALONEVED.github.io/kalandasztal/`.

Ha még nem tölt be, nézd meg a repó **Actions** lapján, hogy a Pages-közzététel befejeződött-e. Az első publikálás eltarthat néhány percig.

Hivatalos segítség: [GitHub Pages beállítása](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 5. Készíts elő egy játékot

1. Nyisd meg a saját GitHub Pages-es oldaladat normál böngészőablakban.
2. Válaszd az **Én mesélek** fület.
3. Nyisd meg az egyik mintatérképet, vagy válaszd az **Új térkép feltöltése** gombot.
4. A **három pont → Rács beállítása** menüponttal állítsd a mezők méretét és a háló eltolását. A térképen megjelenő **+** jelölőt húzással is igazíthatod. Befejezéshez nyisd meg újra a rács beállításait a hárompontos menüből.
5. A **token** eszközzel nyisd meg a tokentárat. Válassz egy alapfigurát, vagy készíts saját tokent a panel tetején lévő gombbal. Választhatsz 1×1–5×5 méretet vagy külön szabad szélességet és magasságot.
6. Tokenre koppintva megjelenik a szerkesztés, törlés és DM-ként az elrejtés/visszahozás eszköze.

Üres területen húzva a térképet mozgatod. A kéz eszköz akkor is a térképet mozgatja, ha egy figuránál indítod a húzást. Két ujjal nagyíthatsz; az illesztés gomb az egész térképet mutatja.

## 6. Hívd be a játékosokat

1. DM-ként kattints a **Szoba indítása** gombra.
2. A létrejövő szobakódot másold ki, vagy válaszd a **Játékoslink** gombot.
3. A játékosok megnyitják az oldaladat vagy a játékoslinket, megadják a becenevüket és a kódot, majd a **Csatlakozás** gombra kattintanak.
4. A játékos feltölthet saját tokent. Ha te készítetted elő a figuráját, a token szerkesztésénél a **Ki kezelheti?** mezőben rendeld a már csatlakozott játékoshoz.
5. Tartsd nyitva és aktívan a DM-oldalt a játék végéig. A telefon lezárása vagy az oldal háttérbe helyezése megszakíthatja a kapcsolatot.

A szoba tartalmát a kóddal rendelkezők érhetik el. A DM-kezdőképernyőre kattintó másik látogató a saját helyi térképtárát látja, és nem kap hozzáférést a te mesélői eszközeidhez.

## 7. Ments, és folytasd később

- A térkép automatikusan mentődik a **DM böngészőjében**.
- A letöltés ikon vagy a szobaablak vagy a hárompontos menü **Mentés letöltése** gombja egy `.kalandasztal.json` fájlt készít.
- Másik eszközre költözéskor a kezdőképernyő **Mentés betöltése** gombjával töltsd vissza.
- Ez a mentés a rejtett ellenfeleket is tartalmazza; mesélői mentésként kezeld.
- A **DM gyorslink** ugyanebben a böngészőben segít megnyitni a térképet. Másik eszközre nem viszi át a térképtárat.
- Újranyitáskor a **Szoba indítása** gombbal indítsd újra a közös játékot.

## Ha nem tudtok kapcsolódni

1. Ellenőrizzétek, hogy a DM-nél ténylegesen megjelent a szobakód.
2. Ellenőrizzétek a kódot, és hogy a DM oldala nincs-e bezárva vagy elaltatva.
3. A játékos próbálja meg az **Újracsatlakozás** gombot.
4. Próbáljátok ki másik Wi-Fi-n, vagy Wi-Fi és mobilnet között váltva.
5. Bizonyos hálózatokon külön **TURN-továbbító** kell a WebRTC-hez. A csomag nem tartalmaz ilyet, ezért minden hálózaton működő kapcsolatot nem garantál. Az ingyenes PeerJS szolgáltatás kimaradása is megakadályozhatja az új csatlakozásokat.

Ha a helyi térképtár üres: ugyanazt az eszközt, böngészőt és webcímet használod-e? Engedélyezve van-e a webhelyadatok tárolása? A böngészőadatok törlése vagy az inkognitóablak bezárása eltüntetheti a helyi mentést. Ilyenkor a korábban letöltött biztonsági mentésből állítsd vissza.


A visszavonás, távolságmérés, ping, jelenetváltás, tokentár, zsákmány és a közös/titkos kockadobás részletes használata: [FRISSITES-v0.2.md](FRISSITES-v0.2.md).
