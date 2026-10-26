# CrowBattle 0.5.0

Magyar–angol, mobilbarát virtuális játékasztal D&D-hez. Saját szerver, buildelés és csomagtelepítés nélkül feltölthető GitHub Pages-re. A DM böngészője tartja össze a játékot, az egymásra találást az ingyenes PeerJS Cloud segíti.

- Első indítás: [INDULAS.md](INDULAS.md).
- Meglévő oldal frissítése és az új funkciók: [FRISSITES-v0.5.0.md](FRISSITES-v0.5.0.md).
- Ellenőrzés és annak határai: [ELLENORZES.md](ELLENORZES.md).

## Ingyenes közzététel

1. Hozz létre egy **Public** GitHub-repót, például `CrowBattle` néven.
2. A kicsomagolt alkalmazás **tartalmát** töltsd fel a repó gyökerébe. Az `index.html` közvetlenül a gyökérben legyen; az `assets/` és `vendor/` mappák is kerüljenek fel.
3. **Settings → Pages → Source: Deploy from a branch → main → / (root) → Save.**
4. Nyisd meg a GitHub által megadott HTTPS-címet. PeerJS-fiók vagy API-kulcs nem kell.

A GitHubra csak az alkalmazás kódját és a mellékelt grafikákat töltöd fel. A saját térképeid és mentéseid a böngészőben maradnak.

## Új kényelmi funkciók

- Tokenhúzás közbeni peremgörgetés: a szélhez közeledve gyorsul, felengedéskor vagy megszakításkor megáll.
- A térképi nevek és mozgás-/mérésfeliratok külön kapcsolhatók minden résztvevőnél. A helyi beállítás megmarad. A jelölőikonok és a „ki mozgatja?” jelzés láthatók maradnak.
- Teljesképernyő-gomb a támogatott böngészőkben; a menük és párbeszédablakok is használhatók teljes képernyőn.
- Legalább 44×44 képernyőpixeles érintési cél a kis tokenekhez. Közeli figuráknál előbb a ténylegesen eltalált, egyébként a legközelebbi token választható; a portré nem lesz nagyobb.
- Rövid névjelzés a húzott tokenen. Ez tájékoztatás, nem kizárólagos zárolás; rejtett token jelenlétjelzése nem kerül a játékosokhoz.
- Helyben készülő QR-kód a szobaablakban, játékoslinkkel és beceneves csatlakozással. QR-szolgáltatóhoz nem küldünk adatot.

## Funkciók

- DM- és játékoskezdőképernyő, beceneves belépés szobakóddal vagy játékoslinkkel.
- Automatikusan mentett helyi térképtár, letölthető és visszatölthető biztonsági másolattal. A 0.1-es mentések támogatottak.
- PNG, JPG és WebP térképfeltöltés. Legfeljebb 20 MB bemeneti kép; a hosszabb oldal legfeljebb 4096 pixelre lesz kicsinyítve.
- Négyzetrács: mezőméret, eltolás, szín, átlátszóság, vonalvastagság, rácshoz igazítás. 1 mező = 5 láb.
- Tokenfeltöltés, név, szín, 1×1–5×5 mezős és szabad szélességű/magasságú méretezés.
- Minden látható tokent bárki mozgathat; szerkeszteni és törölni a tulajdonosa vagy a DM tudja. A DM elrejtheti és visszahozhatja a figurákat. A rejtett token nem szerepel a játékosoknak küldött állapotban.
- Mozgatás visszavonása, térképenként legfeljebb 50 bejegyzéssel; Ctrl/Cmd+Z.
- Közös, mezőközéptől induló távolságmérés és mozgásjelzés. A vonalon név, láb és mezőszám jelenik meg; a jelzés felengedés után 3 másodperccel eltűnik. Átlósan is 5 láb egy mező. Rejtett token mozgása csak a DM-nél látszik.
- Névvel jelzett, minden résztvevőnél megjelenő térképi ping.
- Jelenetváltás a szobakód és a kapcsolat megtartásával; csapattagnak jelölt figurák átvitele.
- Kereshető tokentár: 12 kasztfigura egy-egy alosztály alapján, 6 ellenfél, 4 civil, 1 VIP. Saját, egységes SVG-portrék.
- Saját tokenek elmentése, másolása; külön tokentár-export és -import.
- Térképenként mentett és DM által megosztható zsákmánylista.
- Összeállítható kockadobások: d4, d6, d8, d10, d12, d20, d100. Kattintás hozzáad, mínusz elvesz; kevert dobás és módosító is használható.
- Felismerhető, külön D4–D100 kockaikonok, D20-as főikon és favicon.
- Közös dobáselőzmény és külön titkos DM-dobás. A titkos dobások nem kerülnek át a játékosokhoz, az aktuális DM-térképpel mentődnek.
- Érintéses mozgatás, kétujjas nagyítás, álló és fekvő mobilnézet, résztvevőnként külön magyar/angol felület.

- Képernyőpixelben korlátozott, halmozható állapotjelölők és rövid `elköltött/keret ft` mozgásfelirat; tokenenkénti kezdeményezés és közös harckövető.
- Körönként visszatöltődő mozgáskeret, összegzett költség, piros túllépés és visszavonáskor költség-visszatérítés.
- Festhető/radírozható nehéz terep, kétszeres mezőköltséggel; közös kör-, kúp- és vonalsablonok.

Karakterlap, chat, köd, automatikus lootfelvétel és képes/leveles megosztás nincs ebben a változatban.

## Helyi előnézet

A projekt mappájában Python 3-mal:

```sh
python3 -m http.server 4173
```

Nyisd meg a `http://localhost:4173` címet. A `file://` megnyitás nem megfelelő az ES-modulokhoz. Távoli játékhoz a GitHub Pages HTTPS-címét használd.

## Fejlesztői ellenőrzés

Node.js 20 vagy újabb esetén nincs szükség csomagtelepítésre:

```sh
npm run check
```

A tesztek a jogosultságokat, a titkos adatok kiszűrését, a dobásokat, a visszavonást, a csapat átvitelét, a rácsmérést, a mozgáskeretet, a nehéz terepet, a harckövetőt, a jelölőket, a varázsterületeket és a korábbi mentések kompatibilitását is vizsgálják.

## Adattárolás és hálózat

A korábbi `kalandasztal-v1` IndexedDB-adatbázist használjuk a térképekhez. A saját tokentár külön `kalandasztal-tokens-v1` helyi adatbázisban van. A böngészőadatok törlése a mentéseket is törölheti; exportálj biztonsági másolatot. Másik webcím, eszköz vagy böngésző külön térképtárat jelent.

A DM gyorslink ugyanabban a böngészőben nyitja meg a mentett térképet; nem felhőmentés és nem eszközök közötti átvitel. Az exportált DM-térképmentés rejtett tokeneket, rejtett zsákmányt és titkos dobásokat is tartalmazhat. Nem tartalmaz DM-belépési kulcsot vagy játékos-hitelesítő adatokat. Importáláskor új térkép keletkezik, és minden token kezelője a DM lesz.

A DM lapjának aktívan nyitva kell maradnia. A képernyőzár vagy telefonos energiatakarékosság megszakíthatja a játékot. A képernyő ébren tartását az alkalmazás megkísérli, ha a böngésző támogatja. Játékosoldalon újracsatlakozáskor friss állapotot kapunk; az offline módosítás tiltott.

A PeerJS Cloud ingyenes signaling szolgáltatása külső függőség. Egyes hálózatokon külön TURN-továbbító kellhet a WebRTC-kapcsolathoz; ilyet ez a csomag nem tartalmaz. Nincs termékbeli játékoslétszám-korlát, de a teljesítmény a DM eszközétől, a feltöltési sebességtől és a képek méretétől függ. A térképen 1000 token technikai határ van.

## Források

- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [PeerJS és a hálózati korlátok](https://peerjs.com/client/faq)
- [D&D Free Rules – kasztok és alosztályok](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

A helyben mellékelt PeerJS 1.5.5 MIT-licence: `vendor/PEERJS-LICENSE.txt`. A portrék, a mintatérképek és a felület saját SVG/CSS-elemek; hivatalos D&D- és Owlbear-grafika nincs a csomagban.

A QR-készítő a [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) helyben mellékelt JavaScript-változata; MIT-licenc: `vendor/QRCODE-LICENSE.txt`.
