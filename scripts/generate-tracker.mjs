import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { assess, declaredIds, sourceRoot, STATUSES } from "./tracker-evidence.mjs";

const [, , PUMPKIN, OUT = path.resolve(import.meta.dirname, "../src/pages/tracker/data.json")] = process.argv;
if (!PUMPKIN) {
  console.error("usage: node scripts/generate-tracker.mjs <pumpkin-checkout> [output]");
  process.exit(1);
}

const ROOT = sourceRoot(PUMPKIN);
const SRC = path.join(PUMPKIN, ROOT);
const audits = JSON.parse(fs.readFileSync(new URL("./tracker-audits.json", import.meta.url), "utf8"));
const baseline = JSON.parse(fs.readFileSync(new URL("./tracker-baseline.json", import.meta.url), "utf8"));
const commit = execSync("git rev-parse HEAD", { cwd: PUMPKIN }).toString().trim();
const commitDate = execSync("git log -1 --format=%cs", { cwd: PUMPKIN }).toString().trim();
const cargo = fs.readFileSync(path.join(PUMPKIN, "Cargo.toml"), "utf8");
const mcVersion = (cargo.match(/^version = "[^+"]*\+([^"]+)"/m) || [])[1] || "";

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".rs")) out.push(p);
  }
  return out;
}

function ensureSource(label, source) {
  if (!fs.existsSync(path.join(PUMPKIN, source))) {
    console.warn(`${label}: ${source} is not in the checkout, leaving the source link out`);
    return null;
  }
  return source;
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

const entityFiles = walk(path.join(SRC, "entity"));
function entitySource(id) {
  const overrides = {
    skeleton: "entity/mob/skeleton/skeleton.rs",
    wither_skeleton: "entity/mob/skeleton/wither.rs",
    zombie: "entity/mob/zombie/zombie.rs",
    ender_dragon: "entity/boss/ender_dragon.rs",
    villager: "entity/passive/villager/mod.rs",
    fox: "entity/passive/fox/mod.rs",
    camel_husk: "entity/passive/camel.rs",
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
    experience_bottle: "entity/projectile/experience_bottle.rs",
  };
  if (overrides[id]) return ensureSource(id, `${ROOT}/` + overrides[id]);
  if (/_(chest_)?(boat|raft)$/.test(id)) return ensureSource(id, `${ROOT}/entity/vehicle/boat.rs`);
  const hit = entityFiles.find((f) => path.basename(f) === `${id}.rs`);
  return hit ? rel(hit) : null;
}

// Discovery metadata only. Behaviour assessments live in tracker-audits.json.
const ENTITY_METADATA = {
  "zombie": {"group": "Hostile", "issues": [1336]},
  "husk": {"group": "Hostile"},
  "zombie_villager": {"group": "Hostile"},
  "drowned": {"group": "Hostile", "issues": [3069, 2162]},
  "zombified_piglin": {"group": "Hostile"},
  "skeleton": {"group": "Hostile", "issues": [2537]},
  "stray": {"group": "Hostile"},
  "bogged": {"group": "Hostile"},
  "parched": {"group": "Hostile"},
  "wither_skeleton": {"group": "Hostile"},
  "spider": {"group": "Hostile"},
  "cave_spider": {"group": "Hostile"},
  "enderman": {"group": "Hostile", "issues": [2872]},
  "creeper": {"group": "Hostile"},
  "blaze": {"group": "Hostile", "issues": [1960]},
  "vex": {"group": "Hostile"},
  "phantom": {"group": "Hostile"},
  "guardian": {"group": "Hostile"},
  "elder_guardian": {"group": "Hostile"},
  "magma_cube": {"group": "Hostile"},
  "slime": {"group": "Hostile"},
  "sulfur_cube": {"group": "Hostile", "issues": [3114]},
  "ghast": {"group": "Hostile"},
  "happy_ghast": {"group": "Passive"},
  "endermite": {"group": "Hostile"},
  "silverfish": {"group": "Hostile"},
  "witch": {"group": "Hostile", "issues": [1302]},
  "illusioner": {"group": "Hostile"},
  "vindicator": {"group": "Hostile"},
  "pillager": {"group": "Hostile"},
  "evoker": {"group": "Hostile"},
  "ravager": {"group": "Hostile"},
  "piglin": {"group": "Hostile", "issues": [3376]},
  "piglin_brute": {"group": "Hostile"},
  "hoglin": {"group": "Hostile"},
  "zoglin": {"group": "Hostile"},
  "warden": {"group": "Hostile"},
  "breeze": {"group": "Hostile"},
  "creaking": {"group": "Hostile"},
  "shulker": {"group": "Hostile"},
  "giant": {"group": "Hostile"},
  "bat": {"group": "Passive"},
  "wither": {"group": "Boss"},
  "ender_dragon": {"group": "Boss"},
  "cow": {"group": "Passive"},
  "pig": {"group": "Passive"},
  "sheep": {"group": "Passive", "issues": [4214]},
  "chicken": {"group": "Passive"},
  "mooshroom": {"group": "Passive"},
  "wolf": {"group": "Passive", "issues": [2998, 2789]},
  "cat": {"group": "Passive"},
  "ocelot": {"group": "Passive"},
  "parrot": {"group": "Passive"},
  "rabbit": {"group": "Passive"},
  "polar_bear": {"group": "Passive"},
  "fox": {"group": "Passive"},
  "panda": {"group": "Passive"},
  "horse": {"group": "Passive"},
  "donkey": {"group": "Passive"},
  "mule": {"group": "Passive"},
  "skeleton_horse": {"group": "Passive"},
  "zombie_horse": {"group": "Passive"},
  "llama": {"group": "Passive"},
  "trader_llama": {"group": "Passive"},
  "turtle": {"group": "Passive"},
  "strider": {"group": "Passive"},
  "cod": {"group": "Passive", "issues": [4200]},
  "salmon": {"group": "Passive", "issues": [4213]},
  "tropical_fish": {"group": "Passive", "issues": [4222]},
  "pufferfish": {"group": "Passive", "issues": [4240]},
  "squid": {"group": "Passive", "issues": [4218]},
  "glow_squid": {"group": "Passive", "issues": [4205]},
  "dolphin": {"group": "Passive"},
  "tadpole": {"group": "Passive"},
  "axolotl": {"group": "Passive"},
  "frog": {"group": "Passive"},
  "bee": {"group": "Passive"},
  "allay": {"group": "Passive", "issues": [4189]},
  "armadillo": {"group": "Passive"},
  "camel": {"group": "Passive"},
  "copper_golem": {"group": "Passive"},
  "goat": {"group": "Passive"},
  "sniffer": {"group": "Passive"},
  "nautilus": {"group": "Passive"},
  "zombie_nautilus": {"group": "Passive"},
  "camel_husk": {"group": "Passive"},
  "iron_golem": {"group": "Passive", "issues": [3430]},
  "snow_golem": {"group": "Passive"},
  "villager": {"group": "Villager"},
  "wandering_trader": {"group": "Villager", "issues": [3364, 3083]},
  "mannequin": {"group": "Villager"},
  "arrow": {"group": "Projectile"},
  "spectral_arrow": {"group": "Projectile"},
  "trident": {"group": "Projectile"},
  "snowball": {"group": "Projectile"},
  "egg": {"group": "Projectile"},
  "ender_pearl": {"group": "Projectile"},
  "experience_bottle": {"group": "Projectile"},
  "fireball": {"group": "Projectile"},
  "small_fireball": {"group": "Projectile"},
  "dragon_fireball": {"group": "Projectile"},
  "wither_skull": {"group": "Projectile"},
  "shulker_bullet": {"group": "Projectile"},
  "llama_spit": {"group": "Projectile"},
  "evoker_fangs": {"group": "Projectile"},
  "eye_of_ender": {"group": "Projectile"},
  "wind_charge": {"group": "Projectile"},
  "breeze_wind_charge": {"group": "Projectile"},
  "splash_potion": {"group": "Projectile"},
  "lingering_potion": {"group": "Projectile"},
  "firework_rocket": {"group": "Projectile"},
  "fishing_bobber": {"group": "Projectile"},
  "armor_stand": {"group": "Decoration"},
  "item_frame": {"group": "Decoration"},
  "glow_item_frame": {"group": "Decoration"},
  "painting": {"group": "Decoration"},
  "block_display": {"group": "Decoration"},
  "cushion": {"group": "Decoration"},
  "item_display": {"group": "Decoration"},
  "text_display": {"group": "Decoration"},
  "end_crystal": {"group": "Decoration"},
  "leash_knot": {"group": "Decoration"},
  "marker": {"group": "Decoration"},
  "interaction": {"group": "Decoration"},
  "item": {"group": "Misc"},
  "experience_orb": {"group": "Misc"},
  "falling_block": {"group": "Misc"},
  "tnt": {"group": "Misc"},
  "lightning_bolt": {"group": "Misc"},
  "area_effect_cloud": {"group": "Misc"},
  "ominous_item_spawner": {"group": "Misc"},
  "minecart": {"group": "Vehicle"},
  "chest_minecart": {"group": "Vehicle"},
  "furnace_minecart": {"group": "Vehicle"},
  "hopper_minecart": {"group": "Vehicle"},
  "tnt_minecart": {"group": "Vehicle"},
  "command_block_minecart": {"group": "Vehicle"},
  "spawner_minecart": {"group": "Vehicle"},
};

const vanilla = JSON.parse(fs.readFileSync(path.join(PUMPKIN, "assets/entities.json"), "utf8"));
const entityIds = Object.keys(vanilla).filter((id) => id !== "player");
for (const id of entityIds) {
  if (/_(chest_)?(boat|raft)$/.test(id)) ENTITY_METADATA[id] = { group: "Vehicle" };
}

const GROUP_ORDER = ["Hostile", "Boss", "Passive", "Villager", "Projectile", "Vehicle", "Decoration", "Misc"];
const entityEntries = entityIds
  .map((id) => {
    const { group = "Misc", issues = [] } = ENTITY_METADATA[id] ?? {};
    const entry = { id, name: humanize(id), group, status: "unknown" };
    const source = entitySource(id);
    if (source) entry.source = source;
    if (issues.length) entry.issues = issues;
    return entry;
  })
  .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name));

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
  bonemealable_feature_placer: "Moss & Pale Moss",
  huge_mushroom: "Huge Mushroom Blocks",
};
const BLOCK_ISSUES = {
  bed: [4344, 3888, 3581, 3521],
  campfire: [4178, 3020],
  chests: [4288, 4011, 3902, 3545],
  chiseled_bookshelf: [3847, 3646],
  composter: [4342, 4129, 3293],
  crafting_table: [3917],
  dirt_path: [3580, 3560],
  dripstone: [3377],
  falling: [3672, 2467],
  farmland: [3580, 3560, 3111],
  "fire-fire": [4478, 4451, 3772, 3659],
  furnace: [4496, 4491, 4340, 4339, 2976],
  hopper: [4343, 4342, 4341, 4340, 4339, 3881],
  ice: [3781],
  infested: [3615],
  jukebox: [4128, 3643, 3548],
  leaves: [3250],
  lectern: [2698],
  magma: [3837, 3099],
  nether_portal: [4197, 4194],
  "piston-piston": [4281, 3900, 3833, 3144],
  "plant-big_dripleaf": [3552],
  "plant-crop-sweet_berry_bush": [3292],
  "plant-crop-wheat": [3516],
  "plant-eyeblossom": [3065],
  "plant-lily_pad": [3557],
  "plant-mushroom_plant": [3060],
  "plant-sugar_cane": [3558],
  "redstone-bell": [3631, 3003, 3002],
  "redstone-buttons": [3838],
  "redstone-crafter": [4290],
  "redstone-dispenser": [3972, 3970, 3822, 3627, 3518],
  "redstone-lever": [3133],
  "redstone-observer": [3105],
  "redstone-tripwire": [3623, 3574],
  respawn_anchor: [3521, 3514],
  scaffolding: [1871],
  "sculk-sculk_shrieker": [3107],
  shulker_box: [4537, 4341],
  slabs: [4247],
  smithing_table: [4457],
  snow: [3855, 3837],
  stairs: [4247],
  stonecutter: [4458],
  tnt: [4084],
  torches: [3120],
  vault: [3989],
  weathering_copper: [3567],
};
const BLOCK_GROUPS = [
  ["Redstone", (p) => p.includes("/redstone/")],
  ["Plants & Crops", (p) => p.includes("/plant/") || p.includes("/coral/")],
  ["Fire & Sculk", (p) => p.includes("/fire/") || p.includes("/sculk/")],
  ["Pistons", (p) => p.includes("/piston/")],
  ["Blocks", () => true],
];

const blockEntries = [];
for (const file of walk(path.join(SRC, "block/blocks")).sort()) {
  const base = path.basename(file, ".rs");
  if (BLOCK_SKIP.has(base)) continue;
  const txt = fs.readFileSync(file, "utf8");
  if (!/impl BlockBehaviour for/.test(txt) && !/pumpkin_block/.test(txt)) continue;
  const r = rel(file);
  const group = BLOCK_GROUPS.find(([, test]) => test(r))[0];
  const ids = declaredIds(txt, "Block");
  const id = path.relative(path.join(SRC, "block/blocks"), file).replace(/\\/g, "/").replace(/\.rs$/, "").replace(/\//g, "-");
  const entry = {
    id,
    name: BLOCK_NAMES[base] || humanize(base),
    group,
    status: "unknown",
    source: r,
  };
  if (ids.length) entry.ids = ids;
  if (BLOCK_ISSUES[id]?.length) entry.issues = BLOCK_ISSUES[id];
  blockEntries.push(entry);
}
blockEntries.push(
  { id: "lodestone", name: "Lodestone", group: "Blocks", status: "unknown", source: ensureSource("lodestone", `${ROOT}/item/items/compass.rs`) },
);
blockEntries.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

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
const ITEM_ISSUES = {
  armor_stand: [3614],
  arrow: [4487, 3489, 3388],
  axe: [3567, 3039],
  boat: [4386, 3577, 3082, 3068, 3061],
  bucket: [4491, 4138, 3973, 3971, 3969, 3933],
  bundle: [4388],
  crossbow: [3844],
  elytra: [3899, 3648, 3647, 3070, 1807, 1551],
  end_crystal: [3690],
  ender_pearl: [4187],
  firework_rocket: [4089, 1551],
  fishing_rod: [3522, 3051],
  goat_horn: [3113],
  hanging_entity: [4522, 3767, 3622, 3108, 3103],
  hoe: [3039],
  lead: [4546, 4545],
  minecart: [3880, 3071],
  potions: [4296, 3806],
  shears: [3830, 3574, 3081],
  shield: [3520],
  shovel: [3039],
  spawn_egg: [4550, 4036, 2536],
  spear: [4454],
  swords: [4477, 3062],
  totem_of_undying: [4320, 4135, 4134],
  trident: [4456, 3918, 1552],
  wind_charge: [3873],
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
  const ids = declaredIds(txt, "Item");
  const group = (ITEM_GROUPS.find(([, set]) => set.has(base)) || ITEM_GROUPS[ITEM_GROUPS.length - 1])[0];
  const entry = {
    id: base,
    name: ITEM_NAMES[base] || humanize(base),
    group,
    status: "unknown",
    source: rel(file),
  };
  if (ids.length) entry.ids = ids;
  if (ITEM_ISSUES[base]?.length) entry.issues = ITEM_ISSUES[base];
  itemEntries.push(entry);
}
itemEntries.push(
  { id: "elytra", name: "Elytra", group: "Utility", status: "unknown", source: ensureSource("elytra", `${ROOT}/entity/player.rs`), issues: ITEM_ISSUES.elytra },
  { id: "totem_of_undying", name: "Totem of Undying", group: "Utility", status: "unknown", source: ensureSource("totem_of_undying", `${ROOT}/entity/living.rs`), issues: ITEM_ISSUES.totem_of_undying },
  { id: "chorus_fruit", name: "Chorus Fruit", group: "Throwables", status: "unknown", source: ensureSource("chorus_fruit", `${ROOT}/entity/living.rs`) },
);
const ITEM_GROUP_ORDER = ITEM_GROUPS.map((g) => g[0]);
itemEntries.sort((a, b) => ITEM_GROUP_ORDER.indexOf(a.group) - ITEM_GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name));

const VANILLA_COMMANDS = [
  "advancement", "attribute", "ban", "ban-ip", "banlist", "bossbar", "clear", "clone", "damage", "data", "datapack", "debug",
  "defaultgamemode", "deop", "dialog", "difficulty", "effect", "enchant", "execute", "experience", "fetchprofile", "fill",
  "fillbiome", "forceload", "function", "gamemode", "gamerule", "give", "help", "item", "kick", "kill", "list", "locate",
  "loot", "me", "msg", "op", "pardon", "pardon-ip", "particle", "place", "playsound", "random", "recipe",
  "reload", "return", "ride", "rotate", "save-all", "save-off", "save-on", "say", "schedule", "scoreboard", "seed", "setblock",
  "setidletimeout", "setworldspawn", "spawnpoint", "spectate", "spreadplayers", "stop", "stopsound", "summon", "tag", "team",
  "teammsg", "teleport", "tell", "tellraw", "test", "tick", "time", "title", "tm", "tp", "transfer", "trigger", "version",
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
    status: "unknown",
  };
  if (exists) entry.source = `${ROOT}/command/commands/${file}.rs`;
  if (COMMAND_ALIASES[name] && exists) entry.note = `Alias of /${COMMAND_ALIASES[name] === "pumpkin" ? "pumpkin" : COMMAND_ALIASES[name]}.`;
  commandEntries.push(entry);
}
for (const name of Object.keys(PUMPKIN_COMMANDS)) {
  if (!commandFiles.has(name)) continue;
  commandEntries.push({ id: name, name: `/${name}`, group: "Pumpkin", status: "unknown", source: `${ROOT}/command/commands/${name}.rs` });
}

function checklist(rows) {
  return rows.map(([name, group, source]) => {
    const e = { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), name, group, status: "unknown" };
    if (source) e.source = ensureSource(name, source);
    return e;
  });
}

const BLK = `${ROOT}/block`;
const RED = `${BLK}/blocks/redstone`;
const ENT = `${ROOT}/entity`;
const WLD = `${ROOT}/world`;
const PW = "crates/pumpkin-world/src";

const redstoneEntries = checklist([
  ["Redstone wire signal propagation", "Core", `${RED}/redstone_wire.rs`],
  ["Redstone tick system", "Core", `${PW}/tick/scheduler.rs`],
  ["Hard vs. soft powering", "Core", `${RED}/mod.rs`],
  ["Pressure plates", "Power & Sensors", `${RED}/pressure_plate`],
  ["Tripwire hook", "Power & Sensors", `${RED}/tripwire_hook.rs`],
  ["Trapped chest", "Power & Sensors", `${BLK}/entities/trapped_chest.rs`],
  ["Sculk sensors, shriekers and calibrated sensors", "Power & Sensors", `${RED}/sculk_sensor.rs`],
  ["Daylight detector", "Power & Sensors", `${RED}/daylight_detector.rs`],
  ["Target block", "Power & Sensors", `${RED}/target_block.rs`],
  ["Redstone torch, levers and buttons", "Power & Sensors", `${RED}/redstone_torch.rs`],
  ["Comparator", "Logic & Timing", `${RED}/comparator.rs`],
  ["Repeater", "Logic & Timing", `${RED}/repeater.rs`],
  ["Note block", "Logic & Timing", `${BLK}/blocks/note.rs`],
  ["Hopper item transfer", "Logic & Timing", `${BLK}/entities/hopper.rs`],
  ["Observer", "Logic & Timing", `${RED}/observer.rs`],
  ["Rails", "Logic & Timing", `${RED}/rails`],
  ["Pistons and block swapping", "Mechanisms", `${BLK}/blocks/piston`],
  ["Dropper", "Mechanisms", `${RED}/dropper.rs`],
  ["Dispenser", "Mechanisms", `${RED}/dispenser.rs`],
  ["Crafter", "Mechanisms", `${RED}/crafter.rs`],
  ["Minecart powering and activation", "Mechanisms", `${ENT}/vehicle/minecart.rs`],
  ["TNT ignition and priming", "Mechanisms", `${BLK}/blocks/tnt.rs`],
  ["Bell", "Interactive", `${RED}/bell.rs`],
  ["Redstone lamp", "Interactive", `${RED}/redstone_lamp.rs`],
  ["Doors, gates and trapdoors", "Interactive", `${BLK}/blocks/doors.rs`],
  ["Lectern signal strength", "Interactive", `${BLK}/blocks/lectern.rs`],
  ["Composter signal strength", "Interactive", `${BLK}/blocks/composter.rs`],
]);

const combatEntries = checklist([
  ["Basic melee attack", "Core", `${ENT}/player.rs`],
  ["Tool-based damage calculation", "Core", `${ENT}/player.rs`],
  ["Vanilla knockback", "Core", `${ENT}/combat.rs`],
  ["Attack speed and cooldown indicator", "Core", `${ENT}/player.rs`],
  ["Bows", "Equipment", `${ROOT}/item/items/bow.rs`],
  ["Crossbows", "Equipment", `${ROOT}/item/items/crossbow.rs`],
  ["Shields", "Equipment", `${ROOT}/item/items/shield.rs`],
  ["Tridents", "Equipment", `${ROOT}/item/items/trident.rs`],
  ["Critical hits", "Mechanics", `${ENT}/combat.rs`],
  ["Damage invulnerability frames", "Mechanics", `${ENT}/living.rs`],
  ["Sweep attack", "Mechanics", `${ENT}/combat.rs`],
  ["Enchantment integration", "Mechanics", `${ROOT}/enchantment/helper.rs`],
  ["Status effect integration", "Mechanics", `${ENT}/effect/mod.rs`],
  ["1.8 combat mode", "Mechanics"],
]);

const worldEntries = checklist([
  ["World loading (level.dat, DIM1, DIM-1)", "Persistence", `${PW}/world_info/anvil.rs`],
  ["World saving", "Persistence", `${PW}/level.rs`],
  ["Chunk loading (vanilla, linear, pump)", "Persistence", `${PW}/chunk/format`],
  ["Chunk saving", "Persistence", `${PW}/chunk/io/file_manager.rs`],
  ["Chunk generation", "Persistence", `${PW}/generation/generator/mod.rs`],
  ["Flat world generation", "Persistence", `${PW}/generation/generator/flat.rs`],
  ["Redstone", "Logic & Physics", RED],
  ["Liquid physics", "Logic & Physics", `${BLK}/fluid`],
  ["Lighting", "Logic & Physics", `${PW}/lighting/engine.rs`],
  ["World time", "Logic & Physics", `${WLD}/time.rs`],
  ["World borders", "Logic & Physics", `${WLD}/border.rs`],
  ["World joining", "Logic & Physics", `${WLD}/mod.rs`],
  ["Player tab list", "Logic & Physics", `${WLD}/mod.rs`],
  ["Scoreboard", "Logic & Physics", `${WLD}/scoreboard.rs`],
  ["Bossbar", "Logic & Physics", `${WLD}/bossbar.rs`],
  ["Entity spawning", "Logic & Physics", `${WLD}/natural_spawner.rs`],
]);

const knownIssues = new Map();
if (fs.existsSync(OUT)) {
  for (const category of JSON.parse(fs.readFileSync(OUT, "utf8")).categories) {
    for (const entry of category.entries) for (const issue of entry.issues ?? []) knownIssues.set(issue.number, issue);
  }
}

async function issueInfo(number) {
  if (process.env.TRACKER_OFFLINE === "1") return knownIssues.get(number) ?? { number };
  const headers = { accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const response = await fetch(`https://api.github.com/repos/Pumpkin-MC/Pumpkin/issues/${number}`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { title, state, pull_request: pr } = await response.json();
    return { number, title, state: pr?.merged_at ? "merged" : state, ...(pr && { pr: true }) };
  } catch (error) {
    console.warn(`Could not look up #${number}: ${error.message}, keeping the last known details`);
    return knownIssues.get(number) ?? { number };
  }
}

for (const entry of [...entityEntries, ...blockEntries, ...itemEntries]) {
  if (entry.issues) entry.issues = await Promise.all(entry.issues.map(issueInfo));
}

const out = {
  version: mcVersion,
  commit,
  updated: commitDate,
  categories: [
    { id: "entities", label: "Entities", unit: "entities", tracking: 3468, description: `All ${entityEntries.length} entity types in the ${mcVersion} registry, with source reviews where available. Registry presence alone does not establish behaviour parity.`, entries: entityEntries },
    { id: "blocks", label: "Blocks", unit: "block behaviours", tracking: 4559, description: "Block behaviour files discovered in the server source, plus explicitly tracked gaps. File discovery is not a complete vanilla block audit.", entries: blockEntries },
    { id: "items", label: "Items", unit: "item behaviours", tracking: 4560, description: "Item behaviour files discovered in the server source, plus selected shared mechanics. File discovery is not a complete vanilla item audit.", entries: itemEntries },
    { id: "commands", label: "Commands", unit: "commands", tracking: 15, description: "Curated Java command inventory and Pumpkin extras. A matching filename does not establish command or alias parity.", entries: commandEntries },
    { id: "redstone", label: "Redstone", unit: "components", tracking: 1402, description: "Inventory of redstone components and mechanics; assessments require a source review.", entries: redstoneEntries },
    { id: "combat", label: "Combat", unit: "mechanics", tracking: 1404, description: "Inventory of melee, ranged and damage mechanics; assessments require a source review.", entries: combatEntries },
    { id: "world", label: "World", unit: "systems", tracking: 1403, description: "Inventory of persistence, physics and world systems; assessments require a source review.", entries: worldEntries },
  ],
};

for (const category of out.categories) {
  category.entries = category.entries.map((entry) => {
    const key = `${category.id}:${entry.id}`;
    const result = assess(entry, audits.entries[key], PUMPKIN, baseline.entries[key], baseline.commit);
    // The existing tracker renders three statuses. An unreviewed change is
    // incomplete evidence, not proof that a feature is absent or planned.
    if (result.status === "unknown") result.status = "partial";
    return result;
  });
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

for (const c of out.categories) {
  const n = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const e of c.entries) n[e.status]++;
  console.log(`${c.label.padEnd(10)} ${String(c.entries.length).padStart(4)} total  ${String(n.done).padStart(4)} done  ${String(n.partial).padStart(4)} partial  ${String(n.planned).padStart(4)} planned  ${String(n.unknown).padStart(4)} needs audit`);
}
