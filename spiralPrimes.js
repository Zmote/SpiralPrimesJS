class Canvas {
    constructor({width = screen.width, height = screen.height} = {}) {
        this.width = width;
        this.height = height;
        this.canvas = Canvas.createCanvas(width, height);
        this.context = this.canvas.getContext("2d");
        this.context.moveTo(0, 0);
    }

    static createCanvas(canvasWidth, canvasHeight) {
        let canvas = document.createElement("canvas");
        document.body = document.createElement("body");
        document.body.appendChild(canvas);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        return canvas;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Options {
    constructor({
                    limit = 1024, rectangleSize = 24,
                    gridLineWidth = 1, gridLineColor = "black",
                    defaultTextColor = "black", defaultFillStyle = "white",
                    primeTextColor = "white", primeFillStyle = "blue",
                    hideNumbers = false,
                    isAnimated = false
                } = {}) {
        this.limit = limit;
        this.rectangleSize = rectangleSize;
        this.gridLineWidth = gridLineWidth;
        this.gridLineColor = gridLineColor;
        this.defaultTextColor = defaultTextColor;
        this.defaultFillStyle = defaultFillStyle;
        this.primeTextColor = primeTextColor;
        this.primeFillStyle = primeFillStyle;
        this.hideNumbers = hideNumbers;
        this.isAnimated = isAnimated;
        this.fontSize = (rectangleSize / 4) * 3;
    }
}

class Directions {
    constructor() {
        this.leftOptions = {
            startMultiplier: 1,
            currentCount: 0,
            dirs: ["LEFT", "UP"],
            dirStore: ["LEFT", "UP"]
        };

        this.rightOptions = {
            startMultiplier: 2,
            currentCount: 1,
            dirs: ["RIGHT", "DOWN"],
            dirStore: ["RIGHT", "DOWN"]
        };

        this.isLeft = true;
        this.isInitial = true;
    }

    generateDirection() {
        if (this.isInitial) {
            this.isInitial = false;
            return "CENTER";
        }
        if (this.isLeft) {
            return this.generateAbstractDirection(this.leftOptions);
        } else {
            return this.generateAbstractDirection(this.rightOptions);
        }
    }

    generateAbstractDirection(options) {
        if (options.currentCount <= 0) {
            let dir = options.dirs.shift();
            if (options.dirs.length === 0) {
                options.dirs = [].concat(options.dirStore);
                options.startMultiplier = options.startMultiplier + 2;
                options.currentCount = options.startMultiplier - 1;
                this.isLeft = !this.isLeft;
            } else {
                options.currentCount = options.startMultiplier - 1;
            }
            return dir;
        } else {
            options.currentCount = options.currentCount - 1;
            return options.dirs[0];
        }
    }
}

Object.assign(Directions, {
    DOWN: {x: 0, y: -1},
    UP: {x: 0, y: 1},
    RIGHT: {x: -1, y: 0},
    LEFT: {x: 1, y: 0},
    CENTER: {x: 0, y: 0}
});

/**
 * @class Primes
 * @desc isPrime and leastFactor referenced from http://www.javascripter.net/faq/numberisprime.htm
 * @desc determines in a fast way if a number is a prime or not
 * */
class Primes {
    static isPrime(number) {
        if (isNaN(number) || !isFinite(number) || number % 1 || number < 2) return false;
        return number === Primes.leastFactor(number);

    }

    static leastFactor(number) {
        if (isNaN(number) || !isFinite(number)) return NaN;
        if (number === 0) return 0;
        if (number % 1 || number * number < 2) return 1;
        if (number % 2 === 0) return 2;
        if (number % 3 === 0) return 3;
        if (number % 5 === 0) return 5;
        let m = Math.sqrt(number);
        for (let i = 7; i <= m; i += 30) {
            if (number % i === 0) return i;
            if (number % (i + 4) === 0) return i + 4;
            if (number % (i + 6) === 0) return i + 6;
            if (number % (i + 10) === 0) return i + 10;
            if (number % (i + 12) === 0) return i + 12;
            if (number % (i + 16) === 0) return i + 16;
            if (number % (i + 22) === 0) return i + 22;
            if (number % (i + 24) === 0) return i + 24;
        }
        return number;
    }
}

class SpiralPrimeGenerator {
    constructor({canvas = new Canvas(), options = new Options(), timer = false} = {}) {
        this.canvas = canvas;
        this.center = new Point(canvas.width / 2, canvas.height / 2);
        this.options = options;
        this.timer = timer;
    }

    run() {
        let start = new Date();
        this.drawSpiral();
        if (this.timer) {
            let stop = new Date();
            console.log("Calculation took: " + (stop - start) + " milliseconds");
        }
    }

    reset() {
        this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
    }

    setOptions(options) {
        this.options = options;
    }

    setOffset(offsetX, offsetY) {
        this.center = new Point(this.center.x + offsetX, this.center.y + offsetY);
    }

    colorRectangle(isPrime, pos) {
        if (isPrime) {
            this.drawBackground(pos, this.options.primeFillStyle);
            this.canvas.context.fillStyle = this.options.primeTextColor;
        } else {
            this.drawBackground(pos, this.options.defaultFillStyle);
            this.canvas.context.fillStyle = this.options.defaultTextColor;
        }
    }

    printRectangleNumber(number, pos) {
        let numberString = number.toString();
        let adjustedFontSize = this.options.fontSize / Math.sqrt(numberString.length);
        this.canvas.context.font = adjustedFontSize + "px Arial";
        let fontXAdjustment = this.options.fontSize / (3 * numberString.length);
        this.canvas.context.fillText(numberString, pos.x + fontXAdjustment, pos.y + this.options.fontSize);
    }

    drawFrame(direction) {
        this.canvas.context.lineWidth = this.options.gridLineWidth;
        this.canvas.context.strokeStyle = this.options.gridLineColor;
        let newPos = new Point(
            this.center.x - (this.options.rectangleSize * direction.x),
            this.center.y - (this.options.rectangleSize * direction.y));
        this.canvas.context.strokeRect(newPos.x, newPos.y, this.options.rectangleSize, this.options.rectangleSize);
        return newPos;
    }

    drawBackground(pos, fillStyle) {
        this.canvas.context.fillStyle = fillStyle;
        this.canvas.context.fillRect(pos.x, pos.y, this.options.rectangleSize, this.options.rectangleSize);
    }

    drawRectangle(number, direction) {
        let newPos = this.drawFrame(direction);
        this.colorRectangle(Primes.isPrime(number), newPos);

        if (!this.options.hideNumbers) {
            this.printRectangleNumber(number, newPos);
        }
        this.center = new Point(newPos.x, newPos.y);
    }

    drawSpiral() {
        let directions = new Directions();
        for (let number = 0; number < this.options.limit; number++) {
            if(this.options.isAnimated){
                setTimeout(()=>{
                    this.drawRectangle(number, Directions[directions.generateDirection()]);
                },1);
            }else{
                this.drawRectangle(number, Directions[directions.generateDirection()]);
            }
        }
    }
}

// let spiralPrimes = new SpiralPrimeGenerator({
//     canvas: new Canvas({
//         width: 3840,
//         height: 2160
//     }),
//     options: new Options({
//         limit: 1000000,
//         rectangleSize: 4,
//         gridLineWidth: 1,
//         gridLineColor: "black",
//         defaultFillStyle: "black",
//         defaultTextColor: "white",
//         primeTextColor: "pink",
//         primeFillStyle: "white",
//         hideNumbers: true,
//         isAnimated: false
//     }),
//     timer: true
// });

// spiralPrimes.run();

// spiralPrimes.reset();
// spiralPrimes.setOffset(500, 0);
// spiralPrimes.setOptions(new Options({
//     limit: 2000,
//     rectangleSize: 16,
//     gridLineWidth: 2,
//     gridLineColor: "white",
//     defaultFillStyle: "black",
//     defaultTextColor: "white",
//     primeTextColor: "white",
//     primeFillStyle: "red",
//     hideNumbers: false
// }));
// spiralPrimes.run();

new SpiralPrimeGenerator().run();
