(function () {
    var COEF = 1;

    var maskList = document.querySelector(".mask-list");
    var idList = [];
    var setElemMask = function (x, y, mask) {
        var id = `clip_${0}_${0}`;
        if (idList.includes(id)) return `url(#${id})`;

        var s = getPuzzlePieceMask(x, y, PuzzlePiece.elementSize, PuzzlePiece.elementSize, PuzzlePiece.prototype.maxX(), PuzzlePiece.prototype.maxY());
        var m = mask.cloneNode(true);
        m.id = id;
        idList.push(id);

        m.querySelector("path").setAttribute("d", s);
        maskList.appendChild(m);
        return `url(#${id})`;
    }
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

        item.style.backgroundImage = PuzzlePiece.image;
        item.style.width = PuzzlePiece.elementSize + PuzzlePiece.overlay * 2 + "px";
        item.style.height = PuzzlePiece.elementSize + PuzzlePiece.overlay * 2 + "px";
        item.style.clipPath = getElemMask(this.indexX, this.indexY);
        if (i >= 0) {
            //item.style.left = i % this.maxX() * PuzzlePiece.elementSize * COEF - PuzzlePiece.overlay + "px";
            //item.style.top = Math.floor(i / this.maxX()) * PuzzlePiece.elementSize * COEF - PuzzlePiece.overlay + "px";
            item.style.left = Math.random() * this.maxX() * PuzzlePiece.elementSize - PuzzlePiece.overlay + "px";
            item.style.top = Math.random() * this.maxY() * PuzzlePiece.elementSize - PuzzlePiece.overlay + "px";
        } else {
            item.style.left = this.indexX * PuzzlePiece.elementSize * COEF - PuzzlePiece.overlay + "px";
            item.style.top = this.indexY * PuzzlePiece.elementSize * COEF - PuzzlePiece.overlay + "px";
        }

        item.style.backgroundPosition = this.getShift();
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
        split: function () {

            var arr = [];
            for (var y = 0; y < Math.floor(PuzzlePiece.imageHeight / PuzzlePiece.elementSize); y++) {
                for (var x = 0; x < Math.floor(PuzzlePiece.imageWidth / PuzzlePiece.elementSize); x++) {
                    arr.push(new PuzzlePiece(x, y));
                }
            }
            console.log(Math.floor(PuzzlePiece.imageHeight / PuzzlePiece.elementSize));
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
            var template = document.querySelector("template");
            var piece = template.content.querySelector(".image-piece");
            var field = document.querySelector(".gamefield");
            field.innerHTML = "";
            var append = function (item, i) {
                var elem = item.makeFieldElem(piece, i);
                field.append(elem);
            }
            if (mode === 1) {
                arr.forEach(append);
            } else {
                arr.forEach(function (item) {
                    append(item, -1);
                });
            }
        }
    }

    var arr = [];

    var onCutClick = function () {
        arr = splitImage.split();
        splitImage.fill(arr, 0);
    }

    var onShuffleClick = function () {
        arr = splitImage.shuffle(arr);
        if (arr.length > 0) splitImage.fill(arr, 1);
    }

    splitImage.init("data/img.jpg", 1920, 1200, 100, 30);
    document.querySelector(".cut-button").addEventListener("click", onCutClick);
    document.querySelector(".shuffle-button").addEventListener("click", onShuffleClick);
})();