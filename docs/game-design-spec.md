# Blade of Ages — 2D Historical Fighting Game

## Context

Build a portfolio-quality 2D sword fighting game inspired by Shadow Fight, featuring warriors from different historical periods. Runs locally in a browser using Phaser 3, with potential for later web deployment. The top priority is **combat feel** — responsive, satisfying sword fighting with visual impact.

---

## Game Overview

| Aspect | Decision |
|---|---|
| Genre | 2D side-view fighting game |
| Engine | Phaser 3 |
| Mode | Arcade quick-match (no campaign) |
| Players | Single-player vs AI + local 2-player (same keyboard) |
| Match Format | Best of 3 rounds |
| Audio | None for v1 (add later) |
| Target | Browser-based, fully responsive |
| Goal | Portfolio piece |

---

## Game Flow

```
Title Screen → Mode Select (1P / 2P) → Character Select → Arena Select → Fight (Best of 3) → Results → Rematch / Menu
```

### Screens

1. **Title Screen** — Game logo, "Start" button, stylized historical theme
2. **Mode Select** — 1 Player (vs AI) or 2 Players (local)
3. **Character Select** — Stylized parchment/scroll UI with character portraits, name plates, stat previews, animated selection cursor. In 2P mode, both players pick simultaneously (P1 left side, P2 right side)
4. **Arena Select** — Pick from 10 themed arenas with preview thumbnails
5. **Fight** — The main gameplay, best of 3 rounds with round transition screens
6. **Results** — Winner announcement with fight stats (hits landed, damage dealt, time), "Rematch" and "Back to Menu" options

---

## Roster — 10 Warriors

Each warrior has: shared base moveset, unique special move, slight stat variations, distinct AI personality.

| # | Warrior | Era/Region | Weapon | Stat Profile | AI Personality | Special Move (concept) |
|---|---|---|---|---|---|---|
| 1 | **Medieval Knight** | Europe, ~1200s | Longsword | High HP, slow | Defensive, patient | Mordhau (devastating pommel-strike reversal) |
| 2 | **Samurai** | Japan, ~1600s | Katana | Balanced, fast attacks | Precise, counter-heavy | Iaijutsu (lightning-fast draw-cut) |
| 3 | **Viking** | Scandinavia, ~900s | Sword & axe | High damage, medium HP | Aggressive, relentless | Berserker Rush (rapid multi-hit charge) |
| 4 | **Roman Gladiator** | Rome, ~100 AD | Gladius & shield | Balanced, strong block | Adaptive, showy | Shield Bash Combo (stun + follow-up strikes) |
| 5 | **Mongol** | Central Asia, ~1200s | Curved sword | Fast, low HP | Hit-and-run, evasive | Feigned Retreat (dodge back + devastating counter) |
| 6 | **Spartan** | Greece, ~480 BC | Short sword & shield | High HP, slow | Disciplined, wall-like | Phalanx Strike (unblockable shield-charge thrust) |
| 7 | **Pirate** | Caribbean, ~1700s | Cutlass | Medium, tricky | Unpredictable, dirty | Powder Flash (blind + slash combo) |
| 8 | **Zulu Warrior** | Southern Africa, ~1800s | Iklwa (short spear) | Fast, long reach | Aggressive, in-your-face | Bull Horn (rapid encircling multi-strike) |
| 9 | **Conquistador** | Spain, ~1500s | Toledo rapier | Balanced, precise | Methodical, poking | Estocada (precision thrust, high damage, narrow window) |
| 10 | **Navy SEAL** | Modern | Rifle (swung as sword) | High damage, fast | Tactical, efficient | Buttstroke Barrage (rifle CQC combo) |

### Stat Variations

Three stats with slight variation per warrior (not dramatic, ~15-20% range):
- **Speed** — movement and attack speed
- **Power** — damage dealt per hit
- **Health** — total HP pool

---

## Combat System

### Basic Moves (shared by all warriors)
- **Light Attack** — Fast, low damage, short recovery
- **Heavy Attack** — Slow, high damage, longer recovery (punishable if missed)
- **Block** — Reduces incoming damage, can be broken by heavy attacks
- **Special Move** — Unique per warrior, activated when special meter is full

### Special Meter
- Fills by dealing damage (rewards aggressive play)
- When full, player can activate their unique special move
- Meter resets after use
- Meter carries between rounds within a match

### Health System
- Each warrior has an HP bar (value varies slightly by warrior stats)
- First to zero HP loses the round
- Best of 3 rounds wins the match
- HP fully resets each round; special meter does NOT reset

### Combat Feel (TOP PRIORITY)
- **Hit sparks** — Particle effects on sword contact
- **Freeze frames (hitstop)** — Brief pause on heavy hits for impact
- **Knockback** — Visual pushback on hit
- **Responsive controls** — Minimal input lag, snappy animations
- Frame-rate independent timing for consistent feel across devices

---

## Controls

### Player 1 (Left side of keyboard)
| Action | Key |
|---|---|
| Move Left | A |
| Move Right | D |
| Jump | W |
| Crouch/Duck | S |
| Light Attack | F |
| Heavy Attack | G |
| Block | H |
| Special | R |

### Player 2 (Right side of keyboard)
| Action | Key |
|---|---|
| Move Left | Left Arrow |
| Move Right | Right Arrow |
| Jump | Up Arrow |
| Crouch/Duck | Down Arrow |
| Light Attack | Numpad 1 (or ;) |
| Heavy Attack | Numpad 2 (or ') |
| Block | Numpad 3 (or /) |
| Special | Numpad 0 (or .) |

*Note: Exact bindings to be refined during playtesting. P2 keys need to work on keyboards without numpads.*

---

## AI System

Per-warrior personality-driven AI with these behavior dimensions:
- **Aggression** — How often the AI initiates attacks vs waits
- **Defense** — How likely to block and how quickly
- **Counter tendency** — How often the AI punishes whiffed attacks
- **Special usage** — When the AI chooses to use its special (immediately, save for low HP, etc.)
- **Pattern variation** — How predictable/random the AI's action selection is

Each warrior's AI profile is tuned to match their historical fighting style (see roster table above).

---

## Art Style

### Characters
- **Vector / clean illustration** style
- Strong black outlines, smooth shapes, vibrant flat colors
- Each warrior has a distinct color palette tied to their culture
- Programmatically drawn (SVG paths or Canvas drawing) for v1
- Designed to be replaceable with hand-drawn assets later
- Idle, walk, light attack, heavy attack, block, special, hit, and victory animation states

### Arenas (10 — one per warrior)
| Warrior | Arena | Visual Concept |
|---|---|---|
| Knight | Castle Courtyard | Stone walls, banners, overcast sky |
| Samurai | Cherry Blossom Dojo | Wooden platform, sakura trees, mountains |
| Viking | Longship Deck | Ship at sea, stormy sky, waves |
| Gladiator | Roman Colosseum | Sand arena, arched walls, crowd silhouettes |
| Mongol | Steppe Grasslands | Open plains, yurts in distance, vast sky |
| Spartan | Thermopylae Pass | Narrow rocky pass, cliffs, dramatic light |
| Pirate | Port Tavern Dock | Wooden dock, ships in harbor, sunset |
| Zulu | Savanna | Golden grass, acacia trees, warm light |
| Conquistador | Aztec Temple Steps | Stone pyramid, jungle, gold accents |
| Navy SEAL | Aircraft Carrier Deck | Steel deck, jets, ocean horizon |

- Static backgrounds (no interactive elements)
- Programmatically drawn for v1, replaceable later

### UI Theme
- Stylized parchment/scroll aesthetic for menus
- Character portraits with name plates and stat preview bars
- Animated selection cursor
- Historical/medieval typography feel
- Bright, high-contrast color scheme throughout

---

## Technical Architecture

### Phaser 3 Scene Structure
```
BootScene → PreloadScene → TitleScene → ModeSelectScene → CharacterSelectScene → ArenaSelectScene → FightScene → ResultScene
```

### Key Systems to Build
1. **Fighter class** — Base class with shared moveset, stats, animation state machine, hitbox management
2. **SpecialMove system** — Pluggable special moves per warrior
3. **Input Manager** — Dual-player keyboard input with configurable bindings
4. **AI Controller** — Personality-driven decision-making per warrior type
5. **Combat Manager** — Hit detection, damage calculation, hitstop, knockback
6. **Round Manager** — Best-of-3 logic, round transitions, match state
7. **Art Generator** — Programmatic character and arena drawing system
8. **UI System** — Menus, health bars, special meters, round indicators

### Responsive Design
- Maintain game aspect ratio (16:9)
- Scale canvas to fit browser window
- UI elements positioned relative to canvas size
- Touch controls NOT required for v1 (keyboard only)

### Project Structure (suggested)
```
blade-of-ages/
  index.html
  package.json
  src/
    main.js              — Phaser config & boot
    scenes/              — All game scenes
    fighters/            — Fighter base class + per-warrior configs
    ai/                  — AI controller + personality profiles
    combat/              — Hit detection, damage, effects
    art/                 — Programmatic drawing functions
    ui/                  — HUD, menus, health bars
    config/              — Game constants, warrior stats, key bindings
  assets/                — (Empty for v1, future art/audio)
```

---

## Verification & Testing

1. **Core combat loop** — Two fighters can move, attack, block, take damage, and die in a single round
2. **Input test** — Both P1 (WASD+FGH) and P2 (arrows+nearby keys) work simultaneously without conflicts
3. **Round system** — Best-of-3 works correctly with proper win tracking and round transitions
4. **All 10 warriors** — Each loads with correct programmatic art, stats, AI personality, and unique special move
5. **All 10 arenas** — Each renders correctly as a backdrop
6. **AI behavior** — Each warrior's AI feels distinct (Viking aggressive, Knight defensive, etc.)
7. **Special meter** — Fills from damage dealt, activates special correctly, resets after use
8. **Combat feel** — Hit sparks appear, freeze frames trigger on heavy hits, knockback is visible
9. **Game flow** — Full loop from title → mode → pick → arena → fight → result → rematch works
10. **Responsive** — Game scales properly when resizing browser window
11. **Performance** — Consistent 60fps during fights with effects active

---

## Scope & Priorities

### Must Have (v1)
- All 10 warriors with programmatic art, stats, specials, and AI
- All 10 themed arenas
- Full game flow (title → select → fight → result)
- Best-of-3 round system
- Local 2-player + single-player vs AI
- Hit sparks, freeze frames, knockback
- Responsive scaling
- Stylized menu UI

### Won't Have (v1)
- Audio (sound effects or music)
- Online multiplayer
- Campaign/story mode
- Touch/mobile controls
- Hand-drawn art assets
- Configurable key bindings UI
- Leaderboards or progression

### Future Considerations
- Audio layer (SFX + per-arena music)
- Hand-drawn or AI-generated art replacement
- Online multiplayer via WebSockets
- Mobile touch controls
- Campaign mode with progression
- Additional warriors (DLC-style expansion)
- Web deployment (hosting, analytics)
