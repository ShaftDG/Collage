import Transform from "./Transform";

function Shape(x, y, w, h, rotate, fill, matrix, xBegin, yBegin) {
    // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    // But we aren't checking anything else! We could put "Lalala" for the value of x
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.aspect = this.h / this.w;
    this.rotate = rotate || 0;
    this.xBegin = xBegin || 0;
    this.yBegin = yBegin || 0;
    this.fill = fill || '#AAAAAA';
    this.t = new Transform();
    this.t.translate(this.x, this.y);
    this.t.rotate(this.rotate);
    this.matrix = matrix || this.t.m;
    this.TL = this.t.transformPoint( -this.w/2, -this.h/2);
    this.TR = this.t.transformPoint(this.w/2, -this.h/2);
    this.BR = this.t.transformPoint(this.w/2, this.h/2);
    this.BL = this.t.transformPoint(-this.w/2, this.h/2);
}

Shape.prototype.constructor = Shape;
export default Shape;

// Draws this shape to a given context
Shape.prototype.draw = function(ctx, img) {

    if (img) {
        ctx.save();
        this.TL = this.t.transformPoint( -this.w/2, -this.h/2);
        this.TR = this.t.transformPoint(this.w/2, -this.h/2);
        this.BR = this.t.transformPoint(this.w/2, this.h/2);
        this.BL = this.t.transformPoint(-this.w/2, this.h/2);
        ctx.setTransform (this.matrix [0], this.matrix [1], this.matrix [2], this.matrix [3], this.matrix [4], this.matrix [5]);
        ctx.rect(-this.w/2, -this.h/2, this.w, this.h);
        ctx.clip();
        ctx.drawImage(img, -this.w/2, -this.h/2, this.w, this.h);
        ctx.restore();

    } else {

        ctx.save();
        this.TL = this.t.transformPoint(this.xBegin, this.yBegin);
        this.TR = this.t.transformPoint(this.xBegin+this.w, this.yBegin);
        this.BR = this.t.transformPoint(this.xBegin+this.w, this.yBegin+this.h);
        this.BL = this.t.transformPoint(this.xBegin, this.yBegin+this.h);

        ctx.setTransform (this.matrix [0], this.matrix [1], this.matrix [2], this.matrix [3], this.matrix [4], this.matrix [5]);
        ctx.fillStyle = this.fill;
        ctx.fillRect(this.xBegin, this.yBegin, this.w, this.h);
        ctx.restore();

        // ctx.fillRect(this.TL.x,this.TL.y,2,2);
        // ctx.fillRect(this.TR.x,this.TR.y,2,2);
        // ctx.fillRect(this.BR.x,this.BR.y,2,2);
        // ctx.fillRect(this.BL.x,this.BL.y,2,2);
    }
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my, points, ctx) {
    points[0] = this.t.transformPoint(points[0].x, points[0].y);
    points[1] = this.t.transformPoint(points[1].x, points[1].y);
    points[2] = this.t.transformPoint(points[2].x, points[2].y);
    points[3] = this.t.transformPoint(points[3].x, points[3].y);
    // ctx.fillRect(points[0].x,points[0].y,5,5);
    // ctx.fillRect(points[1].x,points[1].y,5,5);
    // ctx.fillRect(points[2].x,points[2].y,5,5);
    // ctx.fillRect(points[3].x,points[3].y,5,5);
    // console.log(points);
    var triangle = points;
    var D, D1, D2, D3;
    D = (mx - triangle[0].x) * (triangle[1].y - triangle[0].y) - (my - triangle[0].y) * (triangle[1].x - triangle[0].x);
    D1 = (mx - triangle[1].x) * (triangle[2].y - triangle[1].y) - (my - triangle[1].y) * (triangle[2].x - triangle[1].x);
    D2 = (mx - triangle[2].x) * (triangle[3].y - triangle[2].y) - (my - triangle[2].y) * (triangle[3].x - triangle[2].x);
    D3 = (mx - triangle[3].x) * (triangle[0].y - triangle[3].y) - (my - triangle[3].y) * (triangle[0].x - triangle[3].x);
    return (D < 0 && D1 < 0 && D2 < 0 && D3 < 0);
    // All we have to do is make sure the Mouse X,Y fall in the area between
    // the shape's X and (X + Width) and its Y and (Y + Height)

    // let point = this.t.transformPoint(mx, my);
    // ctx.fillRect(point[0]-,point[1],5,5);
    // console.log(point);
    // if ((this.x <= mx) && (this.x + this.w >= mx) &&
    //     (this.y <= my) && (this.y + this.h >= my)) {
    //     console.log(mx, my);
    //     console.log(point);
    //     return true;
    // } else {
    //     return false;
    // }
    // return  (this.x <= mx) && (this.x + this.w >= mx) &&
    //     (this.y <= my) && (this.y + this.h >= my);
}