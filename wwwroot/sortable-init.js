window.initSortable = (elementId, dotnetRef, listName) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    Sortable.create(el, {
        animation: 150,
        handle: ".drag-handle",
        direction: "vertical",
        ghostClass: "sortable-ghost",
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: function (evt) {
            dotnetRef.invokeMethodAsync("OnReordered", listName, evt.oldIndex, evt.newIndex);
        }
    });
};
