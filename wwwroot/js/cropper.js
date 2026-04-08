// ===============================
// 形状（rectangle / square / circle）
// C# から cropper.setShape("square") のように呼ぶ
// ===============================
window.cropperShape = "rectangle";

window.cropper = window.cropper || {};
window.cropper.setShape = function (shape) {
    window.cropperShape = shape;
};


// ===============================
// Cropper 本体
// ===============================
window.cropper = {
    init: function () {
        const container = document.getElementById("crop-container");
        const frame = document.getElementById("crop-frame");
        const image = document.getElementById("edit-image");

        // ===============================
        // 初期位置（中央に60%サイズ）
        // ===============================
        const initSize = Math.min(container.clientWidth, container.clientHeight) * 0.6;
        frame.style.width = initSize + "px";
        frame.style.height = initSize + "px";
        frame.style.left = (container.clientWidth - initSize) / 2 + "px";
        frame.style.top = (container.clientHeight - initSize) / 2 + "px";

        // ===============================
        // 画像パン（移動）
        // ===============================
        let imgPosX = 0, imgPosY = 0;
        let imgStartX = 0, imgStartY = 0;
        let imgDragging = false;

        image.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                imgDragging = true;
                const t = e.touches[0];
                imgStartX = t.clientX - imgPosX;
                imgStartY = t.clientY - imgPosY;
            }
        });

        image.addEventListener("touchmove", e => {
            if (imgDragging && e.touches.length === 1) {
                const t = e.touches[0];
                imgPosX = t.clientX - imgStartX;
                imgPosY = t.clientY - imgStartY;

                image.style.transform = `translate(${imgPosX}px, ${imgPosY}px) scale(${scale})`;
            }
        });

        image.addEventListener("touchend", () => {
            imgDragging = false;
        });

        // ===============================
        // 四隅リサイズ
        // ===============================
        let resizing = false;
        let resizeDir = null;
        let startX, startY, startW, startH, startLeft, startTop;

        document.querySelectorAll("#crop-frame .handle").forEach(h => {
            h.addEventListener("mousedown", e => startResize(e, h));
            h.addEventListener("touchstart", e => startResize(e, h, true));
        });

        function startResize(e, handle, isTouch = false) {
            e.stopPropagation();
            resizing = true;

            const t = isTouch ? e.touches[0] : e;

            resizeDir =
                handle.classList.contains("handle-nw") ? "nw" :
                    handle.classList.contains("handle-ne") ? "ne" :
                        handle.classList.contains("handle-sw") ? "sw" : "se";

            startX = t.clientX;
            startY = t.clientY;
            startW = frame.offsetWidth;
            startH = frame.offsetHeight;
            startLeft = frame.offsetLeft;
            startTop = frame.offsetTop;
        }

        document.addEventListener("mousemove", e => moveResize(e.clientX, e.clientY));
        document.addEventListener("touchmove", e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                moveResize(t.clientX, t.clientY);
            }
        });

        function moveResize(x, y) {
            if (!resizing) return;

            let dx = x - startX;
            let dy = y - startY;

            let newW = startW;
            let newH = startH;
            let newLeft = startLeft;
            let newTop = startTop;

            if (resizeDir.includes("e")) newW = startW + dx;
            if (resizeDir.includes("s")) newH = startH + dy;
            if (resizeDir.includes("w")) {
                newW = startW - dx;
                newLeft = startLeft + dx;
            }
            if (resizeDir.includes("n")) {
                newH = startH - dy;
                newTop = startTop + dy;
            }

            // ★ 正方形・円は比率ロック
            if (window.cropperShape === "square" || window.cropperShape === "circle") {
                const size = Math.max(newW, newH);
                newW = size;
                newH = size;

                // 左上方向のとき位置調整
                if (resizeDir.includes("w")) newLeft = startLeft + (startW - size);
                if (resizeDir.includes("n")) newTop = startTop + (startH - size);
            }

            frame.style.width = newW + "px";
            frame.style.height = newH + "px";
            frame.style.left = newLeft + "px";
            frame.style.top = newTop + "px";
        }

        document.addEventListener("mouseup", () => resizing = false);
        document.addEventListener("touchend", () => resizing = false);

        // ===============================
        // ピンチズーム
        // ===============================
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
                    image.style.transform = `translate(${imgPosX}px, ${imgPosY}px) scale(${scale})`;
                }

                lastDistance = distance;
            }
        });

        container.addEventListener("touchend", () => {
            lastDistance = 0;
        });
    },

    // ===============================
    // C# に返すトリミング座標（画像ピクセルに変換）
    // ===============================
    getFrame: function () {
        const frame = document.getElementById("crop-frame");
        const image = document.getElementById("edit-image");

        const displayWidth = image.clientWidth;
        const displayHeight = image.clientHeight;

        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

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
