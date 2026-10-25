# Az első változat ellenőrzése

2026. október 25.

## Sikeresen ellenőrzött működés

- Nyolc automatikus teszt: rejtett tokenek és DM-kulcsok kiszűrése, tokenjogosultságok, hamisított tulajdonos és láthatóság elutasítása, rácsigazítás, hibás képek/koordináták elutasítása, szobakódok.
- JavaScript szintaktikai ellenőrzés az alkalmazás és a kapcsolódási modul fájljain.
- Valódi szobanyitás a nyilvános PeerJS Cloud szolgáltatással.
- Két külön böngészőlap között valódi WebRTC-csatlakozás és térképbetöltés.
- Játékos által létrehozott 2×2 token megjelenése a DM-nél.
- Játékos tokenmozgatásának szinkronizálása és rácshoz igazítása.
- Szabad, 1,5×2,5 mezős tokenméret szinkronizálása.
- Token elrejtése: eltűnik a játékosnézetből; visszahozáskor újra megjelenik.
- Saját PNG-térkép feltöltése és feldolgozása.
- Rácsméret és eltolás megőrzése oldalfrissítés után.
- Mentés letöltése és a letöltött fájl visszaimportálása.
- Magyar és angol kezelőfelület.
- 390×844 és 844×390 képpontos telefonos nézetek, vízszintes oldal-túlcsordulás nélkül; 1024×768 képpontos tabletes előnézet.
- A megvizsgált böngészőlapok naplójában nem jelent meg alkalmazáshiba.

## Az ellenőrzés határai

A két böngészőlap ugyanazon tesztkörnyezetben futott. Külön fizikai Android-készülék, eltérő internetkapcsolatok, valódi kétujjas érintés, hosszú képernyőzár utáni visszatérés és 5–10 játékos egyidejű terhelése nem lett kipróbálva. A mobilos ellenőrzés böngészős képernyőméretekkel történt.

A GitHub Pages-re közzététel még nem történt meg. A csomag ehhez elő van készítve, a lépéseket az INDULAS.md tartalmazza. Az ingyenes PeerJS rendelkezésre állása és a TURN nélküli működés a résztvevők hálózatától is függ.
