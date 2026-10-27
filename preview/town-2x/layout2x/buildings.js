// 2x town PLACEHOLDER layout: the single building list. Swap art by changing the `img` line only.
// Data is strict JSON between the markers so tools/checks/layout2x.py can parse it.
// Lots (kind "lot") are reserved empty plots: no art, no door.
window.TOWN2X = /*JSON*/
{
 "canvas": {
  "w": 3840,
  "h": 2880
 },
 "SPRITE": {
  "h": 98,
  "w": 48
 },
 "PATH_MIN": 128,
 "APRON": 160,
 "spawn": {
  "x": 1920,
  "y": 1092
 },
 "districts": [
  {
   "id": "civic",
   "label": "Civic: hall + square",
   "x": 1408,
   "y": 0,
   "w": 1024,
   "h": 1404
  },
  {
   "id": "residential",
   "label": "Residential",
   "x": 0,
   "y": 0,
   "w": 1300,
   "h": 1840
  },
  {
   "id": "pub",
   "label": "Pub corner",
   "x": 2426,
   "y": 64,
   "w": 720,
   "h": 560
  },
  {
   "id": "park",
   "label": "Park",
   "x": 2496,
   "y": 780,
   "w": 704,
   "h": 624
  },
  {
   "id": "library",
   "label": "Library close",
   "x": 3232,
   "y": 900,
   "w": 608,
   "h": 600
  },
  {
   "id": "working",
   "label": "Works quarter",
   "x": 0,
   "y": 1700,
   "w": 3840,
   "h": 1180
  }
 ],
 "square": {
  "x": 1440,
  "y": 812,
  "w": 960,
  "h": 560
 },
 "streets": [
  {
   "id": "high_street",
   "x": 1312,
   "y": 684,
   "w": 2528,
   "h": 128
  },
  {
   "id": "oak_lane",
   "x": 0,
   "y": 443,
   "w": 1440,
   "h": 128
  },
  {
   "id": "ivy_lane",
   "x": 0,
   "y": 1047,
   "w": 1440,
   "h": 128
  },
  {
   "id": "fern_lane",
   "x": 0,
   "y": 1647,
   "w": 1440,
   "h": 128
  },
  {
   "id": "works_road",
   "x": 0,
   "y": 2600,
   "w": 3840,
   "h": 128
  },
  {
   "id": "library_walk",
   "x": 2400,
   "y": 1372,
   "w": 1440,
   "h": 128
  }
 ],
 "spokes": [
  {
   "id": "hall_lane",
   "x": 1312,
   "y": 443,
   "w": 128,
   "h": 1332
  },
  {
   "id": "main_street",
   "x": 1826,
   "y": 1372,
   "w": 128,
   "h": 1228
  },
  {
   "id": "pub_door",
   "x": 2722,
   "y": 550,
   "w": 96,
   "h": 134
  },
  {
   "id": "east_lane",
   "x": 3200,
   "y": 684,
   "w": 128,
   "h": 816
  }
 ],
 "buildings": [
  {
   "id": "spare_r1",
   "label": "Spare lot (house)",
   "kind": "lot",
   "district": "residential",
   "img": null,
   "w": 429,
   "h": 347,
   "x": 96,
   "y": 1300,
   "status": "lot",
   "slot": {
    "x": 38,
    "y": 47,
    "w": 352,
    "h": 300
   }
  },
  {
   "id": "oak",
   "label": "Oak",
   "kind": "building",
   "district": "residential",
   "img": "assets/town2x/oak_r16l.png",
   "w": 429,
   "h": 346,
   "x": 96,
   "y": 97,
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
   "x": 653,
   "y": 96,
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
   "x": 96,
   "y": 700,
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
   "x": 653,
   "y": 700,
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
   "id": "spare_r2",
   "label": "Spare lot (house)",
   "kind": "lot",
   "district": "residential",
   "img": null,
   "w": 429,
   "h": 347,
   "x": 653,
   "y": 1300,
   "status": "lot",
   "slot": {
    "x": 38,
    "y": 47,
    "w": 352,
    "h": 300
   }
  },
  {
   "id": "spare_w1",
   "label": "Spare lot (working)",
   "kind": "lot",
   "district": "working",
   "img": null,
   "w": 480,
   "h": 360,
   "x": 2562,
   "y": 2240,
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
   "x": 2490,
   "y": 160,
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
   "id": "tower",
   "label": "Tower",
   "kind": "building",
   "district": "working",
   "img": "assets/town2x/tower_r16c.png",
   "w": 467,
   "h": 837,
   "x": 797,
   "y": 1763,
   "door": {
    "x": 204,
    "y": 727,
    "w": 60,
    "h": 110
   },
   "status": "locked"
  },
  {
   "id": "library",
   "label": "Library",
   "kind": "building",
   "district": "library",
   "img": "assets/town2x/library_r17e.png",
   "w": 473,
   "h": 355,
   "x": 3296,
   "y": 1017,
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
   "id": "hall",
   "label": "Hall",
   "kind": "building",
   "district": "civic",
   "img": "assets/town2x/hall_r16d.png",
   "w": 883,
   "h": 588,
   "x": 1479,
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
   "id": "lab",
   "label": "Lab",
   "kind": "building",
   "district": "working",
   "img": "assets/town2x/lab_r16b.png",
   "w": 434,
   "h": 332,
   "x": 1392,
   "y": 2268,
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
   "x": 1954,
   "y": 2240,
   "door": {
    "x": 210,
    "y": 250,
    "w": 60,
    "h": 110
   },
   "status": "placeholder"
  },
  {
   "id": "park",
   "label": "Park (returns from the old layout)",
   "kind": "lot",
   "status": "park",
   "img": null,
   "w": 640,
   "h": 560,
   "x": 2528,
   "y": 812,
   "district": "park"
  }
 ],
 "viewport": {
  "x": 640,
  "y": 0,
  "w": 2560,
  "h": 1440,
  "assumption": "1920x1080 screen, camera zoom 0.75 -> 2560x1440 world px"
 }
}
/*END*/;
if (typeof module !== 'undefined') module.exports = window.TOWN2X;
