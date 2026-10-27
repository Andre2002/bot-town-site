// 2x town PLACEHOLDER layout: the single building list. Swap art by changing the `img` line only.
// Data is strict JSON between the markers so tools/checks/layout2x.py can parse it.
// Lots (kind "lot") are reserved empty plots: no art, no door.
window.TOWN2X = /*JSON*/
{
 "canvas": {
  "w": 3200,
  "h": 2368
 },
 "SPRITE": {
  "h": 98,
  "w": 48
 },
 "PATH_MIN": 96,
 "APRON": 160,
 "spawn": {
  "x": 1600,
  "y": 1060
 },
 "districts": [
  {
   "id": "residential",
   "label": "Residential",
   "x": 0,
   "y": 0,
   "w": 1114,
   "h": 998
  },
  {
   "id": "civic",
   "label": "Civic: hall + square",
   "x": 1114,
   "y": 0,
   "w": 990,
   "h": 1372
  },
  {
   "id": "tbd",
   "label": "TBD (open lot)",
   "x": 2106,
   "y": 96,
   "w": 560,
   "h": 560
  },
  {
   "id": "pub",
   "label": "Pub",
   "x": 2190,
   "y": 780,
   "w": 620,
   "h": 520
  },
  {
   "id": "teleport",
   "label": "Teleport",
   "x": 2892,
   "y": 780,
   "w": 308,
   "h": 456
  },
  {
   "id": "library",
   "label": "Library",
   "x": 1664,
   "y": 1340,
   "w": 656,
   "h": 400
  },
  {
   "id": "park",
   "label": "Park",
   "x": 0,
   "y": 1014,
   "w": 1114,
   "h": 512
  },
  {
   "id": "working",
   "label": "Works quarter",
   "x": 0,
   "y": 1740,
   "w": 3200,
   "h": 628
  }
 ],
 "square": {
  "x": 1136,
  "y": 780,
  "w": 928,
  "h": 560
 },
 "streets": [
  {
   "id": "high_street",
   "x": 1018,
   "y": 684,
   "w": 2182,
   "h": 96
  },
  {
   "id": "oak_lane",
   "x": 0,
   "y": 459,
   "w": 1018,
   "h": 96
  },
  {
   "id": "ivy_lane",
   "x": 0,
   "y": 902,
   "w": 1018,
   "h": 96
  },
  {
   "id": "pub_yard",
   "x": 2064,
   "y": 1236,
   "w": 1136,
   "h": 96
  },
  {
   "id": "library_walk",
   "x": 1632,
   "y": 1727,
   "w": 688,
   "h": 96
  },
  {
   "id": "works_road",
   "x": 0,
   "y": 2240,
   "w": 3200,
   "h": 96
  }
 ],
 "spokes": [
  {
   "id": "res_lane",
   "x": 1018,
   "y": 459,
   "w": 96,
   "h": 539
  },
  {
   "id": "main_street",
   "x": 1536,
   "y": 1340,
   "w": 96,
   "h": 900
  },
  {
   "id": "teleport_path",
   "x": 2796,
   "y": 780,
   "w": 96,
   "h": 456
  }
 ],
 "buildings": [
  {
   "id": "oak",
   "label": "Oak",
   "kind": "building",
   "district": "residential",
   "img": "assets/town2x/oak_r16l.png",
   "w": 429,
   "h": 346,
   "x": 64,
   "y": 113,
   "door": {
    "x": 185,
    "y": 236,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate",
   "slot": {
    "x": 38,
    "y": 46,
    "w": 352,
    "h": 300
   }
  },
  {
   "id": "ivy",
   "label": "Ivy",
   "kind": "building",
   "district": "residential",
   "img": "assets/town2x/ivy_r16e.png",
   "w": 429,
   "h": 347,
   "x": 589,
   "y": 112,
   "door": {
    "x": 185,
    "y": 237,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate",
   "slot": {
    "x": 38,
    "y": 47,
    "w": 352,
    "h": 300
   }
  },
  {
   "id": "birch",
   "label": "Birch",
   "kind": "building",
   "district": "residential",
   "img": "assets/town2x/birch_r16d.png",
   "w": 429,
   "h": 347,
   "x": 64,
   "y": 555,
   "door": {
    "x": 185,
    "y": 237,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate",
   "slot": {
    "x": 38,
    "y": 47,
    "w": 352,
    "h": 300
   }
  },
  {
   "id": "fern",
   "label": "Fern",
   "kind": "building",
   "district": "residential",
   "img": "assets/town2x/fern_r16f.png",
   "w": 429,
   "h": 347,
   "x": 589,
   "y": 555,
   "door": {
    "x": 185,
    "y": 237,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate",
   "slot": {
    "x": 38,
    "y": 47,
    "w": 352,
    "h": 300
   }
  },
  {
   "id": "park",
   "label": "Park",
   "kind": "lot",
   "status": "park",
   "img": null,
   "w": 954,
   "h": 480,
   "x": 64,
   "y": 1030,
   "district": "park"
  },
  {
   "id": "hall",
   "label": "Hall",
   "kind": "building",
   "district": "civic",
   "img": "assets/town2x/hall_r16d.png",
   "w": 883,
   "h": 588,
   "x": 1159,
   "y": 96,
   "door": {
    "x": 412,
    "y": 478,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate"
  },
  {
   "id": "tbd",
   "label": "TBD (open lot)",
   "kind": "lot",
   "district": "tbd",
   "img": null,
   "w": 480,
   "h": 420,
   "x": 2138,
   "y": 160,
   "status": "lot"
  },
  {
   "id": "pub",
   "label": "Pub",
   "kind": "building",
   "district": "pub",
   "img": "assets/town2x/pub_r17e.png",
   "w": 560,
   "h": 390,
   "x": 2236,
   "y": 782,
   "door": {
    "x": 250,
    "y": 240,
    "w": 60,
    "h": 110,
    "dx": 0,
    "dy": -40,
    "measured": "pub_r17e: outer casing x229-331, lintel top y226; leaf x237-323, top y241, threshold y350 (opening 109 tall); centre x280"
   },
   "status": "locked"
  },
  {
   "id": "teleport",
   "label": "Teleport base (placeholder)",
   "kind": "lot",
   "district": "teleport",
   "img": null,
   "w": 148,
   "h": 198,
   "x": 2972,
   "y": 909,
   "status": "lot",
   "ref": "live town/index.html Summon Hill (hill_* features via __townLayout): 1x footprint x406-480, y117-216 = 74x99 (wall + plateau 74x82 at y134-216, pine tops to y117); 2x lot = 148x198. 1x crop: /workspace/proof/town-2x/refs/teleport_1x.png"
  },
  {
   "id": "library",
   "label": "Library",
   "kind": "building",
   "district": "library",
   "img": "assets/town2x/library_r30.png",
   "w": 594,
   "h": 364,
   "x": 1696,
   "y": 1363,
   "door": {
    "x": 439,
    "y": 204,
    "w": 78,
    "h": 123,
    "measured": "library_r29 (594x364): door frame x439-516, arch top y204, leaf x442-516, threshold (last leaf row) y326; door point = bottom-centre (478,327)"
   },
   "status": "final-r29"
  },
  {
   "id": "mage_shop",
   "label": "Mage shop",
   "kind": "building",
   "district": "working",
   "img": "assets/town2x/mage_r2.png",
   "w": 429,
   "h": 362,
   "x": 64,
   "y": 1878,
   "door": {
    "x": 101,
    "y": 216,
    "w": 63,
    "h": 111,
    "measured": "mage_r2 (429x362): door on the LEFT; frame x101-163, arch top y216, threshold y326; door point = bottom-centre (132,327)"
   },
   "status": "final-r2"
  },
  {
   "id": "lab",
   "label": "Lab",
   "kind": "building",
   "district": "working",
   "img": "assets/town2x/lab_r19.png",
   "w": 434,
   "h": 332,
   "x": 627,
   "y": 1908,
   "door": {
    "x": 182,
    "y": 211,
    "w": 70,
    "h": 115,
    "measured": "lab_r19 (434x332): door opening x182-251, arch top y211, threshold y325; door point = bottom-centre (217,326)"
   },
   "status": "final-r19"
  },
  {
   "id": "workshop",
   "label": "Workshop (no art yet)",
   "kind": "building",
   "district": "working",
   "img": null,
   "w": 480,
   "h": 360,
   "x": 1728,
   "y": 1880,
   "door": {
    "x": 210,
    "y": 250,
    "w": 60,
    "h": 110
   },
   "status": "placeholder"
  },
  {
   "id": "spare_w1",
   "label": "Spare lot (working)",
   "kind": "lot",
   "district": "working",
   "img": null,
   "w": 480,
   "h": 360,
   "x": 2304,
   "y": 1880,
   "status": "lot"
  }
 ],
 "viewport": {
  "x": 0,
  "y": 0,
  "w": 3200,
  "h": 1800,
  "zoom": 0.6,
  "assumption": "1920x1080 screen, camera zoom 0.6 -> 3200x1800 world px (the full canvas width)"
 },
 "PATH_MAX": 128,
 "plaza": {
  "id": "teleport_plaza",
  "label": "Teleport plaza",
  "x": 2892,
  "y": 780,
  "w": 308,
  "h": 456,
  "note": "ground area filling the block bounded by High Street (top), Teleport Path (left), Pub Yard (bottom) and the canvas edge; the Summon Hill base sits inside"
 },
 "patios": [
  {
   "id": "pub_patio",
   "label": "Pub patio",
   "x": 2416,
   "y": 1172,
   "w": 200,
   "h": 64,
   "for": "pub",
   "note": "walkable patio between the pub door and Pub Yard"
  },
  {
   "id": "board_spot",
   "label": "Town board spot",
   "x": 2076,
   "y": 980,
   "w": 120,
   "h": 140,
   "for": "square",
   "note": "reserved walkable spot for the task board, just east of the square"
  }
 ]
}
/*END*/;
if (typeof module !== 'undefined') module.exports = window.TOWN2X;
