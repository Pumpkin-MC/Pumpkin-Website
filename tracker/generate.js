// Seeds tracker/data.json from a Pumpkin checkout: blocks, items and commands are read from the
// source tree, entities come from the audit table below. data.json is the file the site reads and
// the one to edit for quick fixes; rerun this only for a full re-audit and merge by hand.
// Usage: node tracker/generate.js <pumpkin-checkout> tracker/data.json


const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const [, , PUMPKIN, OUT] = process.argv;
if (!PUMPKIN || !OUT) {
  console.error("usage: node gen-data.js <pumpkin-checkout> <output>");
  process.exit(1);
}

const SRC = path.join(PUMPKIN, "crates/pumpkin/src");
const commit = execSync("git rev-parse --short HEAD", { cwd: PUMPKIN }).toString().trim();
const commitDate = execSync("git log -1 --format=%cs", { cwd: PUMPKIN }).toString().trim();
const cargo = fs.readFileSync(path.join(PUMPKIN, "Cargo.toml"), "utf8");
const mcVersion = (cargo.match(/^version = "[^+"]*\+([0-9.]+)/m) || [])[1] || "";

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".rs")) out.push(p);
  }
  return out;
}

function rel(p) {
  return path.relative(PUMPKIN, p).replace(/\\/g, "/");
}

function humanize(s) {
  return s
    .split("_")
    .map((w) => (w === "tnt" ? "TNT" : w === "of" ? "of" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function item(text) {
  return { text: text.slice(1), done: text[0] === "+" };
}

function todoCount(file) {
  const txt = fs.readFileSync(file, "utf8");
  return (txt.match(/\b(TODO|FIXME|unimplemented!)/g) || []).length;
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

const entityFiles = walk(path.join(SRC, "entity"));
function entitySource(id) {
  const overrides = {
    skeleton: "entity/mob/skeleton/skeleton.rs",
    wither_skeleton: "entity/mob/skeleton/wither.rs",
    zombie: "entity/mob/zombie/zombie.rs",
    ender_dragon: "entity/boss/ender_dragon.rs",
    villager: "entity/passive/villager/mod.rs",
    glow_item_frame: "entity/decoration/item_frame.rs",
    block_display: "entity/decoration/display.rs",
    item_display: "entity/decoration/display.rs",
    text_display: "entity/decoration/display.rs",
    spectral_arrow: "entity/projectile/arrow.rs",
    breeze_wind_charge: "entity/projectile/wind_charge.rs",
    falling_block: "entity/falling.rs",
    lightning_bolt: "entity/lightning.rs",
    minecart: "entity/vehicle/minecart/rideable.rs",
    chest_minecart: "entity/vehicle/minecart/chest.rs",
    furnace_minecart: "entity/vehicle/minecart/furnace.rs",
    hopper_minecart: "entity/vehicle/minecart/hopper.rs",
    tnt_minecart: "entity/vehicle/minecart/tnt.rs",
    command_block_minecart: "entity/vehicle/minecart.rs",
    spawner_minecart: "entity/vehicle/minecart.rs",
    experience_bottle: "item/items/experience_bottle.rs",
  };
  if (overrides[id]) return "crates/pumpkin/src/" + overrides[id];
  if (/_(chest_)?(boat|raft)$/.test(id)) return "crates/pumpkin/src/entity/vehicle/boat.rs";
  const hit = entityFiles.find((f) => path.basename(f) === `${id}.rs`);
  return hit ? rel(hit) : null;
}

const SPIDER_ITEMS = [
  "+Generic melee and target goals",
  "-`LeapAtTargetGoal`",
  "-`SpiderAttackGoal`",
  "-`AvoidEntityGoal`",
  "-Light-gated `SpiderTargetGoal`",
  "-Wall-climber navigation",
];
const FISH_ITEMS = [
  "+Bucket pickup",
  "-Water-bound navigation",
  "-`PanicGoal` and `AvoidEntityGoal`",
  "-`FishSwimGoal`",
  "-`FollowFlockLeaderGoal` schooling",
];
const HORSE_ITEMS = [
  "+Breed and tempt",
  "+Taming, saddle and riding",
  "-`RunAroundLikeCrazyGoal` when mounted untamed",
  "-`MountPanicGoal`",
  "-`RandomStandGoal`",
];
const BOAT_ITEMS = ["+Placement and riding", "+Paddle state sync", "-Vanilla boat physics"];
const CHEST_BOAT_ITEMS = [...BOAT_ITEMS, "-Chest inventory"];

// [status, group, note, items, issues]
const ENTITIES = {
  // Hostile
  zombie: ["partial", "Hostile", "Base zombie goals match vanilla, including door breaking and turtle egg raids.", ["+`ZombieAttackGoal`, `BreakDoorGoal` and `DestroyEggGoal`", "+Revenge and player targeting", "-`MoveThroughVillageGoal`", "-`SpearUseGoal` (new in 26.2)"], [1336]],
  husk: ["partial", "Hostile", "Wraps the zombie base with desert spawn rules.", ["+Zombie goal set", "+Surface monster spawn rules", "-Conversion to zombie when submerged"]],
  zombie_villager: ["partial", "Hostile", "Villager profession data and curing are ported.", ["+Villager profession and biome data", "+Curing with a golden apple", "+Zombie goal set", "-`MoveThroughVillageGoal`"]],
  drowned: ["partial", "Hostile", "Spawn rules exist, but the entity registers none of its own goals, so trident drowned never throw.", ["-`DrownedGoToWaterGoal`", "-`DrownedTridentAttackGoal` and `DrownedAttackGoal`", "-`DrownedGoToBeachGoal` and `DrownedSwimUpGoal`", "-Water-bound navigation", "-Drowned conversion persistence"], [3069, 2162]],
  zombified_piglin: ["partial", "Hostile", "", ["+Zombie goal set and nether spawn rules", "+Anger timer when hit", "-`SpearUseGoal`", "-Group anger and `ResetUniversalAngerTargetGoal`"], []],
  skeleton: ["partial", "Hostile", "Bow and melee goals are registered at the same time, so skeletons walk up and hit you with the bow.", ["+`BowAttackGoal` and `MeleeAttackGoal`", "+`AvoidEntityGoal` for wolves", "-Swap bow and melee on held-item change", "-`RestrictSunGoal` and `FleeSunGoal`", "-Difficulty-scaled attack interval"], [2537]],
  stray: ["partial", "Hostile", "Wraps the skeleton base with powder snow spawn checks.", ["+Skeleton goal set", "+Sky and powder snow spawn rules", "-Slowness tipped arrows", "-Bow and melee swap"]],
  bogged: ["partial", "Hostile", "Wraps the skeleton base, so it shoots a bow like vanilla.", ["+Skeleton goal set with bow attack", "-Poison tipped arrows", "-Shearing for mushrooms"]],
  parched: ["partial", "Hostile", "New in 26.2, wraps the skeleton base.", ["+Skeleton goal set", "+Surface monster spawn rules", "-Held item and attack parity"]],
  wither_skeleton: ["partial", "Hostile", "Wraps the skeleton base, which registers a bow goal the wither skeleton should not have.", ["+Skeleton goal set", "-Melee-only weapon handling, inherits the bow goal", "-Wither effect on hit"]],
  spider: ["partial", "Hostile", "Uses the generic melee set. No leap, no wall climbing, no daylight gate on targeting.", ["+Climbing flag synced to clients", ...SPIDER_ITEMS]],
  cave_spider: ["partial", "Hostile", "Same gaps as the spider.", ["+Poison on hit, scaled by difficulty", ...SPIDER_ITEMS]],
  enderman: ["partial", "Hostile", "Teleports, moves blocks and gets angry when stared at, but hovers in mid-air and never freezes in place.", ["+Block pick up and placement", "+Anger when a player stares", "+Teleports away from projectiles and towards targets", "-`EndermanFreezeWhenLookedAtGoal`", "-Gravity and teleport target validation", "-`ResetUniversalAngerTargetGoal`", "-Sunlight avoidance", "-Carried block drop on death"], [2872]],
  creeper: ["partial", "Hostile", "Ignites and explodes like vanilla. Only the cat and ocelot avoidance and the effect cloud are missing.", ["+`CreeperIgniteGoal` and explosion", "+Charged by lightning", "+Revenge and player targeting", "-`AvoidEntityGoal` for cats and ocelots", "-Area effect cloud from potion effects"]],
  blaze: ["partial", "Hostile", "Shoots fireballs but has normal gravity and ground navigation, so it cannot hover.", ["+`BlazeShootFireballGoal`", "+Any-light nether spawn rules", "-Flying navigation and zero gravity", "-`MoveTowardsRestrictionGoal`"], [1960]],
  vex: ["partial", "Hostile", "", ["+Basic goal set", "-`VexChargeAttackGoal`", "-`VexRandomMoveGoal`", "-`VexCopyOwnerTargetGoal`", "-Flying movement"]],
  phantom: ["partial", "Hostile", "Look goals only. It has no target selector and does nothing.", ["+Look goals", "-`PhantomAttackStrategyGoal`", "-`PhantomSweepAttackGoal`", "-`PhantomCircleAroundAnchorGoal`", "-`PhantomAttackPlayerTargetGoal`", "-Flying navigation"]],
  guardian: ["partial", "Hostile", "Swims with the generic set and hurts attackers. The beam attack, the whole identity of the mob, does not exist.", ["+Water spawn rules", "+Spike damage to attackers", "-`GuardianAttackGoal` laser beam", "-`MoveTowardsRestrictionGoal`", "-`LookAtPlayerGoal` for players and other guardians", "-`GuardianMoveControl` and zero water malus"]],
  elder_guardian: ["partial", "Hostile", "Mining fatigue and spikes work; the beam attack does not exist.", ["+Water spawn rules", "+Mining fatigue on nearby players", "+Spike damage to attackers", "-`GuardianAttackGoal` laser beam", "-`MoveTowardsRestrictionGoal`", "-`GuardianMoveControl` and zero water malus"]],
  magma_cube: ["done", "Hostile", "Built on the slime entity, so it inherits the full slime goal set.", ["+Slime goal set: attack, jump, split", "+Nether spawn rules", "+Player collision damage"]],
  slime: ["done", "Hostile", "Goal set matches vanilla. Landing particles are still pending.", ["+Size, split and jump attack", "+Slime chunk and swamp spawn rules", "+Player collision damage"], []],
  sulfur_cube: ["planned", "Hostile", "New in 26.2. Spawn rules exist but there is no entity type or goals.", ["-Entity type and sizes", "-`SulfurCubeTemptGoal`", "-`SulfurCubeSearchForItemsGoal`"], [3114]],
  ghast: ["done", "Hostile", "", ["+Fireball shooting", "+Flying wander and look", "+Spawn chance rules"]],
  happy_ghast: ["partial", "Hostile", "Tempts, leashes and holds still, approximated with goals.", ["+Tempt and still timeout", "+Leash holder", "-Flying navigation", "-Brain migration"]],
  endermite: ["partial", "Hostile", "", ["+Generic goal set", "+Lifetime despawn timer", "-`ClimbOnTopOfPowderSnowGoal`"]],
  silverfish: ["partial", "Hostile", "", ["+Generic goal set", "-`ClimbOnTopOfPowderSnowGoal`", "-`SilverfishWakeUpFriendsGoal`", "-`SilverfishMergeWithStoneGoal`"]],
  witch: ["partial", "Hostile", "Throws and drinks potions and joins raids, but never heals other raiders.", ["+Potion throwing via `RangedAttackGoal`", "+Drinks potions to heal and resist", "+Magic damage reduction", "+Raid goals", "-`WitchHealRaidersGoal`", "-`WitchAttackPlayersGoal` target"], [1302]],
  illusioner: ["partial", "Hostile", "No spells and no bow.", ["+Raider goal set", "-`IllusionerMirrorSpellGoal`", "-`IllusionerBlindnessSpellGoal`", "-`RangedBowAttackGoal`", "-`AvoidEntityGoal`"]],
  vindicator: ["partial", "Hostile", "", ["+Melee and raid goals", "-`VindicatorJohnnyAttackGoal`", "-`VindicatorBreakDoorGoal`"]],
  pillager: ["partial", "Hostile", "", ["+Crossbow attack and raid goals", "+Patrol behaviour", "-`AvoidEntityGoal`"]],
  evoker: ["partial", "Hostile", "", ["+Fangs, vex summon and wololo spells", "+Raid goals", "-`AvoidEntityGoal`"]],
  ravager: ["done", "Hostile", "Goal set matches vanilla.", ["+Goal set matches vanilla", "+Raid goals"]],
  piglin: ["partial", "Hostile", "Bartering, admiring and zombification all work on a hand-rolled activity system. The vanilla brain port replaces that system rather than adding features.", ["+Bartering with gold and barter loot", "+Admiring held gold and `GoToWantedItemGoal`", "+Celebrating and dancing after a hunt", "+Zombification outside the Nether", "+Crossbow and melee attack, repellent avoidance", "-Shared anger across the group", "-Brain migration"], [3376]],
  piglin_brute: ["partial", "Hostile", "", ["+Melee and target goals", "+Zombification outside the Nether", "-Brain migration"]],
  hoglin: ["partial", "Hostile", "", ["+Melee attack with launch", "+Zombification into a zoglin", "+Nether spawn rules", "-Retreat from repellents and home", "-Brain migration"]],
  zoglin: ["partial", "Hostile", "", ["+Goal approximation", "-Brain migration"]],
  warden: ["partial", "Hostile", "Placeholder goals only. Sniffing, the sonic boom and anger are all brain driven in vanilla.", ["+Basic goal set", "-Vibration sensing and anger", "-Sniffing", "-Sonic boom", "-Emerging and digging"]],
  breeze: ["partial", "Hostile", "Wanders and targets players but never attacks; the wind charge projectile exists, nothing fires it.", ["+Basic goal set", "-Wind charge attack", "-Jump and slide attack pattern", "-Brain migration"]],
  creaking: ["partial", "Hostile", "", ["+Creaking heart binding", "+Freezes while a player looks at it", "+Tear down and death effects", "-Brain migration"]],
  shulker: ["done", "Hostile", "", ["+Peek and shoot goals", "+Attachment and teleport", "+Shulker bullet"]],
  giant: ["done", "Hostile", "Vanilla giant registers no goals at all. Pumpkin adds a small goal set on top.", ["+Entity type and attributes"]],
  bat: ["partial", "Hostile", "", ["+Roosting under blocks", "+Random flight", "+Cave spawn rules", "-Flying navigation hook"]],

  // Boss
  wither: ["partial", "Boss", "Shoots skulls from all three heads and breaks blocks, but does not fly and only targets whatever hurt it.", ["+Spawning from soul sand and skulls", "+Spawn invulnerability window and explosion", "+Wither skulls from all three heads", "+Half-health armour phase", "+Block breaking and boss bar", "-Player targeting, only revenge", "-Flying movement"], []],
  ender_dragon: ["partial", "Boss", "All twelve flight phases are ported. Collision and damage still run against the main bounding box instead of the parts.", ["+12-phase `PhaseManager`", "+Crystal healing and block breaking", "+Flight history", "+Part tracking, not yet registered as world entities", "-Part based knockback", "-Hurt-time gating and creative exclusion", "-Push semantics", "-Contact damage guard"], []],

  // Passive
  cow: ["done", "Passive", "", ["+Breed, tempt and follow parent", "+Milking"]],
  pig: ["done", "Passive", "", ["+Breed, tempt and follow parent", "+Saddle and carrot on a stick"]],
  sheep: ["done", "Passive", "", ["+Breed, tempt and follow parent", "+Eat grass and regrow wool", "+Shearing and dyeing"]],
  chicken: ["done", "Passive", "", ["+Breed, tempt and follow parent", "+Egg laying", "+Slow fall"]],
  mooshroom: ["done", "Passive", "", ["+Breed, tempt and follow parent", "+Mushroom stew", "+Shear into a cow"], []],
  wolf: ["partial", "Passive", "Player targeting is left out on purpose until an anger memory exists, so wolves never get angry eyes.", ["+Taming, owner follow and defend", "+`BegGoal` and `TamableAnimalPanicGoal`", "+Prey targets for sheep, rabbit, fox and skeleton", "+Avoids llamas", "-`SitWhenOrderedToGoal`, sit pose is synced but not enforced", "-`LeapAtTargetGoal`", "-Anger memory and `ResetUniversalAngerTargetGoal`", "-Remaining prey: baby turtle, stray, bogged, parched, bat", "-`NonTameRandomTargetGoal`"], [2998, 2789]],
  cat: ["partial", "Passive", "Taming, following and avoidance work. Sitting, beds and pouncing are state flags without goals behind them.", ["+Taming, tempt and `FollowOwnerGoal`", "+`CatAvoidEntityGoal` and `NonTameRandomTargetGoal`", "+Variants and collar colour", "-`SitWhenOrderedToGoal`, sit pose is synced but not enforced", "-`CatLieOnBedGoal` and `CatSitOnBlockGoal`", "-`CatRelaxOnOwnerGoal`", "-`LeapAtTargetGoal` and `OcelotAttackGoal`", "-Morning gifts"], []],
  ocelot: ["partial", "Passive", "", ["+Tempt and trust", "+Avoids players until trusted", "+Hunts chickens and turtles", "-`OcelotAttackGoal` and `LeapAtTargetGoal`"]],
  parrot: ["partial", "Passive", "Walks everywhere because there is no flying navigation, and all tamed behaviour is missing.", ["+Wander and look goals", "+Cookie poisoning", "-Taming and `SitWhenOrderedToGoal`", "-`FollowOwnerGoal` and `LandOnOwnersShoulderGoal`", "-`FollowMobGoal` mimicry", "-`ParrotWanderGoal` with flying navigation"]],
  rabbit: ["partial", "Passive", "", ["+Generic goals with tempt", "+Variants", "-`RabbitRaidGardenGoal`", "-`ClimbOnTopOfPowderSnowGoal`"]],
  polar_bear: ["partial", "Passive", "", ["+Melee attack and revenge", "+Standing pose flag", "-`PolarBearAttackPlayersGoal` cub protection", "-`ResetUniversalAngerTargetGoal`"]],
  fox: ["partial", "Passive", "State flags are synced, but every fox-specific goal is missing.", ["+Breed, tempt and panic", "+Variants and pose flags", "-Prey targets", "-`StalkPreyGoal` and `FoxPounceGoal`", "-`SleepGoal` and `SeekShelterGoal`", "-`FoxEatBerriesGoal` and `FoxSearchForItemsGoal`", "-`FaceplantGoal` and `PerchAndSearchGoal`", "-`DefendTrustedTargetGoal`"], []],
  panda: ["partial", "Passive", "Genes and pose flags are synced, but every panda-specific goal is missing.", ["+Generic goals", "+Genes and pose flags", "-`PandaPanicGoal`, `PandaBreedGoal` and `PandaAttackGoal`", "-`PandaAvoidGoal`", "-Sit, lie on back, sneeze and roll", "-`PandaHurtByTargetGoal`"]],
  horse: ["partial", "Passive", "", [...HORSE_ITEMS, "+Variants"]],
  donkey: ["partial", "Passive", "", [...HORSE_ITEMS, "+Chest"]],
  mule: ["partial", "Passive", "", ["+Tempt and follow parent", "+Taming, saddle and riding", "+Chest", "-`RunAroundLikeCrazyGoal` when mounted untamed", "-`MountPanicGoal`", "-`RandomStandGoal`"]],
  skeleton_horse: ["partial", "Passive", "", ["+Basic goals", "+Taming and saddle", "-`SkeletonTrapGoal`"]],
  zombie_horse: ["partial", "Passive", "", ["+Basic goals", "+Taming and saddle", "-Horse family goals"]],
  llama: ["partial", "Passive", "", ["+Spits at wolves and attackers", "+Chest, strength and variants", "+Breed and tempt", "-`LlamaFollowCaravanGoal`"], []],
  trader_llama: ["partial", "Passive", "", ["+Spits at wolves and attackers", "+Chest, strength and variants", "-`LlamaFollowCaravanGoal`", "-`TraderLlamaDefendWanderingTraderGoal`"]],
  turtle: ["partial", "Passive", "Never lays eggs, goes home or travels.", ["+Breed, tempt and `TryFindWaterGoal`", "+Beach spawn rules and egg state flags", "-`TurtleLayEggGoal`", "-`TurtleGoHomeGoal` and `TurtleTravelGoal`", "-Amphibious navigation"]],
  strider: ["partial", "Passive", "", ["+Saddle and steering", "+Suffocation off lava", "+Lava spawn rules", "-`StriderGoToLavaGoal`", "-Lava walking"]],
  cod: ["partial", "Passive", "Bobs in place on the ground navigator.", FISH_ITEMS],
  salmon: ["partial", "Passive", "Bobs in place on the ground navigator.", FISH_ITEMS],
  tropical_fish: ["partial", "Passive", "Bobs in place on the ground navigator.", FISH_ITEMS],
  pufferfish: ["partial", "Passive", "Bobs in place on the ground navigator.", [...FISH_ITEMS, "-`PufferfishPuffGoal`"], []],
  squid: ["partial", "Passive", "", ["+Water spawn rules", "-Water-bound navigation", "-`SquidRandomMovementGoal`", "-`SquidFleeGoal`", "-Ink cloud"]],
  glow_squid: ["partial", "Passive", "", ["+Deep water spawn rules", "-Water-bound navigation", "-`SquidRandomMovementGoal`", "-`SquidFleeGoal`", "-Ink cloud"]],
  dolphin: ["partial", "Passive", "", ["+Generic goals with `TryFindWaterGoal`", "-`BreathAirGoal`", "-`DolphinSwimToTreasureGoal`", "-`DolphinSwimWithPlayerGoal`", "-`DolphinJumpGoal` and `PlayWithItemsGoal`", "-Water-bound navigation"]],
  tadpole: ["partial", "Passive", "", ["+Basic goals", "+Bucket pickup", "-Brain migration", "-Water-bound navigation"]],
  axolotl: ["partial", "Passive", "", ["+Attack, breed and tempt", "+Variants and bucket", "+Playing dead", "-Brain migration", "-Water-bound navigation"]],
  frog: ["partial", "Passive", "", ["+Variants and tempt", "-Tongue attack on slimes and magma cubes", "-Brain migration"], []],
  bee: ["partial", "Passive", "Registers the generic animal set only, so bees never enter hives, pollinate or grow crops.", ["+Generic animal goals", "+Nectar, sting and hive timer state", "-`BeeAttackGoal` and stinger damage", "-Hive goals", "-`BeePollinateGoal` and `BeeGrowCropGoal`", "-`BeeWanderGoal`", "-Anger targets", "-Flying navigation"], []],
  allay: ["partial", "Passive", "", ["+Duplication and dancing state", "-Item collection and delivery", "-Note block following", "-Brain migration"]],
  armadillo: ["partial", "Passive", "", ["+Roll up when threatened", "+Scute shedding and brushing", "+Breed and tempt", "-Brain migration"]],
  camel: ["partial", "Passive", "", ["+Breed and tempt", "+Saddle and dash state", "-Sitting", "-Brain migration"]],
  copper_golem: ["partial", "Passive", "", ["+Oxidation states and weather", "+Lightning strike reset", "-Item transport between chests", "-Brain migration"]],
  goat: ["partial", "Passive", "", ["+Breed and tempt", "+Horns and screaming state", "-Ram attack", "-Horn drop on ram", "-Brain migration"]],
  sniffer: ["partial", "Passive", "", ["+Digging and seed drops", "+Breed and tempt", "+Explored positions", "-Brain migration"]],
  nautilus: ["partial", "Passive", "New in 26.2. Taming, riding and dash state exist, but no goals are registered.", ["+Taming, saddle and riding", "+Dash state and sounds", "-Swim and shell behaviour", "-Brain migration"]],
  zombie_nautilus: ["planned", "Passive", "New in 26.2. Not implemented."],
  camel_husk: ["planned", "Passive", "New in 26.2. Spawn rules exist but there is no entity type."],
  iron_golem: ["partial", "Passive", "Attacks monsters and offers flowers. Player targeting is left out until an anger memory exists, so village and reputation behaviour is missing.", ["+`OfferFlowerGoal`", "+Attacks monsters, except creepers", "+`MoveTowardsTargetGoal`", "-Player targeting from anger and reputation", "-`MoveBackToVillageGoal` and `GolemRandomStrollInVillageGoal`", "-Anger memory"], [3430]],
  snow_golem: ["done", "Passive", "", ["+Snowball ranged attack", "+Pumpkin shearing"]],
  villager: ["partial", "Villager", "Approximated with goals. Trading, work sites and hostile avoidance work; everything activity and reputation driven is missing.", ["+Trading and `TradeWithPlayerGoal`", "+`WorkAtJobSiteGoal`", "+Gossip and reputation with trade discounts", "+Hostile avoidance and door use", "-Brain migration", "-Breeding", "-Sleep, work and meet activities"], []],
  wandering_trader: ["partial", "Villager", "Trades, wanders and drinks its potions. Natural spawning and the llama escort are missing.", ["+Trading screen and generated offers", "+Invisibility potion at night", "+Despawn timer and wander targets", "-Natural spawn cycle and `level.dat` persistence", "-Leashed trader llamas", "-Trade offer parity"], [3364, 3083]],
  mannequin: ["planned", "Villager", "New in 26.x. Not implemented."],

  // Projectiles
  arrow: ["done", "Projectile", "", ["+Flight, hit and pickup", "+Damage on hit"], []],
  spectral_arrow: ["done", "Projectile", "Shares the arrow entity.", ["+Shares the arrow entity", "+Glowing effect on hit"]],
  trident: ["done", "Projectile", "", ["+Thrown trident with pickup", "+Loyalty and riptide through the item"]],
  snowball: ["done", "Projectile"],
  egg: ["done", "Projectile", "", [], []],
  ender_pearl: ["done", "Projectile", "", ["+Teleport on hit", "+Damage to the thrower", "+Endermite spawn chance"]],
  experience_bottle: ["partial", "Projectile", "Using the item spawns the orbs at the player instead of throwing a bottle.", ["+Experience orbs on use", "-Thrown projectile flight and impact"]],
  fireball: ["done", "Projectile", "", [], []],
  small_fireball: ["done", "Projectile"],
  dragon_fireball: ["planned", "Projectile", "Not implemented."],
  wither_skull: ["done", "Projectile"],
  shulker_bullet: ["done", "Projectile"],
  llama_spit: ["done", "Projectile"],
  evoker_fangs: ["done", "Projectile"],
  eye_of_ender: ["done", "Projectile", "", [], []],
  wind_charge: ["done", "Projectile"],
  breeze_wind_charge: ["done", "Projectile"],
  splash_potion: ["done", "Projectile"],
  lingering_potion: ["done", "Projectile"],
  firework_rocket: ["done", "Projectile", "", [], []],
  fishing_bobber: ["partial", "Projectile", "", ["+Casting and hooking", "-Loot tables (gives raw cod only)"], []],

  // Decoration
  armor_stand: ["partial", "Decoration", "", ["+Placement, poses and breaking", "-Equipment slot drops on break", "-Fire damage"]],
  item_frame: ["done", "Decoration"],
  glow_item_frame: ["done", "Decoration"],
  painting: ["partial", "Decoration", "", ["+Placement", "-Drop on break"]],
  block_display: ["done", "Decoration"],
  item_display: ["done", "Decoration"],
  text_display: ["done", "Decoration"],
  end_crystal: ["done", "Decoration"],
  leash_knot: ["partial", "Decoration", "", ["+Created when leashing to fences", "-Restored from saved chunks"], []],
  marker: ["done", "Decoration", "", [], []],
  interaction: ["done", "Decoration", "", [], []],

  // Misc
  item: ["done", "Misc", "", [], []],
  experience_orb: ["done", "Misc", "", [], []],
  falling_block: ["done", "Misc", "", [], []],
  tnt: ["done", "Misc", "", [], []],
  lightning_bolt: ["done", "Misc", "", [], []],
  area_effect_cloud: ["done", "Misc", "", [], []],
  ominous_item_spawner: ["planned", "Misc", "Not implemented."],
};

for (const id of ["minecart", "chest_minecart", "furnace_minecart", "hopper_minecart", "tnt_minecart"]) {
  ENTITIES[id] = ["done", "Vehicle", "", []];
}
ENTITIES.command_block_minecart = ["partial", "Vehicle", "", ["+Rides as a plain minecart", "-Command block execution"]];
ENTITIES.spawner_minecart = ["partial", "Vehicle", "", ["+Rides as a plain minecart", "-Spawner logic"]];

const vanilla = JSON.parse(fs.readFileSync(path.join(PUMPKIN, "assets/entities.json"), "utf8"));
const entityIds = Object.keys(vanilla).filter((id) => id !== "player");
for (const id of entityIds) {
  if (/_(chest_)?(boat|raft)$/.test(id)) {
    const chest = id.includes("chest");
    ENTITIES[id] = ["partial", "Vehicle", "Placement, riding and paddle sync work. Vanilla water physics are not ported.", chest ? CHEST_BOAT_ITEMS : BOAT_ITEMS];
  }
}

const missing = entityIds.filter((id) => !ENTITIES[id]);
if (missing.length) {
  console.error("Entities without an audit entry:", missing.join(", "));
  process.exit(1);
}

const GROUP_ORDER = ["Hostile", "Boss", "Passive", "Villager", "Projectile", "Vehicle", "Decoration", "Misc"];
const entityEntries = entityIds
  .map((id) => {
    const [status, group, note = "", items = [], issues = []] = ENTITIES[id];
    const entry = { id, name: humanize(id), group, status };
    if (note) entry.note = note;
    if (items.length) entry.items = items.map(item);
    const source = entitySource(id);
    if (source) entry.source = source;
    if (issues.length) entry.issues = issues;
    return entry;
  })
  .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

const BLOCK_SKIP = new Set(["mod", "abstract_wall_mounting", "abstract_redstone_gate", "common", "tests", "segmented", "tree_grower", "spreading_snowy_block"]);
const BLOCK_NAMES = {
  amethyst: "Budding Amethyst",
  brushable_block: "Suspicious Sand & Gravel",
  candle_cakes: "Candle Cakes",
  carved_pumpkin: "Carved Pumpkin (golem summoning)",
  chests: "Chests",
  command: "Command Block",
  falling: "Falling Blocks (sand, gravel, concrete powder)",
  fire: "Fire",
  soul_fire: "Soul Fire",
  glass_panes: "Glass Panes",
  ice: "Ice & Frosted Ice",
  infested: "Infested Blocks",
  note: "Note Block",
  nylium: "Nylium",
  plate: "Pressure Plates",
  weighted: "Weighted Pressure Plates",
  piston: "Pistons",
  piston_extension: "Moving Piston",
  piston_head: "Piston Head",
  attached_stem: "Attached Stems",
  stem: "Pumpkin & Melon Stems",
  torch_flower: "Torchflower Crop",
  gourds: "Gourds",
  cave_vines: "Cave Vines",
  dry_vegetation: "Dry Vegetation",
  mushroom_plant: "Mushrooms",
  short_plant: "Short Plants (grass, ferns)",
  tall_plant: "Tall Plants",
  redstone_wire: "Redstone Wire",
  redstone_ore: "Redstone Ore",
  sculk_sensor: "Sculk Sensor",
  target_block: "Target Block",
  skull_block: "Skulls & Heads",
  wither_skull: "Wither Skeleton Skull (summoning)",
  tnt: "TNT",
  test_block: "Test Blocks",
  rail: "Rails",
  logs: "Logs (stripping)",
  light: "Light Block",
  shelf: "Shelves",
  weathering_copper: "Weathering Copper",
  spawner: "Monster Spawner",
  end_gateway: "End Gateway",
  end_portal: "End Portal",
  end_portal_frame: "End Portal Frame",
  end_rod: "End Rod",
  ender_chest: "Ender Chest",
  copper_bulb: "Copper Bulb",
  lightning_rod: "Lightning Rod",
  hay: "Hay Bale",
  dirt_path: "Dirt Path",
  big_dripleaf_stem: "Big Dripleaf Stem",
  bamboo_sapling: "Bamboo Sapling",
  cactus_flower: "Cactus Flower",
  sea_pickles: "Sea Pickles",
  torches: "Torches",
  beehive: "Beehive & Bee Nest",
  bed: "Beds",
};
const BLOCK_PARTIAL = {
  piston: "Pushing and block swapping are currently broken.",
  daylight_detector: "Present but not yet at vanilla parity.",
  farmland: "Several trampling and hydration TODOs remain.",
  tripwire: "Several TODOs remain.",
  tripwire_hook: "Several TODOs remain.",
  beehive: "Stores bees, but bees never enter or leave it.",
  sculk_catalyst: "Stub. Does not spread sculk on mob death.",
  conduit: "Stub. No activation or conduit power.",
  structure_block: "Stores settings. Loading and saving structures is not verified.",
};
const BLOCK_GROUPS = [
  ["Redstone", (p) => p.includes("/redstone/")],
  ["Plants & Crops", (p) => p.includes("/plant/") || p.includes("/coral/")],
  ["Fire & Sculk", (p) => p.includes("/fire/") || p.includes("/sculk/")],
  ["Pistons", (p) => p.includes("/piston/")],
  ["Blocks", () => true],
];

function blockIds(file, txt) {
  const macro = [...txt.matchAll(/pumpkin_block(?:_from_tag)?\("([^"]+)"\)/g)].map((m) => m[1]);
  if (macro.length) return macro;
  const idsFn = txt.indexOf("fn ids()");
  if (idsFn === -1) return [];
  const body = txt.slice(idsFn, idsFn + 1500);
  return [...new Set([...body.matchAll(/Block::([A-Z0-9_]+)/g)].map((m) => "minecraft:" + m[1].toLowerCase()))].slice(0, 12);
}

const blockEntries = [];
for (const file of walk(path.join(SRC, "block/blocks")).sort()) {
  const base = path.basename(file, ".rs");
  if (BLOCK_SKIP.has(base)) continue;
  const txt = fs.readFileSync(file, "utf8");
  if (!/impl BlockBehaviour for/.test(txt) && !/pumpkin_block/.test(txt)) continue;
  const r = rel(file);
  const group = BLOCK_GROUPS.find(([, test]) => test(r))[0];
  const ids = blockIds(file, txt);
  const entry = {
    id: r.replace("crates/pumpkin/src/block/blocks/", "").replace(/\.rs$/, "").replace(/\//g, "-"),
    name: BLOCK_NAMES[base] || humanize(base),
    group,
    status: BLOCK_PARTIAL[base] ? "partial" : "done",
    source: r,
  };
  if (BLOCK_PARTIAL[base]) entry.note = BLOCK_PARTIAL[base];
  if (ids.length) entry.ids = ids;
  const todos = todoCount(file);
  if (todos && !entry.note) entry.note = `${todos} TODO${todos > 1 ? "s" : ""} left in the source.`;
  blockEntries.push(entry);
}
blockEntries.push(
  { id: "lodestone", name: "Lodestone", group: "Blocks", status: "planned", note: "Compass binding is not implemented." },
  { id: "frogspawn", name: "Frogspawn", group: "Blocks", status: "planned", note: "Placeable, but never hatches into tadpoles." },
);
blockEntries.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

const ITEM_SKIP = new Set(["mod", "projectile_weapon", "ignition"]);
const ITEM_NAMES = {
  on_a_stick: "Carrot & Fungus on a Stick",
  place_on_water: "Lily Pad & Frogspawn",
  hanging_entity: "Item Frames & Paintings",
  fire_charge: "Fire Charge",
  flint_and_steel: "Flint and Steel",
  glass_bottle: "Glass Bottle",
  potions: "Potions",
  writable_book: "Books",
  knowledge_book: "Knowledge Book",
  spawn_egg: "Spawn Eggs",
  debug_stick: "Debug Stick",
  name_tag: "Name Tag",
  goat_horn: "Goat Horn",
  ink_sac: "Ink Sac",
  glowing_ink_sac: "Glow Ink Sac",
  bone_meal: "Bone Meal",
  ender_eye: "Eye of Ender",
  ender_pearl: "Ender Pearl",
  end_crystal: "End Crystal",
  experience_bottle: "Bottle o' Enchanting",
  firework_rocket: "Firework Rocket",
  fishing_rod: "Fishing Rod",
  wind_charge: "Wind Charge",
  swords: "Swords",
  axe: "Axes",
  hoe: "Hoes",
  shovel: "Shovels",
  spear: "Spears",
  bucket: "Buckets",
  minecart: "Minecarts",
  boat: "Boats & Rafts",
  armor_stand: "Armor Stand",
  dye: "Dyes",
  bundle: "Bundles",
  map: "Maps",
  compass: "Compass & Recovery Compass",
};
const ITEM_PARTIAL = {
  fishing_rod: "Catches only raw cod. Loot tables are not wired up.",
  name_tag: "A TODO remains in the source.",
  mace: "Registered. Smash attack not verified.",
};
const ITEM_NOTES = {
  shield: "Registration. Blocking lives in the combat code.",
  arrow: "Registration. Flight and damage live in the arrow entity.",
  swords: "Registration. Sweep and damage live in the combat code.",
};
const ITEM_GROUPS = [
  ["Tools & Weapons", new Set(["axe", "hoe", "shovel", "swords", "mace", "spear", "bow", "crossbow", "arrow", "trident", "shield", "shears", "brush", "fishing_rod", "flint_and_steel", "debug_stick"])],
  ["Throwables", new Set(["egg", "snowball", "ender_pearl", "ender_eye", "experience_bottle", "wind_charge", "fire_charge", "firework_rocket", "potions"])],
  ["Placeables", new Set(["armor_stand", "boat", "minecart", "end_crystal", "hanging_entity", "place_on_water", "spawn_egg", "bucket"])],
  ["Utility", new Set()],
];

const itemEntries = [];
for (const file of walk(path.join(SRC, "item/items")).sort()) {
  const base = path.basename(file, ".rs");
  if (ITEM_SKIP.has(base)) continue;
  const txt = fs.readFileSync(file, "utf8");
  if (!/impl ItemBehaviour for/.test(txt)) continue;
  const ids = [...new Set([...txt.matchAll(/Item::([A-Z0-9_]+)/g)].map((m) => m[1]))]
    .filter((i) => !/_SPEED|MULTIPLIER|SHERD|SCUTE|SEEDS|WOOL$|^DISC_/.test(i))
    .map((i) => "minecraft:" + i.toLowerCase().replace(/^minecraft_|^c_/, ""))
    .slice(0, 12);
  const group = (ITEM_GROUPS.find(([, set]) => set.has(base)) || ITEM_GROUPS[ITEM_GROUPS.length - 1])[0];
  const entry = {
    id: base,
    name: ITEM_NAMES[base] || humanize(base),
    group,
    status: ITEM_PARTIAL[base] ? "partial" : "done",
    source: rel(file),
  };
  if (ITEM_PARTIAL[base] || ITEM_NOTES[base]) entry.note = ITEM_PARTIAL[base] || ITEM_NOTES[base];
  if (ids.length) entry.ids = ids;
  itemEntries.push(entry);
}
itemEntries.push(
  { id: "elytra", name: "Elytra", group: "Utility", status: "partial", note: "Gliding is handled in the player logic rather than an item behaviour. Parity fixes are in review.", source: "crates/pumpkin/src/entity/player.rs" },
  { id: "totem_of_undying", name: "Totem of Undying", group: "Utility", status: "done", note: "Handled in the living entity death path.", source: "crates/pumpkin/src/entity/living.rs" },
  { id: "chorus_fruit", name: "Chorus Fruit", group: "Throwables", status: "planned", note: "Random teleport on eating is not implemented." },
);
const ITEM_GROUP_ORDER = ITEM_GROUPS.map((g) => g[0]);
itemEntries.sort((a, b) => ITEM_GROUP_ORDER.indexOf(a.group) - ITEM_GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const VANILLA_COMMANDS = [
  "advancement", "attribute", "ban", "ban-ip", "banlist", "bossbar", "clear", "clone", "damage", "data", "datapack", "debug",
  "defaultgamemode", "deop", "dialog", "difficulty", "effect", "enchant", "execute", "experience", "fetchprofile", "fill",
  "fillbiome", "forceload", "function", "gamemode", "gamerule", "give", "help", "item", "jfr", "kick", "kill", "list", "locate",
  "loot", "me", "msg", "op", "pardon", "pardon-ip", "particle", "perf", "place", "playsound", "publish", "random", "recipe",
  "reload", "return", "ride", "rotate", "save-all", "save-off", "save-on", "say", "schedule", "scoreboard", "seed", "setblock",
  "setidletimeout", "setworldspawn", "spawnpoint", "spectate", "spreadplayers", "stop", "stopsound", "summon", "tag", "team",
  "teammsg", "teleport", "tell", "tellraw", "test", "tick", "time", "title", "tm", "transfer", "trigger", "unpublish", "version",
  "w", "waypoint", "weather", "whitelist", "worldborder", "xp",
];
const COMMAND_ALIASES = { "ban-ip": "banip", "pardon-ip": "pardonip", "save-all": "saveall", "save-off": "saveoff", "save-on": "saveon", tell: "msg", w: "msg", tm: "teammsg", tp: "teleport", xp: "experience", version: "pumpkin" };
const PUMPKIN_COMMANDS = { pumpkin: "Version and build info.", plugin: "Load and unload plugins.", plugins: "List loaded plugins.", tps: "Ticks per second.", stopwatch: "Timing helper.", raid: "Raid debugging." };

const commandFiles = new Set(fs.readdirSync(path.join(SRC, "command/commands")).map((f) => f.replace(/\.rs$/, "")));
const commandEntries = [];
for (const name of VANILLA_COMMANDS) {
  const file = COMMAND_ALIASES[name] || name;
  const exists = commandFiles.has(file);
  const entry = {
    id: name,
    name: `/${name}`,
    group: "Vanilla",
    status: exists ? "done" : "planned",
  };
  if (exists) entry.source = `crates/pumpkin/src/command/commands/${file}.rs`;
  if (COMMAND_ALIASES[name] && exists) entry.note = `Alias of /${COMMAND_ALIASES[name] === "pumpkin" ? "pumpkin" : COMMAND_ALIASES[name]}.`;
  commandEntries.push(entry);
}
for (const [name, note] of Object.entries(PUMPKIN_COMMANDS)) {
  commandEntries.push({ id: name, name: `/${name}`, group: "Pumpkin", status: "done", note, source: `crates/pumpkin/src/command/commands/${name}.rs` });
}

// ---------------------------------------------------------------------------
// Checklist categories from the tracking issues
// ---------------------------------------------------------------------------

function checklist(rows) {
  return rows.map(([name, status, group, note]) => {
    const e = { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), name, group, status };
    if (note) e.note = note;
    return e;
  });
}

const redstoneEntries = checklist([
  ["Redstone wire signal propagation", "done", "Core"],
  ["Redstone tick system", "done", "Core"],
  ["Hard vs. soft powering", "done", "Core"],
  ["Pressure plates", "done", "Power & Sensors"],
  ["Tripwire hook", "done", "Power & Sensors"],
  ["Trapped chest", "done", "Power & Sensors"],
  ["Sculk sensors, shriekers and calibrated sensors", "done", "Power & Sensors"],
  ["Daylight detector", "partial", "Power & Sensors", "Block exists but is not yet at vanilla parity."],
  ["Target block", "done", "Power & Sensors"],
  ["Redstone torch, levers and buttons", "done", "Power & Sensors"],
  ["Comparator", "done", "Logic & Timing"],
  ["Repeater", "done", "Logic & Timing"],
  ["Note block", "done", "Logic & Timing"],
  ["Hopper item transfer", "done", "Logic & Timing"],
  ["Observer", "done", "Logic & Timing"],
  ["Rails", "done", "Logic & Timing"],
  ["Pistons and block swapping", "partial", "Mechanisms", "Currently broken."],
  ["Dropper", "done", "Mechanisms"],
  ["Dispenser", "done", "Mechanisms"],
  ["Crafter", "done", "Mechanisms"],
  ["Minecart powering and activation", "done", "Mechanisms"],
  ["TNT ignition and priming", "done", "Mechanisms"],
  ["Bell", "done", "Interactive"],
  ["Redstone lamp", "done", "Interactive"],
  ["Doors, gates and trapdoors", "done", "Interactive"],
  ["Lectern signal strength", "done", "Interactive"],
  ["Composter signal strength", "done", "Interactive"],
]);

const combatEntries = checklist([
  ["Basic melee attack", "done", "Core"],
  ["Tool-based damage calculation", "done", "Core"],
  ["Vanilla knockback", "done", "Core"],
  ["Attack speed and cooldown indicator", "done", "Core"],
  ["Bows", "done", "Equipment"],
  ["Crossbows", "done", "Equipment"],
  ["Shields", "done", "Equipment"],
  ["Tridents", "done", "Equipment"],
  ["Critical hits", "done", "Mechanics"],
  ["Damage invulnerability frames", "done", "Mechanics"],
  ["Sweep attack", "done", "Mechanics"],
  ["Enchantment integration", "done", "Mechanics"],
  ["Status effect integration", "done", "Mechanics"],
  ["1.8 combat mode", "planned", "Mechanics"],
]);

const worldEntries = checklist([
  ["World loading (level.dat, DIM1, DIM-1)", "partial", "Persistence", "26.x format support is still open."],
  ["World saving", "partial", "Persistence", "26.x format support is still open."],
  ["Chunk loading (vanilla, linear, pump)", "done", "Persistence"],
  ["Chunk saving", "done", "Persistence"],
  ["Chunk generation", "done", "Persistence"],
  ["Flat world generation", "done", "Persistence"],
  ["Redstone", "partial", "Logic & Physics", "Tracked in the Redstone tab."],
  ["Liquid physics", "done", "Logic & Physics"],
  ["Lighting", "done", "Logic & Physics"],
  ["World time", "done", "Logic & Physics"],
  ["World borders", "done", "Logic & Physics"],
  ["World joining", "done", "Logic & Physics"],
  ["Player tab list", "done", "Logic & Physics"],
  ["Scoreboard", "done", "Logic & Physics"],
  ["Bossbar", "done", "Logic & Physics"],
  ["Entity spawning", "done", "Logic & Physics"],
]);

// ---------------------------------------------------------------------------

const out = {
  version: mcVersion,
  commit,
  updated: commitDate,
  categories: [
    { id: "entities", label: "Entities", icon: "fa-dragon", unit: "entities", tracking: 3468, description: `All ${entityEntries.length} entity types in the ${mcVersion} registry, compared with the goal sets vanilla registers for each one.`, entries: entityEntries },
    { id: "blocks", label: "Blocks", icon: "fa-cube", unit: "block behaviours", description: "Every block behaviour class in the server. Most vanilla blocks need no behaviour, so this tracks the interactive ones.", entries: blockEntries },
    { id: "items", label: "Items", icon: "fa-wand-magic-sparkles", unit: "item behaviours", description: "Every item behaviour class in the server. Plain items and food need no behaviour of their own.", entries: itemEntries },
    { id: "commands", label: "Commands", icon: "fa-terminal", unit: "commands", tracking: 15, description: "Every command listed on the Minecraft wiki for Java Edition, plus the Pumpkin extras.", entries: commandEntries },
    { id: "redstone", label: "Redstone", icon: "fa-bolt", unit: "components", tracking: 1402, description: "Signal, timing and mechanism parity, from the maintainers' redstone tracking issue.", entries: redstoneEntries },
    { id: "combat", label: "Combat", icon: "fa-shield-halved", unit: "mechanics", tracking: 1404, description: "Melee, ranged and damage mechanics, from the combat tracking issue.", entries: combatEntries },
    { id: "world", label: "World", icon: "fa-earth-americas", unit: "systems", tracking: 1403, description: "Persistence, physics and world systems, from the world engine tracking issue.", entries: worldEntries },
  ],
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

for (const c of out.categories) {
  const n = { done: 0, partial: 0, planned: 0 };
  for (const e of c.entries) n[e.status]++;
  console.log(`${c.label.padEnd(10)} ${String(c.entries.length).padStart(4)} total  ${String(n.done).padStart(4)} done  ${String(n.partial).padStart(4)} partial  ${String(n.planned).padStart(4)} planned`);
}
