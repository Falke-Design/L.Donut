/*
 * @class Donut
 * @aka L.Donut
 * @inherits Circle
 *
 * A class for drawing donut overlays on a map. Extends `Circle`.
 *
 * @example
 *
 * ```js
 * L.donut([50.5, 30.5], {radius: 200, innerRadius: 100, innerRadiusAsPercent: false}).addTo(map);
 * ```
 */
L.Donut = L.Circle.extend({

    initialize: function (latlng, options, legacyOptions) {
        L.Circle.prototype.initialize.call(this, latlng, options, legacyOptions);

        if (isNaN(this.options.innerRadius)) { throw new Error('Inner radius cannot be NaN'); }
        if (this.options.innerRadius >= this.options.radius) { throw new Error('Outer radius must be greater then the inner radius'); }

        // @section
        // @aka Donut options
        // @option innerRadius: Number; Radius of the inner circle, in meters.
        this._mInnerRadius = this.options.innerRadius;

    },

    setRadius: function (radius) {
        if (this._mInnerRadius >= radius) { throw new Error('Outer radius must be greater then the inner radius'); }
        return L.Circle.prototype.setRadius.call(this, radius);
    },


    // @method setInnerRadius(radius: Number): this
    // Sets the inner radius of the donut. Units are in meters or percent.
    setInnerRadius: function (radius) {
        if (radius > this._mRadius) { throw new Error('Inner radius must be smaller then the outer radius'); }
        this.options.innerRadius = this._mInnerRadius = radius;
        return this.redraw();
    },

    // @method getInnerRadius(): Number
    // Returns the current inner radius of the donut. Units are in meters or percent.
    getInnerRadius: function () {
        return this._mInnerRadius;
    },

    _updatePath: function () {
        this._renderer._updateDonut(this);
    },

    _project: function () {

        var map = this._map,
            crs = map.options.crs;

        if (crs.distance === L.CRS.Earth.distance) {

            var outer = this._radiusCalculation(this._mRadius);
            this._point = outer.point;
            this._radius = outer.radius;
            this._radiusY = outer.radiusY;

            var innerRadius = 0;
            if (this.options.innerRadiusAsPercent) {
                var factor = this._mInnerRadius > 1 ? 1 : this._mInnerRadius;
                innerRadius = this._mRadius * factor;
            } else {
                innerRadius = this._mInnerRadius;
            }

            var inner = this._radiusCalculation(innerRadius);
            this._innerPoint = inner.point;
            this._innerRadius = inner.radius;
            this._innerRadiusY = inner.radiusY;

        } else {
            var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

            this._point = map.latLngToLayerPoint(this._latlng);
            this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
        }

        this._updateBounds();
    },

    _radiusCalculation: function (radius) {
        var lng = this._latlng.lng,
            lat = this._latlng.lat,
            map = this._map;

        var d = Math.PI / 180,
            latR = (radius / L.CRS.Earth.R) / d,
            top = map.project([lat + latR, lng]),
            bottom = map.project([lat - latR, lng]),
            p = top.add(bottom).divideBy(2),
            lat2 = map.unproject(p).lat,
            lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
                (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

        if (isNaN(lngR) || lngR === 0) {
            lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
        }

        return {
            point: p.subtract(map.getPixelOrigin()),
            radius: isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x,
            radiusY: p.y - top.y
        };
    }
});

L.donut = function (latlng, options) {
    return new L.Donut(latlng, options);
};

L.SVG.include({
    _updateDonut: function (layer) {
        var p = layer._point,
            r = Math.max(Math.round(layer._radius), 1),
            r2 = Math.max(Math.round(layer._radiusY), 1) || r,
            arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

        var innerP = layer._innerPoint,
            innerR = Math.max(Math.round(layer._innerRadius), 1),
            innerR2 = Math.max(Math.round(layer._innerRadiusY), 1) || innerR,
            innerArc = 'a' + innerR + ',' + innerR2 + ' 0 1,0 ';

        // drawing a circle with hole with two half-arcs
        var d;
        if (layer._empty()) {
            d = 'M0 0';
        } else {
            d = 'M' + (p.x - r) + ',' + p.y +
                arc + (r * 2) + ',0 ' +
                arc + (-r * 2) + ',0 ';
            d += 'M' + (innerP.x - innerR) + ',' + innerP.y +
                innerArc + (innerR * 2) + ',0 ' +
                innerArc + (-innerR * 2) + ',0 ';
        }
        this._setPath(layer, d);
    },
});

L.Canvas.include({
    _updateDonut: function (layer) {

        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1),
            s = (Math.max(Math.round(layer._radiusY), 1) || r) / r,
            innerP = layer._innerPoint,
            innerR = Math.max(Math.round(layer._innerRadius), 1),
            innerS = (Math.max(Math.round(layer._innerRadiusY), 1) || innerR) / innerR;

        if (s !== 1) {
            ctx.save();
            ctx.scale(1, s);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);
        ctx.moveTo(p.x + innerR, p.y);
        ctx.arc(innerP.x, innerP.y / innerS, innerR, 0, Math.PI * 2, true);

        if (s !== 1) {
            ctx.restore();
        }

        this._fillStroke(ctx, layer);
    },
});
