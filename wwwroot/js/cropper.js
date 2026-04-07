window.cropper = {
    init: function () {
        const frame = document.getElementById("crop-frame");
        const handle = document.getElementById("crop-handle");
        let dragging = false;
        let resizing = false;
        let startX, startY, startW, startH;

        frame.addEventListener("mousedown", e => {
            dragging = true;
            startX = e.clientX - frame.offsetLeft;
            startY = e.clientY - frame.offsetTop;
        });

        handle.addEventListener("mousedown", e => {
            e.stopPropagation();
            resizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startW = frame.offsetWidth;
            startH = frame.offsetHeight;
        });

        document.addEventListener("mousemove", e => {
            if (dragging) {
                frame.style.left = (e.clientX - startX) + "px";
                frame.style.top = (e.clientY - startY) + "px";
            }
            if (resizing) {
                frame.style.width = (startW + (e.clientX - startX)) + "px";
                frame.style.height = (startH + (e.clientY - startY)) + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            dragging = false;
            resizing = false;
        });
    },

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
