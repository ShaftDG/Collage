
export default function UploadImage(s, cursorEl) {
    function hideCursor(){
        cursorEl.style.display = 'none';
    }
    var container = document.createElement('div');
    container.id = 'downloadImage';
    container.name = 'downloadImage';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.right = '0';
    container.innerHTML = ' <div style=\'text-align: center\'>\n' +
                          '        <button id=\'downloadImageButton\' type=\'button\' class=\'custom-file-uploadMenu2D\'>Сохранить изображение</button>\n' +
                          '</div>\n';
    document.body.appendChild(container);

    // container.addEventListener('click', function () {
    //     cursorEl.style.display = 'none';
    // }, false);

    let button = document.getElementById('downloadImageButton');

    var link = document.createElement('a');
    link.addEventListener('change', function () {
        cursorEl.style.display = '';
    }, false);
    button.addEventListener('click', function(ev) {
        link.href = s.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        link.download = "image.png";
        link.click();
    }, false);
    document.body.appendChild(link);
    return
}