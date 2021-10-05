'use strict';
(function () {
    var selectedItem;

    window.drag = function () {
        var dragItems = document.querySelectorAll(".dragable__drag-pointer");
        dragItems.forEach(function (item) {
            item.addEventListener("mousedown", function (downEvt) {
                downEvt.preventDefault();
                var coords = {
                    x: downEvt.clientX,
                    y: downEvt.clientY
                }
                selectedItem = item.parentNode;
                if (!selectedItem.classList.contains("dragable")) {
                    selectedItem = null;
                    return;
                }
                selectedItem.style.zIndex = Number(selectedItem.style.zIndex) + 100;
                var onMouseMove = function (moveEvt) {
                    moveEvt.preventDefault();
                    var shift = {
                        x: moveEvt.clientX - coords.x,
                        y: moveEvt.clientY - coords.y
                    }
                    coords = {
                        x: moveEvt.clientX,
                        y: moveEvt.clientY
                    }
                    selectedItem.style.left = selectedItem.offsetLeft + shift.x + 'px';
                    selectedItem.style.top = selectedItem.offsetTop + shift.y + 'px';
                }
                var onMouseUp = function (upEvt) {
                    upEvt.preventDefault();
                    selectedItem.style.zIndex = Number(selectedItem.style.zIndex) - 100;
                    var elemDropEvent = new CustomEvent("elemdrop", {
                        detail: {
                            pointer: item,
                            group: selectedItem
                        }
                    });

                    selectedItem.dispatchEvent(elemDropEvent);

                    selectedItem = null;
                    document.removeEventListener("mouseup", onMouseUp);
                    document.removeEventListener("mousemove", onMouseMove);
                }

                document.addEventListener("mouseup", onMouseUp);
                document.addEventListener("mousemove", onMouseMove);
            });
        })
    }
})();