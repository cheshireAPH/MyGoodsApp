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
        // 初期位置
        // ============================
        const initSize = Math.min(container.clientWidth, container.clientHeight) * 0.6;
        frame.style.width = initSize + "px";
        frame.style.height = initSize + "px";
        frame.style.left = (container.clientWidth - initSize) / 2 + "px";
        frame.style.top = (container.clientHeight - initSize) / 2 + "px";

        // ============================
        // PC: ドラッグ開始
        // ============================
        frame.addEventListener("mousedown", e => {
            dragging = true;
            startX = e.clientX - frame.offsetLeft;
            startY = e.clientY - frame.offsetTop;
        });

        // ============================
        // スマホ: ドラッグ開始
        // ============================
        frame.addEventListener("touchstart", e => {
            dragging = true;
            const t = e.touches[0];
            startX = t.clientX - frame.offsetLeft;
            startY = t.clientY - frame.offsetTop;
        });

        // ============================
        // PC: リサイズ開始
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
        // スマホ: リサイズ開始
        // ============================
        handle.addEventListener("touchstart", e => {
            e.stopPropagation();
            resizing = true;
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            startW = frame.offsetWidth;
            startH = frame.offsetHeight;
        });

        // ============================
        // PC: 移動・リサイズ
        // ============================
        document.addEventListener("mousemove", e => {
            moveOrResize(e.clientX, e.clientY);
        });

        // ============================
        // スマホ: 移動・リサイズ
        // ============================
        document.addEventListener("touchmove", e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                moveOrResize(t.clientX, t.clientY);
            }
        });

        function moveOrResize(x, y) {
            if (dragging) {
                frame.style.left = (x - startX) + "px";
                frame.style.top = (y - startY) + "px";
            }
            if (resizing) {
                frame.style.width = (startW + (x - startX)) + "px";
                frame.style.height = (startH + (y - startY)) + "px";
            }
        }

        // ============================
        // PC: 終了
        // ============================
        document.addEventListener("mouseup", () => {
            dragging = false;
            resizing = false;
        });

        // ============================
        // スマホ: 終了
        // ============================
        document.addEventListener("touchend", () => {
            dragging = false;
            resizing = false;
        });

        // ============================
        // ピンチズーム（既存）
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
                    scale = Math.max(0.5, Math.min(scale, 4));
                    image.style.transform = `scale(${scale})`;
                }

                lastDistance = distance;
            }
        });

        container.addEventListener("touchend", () => {
            lastDistance = 0;
        });
    },

    getFrame: function () {
        const frame = document.getElementById("crop-frame");
        const image = document.getElementById("edit-image");

        // 表示サイズ
        const displayWidth = image.clientWidth;
        const displayHeight = image.clientHeight;

        // 実際の画像サイズ
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        // スケール係数
        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        return {
            x: frame.offsetLeft * scaleX,
            y: frame.offsetTop * scaleY,
            width: frame.offsetWidth * scaleX,
            height: frame.offsetHeight * scaleY
        };
    }
};
