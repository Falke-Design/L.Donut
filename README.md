# L.Donut

Makes it possible to draw donuts with `L.Donut` on Leaflet maps. 

It extends `L.Circle` and adds a inner radius.

![grafik](https://user-images.githubusercontent.com/19800037/139536038-b0d85d7d-461c-490f-94a9-5956677bab0b.png)


```js
var donut = L.donut(map.getCenter(),{
  radius: 2000,
  innerRadius: 1000,
  innerRadiusAsPercent: false,
}).addTo(map);
```

## Installation

Download **L.Donut.js** and include them in your project.
```html
<script src="./src/L.Donut.js"></script>
```
or use the script over cdn:
```html
<script src="https://cdn.jsdelivr.net/gh/Falke-Design/L.Donut@latest/src/L.Donut.js"></script>
```

## Methods:

You can use `new L.Donut` or the factory `L.donut`.

| Method                              | Returns   | Description                                                                                                                |
| :---------------------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------- |
| L.donut(`latlng`,`options`)         | `this`    | Creates the Donut shape.                                                                                                   |
| setInnerRadius(`radius`)            | `this`    | Sets the inner radius of a circle. Units are in meters or percent. The outer radius must be greater then the inner radius. |
| getInnerRadius()                    | `Number`  | Returns the current inner radius of a circle. Units are in meters or percent.                                              |

## Options:

| Option                              | Description                                                                               |
| :---------------------------------- | :---------------------------------------------------------------------------------------- |
| radius                              | Outer radius. The outer radius must be greater then the inner radius.                     |
| innerRadius                         | Inner radius. It can be a meter value or a percent (0-1) value of the outer radius.       |
| innerRadiusAsPercent                | Default `false`. Defines if the inner radius is a percent value of the outer radius.      |
| <`L.Circle` options>                | Other `L.Circle` options: [Docs](https://leafletjs.com/reference-1.7.1.html#circle)       |
