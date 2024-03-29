"use strict";
(function () {
    let COEF = 1;

    let elemMap = {};
    const threshold = 25;

    let puzzlePieces = {};
    let getElemMask = function (x, y) {
        const top = puzzlePieces[`${x}_${y - 1}`]
            ? puzzlePieces[`${x}_${y - 1}`][1]
            : Math.random() > 0.5;
        const left = puzzlePieces[`${x - 1}_${y}`]
            ? puzzlePieces[`${x - 1}_${y}`][0]
            : Math.random() > 0.5;
        const right = Math.random() > 0.5;
        const bottom = Math.random() > 0.5;
        const s = window.getPuzzlePiecePath(
            x,
            y,
            PuzzlePiece.elementSize,
            PuzzlePiece.elementSize,
            PuzzlePiece.prototype.maxX(),
            PuzzlePiece.prototype.maxY(),
            PuzzlePiece.overlay,
            left,
            top,
            right,
            bottom
        );
        puzzlePieces[`${x}_${y}`] = [!right, !bottom];
        return `path('${s}')`;
    };
    const PuzzlePiece = function (x, y) {
        this.indexX = x;
        this.indexY = y;
    };

    PuzzlePiece.prototype.getShift = function () {
        return (
            PuzzlePiece.overlay -
            PuzzlePiece.shiftX -
            this.indexX * PuzzlePiece.elementSize +
            "px " +
            (PuzzlePiece.overlay -
                PuzzlePiece.shiftY -
                this.indexY * PuzzlePiece.elementSize) +
            "px"
        );
    };

    PuzzlePiece.prototype.maxX = function () {
        return Math.floor(PuzzlePiece.imageWidth / PuzzlePiece.elementSize);
    };

    PuzzlePiece.prototype.maxY = function () {
        return Math.floor(PuzzlePiece.imageHeight / PuzzlePiece.elementSize);
    };
    PuzzlePiece.prototype.makeFieldElem = function (piece, i) {
        const item = piece.cloneNode(true);
        const itemContent = item.querySelector(".image-piece__content");
        itemContent.dataset.x = this.indexX;
        itemContent.dataset.y = this.indexY;
        itemContent.style.backgroundImage = PuzzlePiece.image;
        itemContent.style.width =
            PuzzlePiece.elementSize + PuzzlePiece.overlay * 2 + "px";
        itemContent.style.height =
            PuzzlePiece.elementSize + PuzzlePiece.overlay * 2 + "px";
        itemContent.style.clipPath = getElemMask(this.indexX, this.indexY);
        item.style.zIndex = 1;
        if (i >= 0) {
            item.style.left =
                Math.random() * this.maxX() * PuzzlePiece.elementSize -
                PuzzlePiece.overlay +
                "px";
            item.style.top =
                Math.random() * this.maxY() * PuzzlePiece.elementSize -
                PuzzlePiece.overlay +
                "px";
        } else {
            item.style.left =
                this.indexX * PuzzlePiece.elementSize * COEF -
                PuzzlePiece.overlay +
                "px";
            item.style.top =
                this.indexY * PuzzlePiece.elementSize * COEF -
                PuzzlePiece.overlay +
                "px";
        }

        itemContent.style.backgroundPosition = this.getShift();
        return item;
    };

    const updateGroupPiecesPosition = function (group, indexX, indexY) {
        const pieces = group.querySelectorAll(".image-piece__content");
        let minX, minY;
        let currentShiftX, currentShiftY;
        pieces.forEach(function (item) {
            if (!minX || minX > item.dataset.x) minX = item.dataset.x;
            if (!minY || minY > item.dataset.y) minY = item.dataset.y;
            if (item.dataset.x == indexX && item.dataset.y == indexY) {
                currentShiftX = Number(item.offsetLeft);
                currentShiftY = Number(item.offsetTop);
            }
        });
        pieces.forEach(function (item) {
            item.style.left =
                (item.dataset.x - minX) * PuzzlePiece.elementSize + "px";
            item.style.top =
                (item.dataset.y - minY) * PuzzlePiece.elementSize + "px";
            if (item.dataset.x == indexX && item.dataset.y == indexY) {
                currentShiftX -= item.offsetLeft;
                currentShiftY -= item.offsetTop;
            }
        });

        group.style.left = currentShiftX + group.offsetLeft + "px";
        group.style.top = currentShiftY + group.offsetTop + "px";
    };

    const checkElemNeighbour = function (id, indexX, indexY, x, y, group) {
        const elem = elemMap[id];
        if (!elem) return false;
        const elemGroup = elem.parentNode;
        if (elemGroup === undefined || group === elemGroup) return false;
        if (
            Math.abs(elemGroup.offsetLeft + elem.offsetLeft - x) <= threshold &&
            Math.abs(elemGroup.offsetTop + elem.offsetTop - y) <= threshold
        ) {
            while (elemGroup.childNodes.length > 0) {
                group.appendChild(elemGroup.firstChild);
            }
            elemGroup.remove();
            updateGroupPiecesPosition(group, indexX, indexY);
            return true;
        }
        return false;
    };

    const checkElem = function (item, group) {
        const x = Number(item.dataset.x);
        const y = Number(item.dataset.y);
        return (
            checkElemNeighbour(
                `${x - 1}_${y}`,
                x,
                y,
                group.offsetLeft + item.offsetLeft - PuzzlePiece.elementSize,
                group.offsetTop + item.offsetTop,
                group
            ) ||
            checkElemNeighbour(
                `${x + 1}_${y}`,
                x,
                y,
                group.offsetLeft + item.offsetLeft + PuzzlePiece.elementSize,
                group.offsetTop + item.offsetTop,
                group
            ) ||
            checkElemNeighbour(
                `${x}_${y - 1}`,
                x,
                y,
                group.offsetLeft + item.offsetLeft,
                group.offsetTop + item.offsetTop - PuzzlePiece.elementSize,
                group
            ) ||
            checkElemNeighbour(
                `${x}_${y + 1}`,
                x,
                y,
                group.offsetLeft + item.offsetLeft,
                group.offsetTop + item.offsetTop + PuzzlePiece.elementSize,
                group
            )
        );
    };

    const afterMove = function (group) {
        const childList = [...group.querySelectorAll(".image-piece__content")];
        childList.some(function (item) {
            return checkElem(item, group);
        });
    };
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
            const preview = document.querySelector(".preview-block");
            preview.style.backgroundImage = PuzzlePiece.image;
            preview.style.width =
                PuzzlePiece.elementSize * PuzzlePiece.prototype.maxX();
            preview.style.height =
                PuzzlePiece.elementSize * PuzzlePiece.prototype.maxY();
            preview.style.backgroundPosition =
                -PuzzlePiece.shiftX + "px " + -PuzzlePiece.shiftY + "px";
        },
        split: function () {
            const arr = [];
            for (
                let y = 0;
                y <
                Math.floor(PuzzlePiece.imageHeight / PuzzlePiece.elementSize);
                y++
            ) {
                for (
                    let x = 0;
                    x <
                    Math.floor(
                        PuzzlePiece.imageWidth / PuzzlePiece.elementSize
                    );
                    x++
                ) {
                    arr.push(new PuzzlePiece(x, y));
                }
            }
            return arr;
        },
        shuffle: function (arr) {
            const shuffled = arr.slice();
            shuffled.sort(function () {
                return 0.5 - Math.random();
            });
            return shuffled;
        },
        fill: function (arr, mode) {
            elemMap = {};
            const template = document.querySelector("template");
            const piece = template.content.querySelector(".image-piece");
            const field = document.querySelector(".gamefield");
            field.innerHTML = "";
            const onDropItem = function (evt) {
                afterMove(evt.detail.group);
            };
            const append = function (item, i) {
                const elem = item.makeFieldElem(piece, i);
                elem.addEventListener("elemdrop", onDropItem);
                field.append(elem);
                elemMap[`${item.indexX}_${item.indexY}`] = elem.querySelector(
                    ".image-piece__content"
                );
            };
            if (mode === 1) {
                arr.forEach(append);
            } else {
                arr.forEach(function (item) {
                    append(item, -1);
                });
            }
            window.drag();
        },
    };

    let arr = [];

    const onCutClick = function () {
        arr = window.splitImage.split();
        window.splitImage.fill(arr, 0);
    };

    const onShuffleClick = function () {
        arr = window.splitImage.shuffle(arr);
        if (arr.length > 0) window.splitImage.fill(arr, 1);
    };

    if (Math.random() > 0.5) {
        window.splitImage.init("data/img.jpg", 1920, 1200, 100, 30);
    } else {
        window.splitImage.init("data/img2.jpg", 1600, 1200, 100, 30);
    }
    window.splitImage.preview();
    document.querySelector(".cut-button").addEventListener("click", onCutClick);
    document
        .querySelector(".shuffle-button")
        .addEventListener("click", onShuffleClick);
})();
