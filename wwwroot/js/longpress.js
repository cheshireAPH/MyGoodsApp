window.longPress = {
    registerById: function (id, dotnetHelper, seriesId) {
        const element = document.getElementById(id);
        if (!element) return;

        let timer;
        let longPressTriggered = false;

        const startHandler = (e) => {
            longPressTriggered = false;
            timer = setTimeout(() => {
                longPressTriggered = true;
                console.log("Long press detected for series:", seriesId);
                dotnetHelper.invokeMethodAsync("OnLongPress", seriesId);
            }, 600);
        };

        const endHandler = (e) => {
            clearTimeout(timer);
            // 長押しトリガー後は @onclick イベントをキャンセル
            if (longPressTriggered) {
                e.preventDefault();
                e.stopPropagation();
                longPressTriggered = false;
            }
        };

        const cancelHandler = () => {
            clearTimeout(timer);
            longPressTriggered = false;
        };

        // クリックイベントも監視（長押し中は発火させない）
        const clickHandler = (e) => {
            if (longPressTriggered) {
                e.preventDefault();
                e.stopPropagation();
                longPressTriggered = false;
            }
        };

        // PC（マウス）対応
        element.addEventListener("mousedown", startHandler);
        element.addEventListener("mouseup", endHandler);
        element.addEventListener("mouseleave", cancelHandler);
        element.addEventListener("click", clickHandler, true); // キャプチャフェーズで処理

        // スマホ（タッチ）対応
        element.addEventListener("touchstart", startHandler, false);
        element.addEventListener("touchend", endHandler, false);
        element.addEventListener("touchcancel", cancelHandler);

        // スマホでの文字選択を防止
        element.style.userSelect = "none";
        element.style.webkitUserSelect = "none";
        element.style.touchAction = "manipulation";

        console.log("Long press registered for element:", id);
    }
};
