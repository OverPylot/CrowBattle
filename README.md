# Kalandasztal

Magyar–angol, mobilbarát virtuális játékasztal D&D-hez. Statikus weboldal, amely saját szerver, telepítés és buildelés nélkül feltölthető GitHub Pages-re.

## Ingyenes közzététel GitHub Pages-en

A részletes magyar útmutató: [INDULAS.md](INDULAS.md).

1. Hozz létre egy **Public** GitHub repositoryt, például `kalandasztal` néven.
2. A kicsomagolt csomag **tartalmát** töltsd fel a repó gyökerébe. Az `index.html` közvetlenül a gyökérben legyen. Ne a ZIP-et töltsd fel.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
4. Válaszd a **main** ágat és a **/ (root)** mappát, majd **Save**.
5. A GitHub által kiírt oldalcímen nyisd meg a játékasztalt. PeerJS-fiók, API-kulcs és külön szerver nem kell.

Ingyenes GitHub-fióknál a kódtár nyilvános. A saját térképeidet és mentéseidet nem kell a repóba feltöltened; azokat az alkalmazáson belül használod.

## Mit tud az első változat?

- DM- és játékoskezdőképernyő, regisztráció nélkül.
- DM-térképtár automatikus IndexedDB-mentéssel, mentés exportálása/importálása.
- PNG, JPG és WebP térképfeltöltés, legfeljebb 20 MB bemeneti fájllal. A térkép legfeljebb 4096 képpont hosszú oldalra lesz kicsinyítve.
- Négyzetrács: méret, eltolás, szín, átlátszóság, vonalvastagság és rácshoz igazítás. 1 mező = 5 láb.
- Tokenfeltöltés, elhelyezés, mozgatás, név és szín; 1×1–5×5 mezős, illetve szabad szélességű/magasságú méret.
- A játékosok a saját tokenjeiket kezelik; a DM minden tokent kezelhet, és hozzárendelheti a figurákat a már csatlakozott játékosokhoz.
- A DM elrejtheti és visszahozhatja a tokeneket. Rejtett token nem szerepel a játékosoknak küldött állapotban.
- Tizenkét karakteres szobakód és játékoslink; mentett játékosazonosító visszatéréshez.
- Kétujjas nagyítás, érintéses mozgatás, külön kéz eszköz; álló és fekvő mobilnézet.
- Résztvevőnként külön magyar vagy angol kezelőfelület.
- Két saját készítésű SVG-mintatérkép.

Nincs karakterlap, chat, köd, harckövető, kockadobás vagy képes/leveles megosztás. A loot funkció nem része ennek az első változatnak; a működése még egyeztetésre vár.

## Hogyan működik a szoba?

A DM böngészője a játékállapot gazdája. A játékosok WebRTC-adatkapcsolatokon csatlakoznak hozzá. A DM ellenőrzi a tokenműveleteket, és minden résztvevőnek csak a számára látható állapotot küldi.

A kezdeti egymásra találást a **PeerJS Cloud** ingyenes signaling szolgáltatása végzi. Alapesetben a PeerJS nyilvános alapértelmezett STUN-beállítását használjuk. A PeerJS-függőség helyben, verzióhoz kötve a `vendor/` mappában található (1.5.5).

A DM böngészőjének **nyitva és aktívan kell maradnia**. Telefonos háttérbe helyezés, képernyőzár vagy energiatakarékosság megszakíthatja a játékot. A képernyő ébren tartását az alkalmazás megkísérli, ha a böngésző támogatja. Hosszabb játékhoz a DM-nek számítógép ajánlott, miközben a játékosok telefonról is csatlakozhatnak.

Kapcsolatvesztés után a játékos automatikusan megpróbál visszatérni. Visszalépéskor új állapotot kap a DM-től; az offline mozgatás tiltott. Oldalfrissítés után a szobakóddal újra be kell lépni. A mentett helyi játékosazonosító az adott szobában visszaadja a saját tokenek kezelését.

Egyes mobil-, vállalati vagy szigorú NAT-hálózatokon a közvetlen WebRTC-kapcsolat **nem működik TURN-továbbító nélkül**. Ehhez a csomaghoz nem tartozik TURN-szolgáltatás vagy beépített fizetős szolgáltatás. A kapcsolódást a saját eszközeitekkel és hálózataitokkal is próbáljátok ki. Az ingyenes PeerJS szolgáltatás elérhetősége külső függőség.

Nincs termékbeli játékoslétszám-korlát. A tényleges létszám a DM eszközétől, a feltöltési sebességtől és a térképek méretétől függ; 5–10 játékos egyidejű működése ebben a kiadásban még nem lett terhelésesen igazolva. A térképen 1000 token technikai védőkorlát van.

## Mentés és DM-link

- A térképek, képek és tokenek az adott oldalhoz tartozó böngészőtárban maradnak.
- Másik böngésző, eszköz vagy webcím külön tárat jelent. A localhoston elkészített térképek sem kerülnek át automatikusan a GitHub Pages-es címre.
- A böngészőadatok törlése törölheti a mentéseket. Inkognitómód helyett normál böngészőablakot használj, és tölts le biztonsági mentést.
- A mentés `.kalandasztal.json` fájl. Tartalmazza a térképet, a rejtett tokeneket és képeket is, ezért DM-mentésként kezeld.
- Az export nem tartalmaz DM-belépési kulcsot vagy játékos-hitelesítő adatot. Importáláskor új térkép keletkezik, és minden token kezelője a DM lesz; az új szobában újra hozzárendelhetők a figurák.
- A **DM gyorslink** kizárólag az ugyanebben a böngészőben mentett térképet nyitja meg. Nem felhőmentés és nem másik gépről használható mesélői belépés. Az újranyitott térképen a „Szoba indítása” gombbal indul újra a közös játék.
- A játékosnak a **játékoslinket vagy szobakódot** add át.

## Helyi előnézet

A fájlokat HTTP-n kell kiszolgálni; az `index.html` dupla kattintásos `file://` megnyitása az ES-modulok miatt nem megfelelő.

Python 3-mal a projekt mappájában:

```sh
python3 -m http.server 4173
```

Majd nyisd meg: `http://localhost:4173`. A távoli játékhoz a GitHub Pages HTTPS-címét használd. Nem kell a saját hálózatod portjait megnyitnod.

## Fejlesztői ellenőrzés

Node.js 20 vagy újabb esetén nincs szükség csomagtelepítésre:

```sh
npm run check
```

A tesztek a rejtett adatok kiszűrését, a tokenjogosultságokat, a bemeneti ellenőrzést, a rácsigazítást és a szobakódokat vizsgálják.

## Források és külső kód

- [GitHub Pages létrehozása](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Pages publikálási forrása](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [PeerJS dokumentáció és hálózati korlátok](https://peerjs.com/client/faq)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

A PeerJS MIT-licencét a `vendor/PEERJS-LICENSE.txt` tartalmazza. A mintatérképek és a felület saját, e projekthez készített SVG/CSS-elemek; a projekt nem használ Owlbear Rodeo-eredetű grafikai anyagokat.
