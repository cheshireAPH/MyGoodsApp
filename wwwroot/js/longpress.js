window.longPress = {
    register: function (element, dotnetHelper, id) {
        let timer;

        element.addEventListener("pointerdown", () => {
            timer = setTimeout(() => {
                dotnetHelper.invokeMethodAsync("OnLongPress", id);
            }, 600); // 長押し判定
        });

        element.addEventListener("pointerup", () => clearTimeout(timer));
        element.addEventListener("pointerleave", () => clearTimeout(timer));
    }
};
