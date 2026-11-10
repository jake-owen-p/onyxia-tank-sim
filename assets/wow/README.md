# Classic game art

These are local conversions of World of Warcraft Vanilla client art: animated
characters and creatures, equipment, terrain tiles, cave props and spell icons.
The art is copyrighted by Blizzard Entertainment; it is **not** original artwork
or covered by a license for this repository's code.

The reference supplied for this visual update was
[Azeroth Survivors](https://azeroth-survivors.games/). The selected Vanilla 1.12.1
M2 and BLP files were retrieved from its publicly accessible game data at
`https://wow.aethus.pl/data/`. `sources.json` records normalized source paths and
SHA-256 hashes. `tools/art/catalog.json` records the selected skins, equipment,
character atlas components and surface/icon mappings.

## Coverage

- Player and raid figures: armored human, leather-wearing human and robed human,
  with original movement/combat animations. The tank wears a helmet, shoulders,
  sword and shield attached to its animated skeleton.
- 34 bosses: Onyxia; eight Molten Core bosses; seven Blackwing Lair bosses;
  Hakkar; all six Ruins of Ahn'Qiraj bosses; Skeram, Fankriss, Huhuran and C'Thun;
  Anub'Rekhan, Maexxna, Loatheb, the Four Horsemen (Mograine), Patchwerk,
  Sapphiron and Kel'Thuzad.
- Floor and wall textures for all seven raids, braziers, dragon eggs, cave rock
  formations, Onyxia's whelps, and action/debuff icons.

Encounters without a converted creature retain their existing procedural
models. The room geometry, collision, encounter mechanics and training effects
remain authored by the simulator. These are textured rehearsal arenas, not
imported copies of the original raid maps. The renderer supports skeletal
animation and basic material blending; client ribbon/particle emitters are not
imported. Existing simulator spell effects remain active.

## Rebuild

Runtime art is bundled here; the game makes no requests to the source server.
No build step or Python dependency is required to play.

For conversion, use Python 3 with Pillow installed in a virtual environment:

```sh
python tools/art/import_wow.py --source /path/to/extracted/lowercase/client/data
python tools/art/test_import_wow.py
npm test
```

`--source` also accepts an HTTP data root. `--only onyxia,tank` performs an
incremental model import. Downloaded inputs are cached under
`/tmp/wow-art-source`. The importer handles Vanilla MD20 version 256 and BLP
textures; it does not support modern retail M2 or CASC archives. Format details
were checked against the [Benilla M2 parser](https://github.com/OutThisLife/azeroth-survivors-re/tree/main/crates/benilla-m2).

Each model has JSON metadata and a binary mesh: a little-endian uint32 vertex
count, 40-byte vertices (position, four uint8 weights, four uint8 bone indices,
normal, UV), a uint32 index count, then uint16 triangle indices. Clip times are
milliseconds. Rest pivots and coordinates retain the client's X-forward,
Z-up basis. PNG textures preserve the separate alpha plane in paletted BLP2.
