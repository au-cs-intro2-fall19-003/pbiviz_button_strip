import {containerProperties} from "./interfaces"
export class shape{
    xPos: number
    yPos: number
    width: number
    height: number
    constructor(xPos: number, yPos: number, width: number, height: number){
        this.xPos = xPos
        this.yPos = yPos
        this.width = width
        this.height = height
    }
}

export interface shape{
    xPos: number
    yPos: number
    width: number
    height: number
    shapePoints: number[][]
    titleFOPoints: containerProperties
}


export class rectangle extends shape implements shape{
    constructor(xPos: number, yPos: number, width: number, height: number){
        super(xPos, yPos, width, height)
    }

    get shapePoints(): number[][]{
        let points: number[][]= []
        points.push([this.xPos, this.yPos])
        points.push([this.xPos + this.width, this.yPos])
        points.push([this.xPos + this.width, this.yPos + this.height])
        points.push([this.xPos, this.yPos + this.height])
        return points
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos,
            yPos: this.yPos,
            width: this.width,
            height: this.height
        }
    }
}

export class slanted_rectangle extends shape implements shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number){
        super(xPos, yPos, width, height)
        this.z = this.height/Math.tan(angle * (Math.PI / 180))
    }

    get shapePoints(): number[][]{
        let points: number[][]= [] 
        points.push([this.xPos + this.z, this.yPos])
        points.push([this.xPos+ this.width, this.yPos])
        points.push([this.xPos + this.width - this.z, this.yPos + this.height])
        points.push([this.xPos, this.yPos + this.height])
        return points
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos + this.z,
            yPos: this.yPos,
            width: this.width - 2*this.z,
            height: this.height
        }
    }
}