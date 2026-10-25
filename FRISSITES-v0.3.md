# Frissítés 0.3-ra

A korábbi funkciókat ez a változat megtartja; a kockák megjelenése és a közös mérés változott.

## Feltöltés

1. Csomagold ki a `kalandasztal-v0.3.zip` fájlt.
2. A meglévő GitHub-repóban az **Add file → Upload files** alatt töltsd fel a csomag teljes tartalmát a régi fájlok helyére. Az új `dice-icons.js` és `measurement.js` is szükséges. Az `index.html` maradjon a gyökérben.
3. Mentsd a változtatást, és várd meg a Pages-közzétételt.
4. Minden résztvevő frissítse az oldalt, majd a DM indítsa újra a szobát. A 0.2-es és 0.3-as szobák külön protokollt használnak.

Ugyanazon a webcímen és böngészőben megmarad a korábbi térképtár és saját tokentár. A frissítéshez ne töröld a böngésző webhelyadatait. A korábbi mentések is betölthetők. Biztonsági mentést továbbra is letölthetsz.

## Új kockaikonok

- D4: háromszög alapú forma.
- D6: kocka, pöttyözött lapokkal.
- D8: rombusz alakú, háromszöglapokkal.
- D10: külön tízoldalú kockaikon.
- D12: ötszögletű lapokkal jelölt forma.
- D20: háromszöglapokra osztott ikon.
- D100: két százalékkocka, 00/0 jelöléssel.

Az oldal fő ikonja, a kockaeszköz ikonja és a böngészőfül ikonja is D20 lett. A kattintásos összeállítás, a mínusz, a módosító és a közös/titkos dobás ugyanúgy használható. Telefonon a módosító és a Dobás gomb egy sorba került.

## Közös mérés és mozgásjelzés

A vonalzóval egy mezőből a másikba húzva mérhetsz. A kezdő- és végpont a mezők **közepére** igazodik. A mérés a beállított rácsméretet és eltolást használja akkor is, ha a rácsvonalak éppen ki vannak kapcsolva.

A vonal mellett, közvetlenül a térképen jelenik meg a résztvevő neve, a távolság lábban és a mezők száma. Például:

```text
Mira · 20 láb · 4 mező
```

Ezt a szoba minden csatlakozott résztvevője látja. A jelzés felengedés után **3 másodperccel automatikusan eltűnik**. A bezárógombbal a saját mérésedet előbb is eltüntetheted. Több résztvevő mérései egymás mellett is megjelenhetnek.

A látható token mozgatásánál ugyanilyen közös vonal mutatja a kiinduló mező és az új hely közötti távolságot. A végleges vonal az elfogadott, rácshoz igazított mozgást mutatja, és szintén 3 másodperc után törlődik. Nagyobb, több mezőt elfoglaló tokennél a bal felső elfoglalt mező közepe a vonal horgonya.

A mérés négyzetrácsos: egy mező, átlósan is, 5 láb. Továbbra is a közvetlen utat jelzi; falakat vagy kerülőutakat nem számol automatikusan.

## Rejtett figurák

A rejtett token mozgási vonala kizárólag a DM-nél jelenik meg. A játékos nem kapja meg sem a rejtett figurát, sem a mozgatásának végpontjait. Ha egy korábban látható tokent a DM elrejt vagy töröl, a hozzá tartozó közös mozgásjelzés is eltűnik.

A jelzések átmenetiek: nem részei a térképmentésnek vagy a dobáselőzménynek. Frissítés nélkül félbemaradt aktív jelzés 10 másodperc után törlődik; jelenetváltás minden régi jelzést lezár. A korábbi titkos DM-dobások működése megmaradt.

Az összes korábbi funkció leírása: [FRISSITES-v0.2.md](FRISSITES-v0.2.md). Ellenőrzés és korlátai: [ELLENORZES.md](ELLENORZES.md).
