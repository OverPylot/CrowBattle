# Frissítés 0.4.1-re – kisebb térképi jelzések

1. Csomagold ki a `kalandasztal-v0.4.1.zip` fájlt.
2. A meglévő GitHub-repóban töltsd fel a teljes tartalmát a régi fájlok helyére, ugyanúgy, mint korábban. Az `index.html` maradjon a gyökérben.
3. A Pages frissülése után mindenki frissítse az oldalt; a DM indítsa újra a szobát. Ha régi kinézet marad, használj teljes újratöltést (asztali böngészőben Ctrl+Shift+R). Ne töröld a böngésző webhelyadatait.

A helyben mentett térképek, tokenek és harci beállítások megmaradnak.

## Mi változott?

- Mozgatáskor a vonalon csak egy kis, egysoros címke látszik: például **25/30 ft**. Ez az ebben a körben elköltött mozgás / teljes keret; a példában 5 láb marad. Több mozgatás költségét összeadjuk, a nehéz terepet is beleszámítva.
- A token alatti kis számpár is az elköltött / teljes keretet jelenti. A harckövető külön továbbra is kiírja a maradékot.
- Túllépéskor például **35/30 ft** jelenik meg pirosan. A mozgás megengedett.
- A mozgatáskor alul megjelenő második nagy doboz eltűnt. A vonal és a címke 3 másodperc után továbbra is eltűnik.
- Az ellenfél privát keretszámai a játékosnál továbbra sem látszanak: ott a rövid felirat csak az adott mozgás költségét mutatja, pl. **10 ft**.
- A térképi állapotikonok kisebbek. Normál méretük 19 képpont a korábbi 27 helyett, kicsinyítéskor kb. 12 képpontig csökkennek. Kicsi tokennél egy ikon és `+N`, közepesnél kettő és `+N`, nagyobbnál legfeljebb három ikon látszik. Nagyításkor maguktól előkerülnek a további ikonok.
- A teljes állapotlista és a halmozott darabszám továbbra is elérhető a token harci adatlapján. Az adatlap érintőgombjai nem lettek kisebbek.

Előkészítéskor, amikor nem fut harc, a mozgásjelzés az adott húzás költségét mutatja a token beállított keretéhez képest; nem gyűjt körönkénti költséget. A vonalzó külön távolságmérése megtartja a nevet, a lábat és a mezőszámot.

A korábbi funkciók: [FRISSITES-v0.4.md](FRISSITES-v0.4.md).
