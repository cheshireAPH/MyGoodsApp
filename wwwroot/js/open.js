window.openUrl = (url) => {

    const isPwa = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;

    // 画像編集ページかどうか判定（URL 前提を壊さない）
    const isImageEdit = url.startsWith("image-edit/");

    if (isPwa && isImageEdit) {
        // PWA + 画像編集だけ → 同一タブ遷移
        window.location.href = url;
        return;
    }

    // それ以外は今まで通り
    window.open(url, "_blank");
};
