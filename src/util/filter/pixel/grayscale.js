import {
    parseParamNumber,
    pack,
    colorMatrix
} from '../functions'

export default function grayscale (amount) { 
    amount = parseParamNumber(amount)          
    let C = amount / 100;

    if (C > 1) C = 1; 
    
    return pack((pixels, i) => {

        colorMatrix(pixels, i, [
            (0.2126 + 0.7874 * (1 - C)), (0.7152 - 0.7152 * (1 - C)), (0.0722 - 0.0722 * (1 - C)), 0,
            (0.2126 - 0.2126 * (1 - C)), (0.7152 + 0.2848 * (1 - C)), (0.0722 - 0.0722 * (1 - C)), 0,
            (0.2126 - 0.2126 * (1 - C)), (0.7152 - 0.7152 * (1 - C)), (0.0722 + 0.9278 * (1 - C)), 0,
            0, 0, 0, 1
        ])
    });
} 