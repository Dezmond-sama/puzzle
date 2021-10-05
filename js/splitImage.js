'use strict';
(function () {
    var COEF = 1;

    var elemMap = {};

    var getElemMask = function (x, y) {
        var s = window.getPuzzlePiecePath(x, y, PuzzlePiece.elementSize, PuzzlePiece.elementSize, PuzzlePiece.prototype.maxX(), PuzzlePiece.prototype.maxY(), PuzzlePiece.overlay);
        return `path('${s}')`;
    }
    var PuzzlePiece = function (x, y) {
        this.indexX = x;
        this.indexY = y;
    }

    PuzzlePiece.prototype.getShift = function () {
        return (PuzzlePiece.overlay - PuzzlePiece.shiftX - this.indexX * PuzzlePiece.elementSize) + "px " +
            (PuzzlePiece.overlay - PuzzlePiece.shiftY - this.indexY * PuzzlePiece.elementSize) + "px";
    }

    PuzzlePiece.prototype.maxX = function () {
        return Math.floor(PuzzlePiece.imageWidth / PuzzlePiece.elementSize);
    }

    PuzzlePiece.prototype.maxY = function () {
        return Math.floor(PuzzlePiece.imageHeight / PuzzlePiece.elementSize);
    }
    PuzzlePiece.prototype.makeFieldElem = function (piece, i) {
        var item = piece.cloneNode(true);
        var itemContent = item.querySelector(".image-piece__content");
        itemContent.dataset.x = this.indexX;
        itemContent.dataset.y = this.indexY;
        itemContent.style.backgroundImage = PuzzlePiece.image;
        itemContent.style.width = PuzzlePiece.elementSize + PuzzlePiece.overlay * 2 + "px";
        itemContent.style.height = PuzzlePiece.elementSize + PuzzlePiece.overlay * 2 + "px";
        itemContent.style.clipPath = getElemMask(this.indexX, this.indexY);
        item.style.zIndex = 1;
        if (i >= 0) {
            item.style.left = Math.random() * this.maxX() * PuzzlePiece.elementSize - PuzzlePiece.overlay + "px";
            item.style.top = Math.random() * this.maxY() * PuzzlePiece.elementSize - PuzzlePiece.overlay + "px";
        } else {
            item.style.left = this.indexX * PuzzlePiece.elementSize * COEF - PuzzlePiece.overlay + "px";
            item.style.top = this.indexY * PuzzlePiece.elementSize * COEF - PuzzlePiece.overlay + "px";
        }

        itemContent.style.backgroundPosition = this.getShift();
        return item;
    }

    window.splitImage = {
        init: function (imagePath, width, height, pieceSize, overlay) {
            PuzzlePiece.image = `url("${imagePath}")`;
            PuzzlePiece.imageWidth = width;
            PuzzlePiece.imageHeight = height;
            PuzzlePiece.elementSize = pieceSize;
            PuzzlePiece.overlay = overlay;
            PuzzlePiece.shiftX = (width % pieceSize) / 2;
            PuzzlePiece.shiftY = (height % pieceSize) / 2;
        },
        preview: function () {
            var preview = document.querySelector(".preview-block");
            preview.style.backgroundImage = PuzzlePiece.image;
            preview.style.width = PuzzlePiece.elementSize * PuzzlePiece.prototype.maxX();
            preview.style.height = PuzzlePiece.elementSize * PuzzlePiece.prototype.maxY();
            preview.style.backgroundPosition = -PuzzlePiece.shiftX + "px " + - PuzzlePiece.shiftY + "px";
        },
        split: function () {

            var arr = [];
            for (var y = 0; y < Math.floor(PuzzlePiece.imageHeight / PuzzlePiece.elementSize); y++) {
                for (var x = 0; x < Math.floor(PuzzlePiece.imageWidth / PuzzlePiece.elementSize); x++) {
                    arr.push(new PuzzlePiece(x, y));
                }
            }
            return arr;
        },
        shuffle: function (arr) {
            var shuffled = arr.slice();
            shuffled.sort(function () {
                return 0.5 - Math.random();
            })
            return shuffled;
        },
        fill: function (arr, mode) {
            elemMap = {};
            var template = document.querySelector("template");
            var piece = template.content.querySelector(".image-piece");
            var field = document.querySelector(".gamefield");
            field.innerHTML = "";
            var onDropItem = function (evt) {
                console.log(evt.detail.pointer.dataset.x);
                console.log(evt.detail.pointer.dataset.y);
            }
            var append = function (item, i) {
                var elem = item.makeFieldElem(piece, i);
                elem.addEventListener("elemdrop", onDropItem);
                field.append(elem);
                elemMap[`${item.indexX}_${item.indexY}`] = elem;
            }
            if (mode === 1) {
                arr.forEach(append);
            } else {
                arr.forEach(function (item) {
                    append(item, -1);
                });
            }
            window.drag();
            console.log(elemMap);
        }
    }

    var arr = [];

    var onCutClick = function () {
        arr = window.splitImage.split();
        window.splitImage.fill(arr, 0);
    }

    var onShuffleClick = function () {
        arr = window.splitImage.shuffle(arr);
        if (arr.length > 0) window.splitImage.fill(arr, 1);
    }

    if (Math.random() > 0.5) {
        window.splitImage.init("data/img.jpg", 1920, 1200, 100, 30);
        window.splitImage.preview();
    } else {
        window.splitImage.init("data/img2.jpg", 1600, 1200, 100, 30);
        window.splitImage.preview();
    }
    document.querySelector(".cut-button").addEventListener("click", onCutClick);
    document.querySelector(".shuffle-button").addEventListener("click", onShuffleClick);
})();