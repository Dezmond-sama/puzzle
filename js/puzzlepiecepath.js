'use strict';
(function () {
    var getVerticalCurve = function (x, y, w, h) {
        var s = `C ${x - w * 0.1} ${y + h * 0.2} ${x - w * 0.1} ${y + h * 0.5} ${x} ${y + h * 0.4} C ${x + w * 0.1} ${y + h * 0.3} ${x + w * 0.2} ${y + h * 0.4} ${x + w * 0.2} ${y + h * 0.5} C ${x + w * 0.2} ${y + h * 0.6} ${x + w * 0.1} ${y + h * 0.7} ${x} ${y + h * 0.6} C ${x - w * 0.1} ${y + h * 0.5} ${x - w * 0.1} ${y + h * 0.8} ${x} ${y + h}`;
        return s;
    }

    var getHorizontalCurve = function (x, y, w, h) {
        var s = `C ${x + w * 0.2} ${y - h * 0.1} ${x + w * 0.5} ${y - h * 0.1} ${x + w * 0.4} ${y} C ${x + w * 0.3} ${y + h * 0.1} ${x + w * 0.4} ${y + h * 0.2} ${x + w * 0.5} ${y + h * 0.2} C ${x + w * 0.6} ${y + h * 0.2} ${x + w * 0.7} ${y + h * 0.1} ${x + w * 0.6} ${y} C ${x + w * 0.5} ${y - h * 0.1} ${x + w * 0.8} ${y - h * 0.1} ${x + w} ${y}`;
        return s;
    }

    var getLine = function (x, y) {
        return `L ${x} ${y}`;
    }

    window.getPuzzlePiecePath = function (x, y, w, h, maxX, maxY, overlay, outerLeft = false, outerTop = true, outerRight = true, outerBottom = false) {
        var xpos = overlay;
        var ypos = overlay;
        var s = `M ${xpos} ${ypos}`;
        var coef = 1;
        if (y === 0) {
            s += getLine(xpos + w, ypos);
        } else {
            coef = outerTop === true ? 1 : -1;
            s += getHorizontalCurve(xpos, ypos, w, -h * coef);
        }
        if (x === maxX - 1) {
            s += getLine(xpos + w, ypos + h);
        } else {
            coef = outerRight === true ? 1 : -1;
            s += getVerticalCurve(xpos + w, ypos, w * coef, h);
        }
        if (y === maxY - 1) {
            s += getLine(xpos, ypos + h);
        } else {
            coef = outerBottom === true ? 1 : -1;
            s += getHorizontalCurve(xpos + w, ypos + h, -w, h * coef);
        }
        if (x === 0) {
            s += getLine(xpos, ypos);
        } else {
            coef = outerLeft === true ? 1 : -1;
            s += getVerticalCurve(xpos, ypos + h, -w * coef, -h);
        }
        return s;
    }
})();