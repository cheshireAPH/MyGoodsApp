window.cropperShape = "rectangle";   // "rectangle" | "square" | "circle"
let aspectLocked = false;

window.cropper = (function () {
    let container, frame, image;

    // overlay
    let overlayTop, overlayBottom, overlayLeft, overlayRight;

    // 画像の実座標
    let imgLeft = 0;
    let imgTop = 0;
    let imgWidth = 0;
    let imgHeight = 0;
    let naturalWidth = 0;
    let naturalHeight = 0;

    // パン
    let panning = false;
    let panStartX = 0;
    let panStartY = 0;
    let panImgStartLeft = 0;
    let panImgStartTop = 0;

    // リサイズ
    let resizing = false;
    let resizeCorner = null;
    let startMouseX = 0;
    let startMouseY = 0;
    let startLeft = 0;
    let startTop = 0;
    let startWidth = 0;
    let startHeight = 0;
    let startAspect = 1;

    // ピンチズーム
    let pinching = false;
    let lastPinchDistance = 0;

    /* ------------------------------
       overlay 更新
    ------------------------------ */
    function updateOverlay() {
        if (!container || !frame) return;

        const cRect = container.getBoundingClientRect();
        const fRect = frame.getBoundingClientRect();

        // 上
        overlayTop.style.top = "0px";
        overlayTop.style.left = "0px";
        overlayTop.style.width = cRect.width + "px";
        overlayTop.style.height = (fRect.top - cRect.top) + "px";

        // 下
        overlayBottom.style.left = "0px";
        overlayBottom.style.width = cRect.width + "px";
        overlayBottom.style.top = (fRect.bottom - cRect.top) + "px";
        overlayBottom.style.height = (cRect.bottom - fRect.bottom) + "px";

        // 左
        overlayLeft.style.top = (fRect.top - cRect.top) + "px";
        overlayLeft.style.left = "0px";
        overlayLeft.style.width = (fRect.left - cRect.left) + "px";
        overlayLeft.style.height = fRect.height + "px";

        // 右
        overlayRight.style.top = (fRect.top - cRect.top) + "px";
        overlayRight.style.left = (fRect.right - cRect.left) + "px";
        overlayRight.style.width = (cRect.right - fRect.right) + "px";
        overlayRight.style.height = fRect.height + "px";
    }

    /* ------------------------------
       画像の位置・サイズを反映
    ------------------------------ */
    function applyImageRect() {
        image.style.left = imgLeft + "px";
        image.style.top = imgTop + "px";
        image.style.width = imgWidth + "px";
        image.style.height = imgHeight + "px";
    }

    /* ------------------------------
       初期化：画像と枠を中央に配置
    ------------------------------ */
    function initImageAndFrame() {
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        naturalWidth = image.naturalWidth;
        naturalHeight = image.naturalHeight;
        if (!naturalWidth || !naturalHeight) return;

        // 画像をコンテナにフィット
        const scale = Math.min(cw / naturalWidth, ch / naturalHeight);
        imgWidth = naturalWidth * scale;
        imgHeight = naturalHeight * scale;

        // 中央配置
        imgLeft = (cw - imgWidth) / 2;
        imgTop = (ch - imgHeight) / 2;
        applyImageRect();

        // トリミング枠：画像の短辺 × 0.9 の正方形
        const size = Math.min(imgWidth, imgHeight) * 0.9;

        frame.style.width = size + "px";
        frame.style.height = size + "px";
        frame.style.left = (cw - size) / 2 + "px";
        frame.style.top = (ch - size) / 2 + "px";

        updateOverlay();
    }

    /* ------------------------------
       パン（ドラッグ移動）
    ------------------------------ */
    function startPan(x, y) {
        panning = true;
        panStartX = x;
        panStartY = y;
        panImgStartLeft = imgLeft;
        panImgStartTop = imgTop;
    }

    function handlePanMove(x, y) {
        if (!panning) return;
        imgLeft = panImgStartLeft + (x - panStartX);
        imgTop = panImgStartTop + (y - panStartY);
        applyImageRect();
        updateOverlay();
    }

    /* ------------------------------
       リサイズ
    ------------------------------ */
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

    function handleResizeMove(x, y) {
        if (!resizing) return;

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

        const minSize = 20;
        newW = Math.max(minSize, newW);
        newH = Math.max(minSize, newH);

        if (window.cropperShape === "square" || window.cropperShape === "circle") {
            const size = Math.max(newW, newH);
            newW = size;
            newH = size;
        } else if (aspectLocked) {
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

        updateOverlay();
    }

    /* ------------------------------
       ホイールズーム
    ------------------------------ */
    function handleWheelZoom(e) {
        e.preventDefault();
        if (!naturalWidth || !naturalHeight) return;

        const rect = container.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const delta = -e.deltaY;
        const zoomFactor = 1 + delta * 0.001;

        const newWidth = imgWidth * zoomFactor;
        const newHeight = imgHeight * zoomFactor;

        const minScale = 0.2;
        const maxScale = 5;
        const currentScale = imgWidth / (naturalWidth * (Math.min(rect.width / naturalWidth, rect.height / naturalHeight) || 1));
        const nextScale = currentScale * zoomFactor;
        if (nextScale < minScale || nextScale > maxScale) return;

        const oldWidth = imgWidth;
        const oldHeight = imgHeight;

        imgWidth = newWidth;
        imgHeight = newHeight;

        imgLeft = cx - (cx - imgLeft) * (imgWidth / oldWidth);
        imgTop = cy - (cy - imgTop) * (imgHeight / oldHeight);

        applyImageRect();
        updateOverlay();
    }

    /* ------------------------------
       ピンチズーム
    ------------------------------ */
    function distanceTouches(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function centerTouches(t1, t2, rect) {
        return {
            x: (t1.clientX + t2.clientX) / 2 - rect.left,
            y: (t1.clientY + t2.clientY) / 2 - rect.top
        };
    }

    function handlePinchZoom(e) {
        if (e.touches.length !== 2) return;
        e.preventDefault();
        if (!naturalWidth || !naturalHeight) return;

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const rect = container.getBoundingClientRect();

        const dist = distanceTouches(t1, t2);
        if (!pinching) {
            pinching = true;
            lastPinchDistance = dist;
            return;
        }

        const diff = dist - lastPinchDistance;
        const zoomFactor = 1 + diff * 0.005;

        const newWidth = imgWidth * zoomFactor;
        const newHeight = imgHeight * zoomFactor;

        const minScale = 0.2;
        const maxScale = 5;
        const currentScale = imgWidth / (naturalWidth * (Math.min(rect.width / naturalWidth, rect.height / naturalHeight) || 1));
        const nextScale = currentScale * zoomFactor;
        if (nextScale < minScale || nextScale > maxScale) {
            lastPinchDistance = dist;
            return;
        }

        const oldWidth = imgWidth;
        const oldHeight = imgHeight;

        const c = centerTouches(t1, t2, rect);

        imgWidth = newWidth;
        imgHeight = newHeight;

        imgLeft = c.x - (c.x - imgLeft) * (imgWidth / oldWidth);
        imgTop = c.y - (c.y - imgTop) * (imgHeight / oldHeight);

        lastPinchDistance = dist;
        applyImageRect();
        updateOverlay();
    }

    /* ------------------------------
       イベント登録
    ------------------------------ */
    function attachEvents() {
        // ハンドル
        const handles = frame.querySelectorAll(".handle");
        handles.forEach(h => {
            const corner = Array.from(h.classList)
                .find(c => c.startsWith("handle-"))
                ?.replace("handle-", "");

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

        // パン開始
        container.addEventListener("mousedown", e => {
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

        // 移動
        document.addEventListener("mousemove", e => {
            if (resizing) {
                handleResizeMove(e.clientX, e.clientY);
            } else if (panning) {
                handlePanMove(e.clientX, e.clientY);
            }
        });

        document.addEventListener("touchmove", e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                if (resizing) {
                    handleResizeMove(t.clientX, t.clientY);
                } else if (panning) {
                    handlePanMove(t.clientX, t.clientY);
                }
            } else if (e.touches.length === 2) {
                handlePinchZoom(e);
            }
        }, { passive: false });

        // 終了
        document.addEventListener("mouseup", () => {
            resizing = false;
            panning = false;
        });

        document.addEventListener("touchend", e => {
            if (e.touches.length === 0) {
                resizing = false;
                panning = false;
                pinching = false;
                lastPinchDistance = 0;
            }
        });

        // ホイールズーム
        container.addEventListener("wheel", handleWheelZoom, { passive: false });
    }

    /* ------------------------------
       公開 API
    ------------------------------ */
    return {
        setShape: function (shape) {
            window.cropperShape = shape;
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

        reset: function () {
            if (!container || !image || !frame) return;
            initImageAndFrame();
        },

        init: function () {
            container = document.getElementById("crop-container");
            frame = document.getElementById("crop-frame");
            image = document.getElementById("edit-image");
            if (!container || !frame || !image) return;

            // overlay 取得
            overlayTop = document.querySelector(".crop-overlay.top");
            overlayBottom = document.querySelector(".crop-overlay.bottom");
            overlayLeft = document.querySelector(".crop-overlay.left");
            overlayRight = document.querySelector(".crop-overlay.right");

            initImageAndFrame();
            attachEvents();
            updateOverlay();
        },

        getFrame: function () {
            if (!frame || !image || !naturalWidth || !naturalHeight || !imgWidth || !imgHeight) {
                return { x: 0, y: 0, width: 0, height: 0 };
            }

            const frameLeft = frame.offsetLeft;
            const frameTop = frame.offsetTop;
            const frameW = frame.offsetWidth;
            const frameH = frame.offsetHeight;

            const scaleX = naturalWidth / imgWidth;
            const scaleY = naturalHeight / imgHeight;

            const x = (frameLeft - imgLeft) * scaleX;
            const y = (frameTop - imgTop) * scaleY;
            const w = frameW * scaleX;
            const h = frameH * scaleY;

            const safe = v => (!isFinite(v) || isNaN(v)) ? 0 : Math.max(0, Math.round(v));

            return {
                x: safe(x),
                y: safe(y),
                width: safe(w),
                height: safe(h)
            };
        }
    };
})();
