// 2x town PLACEHOLDER layout: the single building list. Swap art by changing the `img` line only.
// Data is strict JSON between the markers so tools/checks/layout2x.py can parse it.
window.TOWN2X = /*JSON*/
{
 "canvas": {
  "w": 2400,
  "h": 1936
 },
 "SPRITE": {
  "h": 98,
  "w": 48
 },
 "PATH_MIN": 128,
 "APRON": 160,
 "spawn": {
  "x": 1200,
  "y": 1880
 },
 "buildings": [
  {
   "id": "tower",
   "label": "Tower",
   "img": "assets/town2x/tower_r16c.png",
   "w": 467,
   "h": 837,
   "x": 96,
   "y": 96,
   "door": {
    "x": 204,
    "y": 727,
    "w": 60,
    "h": 110
   },
   "status": "locked"
  },
  {
   "id": "hall",
   "label": "Hall",
   "img": "assets/town2x/hall_r16d.png",
   "w": 883,
   "h": 588,
   "x": 691,
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
   "id": "library",
   "label": "Library",
   "img": "assets/town2x/library_r17d.png",
   "w": 610,
   "h": 500,
   "x": 1702,
   "y": 96,
   "door": {
    "x": 275,
    "y": 390,
    "w": 60,
    "h": 110
   },
   "status": "stand-in-r17d"
  },
  {
   "id": "pub",
   "label": "Pub",
   "img": "assets/town2x/pub_r17d.png",
   "w": 583,
   "h": 421,
   "x": 841,
   "y": 844,
   "door": {
    "x": 349,
    "y": 271,
    "w": 60,
    "h": 110,
    "dx": 87,
    "dy": -40,
    "measured": "pub_r17d outer frame x341-416, top y259, threshold y381; opening x357-401 y274-380"
   },
   "status": "latest-r17d"
  },
  {
   "id": "lab",
   "label": "Lab",
   "img": "assets/town2x/lab_r16b.png",
   "w": 434,
   "h": 332,
   "x": 1784,
   "y": 743,
   "door": {
    "x": 187,
    "y": 222,
    "w": 60,
    "h": 110
   },
   "status": "accepted"
  },
  {
   "id": "oak",
   "label": "Oak",
   "img": "assets/town2x/oak_r16l.png",
   "w": 429,
   "h": 346,
   "x": 150,
   "y": 1424,
   "door": {
    "x": 185,
    "y": 236,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate"
  },
  {
   "id": "ivy",
   "label": "Ivy",
   "img": "assets/town2x/ivy_r16e.png",
   "w": 429,
   "h": 347,
   "x": 707,
   "y": 1424,
   "door": {
    "x": 185,
    "y": 237,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate"
  },
  {
   "id": "birch",
   "label": "Birch",
   "img": "assets/town2x/birch_r16d.png",
   "w": 429,
   "h": 347,
   "x": 1264,
   "y": 1424,
   "door": {
    "x": 185,
    "y": 237,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate"
  },
  {
   "id": "fern",
   "label": "Fern",
   "img": "assets/town2x/fern_r16f.png",
   "w": 429,
   "h": 347,
   "x": 1821,
   "y": 1424,
   "door": {
    "x": 185,
    "y": 237,
    "w": 60,
    "h": 110
   },
   "status": "accepted-candidate"
  }
 ]
}
/*END*/;
if (typeof module !== 'undefined') module.exports = window.TOWN2X;
