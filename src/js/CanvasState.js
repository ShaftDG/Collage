import Shape from './Shape';
import Transform from './Transform';
import Vector2 from './Vector2';

function CanvasState(canvas, cursorEl, cursorImage, cursors) {
    // **** First some setup! ****

    this.cursorEl = cursorEl;
    this.cursorImage = cursorImage;
    this.cursors = cursors;
    this.contains = false;

    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    // This complicates things a little but but fixes mouse co-ordinate problems
    // when there's a border or padding. See getMouse for more detail
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    // **** Keep track of state! ****

    this.valid = false; // when set to false, the canvas will redraw everything
    this.shapes = [];
    this.rectsTransform = [];// the collection of things to be drawn
    this.images = [];
    this.dragging = false; // Keep track of when we are dragging
    this.draggingRectTransform = false;
    // the current selected object. In the future we could turn this into an array for multiple selection
    this.selection = null;
    this.selectionRectTransform = null;
    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;

    this.startDragging = new Vector2(0,0);
    this.deltaDragging = new Vector2(0,0);
    this.tempPositionObject = new Vector2(0,0);
    this.tempSize = new Vector2(0,0);

    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    var myState = this;

    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // Up, down, and move are for dragging
    canvas.addEventListener('mousedown', function(e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var shapes = myState.shapes;
        var images = myState.images;
        var l = shapes.length;
        if (!myState.selectionRectTransform) {
            for (var i = l - 1; i >= 0; i--) {
                let point = shapes[i].t.transformPoint(mx, my);
                if (shapes[i].contains(point.x, point.y, [shapes[i].TL, shapes[i].TR, shapes[i].BR, shapes[i].BL], myState.ctx)) {
                    var mySel = shapes[i];
                    // Keep track of where in the object we clicked
                    // so we can move it smoothly (see mousemove)
                    myState.dragoffx = mx - mySel.x;
                    myState.dragoffy = my - mySel.y;
                    if (!myState.selectionRectTransform) {
                        myState.dragging = true;
                        canvas.classList.remove('canvasNotDragging');
                        canvas.classList.add('canvasDragging');
                    }
                    myState.selection = mySel;
                    myState.defaultSettingShape(mouse);
                    myState.setBeginCoord(myState.selection);
                    myState.valid = false;
                    shapes.splice(i, 1);
                    shapes.push(myState.selection);
                    let image = images[i];
                    images.splice(i, 1);
                    images.push(image);
                    myState.moveTransfomRect(myState.selection);
                    return;
                }
            }
        } else {
            myState.draggingRectTransform = true;
            myState.defaultSettingShape(mouse);
            myState.dragoffx = mx - myState.selectionRectTransform.x;
            myState.dragoffy = my - myState.selectionRectTransform.y;
            myState.valid = false;
        }

        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect
        if (myState.selection && !myState.selectionRectTransform) {
            myState.selection = null;
            myState.valid = false; // Need to clear the old selection border
        }
    }, true);
    canvas.addEventListener('mousemove', function(e) {
        // cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

        if (myState.dragging){
            let mouse = myState.getMouse(e);
            // We don't want to drag the object by its top-left corner, we want to drag it
            // from where we clicked. Thats why we saved the offset and use it here
            let t = new Transform();
            t.translate(mouse.x - myState.dragoffx, mouse.y - myState.dragoffy);
            t.rotate(myState.selection.rotate);

            myState.selection.matrix = t.m;
            myState.selection.t = t;

            myState.selection.x = mouse.x - myState.dragoffx;
            myState.selection.y = mouse.y - myState.dragoffy;

            myState.moveTransfomRect(myState.selection);

            myState.valid = false; // Something's dragging so we must redraw
        } else if (myState.draggingRectTransform) {
            let mouse = myState.getMouse(e);


            myState.deltaDragging = new Vector2(myState.startDragging.x - mouse.x, myState.startDragging.y - mouse.y);

            // console.log(myState.selectionRectTransform.index)
            // let tempX = myState.selectionRectTransform.x;
            // let tempY = myState.selectionRectTransform.y;
            //
            // let deltaX = tempX - myState.selectionRectTransform.x;



            // left
            // myState.selection.x = myState.selection.x - (tempX - myState.selectionRectTransform.x);
            // myState.selection.w = myState.selection.w + (tempX - myState.selectionRectTransform.x);

            // right
            // let t = new Transform();
            // t.translate(myState.selection.x + (deltaX/2), myState.selection.y);
            // t.rotate(myState.selection.rotate);
            //
            // myState.selection.matrix = t.m;
            // myState.selection.t = t;
            //
            // myState.selection.x = myState.selection.x - (deltaX/2);
            // myState.selection.w = myState.selection.w - deltaX;


            if (myState.selectionRectTransform.index !== undefined) {
                myState.translateShape(mouse, myState.selectionRectTransform.index);
            }

            myState.moveTransfomRect(myState.selection);
            myState.valid = false; // Something's dragging so we must redraw
        } else {
            let mouse = myState.getMouse(e);
            let mx = mouse.x;
            let my = mouse.y;
            let point;
            if (myState.selection) {
                point = myState.selection.t.transformPoint(mx, my);
            }
            if (point && myState.selection.contains(point.x, point.y, [myState.selection.TL, myState.selection.TR, myState.selection.BR, myState.selection.BL],myState.ctx)) {
                myState.cursorImage.src = myState.cursors.imgMove.src;
                myState.contains = true;
                // canvas.classList.remove('canvasNotDragging');
                // canvas.classList.add('canvasDragging');
            } else {
                // canvas.classList.remove('canvasDragging');
                // canvas.classList.add('canvasNotDragging');
                myState.cursorImage.src = myState.cursors.imgNormal.src;
                myState.contains = false;
            }
            let rectsTransform = myState.rectsTransform;
            let l = rectsTransform.length;
            for (let i = l-1; i >= 0; i--) {
                let point = rectsTransform[i].t.transformPoint(mx, my);
                if (rectsTransform[i].contains(point.x, point.y, [rectsTransform[i].TL, rectsTransform[i].TR, rectsTransform[i].BR, rectsTransform[i].BL],myState.ctx)) {
                    let mySel = rectsTransform[i];
                    // Keep track of where in the object we clicked
                    // so we can move it smoothly (see mousemove)
                    myState.setStyleMouseCursor(i);
                    myState.selectionRectTransform = mySel;
                    myState.selectionRectTransform.index = i;
                    myState.contains = true;
                    return;
                } else {
                    myState.selectionRectTransform = null;
                    canvas.style.cursor = null;
                    myState.contains = false;
                }
            }
        }
    }, true);
    canvas.addEventListener('mouseup', function(e) {
        myState.dragging = false;
        myState.draggingRectTransform = false;
    }, true);
    // double click for making new shapes
    // canvas.addEventListener('dblclick', function(e) {
    //     var mouse = myState.getMouse(e);
    //     myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
    // }, true);

    // **** Options! ****

    this.selectionColor = '#00cc15';
    this.selectionWidth = 2;
    // this.interval = 16.6;
    // setInterval(function() { myState.draw(); }, myState.interval);
    function animate() {
        requestAnimationFrame( animate );
        myState.draw();
    }
    animate();
}

CanvasState.prototype.constructor = CanvasState;
export default CanvasState;

CanvasState.prototype.defaultSettingShape = function(mouse) {
    if (this.selection) {
        this.tempPositionObject = new Vector2(this.selection.x, this.selection.y);
        this.startDragging = new Vector2(mouse.x, mouse.y);
        this.deltaDragging = new Vector2(0, 0);
        this.tempSize = new Vector2(this.selection.w, this.selection.h);
    }
}
CanvasState.prototype.translateShape = function(mouse, index) {
    // console.log(index)
    // this.cursorEl.style.transform = `rotate(${-this.selection.rotate}rad)`;
    switch (index) {
        case 0:
            let delta0 = this.deltaDragging.x;
            let x0 = this.tempPositionObject.x - (delta0/2)*Math.sin((Math.PI/2)-this.selection.rotate) + (delta0/2)*Math.sin(this.selection.rotate);
            let y0 = this.tempPositionObject.y - (delta0/2)*Math.cos(this.selection.rotate) - (delta0/2)*Math.cos((Math.PI/2)-this.selection.rotate);
            let t0 = new Transform();
            t0.translate(x0, y0);
            t0.rotate(this.selection.rotate);
            this.selection.matrix = t0.m;
            this.selection.t = t0;

            this.selection.x = x0;
            this.selection.y = y0;
            this.selection.w = this.tempSize.x + delta0;
            this.selection.h = this.tempSize.y + delta0 * this.selection.aspect;
            break;
        case 1:
            let delta1 = this.deltaDragging.x;
            let x1 = this.tempPositionObject.x - (delta1/2)*Math.sin((Math.PI/2)-this.selection.rotate) - (delta1/2)*Math.sin(this.selection.rotate);
            let y1 = this.tempPositionObject.y + (delta1/2)*Math.cos(this.selection.rotate) - (delta1/2)*Math.cos((Math.PI/2)-this.selection.rotate);
            let t1 = new Transform();
            t1.translate(x1, y1);
            t1.rotate(this.selection.rotate);
            this.selection.matrix = t1.m;
            this.selection.t = t1;

            this.selection.x = x1;
            this.selection.y = y1;
            this.selection.w = this.tempSize.x - delta1;
            this.selection.h = this.tempSize.y - delta1 * this.selection.aspect;
            break;
        case 2:
            let delta2 = this.deltaDragging.x;
            let x2 = this.tempPositionObject.x - (delta2/2)*Math.sin((Math.PI/2)-this.selection.rotate) + (delta2/2)*Math.sin(this.selection.rotate);
            let y2 = this.tempPositionObject.y - (delta2/2)*Math.cos(this.selection.rotate) - (delta2/2)*Math.cos((Math.PI/2)-this.selection.rotate);
            let t2 = new Transform();
            t2.translate(x2, y2);
            t2.rotate(this.selection.rotate);
            this.selection.matrix = t2.m;
            this.selection.t = t2;

            this.selection.x = x2;
            this.selection.y = y2;
            this.selection.w = this.tempSize.x - delta2;
            this.selection.h = this.tempSize.y - delta2 * this.selection.aspect;
            break;
        case 3:
            let delta3 = this.deltaDragging.x;
            let x3 = this.tempPositionObject.x - (delta3/2)*Math.sin((Math.PI/2)-this.selection.rotate) - (delta3/2)*Math.sin(this.selection.rotate);
            let y3 = this.tempPositionObject.y + (delta3/2)*Math.cos(this.selection.rotate) - (delta3/2)*Math.cos((Math.PI/2)-this.selection.rotate);
            let t3 = new Transform();
            t3.translate(x3, y3);
            t3.rotate(this.selection.rotate);
            this.selection.matrix = t3.m;
            this.selection.t = t3;

            this.selection.x = x3;
            this.selection.y = y3;
            this.selection.w = this.tempSize.x + delta3;
            this.selection.h = this.tempSize.y + delta3 * this.selection.aspect;
            break;
        case 4:
            let delta4 = this.deltaDragging.y;
            let x4 = this.tempPositionObject.x + (delta4/2)*Math.sin(this.selection.rotate);
            let y4 = this.tempPositionObject.y - (delta4/2)*Math.cos(this.selection.rotate);
            let t4 = new Transform();
            t4.translate(x4, y4);
            t4.rotate(this.selection.rotate);
            this.selection.matrix = t4.m;
            this.selection.t = t4;

            this.selection.x = x4;
            this.selection.y = y4;
            this.selection.h = this.tempSize.y + delta4;
            break;
        case 5:
            let delta5 = this.deltaDragging.x;
            let x5 = this.tempPositionObject.x - (delta5/2)*Math.sin((Math.PI/2)-this.selection.rotate);
            let y5 = this.tempPositionObject.y - (delta5/2)*Math.cos((Math.PI/2)-this.selection.rotate);
            let t5 = new Transform();
            t5.translate(x5, y5);
            t5.rotate(this.selection.rotate);
            this.selection.matrix = t5.m;
            this.selection.t = t5;

            this.selection.x = x5;
            this.selection.y = y5;
            this.selection.w = this.tempSize.x - delta5;
            break;
        case 6:
            let delta6 = this.deltaDragging.y;
            let x6 = this.tempPositionObject.x + (delta6/2)*Math.sin(this.selection.rotate);
            let y6 = this.tempPositionObject.y - (delta6/2)*Math.cos(this.selection.rotate);
            let t6 = new Transform();
            t6.translate(x6, y6);
            t6.rotate(this.selection.rotate);
            this.selection.matrix = t6.m;
            this.selection.t = t6;

            this.selection.x = x6;
            this.selection.y = y6;
            this.selection.h = this.tempSize.y - delta6;
            break;
        case 7:
            let delta7 = this.deltaDragging.x;
            let x7 = this.tempPositionObject.x - (delta7/2)*Math.sin((Math.PI/2)-this.selection.rotate);
            let y7 = this.tempPositionObject.y - (delta7/2)*Math.cos((Math.PI/2)-this.selection.rotate);
            let t7 = new Transform();
            t7.translate(x7, y7);
            t7.rotate(this.selection.rotate);
            this.selection.matrix = t7.m;
            this.selection.t = t7;

            this.selection.x = x7;
            this.selection.y = y7;
            this.selection.w = this.tempSize.x + delta7;
            break;
        case 8:
            let angle = new Vector2(mouse.x - this.selection.x, mouse.y - this.selection.y).angle() + (Math.PI / 2);
            let t = new Transform();
            t.translate(this.selection.x, this.selection.y);
            this.selection.rotate = angle;
            t.rotate(this.selection.rotate);
            this.selection.matrix = t.m;
            this.selection.t = t;
            break;
        default:
        // this.canvas.style.cursor = 'auto';
    }
}

CanvasState.prototype.setStyleMouseCursor = function(index) {
    switch (index) {
        case 0:
            // this.canvas.style.cursor = 'nwse-resize';
            this.cursorImage.src = this.cursors.imgDiagonal1.src;
            break;
        case 1:
            // this.canvas.style.cursor = 'nesw-resize';
            this.cursorImage.src = this.cursors.imgDiagonal2.src;
            break;
        case 2:
            // this.canvas.style.cursor = 'nwse-resize';
            this.cursorImage.src = this.cursors.imgDiagonal1.src;
            break;
        case 3:
            // this.canvas.style.cursor = 'nesw-resize';
            this.cursorImage.src = this.cursors.imgDiagonal2.src;
            break;
        case 4:
            // this.canvas.style.cursor = 'ns-resize';
            this.cursorImage.src = this.cursors.imgVertical.src;
            break;
        case 5:
            // this.canvas.style.cursor = 'ew-resize';
            this.cursorImage.src = this.cursors.imgHorizontal.src;
            break;
        case 6:
            // this.canvas.style.cursor = 'ns-resize';
            this.cursorImage.src = this.cursors.imgVertical.src;
            break;
        case 7:
            // this.canvas.style.cursor = 'ew-resize';
            this.cursorImage.src = this.cursors.imgHorizontal.src;
            break;
        case 8:
            // this.canvas.style.cursor = 'grab';
            this.cursorImage.src = this.cursors.imgRotate.src;
            break;
        default:
            // this.canvas.style.cursor = 'auto';
    }
}

CanvasState.prototype.addShape = function(shape, image) {
    this.shapes.push(shape);
    this.selection = shape;
    if (image) {
        this.images.push(image);
    } else {
        this.images.push(null);
    }
    this.valid = false;
}

CanvasState.prototype.addTransformShape = function(shape) {
    this.rectsTransform.push(shape);
    shape.index = this.rectsTransform.length-1;
    this.valid = false;
}

CanvasState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
    // if our state is invalid, redraw and validate!
    if (!this.valid) {
        let ctx = this.ctx;
        let shapes = this.shapes;
        let images = this.images;
        let rectsTransform = this.rectsTransform;
        this.clear();

        // ** Add stuff you want drawn in the background all the time here **

        // draw all shapes
        let l = shapes.length;
        for (let i = 0; i < l; i++) {
            let shape = shapes[i];
            // We can skip the drawing of elements that have moved off the screen:
            if (shape.x > this.width || shape.y > this.height ||
                shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
            shapes[i].draw(ctx, images[i]);
        }

        // draw selection
        // right now this is just a stroke along the edge of the selected Shape
        if (this.selection != null) {
            var mySel = this.selection;
            let m = this.selection.matrix;
            ctx.save();
            ctx.setTransform (m [0], m [1], m [2], m [3], m [4], m [5]);
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            ctx.setLineDash([12, 4]);
            ctx.strokeRect(-mySel.w/2, -mySel.h/2,mySel.w,mySel.h);
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, -mySel.h/2);
            ctx.lineTo(0, -mySel.h/2 - 50);
            ctx.stroke();
            ctx.restore();
            let l = rectsTransform.length;
            if (l === 0) {
                this.createTransfomRect();
            }
            this.setBeginCoord(this.selection);
            for (let i = 0; i < l; i++) {
                rectsTransform[i].draw(ctx);
            }
        }

        // ** Add stuff you want drawn on top all the time here **

        this.valid = true;
    }
}

CanvasState.prototype.createTransfomRect = function() {
    var mySel = this.selection;
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, -mySel.w/2-10, -mySel.h/2-10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, mySel.w/2-10, -mySel.h/2-10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, mySel.w/2-10, mySel.h/2-10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, -mySel.w/2-10, mySel.h/2-10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, -10, -mySel.h/2-10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, mySel.w/2-10, -10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, -10, mySel.h/2-10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, -mySel.w/2-10, -10));
    this.addTransformShape(new Shape(mySel.x, mySel.y, 20, 20, mySel.rotate, this.selectionColor, mySel.matrix, -10, -mySel.h/2-60));
}

CanvasState.prototype.setBeginCoord = function(selection) {
    var mySel = selection;
    let rectsTransform = this.rectsTransform;

    rectsTransform[0].xBegin = -mySel.w/2-10;
    rectsTransform[0].yBegin = -mySel.h/2-10;

    rectsTransform[1].xBegin = mySel.w/2-10;
    rectsTransform[1].yBegin = -mySel.h/2-10;

    rectsTransform[2].xBegin = mySel.w/2-10;
    rectsTransform[2].yBegin = mySel.h/2-10;

    rectsTransform[3].xBegin = -mySel.w/2-10;
    rectsTransform[3].yBegin = mySel.h/2-10;

    rectsTransform[4].xBegin = -10;
    rectsTransform[4].yBegin = -mySel.h/2-10;

    rectsTransform[5].xBegin = mySel.w/2-10;
    rectsTransform[5].yBegin = -10;

    rectsTransform[6].xBegin = -10;
    rectsTransform[6].yBegin = mySel.h/2-10;

    rectsTransform[7].xBegin = -mySel.w/2-10;
    rectsTransform[7].yBegin = -10;

    rectsTransform[8].xBegin = -10;
    rectsTransform[8].yBegin = -mySel.h/2-60;
}


CanvasState.prototype.moveTransfomRect = function(selection) {
    let rectsTransform = this.rectsTransform;

    rectsTransform.map(v => {
        v.y = selection.x;
        v.x = selection.y;
        v.matrix = selection.matrix;
        v.rotate = selection.rotate;
        v.t = selection.t;
    });
}

// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    // We return a simple javascript object (a hash) with x and y defined
    return new Vector2(mx, my);
}