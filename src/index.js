import './css/style.css';
import UploadImage from './js/UploadImage';
import DownloadImage from './js/DownloadImage';
import CanvasState from './js/CanvasState';

init();

function init() {
    let canvas = document.getElementById('canvas');
    let cursorEl = document.querySelector('#cursor');
    let cursorImage = document.querySelector('#image');

    var imgNormal = new Image();
    imgNormal.src = './src/assets/cursors/normal.cur';
    imgNormal.onload = function() {
        cursorImage.src = this.src;
    };

    var imgDiagonal1 = new Image();
    imgDiagonal1.src = './src/assets/cursors/diagonal1.cur';

    var imgDiagonal2 = new Image();
    imgDiagonal2.src = './src/assets/cursors/diagonal2.cur';

    var imgHorizontal = new Image();
    imgHorizontal.src = './src/assets/cursors/horizontal.cur';

    var imgVertical = new Image();
    imgVertical.src = './src/assets/cursors/vertical.cur';

    var imgMove = new Image();
    imgMove.src = './src/assets/cursors/move.cur';

    var imgRotate = new Image();
    imgRotate.src = './src/assets/cursors/link.cur';

    let cursors = {
        imgNormal: imgNormal,
        imgDiagonal1: imgDiagonal1,
        imgDiagonal2: imgDiagonal2,
        imgHorizontal: imgHorizontal,
        imgVertical: imgVertical,
        imgMove: imgMove,
        imgRotate: imgRotate
    }


    // cursorImageEl = document.querySelector('#cursor > img');
    // let ctx = canvas.getContext('2D');
    resizeCanvas();
    var s = new CanvasState(canvas, cursorEl, cursorImage, cursors);
    // s.addShape(new Shape(40,40,50,50)); // The default is gray
    // s.addShape(new Shape(60,140,40,60, 'lightskyblue'));
    // // Lets make some partially transparent
    // s.addShape(new Shape(80,150,60,30, 'rgba(127, 255, 212, .5)'));
    // s.addShape(new Shape(125,80,30,80, 'rgba(245, 222, 179, .7)'));

    UploadImage(s, cursorEl);
    DownloadImage(s, cursorEl);
    // img.src = URL.createObjectURL(e.target.files[0]);
    window.addEventListener('mousemove', function(e) {
        if (s.contains) {
            cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px) rotate(${s.selection.rotate}rad)`;
            cursorEl.classList.remove('cursorNormal');
            cursorEl.classList.add('cursor');
        } else {
            cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px) rotate(0rad)`;
            cursorEl.classList.remove('cursor');
            cursorEl.classList.add('cursorNormal');
        }
        // this.cursorEl.style.transform = `rotate(${-this.selection.rotate}rad)`;
    }, false);
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        /**
         * Your drawings need to be inside this function otherwise they will be reset when
         * you resize the browser window and the canvas goes will be cleared.
         */
        // drawStuff();
    }
}
