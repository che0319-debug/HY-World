// Character sprite definitions — Task 05
// Each entry overrides the base Character class sprite via applySprite(cfg).
//
// Palette slot reference (Task 04):
//   0 transparent · 1 skin · 2 hair · 3 body · 4 armDark · 5 leg · 6 accent
// Extra slots injected here:
//   7 glasses (HY) · 8 hat-brim (950157)

const CharacterSprites = (() => {

  // ── HY ── green body, dark hair, blue rectangular glasses ──────────
  // Glasses appear across face rows 2-3 as two 2-pixel-wide blue lenses.
  // Slot 7 = glasses blue (#4477cc)
  const HY_IDLE = [
    [0, 0, 2, 2, 2, 2, 0, 0], //  0  hair top
    [0, 2, 2, 2, 2, 2, 2, 0], //  1  hair
    [0, 1, 7, 7, 1, 7, 7, 0], //  2  glasses frame top
    [0, 1, 7, 7, 1, 7, 7, 0], //  3  glasses frame bottom (lenses)
    [0, 1, 1, 1, 1, 1, 1, 0], //  4  face lower / mouth area
    [0, 3, 3, 3, 3, 3, 3, 0], //  5  collar
    [4, 3, 3, 3, 3, 3, 3, 4], //  6  arms + body
    [4, 3, 3, 3, 3, 3, 3, 4], //  7  arms + body
    [0, 3, 3, 3, 3, 3, 3, 0], //  8  body
    [0, 3, 3, 3, 3, 3, 3, 0], //  9  body lower
    [0, 5, 5, 0, 0, 5, 5, 0], // 10  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 11  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 12  legs
    [0, 6, 6, 0, 0, 6, 6, 0], // 13  feet
  ];

  // Head rows for HY are shared between IDLE and WORK variants
  const HY_HEAD = [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 1, 7, 7, 1, 7, 7, 0],
    [0, 1, 7, 7, 1, 7, 7, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ];

  const HY_WORK_A = [
    ...HY_HEAD,
    [0, 3, 3, 3, 3, 3, 3, 0], //  5  body
    [0, 3, 3, 3, 3, 3, 3, 0], //  6  body
    [4, 4, 3, 3, 3, 3, 4, 4], //  7  arms extended forward (typing-A)
    [0, 0, 4, 4, 4, 4, 0, 0], //  8  hands on desk
    [0, 0, 0, 0, 0, 0, 0, 0], //  9
  ];

  const HY_WORK_B = [
    ...HY_HEAD,
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 4, 3, 3, 3, 3, 4, 0], //  7  arms slightly raised (typing-B)
    [0, 4, 4, 4, 4, 4, 4, 0], //  8  hands up
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // ── 小因 ── pink body, pink long hair falling to waist ─────────────
  // Long hair uses slot 2 = '#ffaad4' (pale pink).
  // Hair extends on both sides (col 0 & 7) from row 1 down through row 8.
  const XIAO_IDLE = [
    [0, 0, 2, 2, 2, 2, 0, 0], //  0  hair top (centre volume)
    [2, 2, 2, 2, 2, 2, 2, 2], //  1  hair full-width (flows wide)
    [2, 1, 1, 1, 1, 1, 1, 2], //  2  face + hair curtain sides
    [2, 1, 6, 1, 1, 6, 1, 2], //  3  eyes + hair sides
    [2, 1, 1, 1, 1, 1, 1, 2], //  4  face lower + hair sides
    [2, 3, 3, 3, 3, 3, 3, 2], //  5  collar + hair drapes
    [2, 3, 3, 3, 3, 3, 3, 2], //  6  body + hair drapes
    [2, 3, 3, 3, 3, 3, 3, 2], //  7  body + hair drapes
    [2, 3, 3, 3, 3, 3, 3, 2], //  8  lower body + hair ends
    [0, 3, 3, 3, 3, 3, 3, 0], //  9  body (hair finished)
    [0, 5, 5, 0, 0, 5, 5, 0], // 10  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 11  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 12  legs
    [0, 6, 6, 0, 0, 6, 6, 0], // 13  feet
  ];

  const XIAO_HEAD = [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 6, 1, 1, 6, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 2],
  ];

  const XIAO_WORK_A = [
    ...XIAO_HEAD,
    [2, 3, 3, 3, 3, 3, 3, 2], //  5  body + hair
    [2, 3, 3, 3, 3, 3, 3, 2], //  6  body + hair
    [4, 4, 3, 3, 3, 3, 4, 4], //  7  arms forward (hair hidden by arms)
    [0, 0, 4, 4, 4, 4, 0, 0], //  8  hands on desk
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const XIAO_WORK_B = [
    ...XIAO_HEAD,
    [2, 3, 3, 3, 3, 3, 3, 2],
    [2, 3, 3, 3, 3, 3, 3, 2],
    [0, 4, 3, 3, 3, 3, 4, 0],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // ── 950157 ── blue body, yellow engineer hard-hat ──────────────────
  // Hat brim  = slot 8 '#aa8800' (dark gold, full 8-col width → sticks out)
  // Hat crown = slot 2 '#ffcc44' (bright yellow, 4-col wide like normal hair)
  // Face/body rows identical to base sprite.
  const ITRI_IDLE = [
    [8, 8, 8, 8, 8, 8, 8, 8], //  0  hard-hat brim (full width)
    [0, 0, 2, 2, 2, 2, 0, 0], //  1  hat crown (yellow, narrow)
    [0, 1, 1, 1, 1, 1, 1, 0], //  2  face top
    [0, 1, 6, 1, 1, 6, 1, 0], //  3  eyes
    [0, 1, 1, 1, 1, 1, 1, 0], //  4  face lower
    [0, 3, 3, 3, 3, 3, 3, 0], //  5  collar
    [4, 3, 3, 3, 3, 3, 3, 4], //  6  arms + body
    [4, 3, 3, 3, 3, 3, 3, 4], //  7  arms + body
    [0, 3, 3, 3, 3, 3, 3, 0], //  8  body
    [0, 3, 3, 3, 3, 3, 3, 0], //  9  body lower
    [0, 5, 5, 0, 0, 5, 5, 0], // 10  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 11  legs
    [0, 5, 5, 0, 0, 5, 5, 0], // 12  legs
    [0, 6, 6, 0, 0, 6, 6, 0], // 13  feet
  ];

  const ITRI_HEAD = [
    [8, 8, 8, 8, 8, 8, 8, 8],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 6, 1, 1, 6, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ];

  const ITRI_WORK_A = [
    ...ITRI_HEAD,
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [4, 4, 3, 3, 3, 3, 4, 4],
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const ITRI_WORK_B = [
    ...ITRI_HEAD,
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 4, 3, 3, 3, 3, 4, 0],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // ── sprite configs per character ID ───────────────────────────────
  const CONFIGS = {
    hy: {
      palette: [
        [2, '#1a1a1a'],  // dark hair
        [7, '#4477cc'],  // glasses blue
      ],
      idle:  HY_IDLE,
      workA: HY_WORK_A,
      workB: HY_WORK_B,
    },
    xiaoyin: {
      palette: [
        [2, '#ffaad4'],  // pale pink long hair
      ],
      idle:  XIAO_IDLE,
      workA: XIAO_WORK_A,
      workB: XIAO_WORK_B,
    },
    itri950: {
      palette: [
        [2, '#ffcc44'],  // bright yellow hat crown
        [8, '#aa8800'],  // dark gold hat brim
      ],
      idle:  ITRI_IDLE,
      workA: ITRI_WORK_A,
      workB: ITRI_WORK_B,
    },
  };

  // ── public API ────────────────────────────────────────────────────
  return {
    // Apply sprites to all characters.
    // charsMap: { [id]: Character instance }
    applyAll(charsMap) {
      Object.entries(CONFIGS).forEach(([id, cfg]) => {
        const char = charsMap[id];
        if (char) char.applySprite(cfg);
      });
    }
  };
})();
