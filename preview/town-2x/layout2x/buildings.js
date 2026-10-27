// 2x town PLACEHOLDER layout: the single building list. Swap art by changing the `img` line only.
// Data is strict JSON between the markers so tools/checks/layout2x.py can parse it.
// Lots (kind "lot") are reserved empty plots: no art, no door.
window.TOWN2X = /*JSON*/
{
 "canvas": {
  "w": 3600,
  "h": 2560
 },
 "SPRITE": {
  "h": 98,
  "w": 48
 },
 "PATH_MIN": 128,
 "APRON": 160,
 "spawn": {
  "x": 1800,
  "y": 1021
 },
 "districts": [
  {
   "id": "residential",
   "label": "Residential",
   "x": 0,
   "y": 0,
   "w": 3600,
   "h": 603
  },
  {
   "id": "centre",
   "label": "Centre",
   "x": 0,
   "y": 603,
   "w": 3600,
   "h": 837
  },
  {
   "id": "working",
   "label": "Working",
   "x": 0,
   "y": 1440,
   "w": 3600,
   "h": 1120
  }
 ],
 "square": {
  "x": 1400,
  "y": 781,
  "w": 800,
  "h": 480
 },
 "streets": [
  {
   "id": "residential_street",
   "x": 0,
   "y": 443,
   "w": 3600,
   "h": 160
  },
  {
   "id": "centre_street",
   "x": 0,
   "y": 1312,
   "w": 3600,
   "h": 128
  },
  {
   "id": "working_street",
   "x": 0,
   "y": 2277,
   "w": 3600,
   "h": 160
  }
 ],
 "spokes": [
  {
   "id": "up",
   "x": 1736,
   "y": 443,
   "w": 128,
   "h": 338
  },
  {
   "id": "down_left",
   "x": 1312,
   "y": 1261,
   "w": 128,
   "h": 1016
  },
  {
   "id": "down_right",
   "x": 2323,
   "y": 1261,
   "w": 128,
   "h": 1016
  },
  {
   "id": "left",
   "x": 587,
   "y": 957,
   "w": 813,
   "h": 128
  },
  {
   "id": "right",
   "x": 2200,
   "y": 957,
   "w": 710,
   "h": 128
  },
  {
   "id": "pub_door",
   "x": 3241,
   "y": 1152,
   "w": 96,
   "h": 160
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
   "x": 193,
   "y": 96,
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
   "x": 750,
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
   "x": 1307,
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
   "x": 1864,
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
   "id": "fern",
   "label": "Fern",
   "kind": "building",
   "district": "residential",
   "img": "assets/town2x/fern_r16f.png",
   "w": 429,
   "h": 347,
   "x": 2421,
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
   "id": "spare_r2",
   "label": "Spare lot (house)",
   "kind": "lot",
   "district": "residential",
   "img": null,
   "w": 429,
   "h": 347,
   "x": 2978,
   "y": 96,
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
   "district": "centre",
   "img": null,
   "w": 480,
   "h": 360,
   "x": 107,
   "y": 731,
   "status": "lot"
  },
  {
   "id": "pub",
   "label": "Pub",
   "kind": "building",
   "district": "centre",
   "img": "assets/town2x/pub_r17d.png",
   "w": 583,
   "h": 421,
   "x": 2910,
   "y": 731,
   "door": {
    "x": 349,
    "y": 271,
    "w": 60,
    "h": 110,
    "dx": 87,
    "dy": -40,
    "measured": "pub_r17d outer frame x341-416, top y259, threshold y381; opening x357-401 y274-380"
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
   "x": 107,
   "y": 1440,
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
   "district": "working",
   "img": "assets/town2x/library_r17d.png",
   "w": 610,
   "h": 500,
   "x": 702,
   "y": 1777,
   "door": {
    "x": 275,
    "y": 390,
    "w": 60,
    "h": 110
   },
   "status": "stand-in-r17d"
  },
  {
   "id": "hall",
   "label": "Hall",
   "kind": "building",
   "district": "working",
   "img": "assets/town2x/hall_r16d.png",
   "w": 883,
   "h": 588,
   "x": 1440,
   "y": 1689,
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
   "x": 2451,
   "y": 1945,
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
   "x": 3013,
   "y": 1917,
   "door": {
    "x": 210,
    "y": 250,
    "w": 60,
    "h": 110
   },
   "status": "placeholder"
  }
 ]
}
/*END*/;
if (typeof module !== 'undefined') module.exports = window.TOWN2X;
