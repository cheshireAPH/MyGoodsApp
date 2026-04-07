window.cropper = {
    init: function () {
        const container = document.getElementById("crop-container");
        const frame = document.getElementById("crop-frame");
        const handle = document.getElementById("crop-handle");
        const image = document.getElementById("edit-image");

        let dragging = false;
        let resizing = false;
        let startX, startY, startW, startH;

        // ============================
        // 初期位置・サイズを中央に配置
        // ============================
        const initSize = Math.min(container.clientWidth, container.clientHeight) * 0.6;
        frame.style.width = initSize + "px";
        frame.style.height = initSize + "px";
        frame.style.left = (container.clientWidth - initSize) / 2 + "px";
        frame.style.top = (container.clientHeight - initSize) / 2 + "px";

        // ============================
        // 枠ドラッグ
        // ============================
        frame.addEventListener("mousedown", e => {
            dragging = true;
            startX = e.clientX - frame.offsetLeft;
            startY = e.clientY - frame.offsetTop;
        });

        // ============================
        // リサイズ開始
        // ============================
        handle.addEventListener("mousedown", e => {
            e.stopPropagation();
            resizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startW = frame.offsetWidth;
            startH = frame.offsetHeight;
        });

        // ============================
        // マウス移動
        // ============================
        document.addEventListener("mousemove", e => {
            if (dragging) {
                let newLeft = e.clientX - startX;
                let newTop = e.clientY - startY;

                // 枠が外に出ないように制限
                newLeft = Math.max(0, Math.min(newLeft, container.clientWidth - frame.offsetWidth));
                newTop = Math.max(0, Math.min(newTop, container.clientHeight - frame.offsetHeight));

                frame.style.left = newLeft + "px";
                frame.style.top = newTop + "px";
            }

            if (resizing) {
                let newW = startW + (e.clientX - startX);
                let newH = startH + (e.clientY - startY);

                // 最小サイズ
                newW = Math.max(50, newW);
                newH = Math.max(50, newH);

                // 枠が外に出ないように制限
                newW = Math.min(newW, container.clientWidth - frame.offsetLeft);
                newH = Math.min(newH, container.clientHeight - frame.offsetTop);

                frame.style.width = newW + "px";
                frame.style.height = newH + "px";
            }
        });

        // ============================
        // マウス終了
        // ============================
        document.addEventListener("mouseup", () => {
            dragging = false;
            resizing = false;
        });

        // ============================
        // ピンチイン・アウトで画像拡大縮小
        // ============================
        let scale = 1;
        let lastDistance = 0;

        container.addEventListener("touchmove", e => {
            if (e.touches.length === 2) {
                e.preventDefault();

                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastDistance !== 0) {
                    const diff = distance - lastDistance;
                    scale += diff * 0.005;
                    scale = Math.max(0.5, Math.min(scale, 4)); // ズーム範囲
                    image.style.transform = `scale(${scale})`;
                }

                lastDistance = distance;
            }
        });

        container.addEventListener("touchend", () => {
            lastDistance = 0;
        });
    },

    // ============================
    // 枠の位置とサイズを返す
    // ============================
    getFrame: function () {
        const frame = document.getElementById("crop-frame");
        return {
            x: frame.offsetLeft,
            y: frame.offsetTop,
            width: frame.offsetWidth,
            height: frame.offsetHeight
        };
    }
};
