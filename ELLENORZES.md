# A 0.2-es változat ellenőrzése

2026. október 25.

## Automatikus ellenőrzés

Mind a **18 teszt sikeres**. A nyolc JavaScript-modul szintaktikai ellenőrzése is sikeres. Az SVG-k XML-ellenőrzése sikeres; 23 külön tokenportré és 3 korábbi SVG-elem van a csomagban.

A tesztek lefedik:

- Minden látható token mozgatható játékosként, de rejtett token nem módosítható.
- Más tokenjének szerkesztése, törlése és a DM-műveletek továbbra sem engedélyezettek játékosként.
- A token tulajdonosát és rejtettségét nem lehet meghamisítani létrehozáskor vagy szerkesztéskor.
- A játékosoknak küldött állapotból kimaradnak a rejtett tokenek, a rejtett loot, a mozgástörténet, a DM-kulcsok és a titkos dobások.
- A titkos DM-dobás a helyi mentést hívja, a közös állapotfrissítést nem. Játékos nem kérhet titkos DM-dobást.
- Kockaszámok, módosítók, összegzés és hibás dobásösszeállítások elutasítása.
- Egymást követő visszavonások; a rejtett tokenek mozgásának kihagyása játékosoldalon.
- A visszavonás átméretezés után is a térképen belül tartja a figurát.
- Csapat átvitele, azonosító és tulajdonos megtartása, rejtettség és relatív méret megőrzése, duplikáció elkerülése.
- A célhelyszín elavult csapatmozgás-történetének törlése utazáskor.
- Négyzetrácsos távolságmérés lábban, átlós és több szakaszból megadott tesztútvonalon.
- Korábbi térképformátumok alapértékei, tokentárképek ellenőrzése és a 23 elemes kezdőcsomag.
- Koordináták, rácsigazítás, importált képek és szobakódok ellenőrzése.

## Böngészőben kipróbált működés

Valódi PeerJS Cloud szolgáltatással és két, egymáshoz WebRTC-n kapcsolódó böngészőlappal:

- Korábbi, 0.1-es helyi térképtár betöltése adatvesztés nélkül.
- Szobanyitás, beceneves belépés és a rejtett ellenfél kihagyása a játékosnézetből.
- DM-tulajdonú figura mozgatása játékosként, szinkronizálás és visszavonás.
- Négy D6 hozzáadása: 4d6. Egy D6 elvétele: 3d6.
- Közös dobás azonos eredménnyel a játékos és a DM előzményeiben.
- Titkos D20-dobás csak a DM-nél. Játékosoldalon nem jelent meg titkos előzmény.
- A titkos dobás megőrzése a DM oldalának újratöltése után.
- Zsákmánylista privát mentése, majd felfedése a játékosnak.
- Jelenetváltás azonos szobakóddal, megmaradó kapcsolattal és a csapattoken átvitelével.
- Játékos kijelölésének lezárása jelenetváltás után.
- Saját token mentése a tokentárba, új példány lehelyezése és megőrzés új oldalbetöltés után.
- Tokentár letöltése és a letöltött fájl visszaimportálása.
- Új, 0.2-es mentés betöltése beépített portrékkal és VIP-figurával.
- 20 láb / 4 mező mérés, valamint névvel jelzett ping mindkét résztvevőnél.
- Magyar és angol eszközpanelek.
- 390×844-es álló és 844×390-es fekvő telefonos nézet, vízszintes oldal-túlcsordulás nélkül; 1024×768-as tabletes előnézet.
- A megvizsgált DM- és játékoslap naplójában nem jelent meg alkalmazáshiba.

## Az ellenőrzés határai

A kapcsolódó böngészőlapok ugyanazon tesztkörnyezetben futottak. Fizikai Android-készülék, eltérő internetkapcsolatok, valódi kétujjas érintés, hosszú képernyőzár utáni visszatérés és 5–10 játékos egyidejű terhelése nem lett kipróbálva. A mobilos ellenőrzés böngészős képernyőméretekkel történt.

A GitHubon futó oldal nem lett frissítve. A fájlcsere menetét a FRISSITES-v0.2.md írja le. Az ingyenes PeerJS rendelkezésre állása és a TURN nélküli kapcsolat a résztvevők hálózatától is függ.
