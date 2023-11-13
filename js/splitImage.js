'use strict';
(function () {
    var COEF = 1;

    var elemMap = {};
    var threshold = 25;

    var puzzlePieces = {};
    var getElemMask = function (x, y) {
        var left = puzzlePieces[`${x - 1}_${y}`];
        var top = puzzlePieces[`${x}_${y - 1}`];
        left = left ? left[0] : Math.random() > 0.5;
        top = top ? top[1] : Math.random() > 0.5;
        var right = Math.random() > 0.5;
        var bottom = Math.random() > 0.5;
        var s = window.getPuzzlePiecePath(x, y, PuzzlePiece.elementSize, PuzzlePiece.elementSize, PuzzlePiece.prototype.maxX(), PuzzlePiece.prototype.maxY(), PuzzlePiece.overlay, left, top, right, bottom);
        puzzlePieces[`${x}_${y}`] = [!right, !bottom];
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

    var updateGroupPiecesPosition = function (group, indexX, indexY) {
        var pieces = group.querySelectorAll(".image-piece__content");
        var minX, minY;
        var currentShiftX, currentShiftY;
        pieces.forEach(function (item) {
            if (!minX || minX > item.dataset.x) minX = item.dataset.x;
            if (!minY || minY > item.dataset.y) minY = item.dataset.y;
            if (item.dataset.x == indexX && item.dataset.y == indexY) {
                currentShiftX = Number(item.offsetLeft);
                currentShiftY = Number(item.offsetTop);
            }
        });
        pieces.forEach(function (item) {
            item.style.left = (item.dataset.x - minX) * PuzzlePiece.elementSize + 'px';
            item.style.top = (item.dataset.y - minY) * PuzzlePiece.elementSize + 'px';
            if (item.dataset.x == indexX && item.dataset.y == indexY) {
                currentShiftX -= item.offsetLeft;
                currentShiftY -= item.offsetTop;
            }
        });

        group.style.left = currentShiftX + group.offsetLeft + 'px';
        group.style.top = currentShiftY + group.offsetTop + 'px';
    }

    var checkElemNeighbour = function (id, indexX, indexY, x, y, group) {
        var elem = elemMap[id];
        if (!elem) return false;
        var elemGroup = elem.parentNode;
        if (elemGroup === undefined || group === elemGroup) return false;
        if (Math.abs(elemGroup.offsetLeft + elem.offsetLeft - x) <= threshold && Math.abs(elemGroup.offsetTop + elem.offsetTop - y) <= threshold) {
            while (elemGroup.childNodes.length > 0) {
                group.appendChild(elemGroup.firstChild);
            }
            elemGroup.remove();
            updateGroupPiecesPosition(group, indexX, indexY);
            return true;
        }
        return false;
    }

    var checkElem = function (item, group) {
        var x = Number(item.dataset.x);
        var y = Number(item.dataset.y);
        return checkElemNeighbour(`${x - 1}_${y}`, x, y, group.offsetLeft + item.offsetLeft - PuzzlePiece.elementSize, group.offsetTop + item.offsetTop, group) ||
            checkElemNeighbour(`${x + 1}_${y}`, x, y, group.offsetLeft + item.offsetLeft + PuzzlePiece.elementSize, group.offsetTop + item.offsetTop, group) ||
            checkElemNeighbour(`${x}_${y - 1}`, x, y, group.offsetLeft + item.offsetLeft, group.offsetTop + item.offsetTop - PuzzlePiece.elementSize, group) ||
            checkElemNeighbour(`${x}_${y + 1}`, x, y, group.offsetLeft + item.offsetLeft, group.offsetTop + item.offsetTop + PuzzlePiece.elementSize, group);
    }

    var afterMove = function (group) {
        var childList = [...group.querySelectorAll(".image-piece__content")];
        childList.some(function (item) { return checkElem(item, group) });
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
                afterMove(evt.detail.group);
            }
            var append = function (item, i) {
                var elem = item.makeFieldElem(piece, i);
                elem.addEventListener("elemdrop", onDropItem);
                field.append(elem);
                elemMap[`${item.indexX}_${item.indexY}`] = elem.querySelector(".image-piece__content");
            }
            if (mode === 1) {
                arr.forEach(append);
            } else {
                arr.forEach(function (item) {
                    append(item, -1);
                });
            }
            window.drag();
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
    } else {
        window.splitImage.init("data/img2.jpg", 1600, 1200, 100, 30);
    }
    window.splitImage.preview();
    document.querySelector(".cut-button").addEventListener("click", onCutClick);
    document.querySelector(".shuffle-button").addEventListener("click", onShuffleClick);
})();