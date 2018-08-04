import Canvas from '../../Canvas'
// Image manupulate 
export default function resize (dstWidth, dstHeight) {
    return function (bitmap) {
        
        var c = Canvas.drawPixels(bitmap);
        var context = c.getContext('2d');

        c.width = dstWidth;
        c.height = dstHeight;

        return {
            pixels: new Uint8ClampedArray(context.getImageData(0, 0, dstWidth, dstHeight).data),
            width: dstWidth,
            height: dstHeight
        }
    } 
}