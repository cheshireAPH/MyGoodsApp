window.longPress = {
    register: function (element, dotnetHelper, id) {
        let timer;

        element.addEventListener("pointerdown", () => {
            timer = setTimeout(() => {
                dotnetHelper.invokeMethodAsync("OnLongPress", id);
            }, 600);
        });

        element.addEventListener("pointerup", () => clearTimeout(timer));
        element.addEventListener("pointerleave", () => clearTimeout(timer));
    },

    registerById: function (id, dotnetHelper, seriesId) {
        const element = document.getElementById(id);
        if (!element) return;

        let timer;

        element.addEventListener("pointerdown", () => {
            timer = setTimeout(() => {
                dotnetHelper.invokeMethodAsync("OnLongPress", seriesId);
            }, 600);
        });

        element.addEventListener("pointerup", () => clearTimeout(timer));
        element.addEventListener("pointerleave", () => clearTimeout(timer));
    }
};
