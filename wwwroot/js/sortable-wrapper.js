window.initSortable = (element, dotnetHelper) => {
    if (!element) return;

    // ★ すでに初期化済みなら何もしない
    if (element._sortableInitialized)
        return;

    element._sortableInitialized = true;

    new Sortable(element, {
        animation: 150,
        handle: ".drag-handle",
        onEnd: function (evt) {
            dotnetHelper.invokeMethodAsync("OnSortChanged", {
                oldIndex: evt.oldIndex,
                newIndex: evt.newIndex
            });
        }
    });
};
