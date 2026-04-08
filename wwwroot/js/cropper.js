window.cropperShape = "rectangle";   // "rectangle" | "square" | "circle"
let aspectLocked = false;            // C# から制御用

window.cropper = {
    setShape: function (shape) {
        window.cropperShape = shape; // "rectangle" / "square" / "circle"
        const frame = document.getElementById("crop-frame");
        if (!frame) return;

        if (shape === "circle") {
            frame.classList.add("circle");
        } else {
            frame.classList.remove("circle");
        }
    },

    setAspectLocked: function (locked) {
        aspectLocked = !!locked;
    },

    init: function () {
        const container = document.getElementById("crop-container");
        const frame = document.getElementById("crop-frame");
        const image = document.getElementById("edit-image");
        if (!container || !frame || !image) return;

        // ============================
        // 画像状態（パン＋ズーム）
        // ============================
        let imgX = 0;      // translateX（見た目上）
        let imgY = 0;      // translateY（見た目上）
        let imgScale = 1;  // scale

        function applyImageTransform() {
            image.style.transform = `translate(${imgX}px, ${imgY}px) scale(${imgScale})`;
        }

        // ============================
        // トリミング枠 初期位置
        // ============================
        const initSize = Math.min(container.clientWidth, container.clientHeight) * 0.6;
        frame.style.width = initSize + "px";
        frame.style.height = initSize + "px";
        frame.style.left = (container.clientWidth - initSize) / 2 + "px";
        frame.style.top = (container.clientHeight - initSize) / 2 + "px";

        // ============================
        // リサイズ用状態
        // ============================
        let resizing = false;
        let resizeCorner = null; // "nw" | "ne" | "sw" | "se"
        let startMouseX = 0;
        let startMouseY = 0;
        let startLeft = 0;
        let startTop = 0;
        let startWidth = 0;
        let startHeight = 0;
        let startAspect = 1;

        // ============================
        // 画像パン用状態
        // ============================
        let panning = false;
        let panStartX = 0;
        let panStartY = 0;
        let panImgStartX = 0;
        let panImgStartY = 0;

        // ============================
        // ハンドルイベント登録
        // ============================
        const handles = frame.querySelectorAll(".handle");
        handles.forEach(h => {
            const corner = Array.from(h.classList)
                .find(c => c.startsWith("handle-"))
                ?.replace("handle-", ""); // "nw" など

            h.addEventListener("mousedown", e => {
                e.stopPropagation();
                startResize(e.clientX, e.clientY, corner);
            });

            h.addEventListener("touchstart", e => {
                e.stopPropagation();
                const t = e.touches[0];
                startResize(t.clientX, t.clientY, corner);
            });
        });

        function startResize(x, y, corner) {
            resizing = true;
            resizeCorner = corner;
            startMouseX = x;
            startMouseY = y;
            startLeft = frame.offsetLeft;
            startTop = frame.offsetTop;
            startWidth = frame.offsetWidth;
            startHeight = frame.offsetHeight;
            startAspect = startWidth / startHeight || 1;
        }

        // ============================
        // 画像パン開始（枠以外をドラッグ）
        // ============================
        function startPan(x, y) {
            panning = true;
            panStartX = x;
            panStartY = y;
            panImgStartX = imgX;
            panImgStartY = imgY;
        }

        container.addEventListener("mousedown", e => {
            // 枠 or ハンドル上なら何もしない（リサイズに任せる）
            if (e.target === frame || e.target.closest("#crop-frame")) return;
            startPan(e.clientX, e.clientY);
        });

        container.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                if (e.target === frame || e.target.closest("#crop-frame")) return;
                startPan(t.clientX, t.clientY);
            }
        });

        // ============================
        // マウス移動 / タッチ移動
        // ============================
        document.addEventListener("mousemove", e => {
            handleMove(e.clientX, e.clientY);
        });

        document.addEventListener("touchmove", e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                handleMove(t.clientX, t.clientY);
            } else if (e.touches.length === 2) {
                handlePinch(e);
            }
        }, { passive: false });

        function handleMove(x, y) {
            if (resizing) {
                doResize(x, y);
            } else if (panning) {
                imgX = panImgStartX + (x - panStartX);
                imgY = panImgStartY + (y - panStartY);
                applyImageTransform();
            }
        }

        // ============================
        // リサイズ処理
        // ============================
        function doResize(x, y) {
            let dx = x - startMouseX;
            let dy = y - startMouseY;

            let newLeft = startLeft;
            let newTop = startTop;
            let newW = startWidth;
            let newH = startHeight;

            if (resizeCorner === "se") {
                newW = startWidth + dx;
                newH = startHeight + dy;
            } else if (resizeCorner === "sw") {
                newW = startWidth - dx;
                newH = startHeight + dy;
                newLeft = startLeft + dx;
            } else if (resizeCorner === "ne") {
                newW = startWidth + dx;
                newH = startHeight - dy;
                newTop = startTop + dy;
            } else if (resizeCorner === "nw") {
                newW = startWidth - dx;
                newH = startHeight - dy;
                newLeft = startLeft + dx;
                newTop = startTop + dy;
            }

            // 最小サイズ
            const minSize = 20;
            newW = Math.max(minSize, newW);
            newH = Math.max(minSize, newH);

            // 形状・比率ロック
            if (window.cropperShape === "square" || window.cropperShape === "circle") {
                const size = Math.max(newW, newH);
                newW = size;
                newH = size;
            } else if (aspectLocked) {
                // 矩形比率ロック
                if (Math.abs(dx) > Math.abs(dy)) {
                    newH = newW / startAspect;
                } else {
                    newW = newH * startAspect;
                }
            }

            frame.style.left = newLeft + "px";
            frame.style.top = newTop + "px";
            frame.style.width = newW + "px";
            frame.style.height = newH + "px";
        }

        // ============================
        // 終了
        // ============================
        document.addEventListener("mouseup", () => {
            resizing = false;
            panning = false;
        });

        document.addEventListener("touchend", () => {
            if (event.touches && event.touches.length > 0) return;
            resizing = false;
            panning = false;
            lastPinchDistance = 0;
        });

        // ============================
        // ホイールズーム（PC）
        // ============================
        container.addEventListener("wheel", e => {
            e.preventDefault();
            const delta = -e.deltaY;
            const zoomFactor = 1 + delta * 0.001;
            const oldScale = imgScale;
            imgScale = Math.max(0.5, Math.min(4, imgScale * zoomFactor));

            // ズーム中心をマウス位置に寄せる（簡易）
            const rect = container.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            imgX = cx - (cx - imgX) * (imgScale / oldScale);
            imgY = cy - (cy - imgY) * (imgScale / oldScale);

            applyImageTransform();
        }, { passive: false });

        // ============================
        // ピンチズーム（スマホ）
        // ============================
        let lastPinchDistance = 0;

        function handlePinch(e) {
            e.preventDefault();
            const t1 = e.touches[0];
            const t2 = e.touches[1];

            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (lastPinchDistance === 0) {
                lastPinchDistance = distance;
                return;
            }

            const diff = distance - lastPinchDistance;
            const zoomFactor = 1 + diff * 0.005;
            const oldScale = imgScale;
            imgScale = Math.max(0.5, Math.min(4, imgScale * zoomFactor));

            const rect = container.getBoundingClientRect();
            const cx = (t1.clientX + t2.clientX) / 2 - rect.left;
            const cy = (t1.clientY + t2.clientY) / 2 - rect.top;

            imgX = cx - (cx - imgX) * (imgScale / oldScale);
            imgY = cy - (cy - imgY) * (imgScale / oldScale);

            lastPinchDistance = distance;
            applyImageTransform();
        }

        // 初期 transform
        applyImageTransform();
    },

    getFrame: function () {
        const frame = document.getElementById("crop-frame");
        const image = document.getElementById("edit-image");
        if (!frame || !image) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        // 現在の transform から imgX, imgY, imgScale を復元
        const style = window.getComputedStyle(image);
        const transform = style.transform || "matrix(1, 0, 0, 1, 0, 0)";
        const match = transform.match(/matrix\(([^)]+)\)/);
        let imgX = 0, imgY = 0, imgScale = 1;
        if (match) {
            const parts = match[1].split(",").map(p => parseFloat(p.trim()));
            // matrix(a, b, c, d, tx, ty)
            imgScale = parts[0] || 1;
            imgX = parts[4] || 0;
            imgY = parts[5] || 0;
        }

        const displayWidth = image.clientWidth * imgScale;
        const displayHeight = image.clientHeight * imgScale;

        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        if (!naturalWidth || !naturalHeight || !displayWidth || !displayHeight) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        const frameLeft = frame.offsetLeft;
        const frameTop = frame.offsetTop;
        const frameW = frame.offsetWidth;
        const frameH = frame.offsetHeight;

        const x = (frameLeft - imgX) * scaleX;
        const y = (frameTop - imgY) * scaleY;
        const w = frameW * scaleX;
        const h = frameH * scaleY;

        // NaN / 無限 対策
        const safe = v => (!isFinite(v) || isNaN(v)) ? 0 : Math.max(0, Math.round(v));

        return {
            x: safe(x),
            y: safe(y),
            width: safe(w),
            height: safe(h)
        };
    }
};
