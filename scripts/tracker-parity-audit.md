# Tracker parity audit

Pumpkin snapshot: `e0cb7c01fbab5892d9dbbed0ef574c59c977d07f`. Vanilla reference: Lantern local index `26.3-pre-1`.

Source comparison only. These are implementation differences, not results of a live-client test. Later-version behaviour needs a matching vanilla reference.

Reviewed so far: 143 / 143 initially partial entries.

## blocks:bed

Assessment: **partial**. Sleeping and occupied-bed checks exist. The occupied-bed path still sends the occupied message without waking the villager.

- [x] Placement, occupation and player sleeping
- [ ] Wake a villager occupying the bed

Pumpkin: [crates/pumpkin-core/src/block/blocks/bed.rs:68](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/bed.rs#L68).
Vanilla: Lantern `BedBlock` (`26.3-pre-1`).

## blocks:campfire

Assessment: **partial**. Cooking and collision damage exist. There is no on_projectile_hit handler to light an unlit campfire with a burning projectile.

- [x] Placement, cooking inventory and collision damage
- [ ] Ignition from burning projectile impact

Pumpkin: [crates/pumpkin-core/src/block/blocks/campfire.rs:27](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/campfire.rs#L27).
Pumpkin: [crates/pumpkin-core/src/block/entities/campfire.rs:27](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/campfire.rs#L27).
Vanilla: Lantern `CampfireBlock` (`26.3-pre-1`).

## blocks:chests

Assessment: **partial**. Chest opening checks the block above, but does not check a sitting cat. This is a gameplay gap, not a TODO-count assessment.

- [x] Single/double inventory, opening and comparator output
- [ ] Prevent opening with a sitting cat above

Pumpkin: [crates/pumpkin-core/src/block/blocks/chests.rs:39](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/chests.rs#L39).
Vanilla: Lantern `ChestBlock` (`26.3-pre-1`).

## blocks:chiseled_bookshelf

Assessment: **partial**. Book storage and last-interacted-slot comparator handling exist. try_add_book does not increment the player used-block statistic.

- [x] Slot-based book insertion/removal and comparator output
- [ ] Increment the used-block statistic on inserting a book

Pumpkin: [crates/pumpkin-core/src/block/blocks/chiseled_bookshelf.rs:30](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/chiseled_bookshelf.rs#L30).
Vanilla: Lantern `ChiseledBookShelfBlock` (`26.3-pre-1`).

## blocks:conduit

Assessment: **partial**. The block and block entity store placement/NBT state but have no ticking activation or conduit-power/attack implementation.

- [x] Waterlogged placement and block-entity NBT
- [ ] Frame activation, conduit-power application and hostile targeting

Pumpkin: [crates/pumpkin-core/src/block/blocks/conduit.rs:11](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/conduit.rs#L11).
Pumpkin: [crates/pumpkin-core/src/block/entities/conduit.rs:14](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/conduit.rs#L14).
Vanilla: Lantern `ConduitBlock` (`26.3-pre-1`).

## blocks:dirt_path

Assessment: **partial**. Obstructed paths turn to dirt on a scheduled tick. Conversion does not push entities up, and the placement predicate lacks the vanilla fence-gate exception.

- [x] Conversion to dirt when obstructed
- [ ] Displace entities when converting and allow fence gates above

Pumpkin: [crates/pumpkin-core/src/block/blocks/dirt_path.rs:16](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/dirt_path.rs#L16).
Vanilla: Lantern `PathBlock` (`26.3-pre-1`).

## blocks:ender_chest

Assessment: **partial**. Personal inventory works. The opening path lacks the guarded-block interaction that angers piglins. Sitting cats do not obstruct vanilla ender chests, so that is not a parity gap.

- [x] Personal inventory and opening animation
- [ ] Piglin guarded-block reaction

Pumpkin: [crates/pumpkin-core/src/block/blocks/ender_chest.rs:29](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/ender_chest.rs#L29).
Vanilla: Lantern `EnderChestBlock` (`26.3-pre-1`).

## blocks:farmland

Assessment: **partial**. Rain hydration is implemented. Remaining differences are entity displacement on dirt conversion, the fence-gate exception and checking water blocks instead of fluid states.

- [x] Rain/water hydration, drying and dirt conversion
- [ ] Entity displacement, fence-gate exception and fluid-aware water checks

Pumpkin: [crates/pumpkin-core/src/block/blocks/farmland.rs:25](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/farmland.rs#L25).
Vanilla: Lantern `FarmlandBlock` (`26.3-pre-1`).

## blocks:infested

Assessment: **partial**. Breaking directly constructs a generic Entity with the silverfish type, bypassing SilverfishEntity AI, and does not check Silk Touch. The remaining issue is not just an internal hook TODO.

- [x] Silverfish spawning when broken outside Creative
- [ ] Spawn the specialised silverfish AI and respect Silk Touch

Pumpkin: [crates/pumpkin-core/src/block/blocks/infested.rs:15](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/infested.rs#L15).
Vanilla: Lantern `InfestedBlock` (`26.3-pre-1`).

## blocks:jukebox

Assessment: **partial**. Records and signal output exist. Insertion lacks the block-change game event, and on_state_replaced does not notify comparators.

- [x] Record insertion/ejection, playback and redstone/comparator output
- [ ] Block-change game events and comparator update on replacement

Pumpkin: [crates/pumpkin-core/src/block/blocks/jukebox.rs:29](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/jukebox.rs#L29).
Pumpkin: [crates/pumpkin-core/src/block/entities/jukebox.rs:31](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/jukebox.rs#L31).
Vanilla: Lantern `JukeboxBlock` (`26.3-pre-1`).

## blocks:shulker_box

Assessment: **partial**. The inventory works, but the synced event handler explicitly lacks the closing-state restriction. Source review does not establish full lid/collision parity.

- [x] Inventory opening, placement and comparator output
- [ ] Prevent reopening during closing animation

Pumpkin: [crates/pumpkin-core/src/block/blocks/shulker_box.rs:28](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/shulker_box.rs#L28).
Pumpkin: [crates/pumpkin-core/src/block/entities/shulker_box.rs:27](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/shulker_box.rs#L27).
Vanilla: Lantern `ShulkerBoxBlock` (`26.3-pre-1`).

## blocks:structure_block

Assessment: **partial**. The block and block entity store configuration. They do not implement capture or placement of structure contents.

- [x] Settings screen and NBT persistence
- [ ] Structure capture/save/load execution

Pumpkin: [crates/pumpkin-core/src/block/blocks/structure_block.rs:13](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/structure_block.rs#L13).
Pumpkin: [crates/pumpkin-core/src/block/entities/structure_block.rs:30](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/structure_block.rs#L30).
Vanilla: Lantern `StructureBlockEntity` (`26.3-pre-1`).

## blocks:fire-fire

Assessment: **partial**. Fire spread exists. Increased burnout is hardcoded to biome IDs, whereas the Lantern reference reads the environment attribute at the position.

- [x] Scheduled spread, rain extinguishing and burning
- [ ] Environment-attribute driven increased fire burnout

Pumpkin: [crates/pumpkin-core/src/block/blocks/fire/fire.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/fire/fire.rs#L33).
Vanilla: Lantern `FireBlock` (`26.3-pre-1`).

## blocks:sculk-sculk_catalyst

Assessment: **partial**. Only the placement state is implemented; no death listener or sculk-spreading block entity is present.

- [x] Placement state
- [ ] Mob-death listener, experience absorption and sculk spreading

Pumpkin: [crates/pumpkin-core/src/block/blocks/sculk/sculk_catalyst.rs:7](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/sculk/sculk_catalyst.rs#L7).
Vanilla: Lantern `SculkCatalystBlock` (`26.3-pre-1`).

## blocks:piston-piston_extension

Assessment: **partial**. Head/base removal exists. break_block receives no player, losing the player context; the piston system also has separate movement/persistence gaps.

- [x] Remove an extended piston base when its head is broken
- [ ] Pass the breaking player through to base removal

Pumpkin: [crates/pumpkin-core/src/block/blocks/piston/piston_extension.rs:15](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/piston/piston_extension.rs#L15).
Vanilla: Lantern `MovingPistonBlock` (`26.3-pre-1`).

## blocks:piston-piston_head

Assessment: **partial**. Head/base removal exists. break_block receives no player, losing the player context; the piston system also has separate movement/persistence gaps.

- [x] Remove an extended piston base when its head is broken
- [ ] Pass the breaking player through to base removal

Pumpkin: [crates/pumpkin-core/src/block/blocks/piston/piston_head.rs:17](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/piston/piston_head.rs#L17).
Vanilla: Lantern `PistonHeadBlock` (`26.3-pre-1`).

## blocks:piston-piston

Assessment: **partial**. Pushing and retraction code exist, so calling the whole system broken is too broad. Movement checks and rapid retraction remain incomplete; moving-piston NBT read/write still omit the moved block state.

- [x] Extension/retraction, block movement and block-event handling
- [ ] Complete movement checks and moving-piston state persistence

Pumpkin: [crates/pumpkin-core/src/block/blocks/piston/piston.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/piston/piston.rs#L33).
Pumpkin: [crates/pumpkin-core/src/block/entities/piston.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/piston.rs#L26).
Vanilla: Lantern `PistonBaseBlock` (`26.3-pre-1`).

## redstone:pistons-and-block-swapping

Assessment: **partial**. Pushing and retraction code exist, so calling the whole system broken is too broad. Movement checks and rapid retraction remain incomplete; moving-piston NBT read/write still omit the moved block state.

- [x] Extension/retraction, block movement and block-event handling
- [ ] Complete movement checks and moving-piston state persistence

Pumpkin: [crates/pumpkin-core/src/block/blocks/piston/piston.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/piston/piston.rs#L33).
Pumpkin: [crates/pumpkin-core/src/block/entities/piston.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/piston.rs#L26).
Vanilla: Lantern `PistonBaseBlock` (`26.3-pre-1`).

## blocks:plant-big_dripleaf

Assessment: **partial**. Step-triggered tilt and timed/reset behaviour exist. The block has no projectile-hit tilt handler.

- [x] Entity-triggered tilt, reset and redstone handling
- [ ] Projectile-triggered tilt

Pumpkin: [crates/pumpkin-core/src/block/blocks/plant/big_dripleaf.rs:31](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/plant/big_dripleaf.rs#L31).
Vanilla: Lantern `BigDripleafBlock` (`26.3-pre-1`).

## blocks:plant-lily_pad

Assessment: **partial**. Placement checks block IDs instead of fluid states. Collision recognises names ending in _boat, excluding bamboo rafts that vanilla treats as AbstractBoat.

- [x] Water/ice support and boat collision breakage
- [ ] Fluid-state support and raft collision breakage

Pumpkin: [crates/pumpkin-core/src/block/blocks/plant/lily_pad.rs:15](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/plant/lily_pad.rs#L15).
Vanilla: Lantern `LilyPadBlock` (`26.3-pre-1`).

## blocks:plant-crop-gourds-stem

Assessment: **partial**. Growth and fruit placement exist, but random_tick omits the vanilla light check.

- [x] Growth, fruit placement and bonemeal
- [ ] Light-level gating of random growth

Pumpkin: [crates/pumpkin-core/src/block/blocks/plant/crop/gourds/stem.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/plant/crop/gourds/stem.rs#L26).
Vanilla: Lantern `StemBlock` (`26.3-pre-1`).

## blocks:plant-sea_pickles

Assessment: **partial**. The spread loop keeps its Z span at one because span adjustments are commented out. Lantern uses a growing/shrinking 1/3/5/3/1 span. The random-generator TODO is not the reason for partial.

- [x] Stacking, waterlogging and bonemeal spread
- [ ] Vanilla bonemeal spread footprint

Pumpkin: [crates/pumpkin-core/src/block/blocks/plant/sea_pickles.rs:24](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/plant/sea_pickles.rs#L24).
Vanilla: Lantern `SeaPickleBlock` (`26.3-pre-1`).

## blocks:plant-sugar_cane

Assessment: **partial**. Growth works, but support tests block tags rather than the adjacent fluid state. Waterlogged support is not covered by the current predicate.

- [x] Age-based growth, height limit and support updates
- [ ] Fluid-aware adjacent water support

Pumpkin: [crates/pumpkin-core/src/block/blocks/plant/sugar_cane.rs:19](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/plant/sugar_cane.rs#L19).
Vanilla: Lantern `SugarCaneBlock` (`26.3-pre-1`).

## blocks:redstone-rails-activator_rail

Assessment: **partial**. Rail propagation exists. Both implementations document incorrect extension when a redstone source is placed at intermediate powered positions.

- [x] Connected-rail power propagation and neighbour updates
- [ ] Vanilla rail power-extension boundary

Pumpkin: [crates/pumpkin-core/src/block/blocks/redstone/rails/activator_rail.rs:41](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/redstone/rails/activator_rail.rs#L41).
Vanilla: Lantern `PoweredRailBlock` (`26.3-pre-1`).

## blocks:redstone-rails-powered_rail

Assessment: **partial**. Rail propagation exists. Both implementations document incorrect extension when a redstone source is placed at intermediate powered positions.

- [x] Connected-rail power propagation and neighbour updates
- [ ] Vanilla rail power-extension boundary

Pumpkin: [crates/pumpkin-core/src/block/blocks/redstone/rails/powered_rail.rs:41](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/redstone/rails/powered_rail.rs#L41).
Vanilla: Lantern `PoweredRailBlock` (`26.3-pre-1`).

## blocks:redstone-bell

Assessment: **partial**. Ringing paths exist, but ring_bell does not emit the required game event.

- [x] Interaction/projectile/redstone ringing
- [ ] Activation game events

Pumpkin: [crates/pumpkin-core/src/block/blocks/redstone/bell.rs:22](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/redstone/bell.rs#L22).
Pumpkin: [crates/pumpkin-core/src/block/entities/bell.rs:23](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/bell.rs#L23).
Vanilla: Lantern `BellBlock` (`26.3-pre-1`).

## blocks:redstone-dispenser

Assessment: **partial**. Specialised dispensing covers many items. Unsupported bonemeal/experience/chest/brush cases use the generic drop fallback; filled entity buckets do not spawn their stored entity.

- [x] Redstone triggering, inventory and specialised dispensing
- [ ] Bonemeal, experience bottles, llama chests, armadillo brushing and bucket-contained entity spawning

Pumpkin: [crates/pumpkin-core/src/block/blocks/redstone/dispenser.rs:85](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/redstone/dispenser.rs#L85).
Pumpkin: [crates/pumpkin-core/src/block/entities/dispenser.rs:21](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/dispenser.rs#L21).
Vanilla: Lantern `DispenserBlock` (`26.3-pre-1`).

## blocks:redstone-tripwire

Assessment: **partial**. Detection and hook updates exist. Disarming omits shears durability/game events, and scheduled collision checks do not filter entities that avoid traps.

- [x] Entity detection, hook connection and disarming
- [ ] Shears durability/game event and trap-avoidance filtering

Pumpkin: [crates/pumpkin-core/src/block/blocks/redstone/tripwire.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/redstone/tripwire.rs#L26).
Vanilla: Lantern `TripWireBlock` (`26.3-pre-1`).

## blocks:redstone-tripwire_hook

Assessment: **partial**. Wire scanning, attachment and signal output exist. Transition sounds lack the matching game events.

- [x] Attachment, redstone output and transition sounds
- [ ] Activation/deactivation/attachment game events

Pumpkin: [crates/pumpkin-core/src/block/blocks/redstone/tripwire_hook.rs:31](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/redstone/tripwire_hook.rs#L31).
Vanilla: Lantern `TripWireHookBlock` (`26.3-pre-1`).

## entities:blaze

Assessment: **partial**. Fireball attacks and airborne handling exist. The constructor has no movement towards the restricted area used by the vanilla goal set.

- [x] Fireball attacks, player targeting and airborne descent damping
- [ ] Return towards a restricted/home area

Pumpkin: [crates/pumpkin-core/src/entity/mob/blaze.rs:23](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/blaze.rs#L23).
Vanilla: Lantern `Blaze` (`26.3-pre-1`).

## entities:breeze

Assessment: **partial**. The runtime has basic goals but no wind-charge attack, combat jump or slide behaviour.

- [x] Basic movement and player targeting
- [ ] Wind-charge combat, jumping and sliding

Pumpkin: [crates/pumpkin-core/src/entity/mob/breeze.rs:19](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/breeze.rs#L19).
Vanilla: Lantern `Breeze` (`26.3-pre-1`).

## entities:spider

Assessment: **partial**. Targeting is daylight-gated. The runtime registers no leap or armadillo avoidance behaviour; these are actual missing interactions, not a Brain migration requirement.

- [x] Melee and daylight-gated player/iron-golem targeting
- [ ] Leaping and armadillo avoidance

Pumpkin: [crates/pumpkin-core/src/entity/mob/spider.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/spider.rs#L37).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/active_target.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/active_target.rs#L35).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/spider_attack.rs:14](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/spider_attack.rs#L14).
Vanilla: Lantern `Spider` (`26.3-pre-1`).

## entities:cave_spider

Assessment: **partial**. Targeting is daylight-gated. The runtime registers no leap or armadillo avoidance behaviour; these are actual missing interactions, not a Brain migration requirement.

- [x] Melee and daylight-gated player/iron-golem targeting
- [ ] Leaping and armadillo avoidance

Pumpkin: [crates/pumpkin-core/src/entity/mob/cave_spider.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/cave_spider.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/active_target.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/active_target.rs#L35).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/spider_attack.rs:14](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/spider_attack.rs#L14).
Vanilla: Lantern `CaveSpider` (`26.3-pre-1`).

## entities:creaking

Assessment: **partial**. Gaze changes call stop_in_place once. Shared AI continues ticking goals/navigation without a can_move gate, so the frozen flag does not continuously suppress movement/attacks. Brain migration alone was a misleading gap.

- [x] Heart binding, gaze detection and teardown effects
- [ ] Keep navigation and attacks disabled throughout the frozen state

Pumpkin: [crates/pumpkin-core/src/entity/mob/creaking.rs:60](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/creaking.rs#L60).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Creaking` (`26.3-pre-1`).

## entities:creeper

Assessment: **partial**. Explosion handling explicitly omits the area-effect cloud for active potion effects.

- [x] Fuse, ignition, charged state and explosion
- [ ] Spawn a potion-effect cloud after exploding

Pumpkin: [crates/pumpkin-core/src/entity/mob/creeper.rs:42](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/creeper.rs#L42).
Vanilla: Lantern `Creeper` (`26.3-pre-1`).

## entities:drowned

Assessment: **partial**. The wrapper inherits zombie goals but adds neither the ranged trident attack nor water/land navigation switching.

- [x] Inherited zombie melee and targeting
- [ ] Trident attacks and underwater-specific movement

Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/drowned.rs:15](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/drowned.rs#L15).
Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/mod.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/mod.rs#L37).
Vanilla: Lantern `Drowned` (`26.3-pre-1`).

## entities:guardian

Assessment: **partial**. The source has targets and retaliation, but no beam attack or guardian swimming controller. Elder guardian also applies mining fatigue; the two entities are not look-only scaffolds.

- [x] Targeting and retaliation damage
- [ ] Beam attack and water-specific swimming

Pumpkin: [crates/pumpkin-core/src/entity/mob/guardian.rs:22](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/guardian.rs#L22).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Guardian` (`26.3-pre-1`).

## entities:elder_guardian

Assessment: **partial**. The source has targets and retaliation, but no beam attack or guardian swimming controller. Elder guardian also applies mining fatigue; the two entities are not look-only scaffolds.

- [x] Targeting and retaliation damage
- [ ] Beam attack and water-specific swimming

Pumpkin: [crates/pumpkin-core/src/entity/mob/elder_guardian.rs:25](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/elder_guardian.rs#L25).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `ElderGuardian` (`26.3-pre-1`).

## entities:enderman

Assessment: **partial**. Teleportation validates collision, ground and liquid state. Sunlight avoidance and carried-block drops remain explicitly incomplete.

- [x] Stare/player chase, anger reset and validated teleportation
- [ ] Sunlight avoidance and dropping the carried block on death

Pumpkin: [crates/pumpkin-core/src/entity/mob/enderman.rs:53](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/enderman.rs#L53).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/active_target.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/active_target.rs#L35).
Vanilla: Lantern `Enderman` (`26.3-pre-1`).

## entities:endermite

Assessment: **partial**. The goal list omits powder-snow escape and revenge. The lifetime counter removes the entity at 2400 ticks without the vanilla persistence-required guard.

- [x] Melee, player targeting and lifetime persistence
- [ ] Powder-snow escape, revenge targeting and persistence-aware lifetime

Pumpkin: [crates/pumpkin-core/src/entity/mob/endermite.rs:23](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/endermite.rs#L23).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Endermite` (`26.3-pre-1`).

## entities:evoker

Assessment: **partial**. Spell implementations are present; the previous raid-only checklist hid them. The constructor lacks player avoidance and revenge targeting.

- [x] Fang/summon/wololo spell goals and raid movement
- [ ] Avoid nearby players and retaliate against attackers

Pumpkin: [crates/pumpkin-core/src/entity/mob/evoker.rs:42](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/evoker.rs#L42).
Vanilla: Lantern `Evoker` (`26.3-pre-1`).

## entities:hoglin

Assessment: **partial**. Conversion and attack launch exist. The goal/runtime paths do not implement the repellent/retreat activities shown by the vanilla AI.

- [x] Melee launch and conversion to zoglin
- [ ] Repellent avoidance and retreat behaviour

Pumpkin: [crates/pumpkin-core/src/entity/mob/hoglin.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/hoglin.rs#L33).
Vanilla: Lantern `Hoglin` (`26.3-pre-1`).

## entities:husk

Assessment: **partial**. The wrapper has no hunger attack hook or submerged conversion timer; inheriting zombie melee does not provide these husk-specific behaviours.

- [x] Inherited zombie behaviour and baby/NBT handling
- [ ] Hunger on attacks and submerged conversion to zombie

Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/husk.rs:15](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/husk.rs#L15).
Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/mod.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/mod.rs#L37).
Vanilla: Lantern `Husk` (`26.3-pre-1`).

## entities:illusioner

Assessment: **partial**. The source has no ranged-bow goal, spell state or spell handlers. Raid movement does not establish illusioner combat.

- [x] Patrol, raid movement and target selection
- [ ] Bow attacks, blindness and invisibility spells

Pumpkin: [crates/pumpkin-core/src/entity/mob/illusioner.rs:30](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/illusioner.rs#L30).
Vanilla: Lantern `Illusioner` (`26.3-pre-1`).

## entities:phantom

Assessment: **partial**. The source explicitly leaves circling/sweeping goals unimplemented. Zero gravity is present but does not provide flight AI.

- [x] Look behaviour and zero gravity
- [ ] Circling flight and sweeping attacks

Pumpkin: [crates/pumpkin-core/src/entity/mob/phantom.rs:16](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/phantom.rs#L16).
Vanilla: Lantern `Phantom` (`26.3-pre-1`).

## entities:piglin

Assessment: **partial**. Hand-written activities implement real behaviour. Group anger propagation remains missing; switching to a Brain implementation is not itself a gameplay gap.

- [x] Bartering, admiring, equipment and conversion
- [ ] Broadcast shared anger across piglins

Pumpkin: [crates/pumpkin-core/src/entity/mob/piglin.rs:92](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/piglin.rs#L92).
Vanilla: Lantern `Piglin` (`26.3-pre-1`).

## entities:piglin_brute

Assessment: **partial**. The implementation has targeting and conversion but no stored home or return-to-home behaviour corresponding to vanilla PiglinBruteAi.

- [x] Melee, player targeting and zombification
- [ ] Remember and return to the bastion home location

Pumpkin: [crates/pumpkin-core/src/entity/mob/piglin_brute.rs:34](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/piglin_brute.rs#L34).
Vanilla: Lantern `PiglinBrute` (`26.3-pre-1`).

## entities:pillager

Assessment: **partial**. Crossbow combat is implemented. The constructor lacks the vanilla creaking-avoidance and revenge target behaviours.

- [x] Crossbow charging/shooting, patrol and raid movement
- [ ] Avoid creaking entities and retaliate against attackers

Pumpkin: [crates/pumpkin-core/src/entity/mob/pillager.rs:42](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/pillager.rs#L42).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/ranged_crossbow_attack.rs:44](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/ranged_crossbow_attack.rs#L44).
Vanilla: Lantern `Pillager` (`26.3-pre-1`).

## entities:ravager

Assessment: **partial**. The source registers normal raid combat but has no stun/roar state or handlers.

- [x] Melee, targeting and raid/patrol movement
- [ ] Shield-stun and roar state/attack

Pumpkin: [crates/pumpkin-core/src/entity/mob/ravager.rs:31](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/ravager.rs#L31).
Vanilla: Lantern `Ravager` (`26.3-pre-1`).

## entities:silverfish

Assessment: **partial**. The countdown decreases but does not scan/break infested blocks on expiry. No stone-merging behaviour is wired.

- [x] Melee, revenge and damage-triggered countdown
- [ ] Wake infested-block silverfish and merge with stone

Pumpkin: [crates/pumpkin-core/src/entity/mob/silverfish.rs:23](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/silverfish.rs#L23).
Vanilla: Lantern `Silverfish` (`26.3-pre-1`).

## entities:skeleton

Assessment: **partial**. The shared bow interval is fixed at 20 ticks. Vanilla reassesses the bow goal using difficulty-dependent intervals.

- [x] Held-bow-gated ranged attacks and default equipment
- [ ] Difficulty-scaled bow interval

Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/skeleton.rs:14](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/skeleton.rs#L14).
Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/mod.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/mod.rs#L33).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs#L40).
Vanilla: Lantern `Skeleton` (`26.3-pre-1`).

## entities:bogged

Assessment: **partial**. The shared bow attack always constructs a plain ARROW payload; the wrapper supplies neither poison arrows nor shearing.

- [x] Inherited skeleton ranged attacks and equipment
- [ ] Poison arrow payload and shearing interaction

Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/bogged.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/bogged.rs#L12).
Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/mod.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/mod.rs#L33).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs#L40).
Pumpkin: [crates/pumpkin-core/src/entity/mob/equipment.rs:485](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/equipment.rs#L485).
Vanilla: Lantern `Bogged` (`26.3-pre-1`).

## entities:stray

Assessment: **partial**. The shared bow attack constructs a plain ARROW item, and the wrapper does not override it with slowness.

- [x] Inherited skeleton ranged attacks and equipment
- [ ] Slowness arrow payload

Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/stray.rs:13](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/stray.rs#L13).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs#L40).
Vanilla: Lantern `Stray` (`26.3-pre-1`).

## entities:parched

Assessment: **partial**. The shared bow attack uses a plain ARROW rather than the variant-specific payload. This was previously only marked unverified.

- [x] Inherited skeleton ranged attacks
- [ ] Variant-specific arrow payload

Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/parched.rs:13](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/parched.rs#L13).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/bow_attack.rs#L40).
Vanilla: Lantern `Parched` (`26.3-pre-1`).

## entities:wither_skeleton

Assessment: **partial**. The wrapper has no on_attack hook to apply the vanilla 200-tick Wither effect. Equipment is handled by the shared equipment registry, so a missing wrapper equipment override was not proof of missing swords.

- [x] Inherited skeleton movement and shared equipment spawning
- [ ] Apply Wither after a successful melee attack

Pumpkin: [crates/pumpkin-core/src/entity/mob/skeleton/wither.rs:13](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/skeleton/wither.rs#L13).
Pumpkin: [crates/pumpkin-core/src/entity/mob/equipment.rs:485](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/equipment.rs#L485).
Vanilla: Lantern `WitherSkeleton` (`26.3-pre-1`).

## entities:vex

Assessment: **partial**. Only generic ground goals are present. Flying charge, owner-target copying and summoned lifetime management are not implemented.

- [x] Generic melee and targeting
- [ ] Flying charge movement, owner target copying and limited lifetime

Pumpkin: [crates/pumpkin-core/src/entity/mob/vex.rs:20](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/vex.rs#L20).
Vanilla: Lantern `Vex` (`26.3-pre-1`).

## entities:vindicator

Assessment: **partial**. The constructor implements melee/raid movement but contains neither Johnny-name targeting nor a revenge goal.

- [x] Melee, doors and raid/patrol movement
- [ ] Johnny targeting and revenge targeting

Pumpkin: [crates/pumpkin-core/src/entity/mob/vindicator.rs:31](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/vindicator.rs#L31).
Vanilla: Lantern `Vindicator` (`26.3-pre-1`).

## entities:warden

Assessment: **partial**. Emergence and direct melee exist. Vibration listening, sniffing, anger-based target selection and sonic-boom combat are absent.

- [x] Emergence, darkness, melee and direct player targeting
- [ ] Vibration/anger-driven targeting, sniffing and sonic boom

Pumpkin: [crates/pumpkin-core/src/entity/mob/warden.rs:39](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/warden.rs#L39).
Vanilla: Lantern `Warden` (`26.3-pre-1`).

## entities:witch

Assessment: **partial**. Potion combat exists. Target selection only has revenge/player targets, lacking vanilla injured-raider healing selection.

- [x] Potion drinking/throwing and raid movement
- [ ] Select and heal injured raiders

Pumpkin: [crates/pumpkin-core/src/entity/mob/witch.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/witch.rs#L33).
Vanilla: Lantern `Witch` (`26.3-pre-1`).

## entities:zoglin

Assessment: **partial**. The active target constructor is scoped to PLAYER. Excluding creepers/zoglins in a predicate does not broaden that target type.

- [x] Melee, revenge and adult attack launch
- [ ] Select living targets beyond players

Pumpkin: [crates/pumpkin-core/src/entity/mob/zoglin.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zoglin.rs#L37).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/active_target.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/active_target.rs#L35).
Vanilla: Lantern `Zoglin` (`26.3-pre-1`).

## entities:zombie

Assessment: **partial**. The shared base explicitly lacks baby speed/experience modifiers. Existing zombie attack goals are preserved.

- [x] Melee, conditional door breaking and turtle-egg destruction
- [ ] Baby speed and experience modifiers

Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/zombie.rs:14](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/zombie.rs#L14).
Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/mod.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/mod.rs#L37).
Vanilla: Lantern `Zombie` (`26.3-pre-1`).

## entities:zombie_villager

Assessment: **partial**. Curing and profession state exist. The inherited zombie base still lacks the village movement behaviour.

- [x] Villager data, curing and conversion acceleration
- [ ] Movement through villages

Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/zombie_villager.rs:30](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/zombie_villager.rs#L30).
Pumpkin: [crates/pumpkin-core/src/entity/mob/zombie/mod.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombie/mod.rs#L37).
Vanilla: Lantern `ZombieVillager` (`26.3-pre-1`).

## entities:zombified_piglin

Assessment: **partial**. Group alert code is present, so the previous unverified-alert note was too vague. The constructor has generic melee without the spear-use behaviour in the vanilla reference.

- [x] Anger targeting, universal reset, revenge and group alerts
- [ ] Spear-specific attack behaviour

Pumpkin: [crates/pumpkin-core/src/entity/mob/zombified_piglin.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/zombified_piglin.rs#L40).
Pumpkin: [crates/pumpkin-core/src/entity/ai/behavior/neutral.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/behavior/neutral.rs#L12).
Vanilla: Lantern `ZombifiedPiglin` (`26.3-pre-1`).

## entities:ender_dragon

Assessment: **partial**. Dragon parts are constructed but not registered in the world. Main-box collision handling does not implement the full part-based damage/contact semantics.

- [x] Flight phases, crystals, multipart positions and block breaking
- [ ] Register hit-testable parts and apply part-based contact/knockback checks

Pumpkin: [crates/pumpkin-core/src/entity/boss/ender_dragon.rs:48](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/boss/ender_dragon.rs#L48).
Vanilla: Lantern `EnderDragon` (`26.3-pre-1`).

## entities:wither

Assessment: **partial**. Movement explicitly accelerates towards a target in the air, so saying the wither does not fly was wrong. Primary targeting only registers revenge; side heads do have autonomous target selection.

- [x] Skull attacks, aerial target-following, side-head targets and block breaking
- [ ] Autonomous primary-head target acquisition

Pumpkin: [crates/pumpkin-core/src/entity/boss/wither.rs:58](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/boss/wither.rs#L58).
Vanilla: Lantern `WitherBoss` (`26.3-pre-1`).

## entities:allay

Assessment: **partial**. The source implements duplication/state handling but lacks collection, delivery and note-block following AI.

- [x] Duplication and dance/cooldown state
- [ ] Collect and deliver matching items, note-block following and flying movement

Pumpkin: [crates/pumpkin-core/src/entity/passive/allay.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/allay.rs#L35).
Vanilla: Lantern `Allay` (`26.3-pre-1`).

## entities:armadillo

Assessment: **partial**. Threat predicates and rolling handlers exist but are not called by a proximity detection goal/runtime path. Merely having the state methods did not establish automatic rolling.

- [x] Scute shedding, brushing and rolling-state handlers
- [ ] Trigger rolling from nearby threats

Pumpkin: [crates/pumpkin-core/src/entity/passive/armadillo.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/armadillo.rs#L35).
Vanilla: Lantern `Armadillo` (`26.3-pre-1`).

## entities:axolotl

Assessment: **partial**. The play-dead state/timer exists, but no damage hook selects it. The shared mob uses ground navigation rather than axolotl water movement.

- [x] Melee, breeding, bucket state and play-dead timer
- [ ] Water navigation and trigger playing dead on damage

Pumpkin: [crates/pumpkin-core/src/entity/passive/axolotl.rs:45](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/axolotl.rs#L45).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Axolotl` (`26.3-pre-1`).

## entities:bat

Assessment: **partial**. Custom airborne velocity steering is implemented; a missing FlyingNavigation class was a misleading reason. Shared ticking still calls its AI before the NoAI guard.

- [x] Roosting, airborne steering, wakeup and sound handling
- [ ] Honour NoAI for flying/roosting AI

Pumpkin: [crates/pumpkin-core/src/entity/mob/bat.rs:32](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/bat.rs#L32).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Bat` (`26.3-pre-1`).

## entities:bee

Assessment: **partial**. Combat exists. Hive/pollination/crop behaviour is not wired; the absence of a Brain framework is not the issue.

- [x] Angry melee, sting gating, neutral targeting and sting death
- [ ] Hive entry/exit, pollination and crop growth

Pumpkin: [crates/pumpkin-core/src/entity/passive/bee.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/bee.rs#L40).
Pumpkin: [crates/pumpkin-core/src/entity/ai/behavior/neutral.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/behavior/neutral.rs#L12).
Vanilla: Lantern `Bee` (`26.3-pre-1`).

## blocks:beehive

Assessment: **partial**. The block reports honey level. Its block entity serialises stored bees but has no ticking release path, and bee AI has no hive entry path.

- [x] Honey comparator output and stored bee NBT
- [ ] Bee entry/release and ticking hive lifecycle

Pumpkin: [crates/pumpkin-core/src/block/blocks/beehive.rs:8](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/beehive.rs#L8).
Pumpkin: [crates/pumpkin-core/src/block/entities/beehive.rs:14](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/beehive.rs#L14).
Pumpkin: [crates/pumpkin-core/src/entity/passive/bee.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/bee.rs#L40).
Vanilla: Lantern `BeehiveBlock` (`26.3-pre-1`).

## entities:camel

Assessment: **partial**. Camel state/feeding exists, but no sitting/standing transition or pose-timing logic is implemented. The gap is behavioural, not Brain migration.

- [x] Breed/tempt goals and saddle/dash state
- [ ] Sitting/standing transitions and pose timing

Pumpkin: [crates/pumpkin-core/src/entity/passive/camel.rs:42](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/camel.rs#L42).
Vanilla: Lantern `Camel` (`26.3-pre-1`).

## entities:cat

Assessment: **partial**. Generic player avoidance and target selection already exist. Sitting/lying-on-block and leap/attack execution are not wired; merely missing CatAvoidEntityGoal was not proof that avoidance was absent.

- [x] Taming, breeding, owner following and prey selection
- [ ] Sit/lie-on-block behaviour, leaping and executing prey attacks

Pumpkin: [crates/pumpkin-core/src/entity/passive/cat.rs:38](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/cat.rs#L38).
Vanilla: Lantern `Cat` (`26.3-pre-1`).

## entities:cod

Assessment: **partial**. These fish use the shared ground navigator and generic wander/float goals. They have no schooling state or follower behaviour.

- [x] Generic water escape/float and wander goals
- [ ] Water-bound swimming and school/follower behaviour

Pumpkin: [crates/pumpkin-core/src/entity/passive/cod.rs:22](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/cod.rs#L22).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Pumpkin: [crates/pumpkin-core/src/entity/ai/pathfinder/mod.rs:48](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/pathfinder/mod.rs#L48).
Vanilla: Lantern `Cod` (`26.3-pre-1`).

## entities:salmon

Assessment: **partial**. These fish use the shared ground navigator and generic wander/float goals. They have no schooling state or follower behaviour.

- [x] Generic water escape/float and wander goals
- [ ] Water-bound swimming and school/follower behaviour

Pumpkin: [crates/pumpkin-core/src/entity/passive/salmon.rs:19](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/salmon.rs#L19).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Pumpkin: [crates/pumpkin-core/src/entity/ai/pathfinder/mod.rs:48](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/pathfinder/mod.rs#L48).
Vanilla: Lantern `Salmon` (`26.3-pre-1`).

## entities:tropical_fish

Assessment: **partial**. These fish use the shared ground navigator and generic wander/float goals. They have no schooling state or follower behaviour.

- [x] Generic water escape/float and wander goals
- [ ] Water-bound swimming and school/follower behaviour

Pumpkin: [crates/pumpkin-core/src/entity/passive/tropical_fish.rs:19](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/tropical_fish.rs#L19).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Pumpkin: [crates/pumpkin-core/src/entity/ai/pathfinder/mod.rs:48](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/pathfinder/mod.rs#L48).
Vanilla: Lantern `TropicalFish` (`26.3-pre-1`).

## entities:pufferfish

Assessment: **partial**. There is no puff state, threat detector or collision sting handler. The shared navigator also does not provide fish-specific swimming.

- [x] Generic movement goals
- [ ] Puff-up threat detection, puff metadata and sting damage

Pumpkin: [crates/pumpkin-core/src/entity/passive/pufferfish.rs:22](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/pufferfish.rs#L22).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Pufferfish` (`26.3-pre-1`).

## entities:squid

Assessment: **partial**. The source has no squid-specific swimming controller, flee behaviour or damage ink response. Glow squid does not inherit squid behaviour from its own wrapper.

- [x] Generic movement/look goals
- [ ] Squid swimming/fleeing and ink response

Pumpkin: [crates/pumpkin-core/src/entity/passive/squid.rs:19](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/squid.rs#L19).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Squid` (`26.3-pre-1`).

## entities:glow_squid

Assessment: **partial**. The source has no squid-specific swimming controller, flee behaviour or damage ink response. Glow squid does not inherit squid behaviour from its own wrapper.

- [x] Generic movement/look goals
- [ ] Squid swimming/fleeing and ink response

Pumpkin: [crates/pumpkin-core/src/entity/passive/glow_squid.rs:22](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/glow_squid.rs#L22).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `GlowSquid` (`26.3-pre-1`).

## entities:copper_golem

Assessment: **partial**. The constructor only has generic movement/look goals. No sorting/chest transport or autonomous oxidation tick is wired.

- [x] Oxidation state, axe/honeycomb interaction and lightning handling
- [ ] Chest-to-chest item sorting and oxidation ticking

Pumpkin: [crates/pumpkin-core/src/entity/passive/copper_golem.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/copper_golem.rs#L37).
Vanilla: Lantern `CopperGolem` (`26.3-pre-1`).

## entities:dolphin

Assessment: **partial**. Food sets got_fish, but no treasure navigation consumes it. Air-seeking and play behaviours are also missing.

- [x] Food interaction, melee and revenge
- [ ] Air seeking, fish-guided treasure search and item play

Pumpkin: [crates/pumpkin-core/src/entity/passive/dolphin.rs:35](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/dolphin.rs#L35).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Dolphin` (`26.3-pre-1`).

## entities:horse

Assessment: **partial**. Mounting exists but there is no taming/temper cycle or specialised ridden movement handling. Tame metadata alone does not provide the vanilla taming process.

- [x] Mounting, saddle state, feeding and breeding
- [ ] Untamed-riding taming cycle and ridden movement control

Pumpkin: [crates/pumpkin-core/src/entity/passive/horse.rs:53](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/horse.rs#L53).
Vanilla: Lantern `Horse` (`26.3-pre-1`).

## entities:donkey

Assessment: **partial**. Chest attachment only sets a flag. There is no chest inventory/screen or the vanilla taming/temper cycle; riding interaction alone is not complete horse behaviour.

- [x] Mounting, saddle/chest flags and feeding
- [ ] Untamed-riding taming cycle, chest inventory and ridden movement control

Pumpkin: [crates/pumpkin-core/src/entity/passive/donkey.rs:51](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/donkey.rs#L51).
Vanilla: Lantern `Donkey` (`26.3-pre-1`).

## entities:mule

Assessment: **partial**. Chest attachment only sets a flag. There is no chest inventory/screen or the vanilla taming/temper cycle; riding interaction alone is not complete horse behaviour.

- [x] Mounting, saddle/chest flags and feeding
- [ ] Untamed-riding taming cycle, chest inventory and ridden movement control

Pumpkin: [crates/pumpkin-core/src/entity/passive/mule.rs:51](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/mule.rs#L51).
Vanilla: Lantern `Mule` (`26.3-pre-1`).

## entities:skeleton_horse

Assessment: **partial**. The source has no trap timer/trigger or skeleton riders and uses generic movement rather than the horse ridden controller.

- [x] Mounting, saddle and age/NBT state
- [ ] Skeleton trap activation and horse riding control

Pumpkin: [crates/pumpkin-core/src/entity/passive/skeleton_horse.rs:41](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/skeleton_horse.rs#L41).
Vanilla: Lantern `SkeletonHorse` (`26.3-pre-1`).

## entities:zombie_horse

Assessment: **partial**. The source stores horse state and permits mounting, but lacks horse-specific ridden movement. This replaces the vague missing-goal-registration claim.

- [x] Mounting, saddle and sun-protection slot
- [ ] Horse riding control and vanilla horse-specific movement

Pumpkin: [crates/pumpkin-core/src/entity/passive/zombie_horse.rs:41](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/zombie_horse.rs#L41).
Vanilla: Lantern `ZombieHorse` (`26.3-pre-1`).

## entities:llama

Assessment: **partial**. Spit attacks exist. Chest state has no inventory/screen, and no caravan-following path is wired. Trader llamas additionally lack trader-defence targeting.

- [x] Spit attacks, taming/chest state, feeding and breeding
- [ ] Caravan following and functional chest inventory

Pumpkin: [crates/pumpkin-core/src/entity/passive/llama.rs:52](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/llama.rs#L52).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/ranged_attack.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/ranged_attack.rs#L26).
Vanilla: Lantern `Llama` (`26.3-pre-1`).

## entities:trader_llama

Assessment: **partial**. Spit attacks exist. Chest state has no inventory/screen, and no caravan-following path is wired. Trader llamas additionally lack trader-defence targeting.

- [x] Spit attacks, taming/chest state, feeding and breeding
- [ ] Caravan following and functional chest inventory

Pumpkin: [crates/pumpkin-core/src/entity/passive/trader_llama.rs:52](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/trader_llama.rs#L52).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/ranged_attack.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/ranged_attack.rs#L26).
Vanilla: Lantern `TraderLlama` (`26.3-pre-1`).

## entities:fox

Assessment: **partial**. Fox state/feeding exists, but its goal list and runtime do not execute prey pounces, sleeping or berry foraging.

- [x] Feeding, breeding, variants and generic movement
- [ ] Pouncing/prey combat, sleeping and berry foraging

Pumpkin: [crates/pumpkin-core/src/entity/passive/fox.rs:39](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/fox.rs#L39).
Vanilla: Lantern `Fox` (`26.3-pre-1`).

## entities:frog

Assessment: **partial**. There is no tongue attack or egg-laying path. Feeding can enter the generic animal interaction, but there is no breed goal to complete reproduction.

- [x] Variants, feeding and generic movement
- [ ] Tongue attack, breeding/egg laying and frog-specific jumping

Pumpkin: [crates/pumpkin-core/src/entity/passive/frog.rs:41](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/frog.rs#L41).
Vanilla: Lantern `Frog` (`26.3-pre-1`).

## entities:goat

Assessment: **partial**. The source has no ram/long-jump behaviour. The bucket branch consumes the empty bucket and plays a sound but does not return a milk bucket.

- [x] Breeding, temptation and screaming/horn state
- [ ] Ramming, long jumps and return a milk bucket when milked

Pumpkin: [crates/pumpkin-core/src/entity/passive/goat.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/goat.rs#L37).
Vanilla: Lantern `Goat` (`26.3-pre-1`).

## entities:happy_ghast

Assessment: **partial**. The entity uses generic ground navigation, and its interaction only delegates feeding. Harness riding/passenger handling is not implemented here.

- [x] Temptation, leash/still-state sync and feeding
- [ ] Flying navigation and harness passenger riding

Pumpkin: [crates/pumpkin-core/src/entity/passive/happy_ghast.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/happy_ghast.rs#L40).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `HappyGhast` (`26.3-pre-1`).

## entities:iron_golem

Assessment: **partial**. Attack animation sends StartAttacking and counts down for 10 ticks. Village-defence targeting remains an explicit missing behaviour; neutral anger is already wired.

- [x] Melee, neutral anger, flower offering and attack animation
- [ ] Village-defence targeting

Pumpkin: [crates/pumpkin-core/src/entity/passive/iron_golem.rs:41](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/iron_golem.rs#L41).
Pumpkin: [crates/pumpkin-core/src/entity/ai/behavior/neutral.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/behavior/neutral.rs#L12).
Vanilla: Lantern `IronGolem` (`26.3-pre-1`).

## entities:nautilus

Assessment: **partial**. The constructor has no goals and the runtime only handles passenger effects/cooldowns/particles. Riding state exists but does not supply autonomous nautilus AI.

- [x] Taming, saddling, dash cooldown and passenger breathing effect
- [ ] Autonomous underwater movement and target/tempt AI

Pumpkin: [crates/pumpkin-core/src/entity/passive/nautilus.rs:38](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/nautilus.rs#L38).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Nautilus` (`26.3-pre-1`).

## entities:ocelot

Assessment: **partial**. Generic avoidance is already present. Target selection is not paired with an attack/leap goal, and the interaction only uses generic animal feeding.

- [x] Temptation, player avoidance, breeding and chicken targets
- [ ] Leap/prey attack execution and trusting interaction

Pumpkin: [crates/pumpkin-core/src/entity/passive/ocelot.rs:38](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/ocelot.rs#L38).
Vanilla: Lantern `Ocelot` (`26.3-pre-1`).

## entities:panda

Assessment: **partial**. Gene/animation fields exist, but mob_tick only ages the animal. Generic BreedGoal does not implement the vanilla panda bamboo requirement or specialised state behaviours.

- [x] Genes, flags, feeding and generic breeding
- [ ] Gene-driven eating, rolling, sneezing and bamboo-gated breeding

Pumpkin: [crates/pumpkin-core/src/entity/passive/panda.rs:50](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/panda.rs#L50).
Vanilla: Lantern `Panda` (`26.3-pre-1`).

## entities:parrot

Assessment: **partial**. The interaction explicitly says taming is not implemented. There are also no owner/shoulder/flying behaviour paths.

- [x] Poisonous-food interaction and generic movement
- [ ] Taming, owner following, shoulder landing and flying movement

Pumpkin: [crates/pumpkin-core/src/entity/passive/parrot.rs:31](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/parrot.rs#L31).
Vanilla: Lantern `Parrot` (`26.3-pre-1`).

## entities:polar_bear

Assessment: **partial**. The constructor explicitly omits cub-protection player targeting; anger/reset behaviours are present.

- [x] Adult fox targets, melee and neutral anger
- [ ] Protect nearby cubs from players

Pumpkin: [crates/pumpkin-core/src/entity/passive/polar_bear.rs:34](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/polar_bear.rs#L34).
Pumpkin: [crates/pumpkin-core/src/entity/ai/behavior/neutral.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/behavior/neutral.rs#L12).
Vanilla: Lantern `PolarBear` (`26.3-pre-1`).

## entities:rabbit

Assessment: **partial**. The runtime has generic movement and no crop-raiding or rabbit hop controller. The actual gap is not just the absence of a named goal.

- [x] Feeding, breeding, variants and avoidance
- [ ] Crop raiding and rabbit hopping control

Pumpkin: [crates/pumpkin-core/src/entity/passive/rabbit.rs:47](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/rabbit.rs#L47).
Vanilla: Lantern `Rabbit` (`26.3-pre-1`).

## entities:sniffer

Assessment: **partial**. Digging-state methods exist, but no behaviour invokes transition_to/can_dig to start autonomous foraging.

- [x] Breeding, digging-state effects and explored-position storage
- [ ] Automatic sniff/search/dig cycle

Pumpkin: [crates/pumpkin-core/src/entity/passive/sniffer.rs:49](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/sniffer.rs#L49).
Vanilla: Lantern `Sniffer` (`26.3-pre-1`).

## entities:strider

Assessment: **partial**. The constructor/runtime do not implement lava navigation/walking or update the cold/suffocating state from the environment.

- [x] Feeding, breeding, saddling and boost state
- [ ] Lava seeking, lava-surface walking and cold-state updates

Pumpkin: [crates/pumpkin-core/src/entity/passive/strider.rs:36](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/strider.rs#L36).
Vanilla: Lantern `Strider` (`26.3-pre-1`).

## entities:tadpole

Assessment: **partial**. mob_tick only runs ageable_ai_step. No age-to-frog replacement is wired, and navigation remains generic ground navigation.

- [x] Food growth acceleration and generic water-finding
- [ ] Water-bound swimming and conversion into a frog

Pumpkin: [crates/pumpkin-core/src/entity/passive/tadpole.rs:32](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/tadpole.rs#L32).
Pumpkin: [crates/pumpkin-core/src/entity/ageable.rs:17](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ageable.rs#L17).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `Tadpole` (`26.3-pre-1`).

## entities:turtle

Assessment: **partial**. Egg flags exist but no egg-laying/home/travel behaviour consumes them. Generic breeding does not implement the vanilla return-home egg cycle.

- [x] Feeding, breeding and egg state fields
- [ ] Egg laying, home return and long-distance swimming

Pumpkin: [crates/pumpkin-core/src/entity/passive/turtle.rs:36](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/turtle.rs#L36).
Vanilla: Lantern `Turtle` (`26.3-pre-1`).

## entities:wolf

Assessment: **partial**. Sit commands/state and owner following exist. No sitting control goal prevents the other movement goals, and leap attacks are absent.

- [x] Taming, owner following/defence and neutral anger
- [ ] Stay seated when ordered and leap attacks

Pumpkin: [crates/pumpkin-core/src/entity/passive/wolf.rs:51](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/wolf.rs#L51).
Pumpkin: [crates/pumpkin-core/src/entity/ai/goal/sit_when_ordered_to.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/goal/sit_when_ordered_to.rs#L12).
Pumpkin: [crates/pumpkin-core/src/entity/ai/behavior/neutral.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/ai/behavior/neutral.rs#L12).
Vanilla: Lantern `Wolf` (`26.3-pre-1`).

## entities:villager

Assessment: **partial**. Sleep, work, restocking and gossip already exist; previous claims that these were absent were inaccurate. No villager breeding or meeting schedule is wired. The generic Brain framework is not the status criterion.

- [x] Trading, work/restock, sleep/wakeup and reputation/gossip
- [ ] Breeding and meeting/activity schedule parity

Pumpkin: [crates/pumpkin-core/src/entity/passive/villager/mod.rs:58](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/villager/mod.rs#L58).
Vanilla: Lantern `Villager` (`26.3-pre-1`).

## entities:wandering_trader

Assessment: **partial**. Trading is generated from trade sets and dynamic entries. There is no natural spawning/llama escort scheduler. The world writes trader data from existing/default values rather than active scheduler state.

- [x] Trades, potion use, wandering and entity NBT
- [ ] Natural spawning, llama escort and active spawn-state persistence

Pumpkin: [crates/pumpkin-core/src/entity/passive/wandering_trader.rs:53](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/passive/wandering_trader.rs#L53).
Pumpkin: [crates/pumpkin-world/src/world_info/anvil.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/world_info/anvil.rs#L40).
Pumpkin: [crates/pumpkin-world/src/world_info/data_files.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/world_info/data_files.rs#L37).
Vanilla: Lantern `WanderingTrader` (`26.3-pre-1`).

## entities:experience_bottle

Assessment: **partial**. Using the item spawns experience immediately at the player eye position. There is no thrown bottle flight/impact path.

- [x] Consumption, throwing sound and experience creation
- [ ] Thrown bottle projectile and impact-triggered experience

Pumpkin: [crates/pumpkin-core/src/item/items/experience_bottle.rs:12](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/item/items/experience_bottle.rs#L12).
Vanilla: Lantern `ThrownExperienceBottle` (`26.3-pre-1`).

## entities:fishing_bobber

Assessment: **partial**. The catch path returns a fixed raw cod instead of evaluating the fishing loot table.

- [x] Casting, reeling and catch handling
- [ ] Fishing loot tables and their luck/enchantment context

Pumpkin: [crates/pumpkin-core/src/entity/projectile/fishing_bobber.rs:28](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/projectile/fishing_bobber.rs#L28).
Pumpkin: [crates/pumpkin-core/src/item/items/fishing_rod.rs:16](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/item/items/fishing_rod.rs#L16).
Vanilla: Lantern `FishingHook` (`26.3-pre-1`).

## items:fishing_rod

Assessment: **partial**. The catch path returns a fixed raw cod instead of evaluating the fishing loot table.

- [x] Casting, reeling and catch handling
- [ ] Fishing loot tables and their luck/enchantment context

Pumpkin: [crates/pumpkin-core/src/item/items/fishing_rod.rs:16](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/item/items/fishing_rod.rs#L16).
Pumpkin: [crates/pumpkin-core/src/entity/projectile/fishing_bobber.rs:28](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/projectile/fishing_bobber.rs#L28).
Vanilla: Lantern `FishingRodItem` (`26.3-pre-1`).

## entities:acacia_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:acacia_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:bamboo_chest_raft

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:bamboo_raft

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:birch_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:birch_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:cherry_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:cherry_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:dark_oak_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:dark_oak_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:jungle_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:jungle_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:mangrove_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:mangrove_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:oak_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:oak_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:pale_oak_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:pale_oak_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:poplar_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:poplar_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:spruce_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `Boat` (`26.3-pre-1`).

## entities:spruce_chest_boat

Assessment: **partial**. The shared boat ticks damage state and water contact, but has no vanilla water-status/buoyancy controller. Chest variants use the same implementation without a container inventory.

- [x] Mounting, paddle metadata, damage and water-contact timer
- [ ] Water-status/buoyancy physics
- [ ] Chest inventory and container interaction

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/boat.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/boat.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/vehicle/mod.rs:1](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/mod.rs#L1).
Vanilla: Lantern `ChestBoat` (`26.3-pre-1`).

## entities:command_block_minecart

Assessment: **partial**. The minecart selects MinecartKind::Other and has no command-block state or execution hook.

- [x] Shared rail movement and damage handling
- [ ] Command storage, editing and activator-rail execution

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/minecart.rs:39](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/minecart.rs#L39).
Vanilla: Lantern `MinecartCommandBlock` (`26.3-pre-1`).

## entities:spawner_minecart

Assessment: **partial**. The minecart selects MinecartKind::Other and has no spawner state or ticking spawning implementation.

- [x] Shared rail movement and damage handling
- [ ] Spawner state, delay and entity spawning

Pumpkin: [crates/pumpkin-core/src/entity/vehicle/minecart.rs:39](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/vehicle/minecart.rs#L39).
Vanilla: Lantern `MinecartSpawner` (`26.3-pre-1`).

## entities:armor_stand

Assessment: **partial**. Break handling explicitly omits equipment drops. Igniting/burning armor-stand damage tags are also not implemented.

- [x] Placement/state and damage/break handling
- [ ] Equipment drops and fire-specific damage handling

Pumpkin: [crates/pumpkin-core/src/entity/decoration/armor_stand.rs:29](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/decoration/armor_stand.rs#L29).
Vanilla: Lantern `ArmorStand` (`26.3-pre-1`).

## entities:cushion

Assessment: **partial**. Sitting plays the cushion sit sound, but neither the cushion nor shared dismount path plays the vanilla get-up sound.

- [x] Colour spawn metadata, sitting, NBT and break drops
- [ ] Get-up sound when the passenger dismounts

Pumpkin: [crates/pumpkin-core/src/entity/decoration/cushion.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/decoration/cushion.rs#L26).
Pumpkin: [crates/pumpkin-core/src/entity/mod.rs:111](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mod.rs#L111).
Vanilla: Lantern `Cushion` (`26.3-pre-1`).

## entities:leash_knot

Assessment: **partial**. The generic entity factory has no LEASH_KNOT case, so saved knots do not restore the specialised interaction implementation.

- [x] Fence interaction and leash attachment
- [ ] Restore the specialised knot behaviour through the entity factory

Pumpkin: [crates/pumpkin-core/src/entity/decoration/leash_knot.rs:21](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/decoration/leash_knot.rs#L21).
Pumpkin: [crates/pumpkin-core/src/entity/mod.rs:111](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mod.rs#L111).
Vanilla: Lantern `LeashFenceKnotEntity` (`26.3-pre-1`).

## entities:painting

Assessment: **partial**. Painting drops are implemented. The remaining difference is that no hanging-entity tick checks wall support after placement.

- [x] Placement fitting, variant metadata/NBT and break drops
- [ ] Periodic support validation and breaking after support removal

Pumpkin: [crates/pumpkin-core/src/entity/decoration/painting.rs:24](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/decoration/painting.rs#L24).
Pumpkin: [crates/pumpkin-core/src/entity/mod.rs:111](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mod.rs#L111).
Vanilla: Lantern `Painting` (`26.3-pre-1`).

## items:mace

Assessment: **partial**. Player attacks add 1.5 times fall distance plus enchantment bonuses. Lantern MaceItem uses 4 damage/block for the first 3 blocks, 2 for the next 5, and 1 thereafter.

- [x] Smash classification, density bonus, sounds and fall reset
- [ ] Vanilla piecewise smash damage formula

Pumpkin: [crates/pumpkin-core/src/item/items/mace.rs:9](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/item/items/mace.rs#L9).
Pumpkin: [crates/pumpkin-core/src/entity/player.rs:62](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/player.rs#L62).
Pumpkin: [crates/pumpkin-core/src/entity/combat.rs:30](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/combat.rs#L30).
Vanilla: Lantern `MaceItem` (`26.3-pre-1`).

## items:elytra

Assessment: **partial**. StartFlyingElytra calls check_fall_flying, which only checks that the player is airborne. It does not validate glide-capable equipment, unlike the vanilla reference.

- [x] Gliding flag, pose and movement statistics
- [ ] Validate glide-capable equipment before starting flight

Pumpkin: [crates/pumpkin-core/src/entity/player.rs:62](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/player.rs#L62).
Pumpkin: [crates/pumpkin-core/src/entity/mod.rs:111](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mod.rs#L111).
Pumpkin: [crates/pumpkin-core/src/net/java/play/player_command.rs:5](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/net/java/play/player_command.rs#L5).
Vanilla: Lantern `LivingEntity` (`26.3-pre-1`).

## items:name_tag

Assessment: **partial**. The naming path changes tracked custom name and consumes the tag, but does not set Mob.persistence_required as the vanilla name-tag interaction does.

- [x] Custom-name application and consumption
- [ ] Make named mobs persistent

Pumpkin: [crates/pumpkin-core/src/item/items/name_tag.rs:13](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/item/items/name_tag.rs#L13).
Pumpkin: [crates/pumpkin-core/src/entity/mod.rs:111](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mod.rs#L111).
Pumpkin: [crates/pumpkin-core/src/entity/mob/mod.rs:120](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/entity/mob/mod.rs#L120).
Vanilla: Lantern `NameTagItem` (`26.3-pre-1`).

## world:world-loading-level-dat-dim1-dim-1

Assessment: **partial**. 26.x split-file reading is implemented. read_world_info reads weather.dat but transfers only clear_weather_time into LevelData, omitting rain/thunder state.

- [x] Legacy level.dat and split data-file reading
- [ ] Restore rain/thunder state from weather.dat

Pumpkin: [crates/pumpkin-world/src/world_info/anvil.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/world_info/anvil.rs#L40).
Pumpkin: [crates/pumpkin-world/src/world_info/data_files.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/world_info/data_files.rs#L37).
Vanilla: Lantern `LevelStorageSource` (`26.3-pre-1`).

## world:world-saving

Assessment: **partial**. 26.x split-file output is implemented. Weather output reuses stored rain/thunder values, while boss events, scheduled events, random sequences, scoreboard and stopwatches use create-if-missing stubs rather than serialising active state.

- [x] Chunk/level saving and split data-file output
- [ ] Persist live weather and supported world subsystem state

Pumpkin: [crates/pumpkin-world/src/level.rs:151](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/level.rs#L151).
Pumpkin: [crates/pumpkin-world/src/world_info/anvil.rs:40](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/world_info/anvil.rs#L40).
Pumpkin: [crates/pumpkin-world/src/world_info/data_files.rs:37](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-world/src/world_info/data_files.rs#L37).
Vanilla: Lantern `PrimaryLevelData` (`26.3-pre-1`).

## world:redstone

Assessment: **partial**. This aggregate is partial because the piston movement/state-persistence gaps remain, rather than merely because there is a separate Redstone tab.

- [x] Implemented redstone components and piston block events
- [ ] Complete piston movement and moved-block persistence

Pumpkin: [crates/pumpkin-core/src/block/blocks/piston/piston.rs:33](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/blocks/piston/piston.rs#L33).
Pumpkin: [crates/pumpkin-core/src/block/entities/piston.rs:26](https://github.com/Pumpkin-MC/Pumpkin/blob/e0cb7c01fbab5892d9dbbed0ef574c59c977d07f/crates/pumpkin-core/src/block/entities/piston.rs#L26).
Vanilla: Lantern `PistonBaseBlock` (`26.3-pre-1`).

