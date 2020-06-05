import {containerProperties} from "./interfaces"
import {roundPathCorners} from "./rounding"
export class shape{
    xPos: number
    yPos: number
    width: number
    height: number
    radius: number
    constructor(xPos: number, yPos: number, width: number, height: number, radius: number){
        this.xPos = xPos
        this.yPos = yPos
        this.width = width
        this.height = height
        this.radius = radius
    }
    get alterPadding(): number{
        return 0
    }
}

export interface shape{
    xPos: number
    yPos: number
    width: number
    height: number
    shapePath: string
    titleFOPoints: containerProperties
    alterPadding: number
}


export class rectangle extends shape implements shape{
    constructor(xPos: number, yPos: number, width: number, height: number, radius: number){
        super(xPos, yPos, width, height, radius)
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
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

export class parallelogram extends shape implements shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        this.z = this.height/Math.tan(angle * (Math.PI / 180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos + this.z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos + this.z,
            yPos: this.yPos,
            width: this.width - 2*this.z,
            height: this.height
        }
    }
    get alterPadding(): number{
        return -1*this.z
    }
}

class Path{
    path: string = "";
    public MoveTo(x, y): void{
        this.path+= ["M",x,y].join(" ") + " "
    }
    public moveTo(x, y): void{
        this.path+= ["m",x,y].join(" ")+ " "
    }
    public DrawTo(x, y): void{
        this.path+= ["L",x,y].join(" ")+ " "
    }
    public drawTo(x, y): void{
        this.path+= ["l",x,y].join(" ")+ " "
    }
    public roundCorners(radius): void{
        this.path = roundPathCorners(this.path, radius, false)
    }
    public close(): void{
        this.path += 'Z'
    }
    public toString(): string{
        return this.path
    }
}