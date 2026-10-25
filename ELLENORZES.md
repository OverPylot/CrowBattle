# A 0.3-as változat ellenőrzése

2026. október 25.

## Automatikus ellenőrzés

Mind a **24 teszt sikeres**. Mind a 10 JavaScript-modul szintaktikai ellenőrzése is sikeres. Az SVG-assetek és a hét külön kockaikon XML-ellenőrzése sikeres.

A korábbi 18 teszt továbbra is lefedi a tokenjogosultságokat, a rejtett tokeneket és lootot, a titkos DM-dobások elkülönítését, a dobásösszeállításokat, a visszavonást, a csapat átvitelét, a mentéskompatibilitást, a képek/koordináták ellenőrzését és a szobakódokat.

Az új hat teszt ellenőrzi:

- Mezőközépre igazítás eltolással rendelkező rácson, a térkép szélein is.
- A közös mérés távolságának kiszámítását a DM-nél; hamisított távolságérték nem használható.
- Nagyobb token mozgási vonalának mezőközépre igazított horgonyát.
- Rejtett token mérésének elutasítását játékosként, és a rejtett DM-mozgás továbbításának tiltását.
- Más résztvevő mérésének törlési kísérletét.
- Látható token elrejtésekor a közös vonal törlését, új pozíció továbbítása nélkül.

## Böngészős próba

Valódi PeerJS Cloud szolgáltatással, két WebRTC-kapcsolatban álló böngészőlappal:

- Szobanyitás a 0.3-as protokollal, játékos csatlakozása.
- A hét eltérő kockaforma megjelenítése és a D20-as főikon.
- Közös dobás a telefonon átrendezett Dobás gombbal.
- Játékos által indított mérés mindkét résztvevőnél azonos, vonalon megjelenő felirattal: „Mira · 20 láb · 4 mező”.
- A tényleges SVG-végpontok mezőközépre esnek: 352,288 és 608,288 a 64 pixeles rácson.
- A vonal, a felirat és a saját mérés visszajelzője automatikusan eltűnik.
- Látható token mozgatásánál mindkét résztvevőnél azonos felirat: „Mira · 10 láb · 2 mező”. A végleges vonal az elfogadott mozgást mutatja.
- Rejtett ellenfél mozgatása csak a DM-nél rajzol vonalat; játékosnál nulla mozgásjelzés és nulla rejtett ellenfél látható.
- DM és játékos egymás mellett megjelenő, külön mérései mindkét oldalon látszanak.
- 390×844-es álló és 844×390-es fekvő telefonos nézet, vízszintes oldal-túlcsordulás nélkül. Álló nézetben a Dobás gomb külön görgetés nélkül is elérhető.
- 1024×768-as tabletes kockapanel-előnézet.
- A DM és a játékos böngészőnaplójában nem jelent meg alkalmazáshiba.

## Az ellenőrzés határai

A két böngészőlap ugyanazon tesztkörnyezetben futott. Fizikai Android-készülék, valódi kétujjas érintés, eltérő internetkapcsolatok, hosszú képernyőzár utáni visszatérés és 5–10 játékos egyidejű terhelése nem lett kipróbálva. A mobilos ellenőrzés böngészős képernyőméretekkel történt.

A GitHubon futó oldal nem lett frissítve. A fájlcsere menetét a FRISSITES-v0.3.md írja le. Az ingyenes PeerJS elérhetősége és a TURN nélküli kapcsolódás a résztvevők hálózatától is függ.
