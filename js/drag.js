"use strict";
(function () {
    let selectedItem;

    window.drag = function () {
        const dragItems = document.querySelectorAll(".dragable__drag-pointer");
        dragItems.forEach(function (item) {
            item.addEventListener("mousedown", function (downEvt) {
                if (downEvt.which !== 1) return;
                downEvt.preventDefault();
                let coords = {
                    x: downEvt.clientX,
                    y: downEvt.clientY,
                };
                selectedItem = item.parentNode;
                if (!selectedItem.classList.contains("dragable")) {
                    selectedItem = null;
                    return;
                }
                selectedItem.style.zIndex =
                    Number(selectedItem.style.zIndex) + 100;
                const onMouseMove = function (moveEvt) {
                    moveEvt.preventDefault();
                    const shift = {
                        x: moveEvt.clientX - coords.x,
                        y: moveEvt.clientY - coords.y,
                    };
                    coords = {
                        x: moveEvt.clientX,
                        y: moveEvt.clientY,
                    };
                    selectedItem.style.left =
                        selectedItem.offsetLeft + shift.x + "px";
                    selectedItem.style.top =
                        selectedItem.offsetTop + shift.y + "px";
                };
                const onMouseUp = function (upEvt) {
                    if (upEvt.which !== 1) return;
                    upEvt.preventDefault();
                    selectedItem.style.zIndex =
                        Number(selectedItem.style.zIndex) - 100;
                    const elemDropEvent = new CustomEvent("elemdrop", {
                        detail: {
                            pointer: item,
                            group: item.parentNode,
                        },
                    });

                    selectedItem.dispatchEvent(elemDropEvent);

                    selectedItem = null;
                    document.removeEventListener("mouseup", onMouseUp);
                    document.removeEventListener("mousemove", onMouseMove);
                };

                document.addEventListener("mouseup", onMouseUp);
                document.addEventListener("mousemove", onMouseMove);
            });
        });
    };
})();
