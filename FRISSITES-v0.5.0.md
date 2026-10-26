# CrowBattle 0.5.0 – kényelmesebb játékasztal

Az oldal neve mostantól **CrowBattle**. A hat korábban kiválasztott kényelmi funkció bekerült ebbe a változatba.

## Frissítés a meglévő GitHub-oldalon

1. A régi oldalon tölts le mentést a saját térképeidről és tokentáradról.
2. Csomagold ki a `crowbattle-v0.5.0.zip` fájlt. A teljes tartalmát töltsd fel a meglévő repó fájljai helyére; az `index.html` továbbra is a repó gyökerében legyen. Az új `comfort.js`, `vendor/qrcode.js` és a hozzá tartozó licenc is kell.
3. A Pages frissülése után mindenki töltse újra az oldalt, asztali böngészőn szükség esetén Ctrl+Shift+R-rel. A DM indítsa újra a szobát. A webhelyadatokat ne töröld.

**A repót és a webcímet nem kell átnevezned.** Az alkalmazás neve attól függetlenül CrowBattle lesz. A meglévő adatbázisok és beállításkulcsok megmaradtak; ugyanazon a címen és böngészőben tovább használhatók a mentéseid. Az új export `.crowbattle.json` fájl, de a régi `.kalandasztal.json` térképek és a korábbi tokentár-exportok is betölthetők. A korábbi változatok az új exportformátumot nem feltétlenül tudják olvasni.

## A hat funkció használata

- **Peremgörgetés:** kezdj el húzni egy tokent, és vidd a képernyő széle felé. A térkép fokozatosan továbbgördül. A figura a fogási pontnál marad; felengedéskor a ténylegesen elért helyre kerül. A mozgatás megszakítása, kétujjas nagyításra váltás és az ablak elhagyása megállítja a görgetést.
- **Feliratok ki/be:** a jobb felső **T** gomb a tokenneveket, a mozgásszámokat és a mérővonal szövegeit rejti el vagy hozza vissza. A vonalak, állapotikonok és a mozgató neve megmaradnak. Ez helyi nézetbeállítás; nem változtatja meg más játékos képernyőjét, és újratöltés után megmarad.
- **Teljes képernyő:** a T melletti sarokikon vált oda és vissza. Asztali böngészőn az Esc is kiléptet. A böngésző támogatásának hiányában a gomb inaktív. A teljes dokumentum kap teljes képernyőt, így a felugró eszközök és ablakok sem maradnak azon kívül.
- **Könnyebb telefonos kijelölés:** a kis tokenek érintési célja legalább 44×44 képernyőpixel. A figura rajza a korábbi méretén marad. Közeli tokeneknél a tényleges találat elsőbbséget kap; a kibővített területek közül a közelebbi középpont dönt. A kéz eszköz továbbra is a térképet mozgatja.
- **Ki mozgatja?**: húzás közben rövid névjelzés jelenik meg a tokenen, a többi résztvevőnél is. Ez nem zárolás: továbbra is minden látható tokent mozgathat bárki. Felengedéskor eltűnik; megszakadt kapcsolatnál a jelzés legfeljebb kb. 4–5 másodperc alatt elévül. A DM rejtett tokenjének mozgatójelzése helyi marad.
- **QR-kódos csatlakozás:** indíts szobát, és mutasd meg a szobaablak QR-kódját. A játékos a telefon kamerájával olvassa be, megadja becenevét, majd csatlakozik. A kód a játékoslinket tartalmazza, DM-kulcs nélkül. Az éles HTTPS-oldal kódját használd; a `localhost` cím másik telefonról nem érhető el.

A QR-kód helyben, a csomagban található MIT-licencű [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) segítségével készül. Nem szükséges hozzá új fiók, API-kulcs vagy fizetős szolgáltatás.

A terjedő tűz, méregfelhő és más terjedő környezeti veszély nincs ebben a kiadásban.

## Ellenőrzés

A részletes eredmények és a böngészős ellenőrzés határai az [ELLENORZES.md](ELLENORZES.md) elején olvashatók. Fizikai Android-telefonon és Firefoxon külön próba még szükséges.
