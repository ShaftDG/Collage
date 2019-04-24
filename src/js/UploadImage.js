import Shape from "./Shape";

export default function UploadImage(s, cursorEl) {
    var container = document.createElement('div');
    container.id = 'uploadImage';
    container.name = 'uploadImage';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.innerHTML = ' <div style=\'text-align: center\'>\n' +
        '            <label for=\'file\' class=\'custom-file-uploadMenu2D\'>\n' +
        '                Загрузить изображение\n' +
        '            </label>\n' +
        '            <input id=\'file\' name=\'file\' type=\'file\'/>\n' +
        '        </div>\n' +
        '        <div>\n' +
        '            <span id=\'output\'></span>\n' +
        '        </div>';
    document.body.appendChild(container);

    // document.getElementById('uploadImage').addEventListener('click', function () {
    //     cursorEl.style.display = 'none';
    // }, false);

    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    function handleFileSelect(evt) {
        // cursorEl.style.display = '';
        evt.preventDefault();
        var file = evt.target.files; // FileList object
        var f = file[0];
        // Only process image files.
        if (!f.type.match('image.*')) {
            alert('Image only please....');
        } else {
            var img = new Image();
            img.src = URL.createObjectURL(evt.target.files[0]);
            img.onload = function() {
                let w = 640;
                let h = 320;
                if (img.naturalWidth > 640) {
                    let aspect = img.naturalHeight / img.naturalWidth;
                    w = 640;
                    h = 640 * aspect;
                } else {
                    w = img.naturalWidth;
                    h = img.naturalHeight;
                }
                let x = (s.width / 2);
                let y = (s.height / 2);
                s.addShape(new Shape(x, y, w, h, 0, 'lightskyblue'), img);
                if (s.rectsTransform.length === 0) {
                    s.createTransfomRect();
                } else {
                    s.setBeginCoord(s.selection);
                    s.moveTransfomRect(s.selection);
                }
            }

        }
    }
    return
}