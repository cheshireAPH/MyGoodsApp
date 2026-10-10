window.longPress = {
    registerById: function (id, dotnetHelper, seriesId) {
        const element = document.getElementById(id);
        if (!element) return;

        let timer;

        element.addEventListener("touchstart", () => {
            timer = setTimeout(() => {
                dotnetHelper.invokeMethodAsync("OnLongPress", seriesId);
            }, 600);
        });

        element.addEventListener("touchend", () => clearTimeout(timer));
        element.addEventListener("touchcancel", () => clearTimeout(timer));
    }
};
