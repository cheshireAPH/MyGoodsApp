function isPwa() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

window.openUrl = (url) => {
    if (isPwa()) {
        window.location.href = url;
    } else {
        window.open(url, "_blank");
    }
};
