# Motion Study

The hero uses a BVH motion example as a visual study, not as a personal project credit.

- Source: https://github.com/mrdoob/three.js/blob/dev/examples/models/bvh/pirouette.bvh
- Original format: BVH, 592 frames at 120 Hz.
- `clip.json`: sampled at 30 Hz with 19 body joints, centered horizontally.
- `poster.png` and `poster-mobile.png`: static renders used if WebGL is unavailable.
- Renderer: Three.js 0.186.0. License: `THREE-LICENSE.txt`.
- Interface icons: Lucide 1.46.0. License: `LUCIDE-LICENSE.txt`.

The compressed browser bundle includes the sampled data and icons, so previewing
the website does not require a server, network requests, or a package install.

To regenerate the sampled data and browser bundle, run `npm install` and
`npm run build` from the repository root. Scene source: `src/scripts/motion.js`.
