let productEditInstance = null;

window.registerProductEditInstance = function (instance) {
    productEditInstance = instance;
};

window.postMessageToOpener = function (variantId, base64) {
    if (window.opener) {
        window.opener.postMessage({
            type: "image-edited",
            variantId: variantId,
            base64: base64
        }, "*");
    }
};

window.addEventListener("message", e => {
    if (e.data.type === "image-edited") {
        if (productEditInstance) {
            productEditInstance.invokeMethodAsync("OnImageEdited", e.data.variantId, e.data.base64);
        }
    }
});

window.initCropperWhenImageReady = function () {
    const img = document.getElementById("edit-image");
    if (!img) return;

    if (img.complete) {
        // すでに読み込み済み
        cropper.init();
    } else {
        // 読み込み完了を待つ
        img.onload = () => {
            cropper.init();
        };
    }
};

window.hasOpener = () => !!window.opener;

window.registerPageShowHandler = function (dotnetRef) {
    // スマホ（PWA）・iOS Safari・Android Chrome
    window.addEventListener("pageshow", function () {
        dotnetRef.invokeMethodAsync("OnPageShow");
    });

    // PC Chrome / Edge 対策（pageshow が発火しない）
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            dotnetRef.invokeMethodAsync("OnPageShow");
        }
    });
};


window.selectAllInside = (rootComponent) => {
    if (!rootComponent) return;

    const root = rootComponent.element;
    if (!root) return;

    const input = root.querySelector("input");
    if (!input) return;

    // ★ クリック直後にブラウザがキャレットを置くので、
    //    それより後に select() を実行する必要がある
    setTimeout(() => {
        input.select();
    }, 0);
};
