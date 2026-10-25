// Original, code-native vector portraits. Subclass labels follow the 2024 Free Rules.
const heroes=[
['barbarian','Barbár','Barbarian','Path of the Berserker','#a56544'],
['bard','Bárd','Bard','College of Lore','#927248'],
['cleric','Pap','Cleric','Life Domain','#c1a55e'],
['druid','Druida','Druid','Circle of the Land','#71814f'],
['fighter','Harcos','Fighter','Champion','#6c8290'],
['monk','Szerzetes','Monk','Warrior of the Open Hand','#b58455'],
['paladin','Lovag','Paladin','Oath of Devotion','#bca778'],
['ranger','Vándor','Ranger','Hunter','#517e60'],
['rogue','Zsivány','Rogue','Thief','#626c7d'],
['sorcerer','Varázsló','Sorcerer','Draconic Sorcery','#a16066'],
['warlock','Boszorkánymester','Warlock','Fiend Patron','#866280'],
['wizard','Mágus','Wizard','Evoker','#526f9b'],
];
const others=[
['goblin','Goblin','Goblin','enemies','#708255'],['orc','Ork','Orc','enemies','#617964'],['skeleton','Csontváz','Skeleton','enemies','#9c967d'],['bandit','Útonálló','Bandit','enemies','#936749'],['cultist','Kultista','Cultist','enemies','#7a5270'],['wolf','Farkas','Wolf','enemies','#738086'],
['merchant','Kereskedő','Merchant','civilians','#9d824c'],['smith','Kovács','Blacksmith','civilians','#96745b'],['innkeeper','Fogadós','Innkeeper','civilians','#b47e61'],['villager','Falusi','Villager','civilians','#889064'],['vip','Fontos NPC','Important NPC','vip','#c4a04e']
];
export const BUILTIN_TOKENS=[...heroes.map(([id,hu,en,subclass,color])=>({id:'builtin-'+id,hu,en,subclass,color,group:'heroes',image:`./assets/tokens/${id}.svg`,wUnits:1,hUnits:1,party:true})),...others.map(([id,hu,en,group,color])=>({id:'builtin-'+id,hu,en,color,group,image:`./assets/tokens/${id}.svg`,wUnits:1,hUnits:1,party:false}))];
export const TOKEN_ASSETS=new Set(BUILTIN_TOKENS.map(t=>t.image));
