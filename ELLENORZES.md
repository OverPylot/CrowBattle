# A 0.4.1-es javítás ellenőrzése

2026. október 25. Mind a 31 teszt sikeres; a 13 JavaScript-modul szintaktikai ellenőrzése sikeres.

- 29%-os asztali térképnagyításon az állapotikon mért szélessége 12,35 képpont, a korábbi 27 helyett. Kicsi tokennél egy ikon és `+N` látszik; nagyításkor további ikonok jelennek meg.
- 25 láb elköltése után a vonalon pontosan `25/30 ft` jelent meg, egy 57,2 × 20 képpontos címkében. A második, alsó mozgásdoboz rejtve maradt.
- Két élő WebRTC-böngészőlapon azonos `30/30 ft`, majd piros `35/30 ft` felirat jelent meg. A token alatti számpár is az elköltött keretet mutatta.
- 390×844-es telefonos nézetben 28%-os illesztésnél is kb. 12 pixeles ikonok látszanak; nincs vízszintes oldal-túlcsordulás.
- A módosított teszt ellenőrzi a körön belüli összegzett költség és keret számértékeit, valamint az ellenfél privát számainak kiszűrését a közös mérési eseményekből.
- A játékos böngészőnaplójában nem volt alkalmazáshiba. Fizikai Android-készülékes próba nem történt.

A 0.4-es funkciók korábbi ellenőrzése:

# A 0.4-es változat ellenőrzése

2026. október 25.

## Automatikus ellenőrzés

**31 teszt sikeres.** Mind a 13 JavaScript-modul szintaktikai ellenőrzése sikeres. A 17 állapotikon SVG/XML-ellenőrzése sikeres.

A korábbi tesztek lefedik a tokenjogosultságokat, a rejtett tokeneket és lootot, a titkos DM-dobásokat, a dobásösszeállításokat, a visszavonást, a csapat átvitelét, a mentéskompatibilitást, a képek/koordináták ellenőrzését, a szobakódokat és a közös mérési vonalakat.

Az új ellenőrzések:

- A 30-as mozgáskeretből 25 költése után 5 marad; további 10 megengedett, de túllépésnek számít. A visszavonás visszaadja a költséget.
- Következő saját körkor visszatöltés és körszámnövelés; az új kör keretét régi visszavonás nem módosíthatja.
- Dupla költség nehéz terepen; az átfedések nem többszöröznek. Átlós lépés, eltolt rács és többmezős token lábnyoma is szerepel a próbában.
- Előkészítéskor nincs mozgáslevonás. Csak a DM léptethet harcot és festhet terepet.
- Saját kezdeményezés és jelölők szerkesztése, azonos jelölő halmozása és visszavétele; más token módosításának tiltása.
- Rejtett ellenfelek, valamint a látható ellenfelek privát kezdeményezés- és keretszámainak kiszűrése. Közös mozgásvonal sem továbbítja a privát maradékot és túlköltés összegét.
- Varázsterületek tulajdonjoga, méretkorlátai és mentésből visszaállítása; a jelölők és a harc állapota is megmarad.

## Böngészős próba

Valódi PeerJS Cloud szolgáltatással, két WebRTC-kapcsolatban álló böngészőlappal:

- Szobaindítás a 0.4-es protokollal és játékos csatlakozása.
- Jelölő kétszeri hozzáadása, külön második jelölő és darabszámos térképi megjelenítés.
- Kezdeményezés 20 és 10 értékkel; helyes sorrend és aktuális kör. A figura két mozgatása között megmaradó keret, majd saját körkor 30-ra visszatöltés.
- Terep ráfestése és egy mező radírozása a térképen. Normál területen 25 lábas út után 5 marad. Nehéz mezőre lépve a vonal „5 láb”, „Költség: 10” és „Túllépés” feliratot kap, piros színnel. A mozgás megtörténik.
- Játékos mozgat DM által létrehozott látható csapattagot; mindkét oldalon ugyanaz a 15/30 maradék jelenik meg.
- Terep és varázsterület mindkét nézetben látszik. A rejtett Őrző kimarad a játékos térképéről. A DM kezelt, csapattagnak nem jelölt figura számai a játékosnál hiányoznak.
- Kör, kúp és vonal elhelyezése; a játékos is létrehoz saját kúpot. A vonalsablon forgatásának mentése és áthelyezése; szín, méret és forgatás kezelése; a beviteli mezők alakzathoz igazodnak.
- Játékos saját új Bárd tokenjéhez kezdeményezést és Lángoló jelölőt ad; a közös sorrend 20, 15, 10.
- Újratöltés után megmarad a terep, a három sablon, a halmozott jelölő, a kezdeményezés, a 2. kör és az elköltött keret.
- Magyar és angol felület; 390×844 álló és 844×390 fekvő telefonos méret, valamint 1024×768 tabletes nézet. Fekvő nézetben nincs vízszintes oldal-túlcsordulás.
- A DM és játékos böngészőnaplójában nincs alkalmazáshiba.

## Az ellenőrzés határai

A két böngészőlap ugyanazon tesztkörnyezetben futott. Fizikai Android-készülék, valódi kétujjas érintés, eltérő internetkapcsolatok, hosszú képernyőzár utáni visszatérés és 5–10 játékos egyidejű terhelése nem lett kipróbálva. A mobilos ellenőrzés böngészős képernyőméretekkel történt.

A mozgás közvetlen rácsútvonallal számol; nem keres utat falak körül. A jelölők és varázssablonok nem automatizálnak varázs- vagy állapotszabályokat.

A GitHubon futó oldal nem lett frissítve. A fájlcsere menetét a FRISSITES-v0.4.md írja le. Az ingyenes PeerJS elérhetősége és a TURN nélküli kapcsolódás a résztvevők hálózatától is függ.
