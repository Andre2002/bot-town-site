// GENERATED from assets.json by tools/checks/assets2x.py --write; edit assets.json, not this file.
window.TOWN_ASSETS = /*JSON*/
{
 "_note": "Art slots for the 2x layout. Drop a PNG at `png` (path relative to town/) and the page draws it at `footprint`; no code change. door = bottom-centre of the door rect (absolute); anchor = bottom-centre of footprint. After editing run: python3 tools/checks/assets2x.py --write (regenerates assets.js). Props (kind prop): footprint = full sprite box, base = the collision rect at the bottom of the sprite (props block only their base), anchor = bottom-centre, sortY = base bottom (= footprint bottom); the art is drawn behind the figure when the figure's feet are at or below sortY, in front of it otherwise. Checked by tools/checks/props2x.py.",
 "assets": [
  {
   "id": "oak",
   "label": "Oak",
   "kind": "building",
   "png": "assets/town2x/oak_r16l.png",
   "footprint": {
    "x": 64,
    "y": 113,
    "w": 429,
    "h": 346
   },
   "door": {
    "x": 279,
    "y": 459
   },
   "anchor": {
    "x": 278,
    "y": 459
   }
  },
  {
   "id": "ivy",
   "label": "Ivy",
   "kind": "building",
   "png": "assets/town2x/ivy_r16e.png",
   "footprint": {
    "x": 589,
    "y": 112,
    "w": 429,
    "h": 347
   },
   "door": {
    "x": 804,
    "y": 459
   },
   "anchor": {
    "x": 803,
    "y": 459
   }
  },
  {
   "id": "birch",
   "label": "Birch",
   "kind": "building",
   "png": "assets/town2x/birch_r16d.png",
   "footprint": {
    "x": 64,
    "y": 555,
    "w": 429,
    "h": 347
   },
   "door": {
    "x": 279,
    "y": 902
   },
   "anchor": {
    "x": 278,
    "y": 902
   }
  },
  {
   "id": "fern",
   "label": "Fern",
   "kind": "building",
   "png": "assets/town2x/fern_r16f.png",
   "footprint": {
    "x": 589,
    "y": 555,
    "w": 429,
    "h": 347
   },
   "door": {
    "x": 804,
    "y": 902
   },
   "anchor": {
    "x": 803,
    "y": 902
   }
  },
  {
   "id": "park",
   "label": "Park",
   "kind": "lot",
   "png": "assets/town2x/slots/park.png",
   "footprint": {
    "x": 64,
    "y": 1030,
    "w": 954,
    "h": 480
   },
   "door": null,
   "anchor": {
    "x": 541,
    "y": 1510
   }
  },
  {
   "id": "hall",
   "label": "Hall",
   "kind": "building",
   "png": "assets/town2x/hall_r16d.png",
   "footprint": {
    "x": 1159,
    "y": 96,
    "w": 883,
    "h": 588
   },
   "door": {
    "x": 1601,
    "y": 684
   },
   "anchor": {
    "x": 1600,
    "y": 684
   }
  },
  {
   "id": "tbd",
   "label": "TBD (open lot)",
   "kind": "lot",
   "png": "assets/town2x/slots/tbd.png",
   "footprint": {
    "x": 2138,
    "y": 160,
    "w": 480,
    "h": 420
   },
   "door": null,
   "anchor": {
    "x": 2378,
    "y": 580
   }
  },
  {
   "id": "pub",
   "label": "Pub",
   "kind": "building",
   "png": "assets/town2x/pub_r17e.png",
   "footprint": {
    "x": 2236,
    "y": 782,
    "w": 560,
    "h": 390
   },
   "door": {
    "x": 2516,
    "y": 1132
   },
   "anchor": {
    "x": 2516,
    "y": 1172
   }
  },
  {
   "id": "teleport",
   "label": "Teleport base (placeholder)",
   "kind": "lot",
   "png": "assets/town2x/slots/teleport.png",
   "footprint": {
    "x": 2972,
    "y": 909,
    "w": 148,
    "h": 198
   },
   "door": null,
   "anchor": {
    "x": 3046,
    "y": 1107
   }
  },
  {
   "id": "library",
   "label": "Library",
   "kind": "building",
   "png": "assets/town2x/library_r30.png",
   "footprint": {
    "x": 1696,
    "y": 1363,
    "w": 594,
    "h": 364
   },
   "door": {
    "x": 2174,
    "y": 1690
   },
   "anchor": {
    "x": 1993.0,
    "y": 1727
   }
  },
  {
   "id": "mage_shop",
   "label": "Mage shop",
   "kind": "building",
   "png": "assets/town2x/mage_r2.png",
   "footprint": {
    "x": 64,
    "y": 1878,
    "w": 429,
    "h": 362
   },
   "door": {
    "x": 196,
    "y": 2205
   },
   "anchor": {
    "x": 278.5,
    "y": 2240
   }
  },
  {
   "id": "lab",
   "label": "Lab",
   "kind": "building",
   "png": "assets/town2x/lab_r19.png",
   "footprint": {
    "x": 627,
    "y": 1908,
    "w": 434,
    "h": 332
   },
   "door": {
    "x": 844,
    "y": 2234
   },
   "anchor": {
    "x": 844,
    "y": 2240
   }
  },
  {
   "id": "workshop",
   "label": "Workshop (no art yet)",
   "kind": "building",
   "png": "assets/town2x/slots/workshop.png",
   "footprint": {
    "x": 1728,
    "y": 1880,
    "w": 480,
    "h": 360
   },
   "door": {
    "x": 1968,
    "y": 2240
   },
   "anchor": {
    "x": 1968,
    "y": 2240
   }
  },
  {
   "id": "spare_w1",
   "label": "Spare lot (working)",
   "kind": "lot",
   "png": "assets/town2x/slots/spare_w1.png",
   "footprint": {
    "x": 2304,
    "y": 1880,
    "w": 480,
    "h": 360
   },
   "door": null,
   "anchor": {
    "x": 2544,
    "y": 2240
   }
  },
  {
   "id": "board_spot",
   "label": "Town board",
   "kind": "prop",
   "png": "assets/town2x/props/board.png",
   "footprint": {
    "x": 2066,
    "y": 930,
    "w": 145,
    "h": 190
   },
   "door": null,
   "anchor": {
    "x": 2138,
    "y": 1120
   },
   "base": {
    "x": 2098,
    "y": 1096,
    "w": 80,
    "h": 24
   },
   "sortY": 1120
  },
  {
   "id": "lamp_sq_nw",
   "label": "Lamp",
   "kind": "prop",
   "png": "assets/town2x/props/lamp.png",
   "footprint": {
    "x": 1168,
    "y": 781,
    "w": 32,
    "h": 180
   },
   "base": {
    "x": 1172,
    "y": 945,
    "w": 24,
    "h": 16
   },
   "door": null,
   "anchor": {
    "x": 1184,
    "y": 961
   },
   "sortY": 961
  },
  {
   "id": "lamp_sq_ne",
   "label": "Lamp",
   "kind": "prop",
   "png": "assets/town2x/props/lamp.png",
   "footprint": {
    "x": 2000,
    "y": 781,
    "w": 32,
    "h": 180
   },
   "base": {
    "x": 2004,
    "y": 945,
    "w": 24,
    "h": 16
   },
   "door": null,
   "anchor": {
    "x": 2016,
    "y": 961
   },
   "sortY": 961
  },
  {
   "id": "lamp_high_e",
   "label": "Lamp",
   "kind": "prop",
   "png": "assets/town2x/props/lamp.png",
   "footprint": {
    "x": 2708,
    "y": 503,
    "w": 32,
    "h": 180
   },
   "base": {
    "x": 2712,
    "y": 667,
    "w": 24,
    "h": 16
   },
   "door": null,
   "anchor": {
    "x": 2724,
    "y": 683
   },
   "sortY": 683
  },
  {
   "id": "lamp_yard_w",
   "label": "Lamp",
   "kind": "prop",
   "png": "assets/town2x/props/lamp.png",
   "footprint": {
    "x": 2026,
    "y": 1056,
    "w": 32,
    "h": 180
   },
   "base": {
    "x": 2030,
    "y": 1220,
    "w": 24,
    "h": 16
   },
   "door": null,
   "anchor": {
    "x": 2042,
    "y": 1236
   },
   "sortY": 1236
  },
  {
   "id": "bench_square",
   "label": "Bench",
   "kind": "prop",
   "png": "assets/town2x/props/bench.png",
   "footprint": {
    "x": 1821,
    "y": 1206,
    "w": 110,
    "h": 80
   },
   "base": {
    "x": 1824,
    "y": 1266,
    "w": 104,
    "h": 20
   },
   "door": null,
   "anchor": {
    "x": 1876,
    "y": 1286
   },
   "sortY": 1286
  }
 ]
}
/*END*/;
