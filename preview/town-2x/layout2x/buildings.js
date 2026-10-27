// 2x town PLACEHOLDER layout: the single building list. Swap art by changing the `img` line only.
// Data is strict JSON between the markers so tools/checks/layout2x.py can parse it.
// Lots (kind "lot") are reserved empty plots: no art, no door.
window.TOWN2X = /*JSON*/
{
 "canvas": {
  "w": 3200,
  "h": 2720
 },
 "SPRITE": {
  "h": 98,
  "w": 48
 },
 "PATH_MIN": 128,
 "APRON": 160,
 "spawn": {
  "x": 1600,
  "y": 1092
 },
 "districts": [
  {
   "id": "residential",
   "label": "Residential",
   "x": 0,
   "y": 0,
   "w": 1146,
   "h": 1553
  },
  {
   "id": "civic",
   "label": "Civic: hall + square",
   "x": 1146,
   "y": 0,
   "w": 960,
   "h": 1404
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
   "x": 2860,
   "y": 900,
   "w": 340,
   "h": 360
  },
  {
   "id": "library",
   "label": "Library",
   "x": 1664,
   "y": 1404,
   "w": 660,
   "h": 580
  },
  {
   "id": "park",
   "label": "Park",
   "x": 0,
   "y": 1569,
   "w": 1146,
   "h": 440
  },
  {
   "id": "working",
   "label": "Works quarter",
   "x": 0,
   "y": 2049,
   "w": 3200,
   "h": 671
  }
 ],
 "square": {
  "x": 1136,
  "y": 812,
  "w": 928,
  "h": 560
 },
 "streets": [
  {
   "id": "high_street",
   "x": 1018,
   "y": 684,
   "w": 2182,
   "h": 128
  },
  {
   "id": "oak_lane",
   "x": 0,
   "y": 459,
   "w": 1018,
   "h": 128
  },
  {
   "id": "ivy_lane",
   "x": 0,
   "y": 934,
   "w": 1018,
   "h": 128
  },
  {
   "id": "reserve_lane",
   "x": 0,
   "y": 1425,
   "w": 1018,
   "h": 128
  },
  {
   "id": "pub_yard",
   "x": 2064,
   "y": 1268,
   "w": 860,
   "h": 128
  },
  {
   "id": "library_walk",
   "x": 1664,
   "y": 1759,
   "w": 624,
   "h": 128
  },
  {
   "id": "works_road",
   "x": 0,
   "y": 2561,
   "w": 3200,
   "h": 128
  }
 ],
 "spokes": [
  {
   "id": "res_lane",
   "x": 1018,
   "y": 459,
   "w": 128,
   "h": 1094
  },
  {
   "id": "main_street",
   "x": 1536,
   "y": 1372,
   "w": 128,
   "h": 1189
  },
  {
   "id": "teleport_path",
   "x": 2796,
   "y": 812,
   "w": 128,
   "h": 584
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
   "y": 587,
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
   "y": 587,
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
   "h": 400,
   "x": 64,
   "y": 1585,
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
   "y": 878,
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
   "x": 2924,
   "y": 974,
   "status": "lot",
   "ref": "live town/index.html Summon Hill (hill_* features via __townLayout): 1x footprint x406-480, y117-216 = 74x99 (wall + plateau 74x82 at y134-216, pine tops to y117); 2x lot = 148x198. 1x crop: /workspace/proof/town-2x/refs/teleport_1x.png"
  },
  {
   "id": "library",
   "label": "Library",
   "kind": "building",
   "district": "library",
   "img": "assets/town2x/library_r17e.png",
   "w": 473,
   "h": 355,
   "x": 1696,
   "y": 1404,
   "door": {
    "x": 206,
    "y": 210,
    "w": 60,
    "h": 110,
    "dx": 0,
    "dy": -35,
    "measured": "library_r17e: stone frame x192-280; leaf x207-265, top y214, threshold y320 (opening 106 tall); centre x236"
   },
   "status": "stand-in-r17e"
  },
  {
   "id": "mage_shop",
   "label": "Mage shop (redraw pending)",
   "kind": "building",
   "district": "working",
   "img": null,
   "w": 467,
   "h": 480,
   "x": 64,
   "y": 2081,
   "door": {
    "x": 204,
    "y": 370,
    "w": 60,
    "h": 110
   },
   "status": "placeholder",
   "note": "replaces tower_r16c (467x837) in the layout; the r16c art stays in town/assets/town2x/ untouched until Frame redraws a shorter mage shop"
  },
  {
   "id": "lab",
   "label": "Lab",
   "kind": "building",
   "district": "working",
   "img": "assets/town2x/lab_r16b.png",
   "w": 434,
   "h": 332,
   "x": 627,
   "y": 2229,
   "door": {
    "x": 187,
    "y": 222,
    "w": 60,
    "h": 110
   },
   "status": "accepted"
  },
  {
   "id": "workshop",
   "label": "Workshop (no art yet)",
   "kind": "building",
   "district": "working",
   "img": null,
   "w": 480,
   "h": 360,
   "x": 1760,
   "y": 2201,
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
   "x": 2336,
   "y": 2201,
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
 "reserve": [
  {
   "id": "future_houses",
   "label": "Room for 2 more houses",
   "district": "residential",
   "x": 64,
   "y": 1078,
   "w": 954,
   "h": 347
  }
 ]
}
/*END*/;
if (typeof module !== 'undefined') module.exports = window.TOWN2X;
