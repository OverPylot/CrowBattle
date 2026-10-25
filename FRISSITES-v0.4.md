# Frissítés 0.4-re

## Feltöltés a meglévő GitHub-oldalra

1. Játék előtt tölts le biztonsági mentést a térképeidről.
2. Csomagold ki a `kalandasztal-v0.4.zip` fájlt.
3. A meglévő repóban **Add file → Upload files** alatt töltsd fel a teljes tartalmát a korábbi fájlok helyére. Az új `combat.js`, `combat-ui.js` és `conditions.js` is kell. Az `index.html` közvetlenül a repó gyökerében maradjon.
4. Mentsd a módosítást, és várd meg a GitHub Pages frissülését.
5. Mindenki frissítse az oldalt. A DM indítsa újra a szobát. A 0.4-es és korábbi kliensek külön szobaprotokollt használnak.

Ugyanazon a webcímen, ugyanabban a böngészőben megmaradnak a térképek és a saját tokenek. Ne töröld a webhelyadatokat. A korábbi térképmentések betölthetők. Új tárhely vagy előfizetés nem kell.

## Halmozható jelölők

Kattints vagy koppints a tokenre, majd a **keresztezett kardok** gombra. A token harci adatlapján 17 külön ikonnal jelzett állapot van. A **+** hozzáad egyet, a **−** elvesz egyet; egy típusból legfeljebb 99 halmozható. Többféle állapot egyszerre is szerepelhet.

A térképen három külön jelölő látszik, darabszámmal. Többféle állapotnál a `+N` mutatja a további típusok számát; a teljes lista a token adatlapján olvasható. A jelölők nagyításkor is olvasható méretűek maradnak. Módosítani a token tulajdonosa vagy a DM tudja őket.

Ezek kézi emlékeztetők: például a Láthatatlan jelölő önmagában nem rejti el a tokent. A DM meglévő elrejtés gombja továbbra is külön működik.

## Harckövető és kezdeményezés

A token harci adatlapján add meg a **kezdeményezést**. Az üres mező kihagyja a figurát a harcból; a 0 érvényes érték. A magasabb érték előbb következik. Azonos értéknél a térkép tokenjeinek meglévő sorrendje dönt; a DM eltérő érték megadásával rendezheti át őket.

A **További eszközök → Harckövető** mutatja a sorrendet. A DM indítja a harcot, lépteti a következő figurát, és fejezi be a harcot. Az aktuális token arany keretet kap. Teljes sorrend után a körszám növekszik. A sorrend sorára koppintva is megnyitható a token adatlapja.

A rejtett token neve, kezdeményezése és helye nem kerül át a játékoshoz. Ha éppen rejtett figura következik, a játékos „A DM köre” feliratot lát. Látható, DM által kezelt és csapattagnak nem jelölt ellenfélnél a játékos a sorrendet látja, a kezdeményezés számértékét és a részletes mozgáskeretet nem. A közös karaktereket jelöld **Csapattag**-nak a token szerkesztésénél, ha ezeket az adatokat mindenki láthatja.

## Mozgáskeret

Tokenenként beállítható a körönkénti keret, alapból **30 láb**. A költség levonása akkor működik, ha a harc elindult és a token szerepel a kezdeményezési sorrendben. Előkészítéskor szabadon rendezhetők a figurák.

- 30 lábból 25 elköltése után 5 marad.
- Az ugyanabban a körben következő mozgatás ebből az 5-ből költ.
- A figura következő saját körének kezdetén a teljes beállított keret visszatöltődik.
- A mozgás túllépheti a keretet. A vonal és a visszajelzés ilyenkor piros lesz; a rendszer engedi a lehelyezést. A maradék 0-n áll meg, az adatlap külön mutatja a túlköltést.
- A mozgatás visszavonása visszaadja annak költségét is. Saját kör kezdetén és kézi visszatöltéskor a token régi mozgás-visszavonásai törlődnek, így nem írhatják át az új kör keretét.

Mindenki továbbra is mozgathat minden látható tokent, akár annak körén kívül is. A költség mindig a mozgatott figura saját keretéből fogy. A DM vagy tulajdonos az adatlapon kézzel is visszatöltheti a keretet. Dash esetén a keret kézzel növelhető; automatikus akciókezelés nincs.

A vonalon a geometriai távolság mellett a tényleges **költség** is szerepel, és nyilvános keretű figuránál a maradék is. A jelzés továbbra is 3 másodperc után eltűnik.

## Nehéz terep festése

DM-ként: **További eszközök → Nehéz terep → Festés**. Egy ujjal vagy egérrel húzva jelöld ki a mezőket. A ferdén sávozott, borostyánszínű mezők közösek, mindenki látja őket. A **Radír** ugyanígy eltávolítja őket; az **Összes törlése** üríti a térkép terepjelölését. A **Kész** visszavált a tokenmozgatásra. Két ujjal továbbra is nagyíthatsz; a második ujj megszakítja az aktuális festési húzást.

Normál mezőre lépés 5 láb, nehéz terepre lépés **10 láb** költségű. Így 10 lábnyi út végig nehéz terepen 20 lábat használ el. Többször ráfestett mező nem drágul tovább. A kiinduló mezőre nem számolunk belépési költséget. Nagy tokennél a teljes célmezőbeli területét figyeljük: ha bármelyik elfoglalt mező nehéz, az adott lépés egyszer kap dupla költséget.

A számítás négyzetrácson, a két hely közötti közvetlen mezősoron történik. Átlós lépés is egy mező. Nincs falak körüli útkeresés; kerülőnél több részletben mozgasd a figurát. Rácshoz igazítás nélkül is az elfoglalt mezők változása alapján számolunk. A terepfestés a rácshoz tartozik: a rács eltolása és méretezése együtt mozgatja a jelölést.

## Varázsterületek

**További eszközök → Varázsterületek → Új terület**. Választhatsz kört, kúpot vagy vonalat. Megadható a szín, a sugár/hossz, a forgatás, vonalnál a szélesség, kúpnál a nyílásszög. A 0° jobbra, a 90° lefelé mutat. A kúp alap nyílásszöge 60°, a csapat szabályaihoz állítható.

Elhelyezés után koppints a térképre: körnél ez a középpont, kúpnál és vonalnál a kezdőpont. A pont mezőközépre igazodik. A területek a tokenek alatt, áttetszően látszanak. A területlistában szerkeszthetők, törölhetők, vagy **Áthelyezés** után új helyre tehetők. A saját területeit mindenki kezelheti, a DM mindegyiket.

A varázsterület vizuális sablon: nem oszt ki sebzést, és nem teszi automatikusan nehézzé a terepet. Ha ilyen hatás kell, a DM fesse be a megfelelő mezőket is.

A jelölők, a harc állapota, az elköltött mozgás, a nehéz terep és a varázsterületek az automatikus térképmentésbe és a letölthető mentésbe is bekerülnek.

A mozgás és a nehéz terep alapjához: [D&D Free Rules – Playing the Game](https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game). A sablonok és jelölők a csapat által kézzel kezelt segédeszközök.
