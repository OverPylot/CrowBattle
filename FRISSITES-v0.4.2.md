# Frissítés 0.4.2-re – zoom és méretkorlátok

## Feltöltés

1. Tölts le biztonsági mentést a saját térképeidről.
2. Csomagold ki a `kalandasztal-v0.4.2.zip` fájlt, és töltsd fel a teljes tartalmát a meglévő GitHub-repó régi fájljai helyére. Az új `view.js` is kell; az `assets/` mappa frissítése is fontos.
3. A GitHub Pages frissülése után minden résztvevő töltse újra az oldalt; a DM indítsa újra a szobát. Asztali böngészőben használhatsz Ctrl+Shift+R-t. A webhelyadatokat ne töröld.

A térképtár, a tokenek és a harci adatok megmaradnak. A rövid mozgásfelirat továbbra is elköltött / teljes keretet mutat, például `25/30 ft`.

## Mérethatárok

A korlátok képernyőpixelekre vonatkoznak. A térkép nagyítása vagy kicsinyítése nem lépheti át őket.

| Térképi elem | Minimum | Maximum |
|---|---:|---:|
| Tokennév betűmérete | 10 px | 13 px |
| Token alatti mozgás betűmérete | 9 px | 12 px |
| Mozgási és mérési vonal feliratának betűmérete | 10 px | 12 px |
| Kép nélküli token kezdőbetűi | 12 px | 32 px |
| Állapotikon szélessége/magassága | 12 px | 18 px |
| Állapot darabszámának betűmérete | 8 px | 10 px |
| Rejtettségi ikon szélessége/magassága | 14 px | 20 px |

A név legfeljebb 170 px széles, utána három ponttal rövidül. A mozgási címke szélessége legfeljebb 180 px, a vonalzósé legfeljebb 320 px. A ping neve továbbra is 11 px, a rácsigazító jel 24 px; a kezelőfelület elemei külön, a térkép zoomjától függetlenül jelennek meg.

Kicsi tokennél továbbra is kevesebb állapotikon és `+N` jelzés látszik. A teljes lista a token harci adatlapján elérhető.

## Terhelést csökkentő javítások

- A rács, a nehéz terep, a varázsterületek és a mérés SVG-rajzfelülete a látható ablak méretén marad. A kamera azt változtatja, a térkép mely részét mutatják; nem növeli ezeket több tízezer pixel széles rajzfelületté.
- A mintatérképekről eltávolítottam a teljes felületet érintő procedurális zajszűrőt. A kripta és az erdő elrendezése megmarad, a papírszemcsézettség egyszerűbb lett. A mintatérképek megjelenítése új verziózott címet használ, így a régi szűrős kép gyorsítótárból sem kerül vissza a játékasztalra.
- Megszűnt a mérési címke SVG-szűrős árnyéka és a teljes térképre kényszerített grafikus réteg.
- A gyors görgetés, csippentés és térképhúzás kamera-frissítése képkockánként összevonódik. Puszta térképhúzáskor az állapotikonok és a mérési szövegek nem épülnek újra.
- A térkép zoomhatára továbbra is 4–600%. Hibás vagy nem véges nagyítási érték nem kerülhet a rajzolásba.

A szűrőterhelés lehetséges szerepét a kód alapján azonosítottam; az eredeti, felhasználónál tapasztalt lapösszeomlás pontos oka nem lett bizonyítva. Az SVG-zajszűrő a szűrt felület egészén állít elő textúrát: [MDN – feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence).

## Ellenőrzés

- 35 automatizált teszt sikeres. A mérethatárok vizsgálata 8–4096 pixeles tokeneket, 4–600%-os zoomot és hibás számértékeket is lefed.
- 10 000 kamera-frissítési kérés egyetlen függő képkockára vonódik össze a tesztben.
- 4096×4096-os próbatérképen két teljes 4–600%-os zoomciklus, összesen 120 nagyítógomb-művelet futott összeomlás vagy konzolhiba nélkül.
- 600%-on a rajzrétegek 1280×656 px méretűek maradtak, az ikon 18 px, a név betűmérete 13 px, a mérési feliraté 12 px volt.
- Maximális zoomnál a térképhúzás, a vonalzó és a tokenmozgatás is működött; a mozgásfelirat `5/30 ft` volt.
- 390×844-es mobilnézetben, 600%-os zoomnál a rajzréteg 390×786 px maradt. 4%-on a név 10 px, az ikon kb. 12 px volt; nem volt vízszintes oldal-túlcsordulás.

A böngészős próba az alkalmazáson belüli tesztböngészőben történt. Az eredeti 0.4.1-es összeomlás ebben a környezetben nem jelentkezett; külön Firefoxon és fizikai Android-eszközön nem történt ellenőrzés. A javítás célja a szélsőséges zoom erőforrásigényének csökkentése és a méretek korlátozása.
