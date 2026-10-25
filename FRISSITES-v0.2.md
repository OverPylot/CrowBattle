# Frissítés 0.2-re

Újabb változat: [Frissítés 0.3-ra](FRISSITES-v0.3.md). Az alábbi oldal a 0.2-ben bevezetett funkciókat ismerteti. A közös mérés és a kockaikonok új működését a 0.3-as útmutató írja le.

Ez a csomag a korábbi Kalandasztal kibővített változata. Ugyanúgy GitHub Pages-en és az ingyenes PeerJS-kapcsolaton működik; új fiók, API-kulcs vagy saját szerver nem kell.

## Feltöltés a meglévő GitHub-oldaladra

1. DM-ként érdemes letölteni egy mentést a fontos térképeidről.
2. Csomagold ki a `kalandasztal-v0.2.zip` fájlt.
3. A meglévő GitHub-repóban válaszd az **Add file → Upload files** lehetőséget.
4. Töltsd fel a csomag **tartalmát**, a régi fájlok helyére. Az `index.html` maradjon a repó gyökerében. Az új `assets/tokens/` mappa és az új JavaScript-fájlok is kerüljenek fel.
5. Mentsd a változtatást (**Commit changes**). A korábbi Pages-beállítást nem kell módosítanod.
6. Várd meg a Pages-közzététel végét a GitHub **Actions** lapján, majd frissítsd az oldalt.
7. **Minden résztvevő frissítse az oldalt**, mielőtt új szobát indítotok. A 0.1-es és 0.2-es szobák nem kapcsolódnak egymáshoz.

A térképtár a korábbi böngészőadatbázist használja. Ugyanazon a webcímen, eszközön és böngészőben a régi térképeid megmaradnak. **A frissítéshez ne töröld a webhelyadatokat.** A korábban letöltött térképmentések továbbra is betölthetők.

## Mi került bele?

### Szabad tokenmozgatás és visszavonás

Minden résztvevő mozgathat minden **látható** tokent, az ellenfelek figuráit is. A szerkesztés és törlés a tulajdonos vagy a DM joga; elrejteni és visszahozni a DM tudja a figurákat.

A nagyításvezérlő melletti visszanyíl visszavonja a legutóbbi visszavonható látható tokenmozgatást. A DM rejtett tokenek mozgását is visszavonhatja. Billentyűzettel Ctrl/Cmd+Z is használható. Térképenként legfeljebb 50 mozgási bejegyzést őrzünk; ez mozgatási visszavonás, nem általános szerkesztési undo.

### Távolságmérés és mutatás

- A **vonalzó** eszközzel húzz két pont között.
- Tokenmozgatás közben a kiindulópont és az aktuális hely közötti távolság is megjelenik.
- A mérés négyzetrácsos: egy mező, átlósan is, 5 láb. A mozgatás közben kijelzett vonal közvetlen út, nem akadályokat kerülő vagy több töréspontból álló útvonal.
- A **célkereszt** eszközzel koppints a térképre: minden résztvevő látja a rövid, névvel jelölt pinget.

### Jelenetváltás

A **három pont → Jelenetváltás** alatt kiválaszthatsz egy másik mentett térképet. Megmarad a szobakód és a résztvevők kapcsolata.

A token szerkesztésénél jelölhető a **Csapattag – jelenetváltáskor átvihető** opció. A jelenetválasztóban külön ki-be kapcsolható a csapattagok átvitele. A kasztfigurák alapból csapattagok, az ellenfelek és civilek nem. A saját, játékosként létrehozott token is alapból csapattag.

A figurák mérete az új térkép mezőméretéhez igazodik, az azonosítójuk, tulajdonosuk és rejtettségük megmarad. Az új térképen középre kerülnek. A forráshelyszín mentése megmarad; a célhelyszínen az azonos azonosítójú régi példány frissül.

### Tokentár

A **token** eszköz megnyitja a kereshető, kategóriákra bontott gyűjteményt. Egy koppintás lehelyezi a kiválasztott figurát.

A kezdőcsomag 23 saját, kódnatív SVG-portrét tartalmaz:

- 12 kaszt: Barbarian / Path of the Berserker, Bard / College of Lore, Cleric / Life Domain, Druid / Circle of the Land, Fighter / Champion, Monk / Warrior of the Open Hand, Paladin / Oath of Devotion, Ranger / Hunter, Rogue / Thief, Sorcerer / Draconic Sorcery, Warlock / Fiend Patron, Wizard / Evoker.
- 6 ellenfél: goblin, ork, csontváz, útonálló, kultista, farkas.
- 4 civil: kereskedő, kovács, fogadós, falusi.
- 1 VIP-minta: arany keretes, koronás fontos NPC.

A kasztok és alosztályok neveinek forrása a [D&D 2024 Free Rules](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes). A portrék saját illusztrációk; nem másolt hivatalos grafikák. A figurák nem tartalmaznak karakterlapot vagy automatikus kasztszabályokat.

Tokenre koppintva mappagombbal elmentheted a saját tokentáradba, a másolásgombbal pedig új példányt helyezhetsz le. Saját token létrehozásakor külön jelölőnégyzettel is kérhető a tokentárba mentés. A tokentár külön letölthető és betölthető JSON-mentést kapott. A saját tokentár eszközönként és böngészőnként külön tárolódik.

### Zsákmánylista

**Három pont → Zsákmány.** DM-ként soronként adhatsz meg tárgyakat:

```text
Arany | 30 | Régi érmék
Gyógyital | 2 | Piros folyadék
```

A **Látható a játékosok számára** jelölővel és a Mentés gombbal oszthatod meg. Rejtett állapotban a címe és a tárgyak sem kerülnek át a játékosokhoz. A lista helyszínenként mentődik. Ez megmutatható lista; automatikus tárgyfelvétel és készletvezetés még nincs benne.

### Összeállítható kockadobás

A **kocka** eszköz megnyitja a dobópanelt. Választható d4, d6, d8, d10, d12, d20 és d100.

- Négyszer a D6-ra koppintva **4d6** kerül a dobásba.
- A D6 alatti mínusz egyszeri megnyomásával **3d6** marad.
- Különböző típusok keverhetők, például **2d6 + 1d20 + 3**.
- Egy dobáshoz legfeljebb 100 kocka adható; a módosító −9999 és +9999 között lehet.
- A kiválasztás dobás után megmarad, a **Kockák törlése** gomb üríti.
- A közös dobást minden résztvevő látja, külön kockaértékekkel és összeggel.
- A véletlen értékeket a DM böngészője állítja elő a böngésző kriptográfiai véletlenforrásával. A játékos a kockaösszeállítást küldi el, nem kész eredményt. A működés a mesélő eszközébe vetett bizalmon alapul; nincs kriptográfiai csalásbizonyítás.

A DM-nél választható **Titkos DM-dobás**. Ennek eredménye és előzménye kizárólag a DM-nél jelenik meg, a titkos dobás nem vált ki közös állapotfrissítést. A legutóbbi 30 titkos dobás az aktuális térképpel helyileg mentődik. A DM-térképmentés ezeket is tartalmazza. A közös dobáselőzmény az aktuális futó munkamenethez tartozik, és jelenetváltáskor megmarad; a DM oldalának újratöltésekor újraindul.

## Ismert működési korlát

A DM böngészője tartja össze a játékot, ezért maradjon nyitva és aktívan. Egyes hálózatokon külön TURN-továbbító nélkül nem épül fel a közvetlen WebRTC-kapcsolat. Fizikai Android-készüléken és a saját hálózataitokon is érdemes kipróbálni. Részletes ellenőrzési lista: [ELLENORZES.md](ELLENORZES.md).
