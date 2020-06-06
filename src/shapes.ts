import {containerProperties} from "./interfaces"
import {roundPathCorners} from "./rounding"
export class Shape{
    xPos: number
    yPos: number
    width: number
    height: number
    radius: number
    constructor(xPos: number, yPos: number, width: number, height: number, radius?: number){
        this.xPos = xPos
        this.yPos = yPos
        this.width = width
        this.height = height
        this.radius = radius
    }

    get strokePath(): string{
        return this.shapePath
    }
}

export interface Shape{
    xPos: number
    yPos: number
    width: number
    height: number
    shapePath: string
    strokePath: string
    titleFOPoints: containerProperties
}


export class Rectangle extends Shape implements Shape{
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

export class Parallelogram extends Shape implements Shape{
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
}

export class Chevron extends Shape implements Shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        this.z = (0.5*this.height)/Math.tan(angle * (Math.PI / 180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + 0.5*this.height)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos + this.z, this.yPos + 0.5*this.height)
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
}

export class ChevronVertical extends Shape implements Shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        this.z = (0.5*this.width)/Math.tan(angle * (Math.PI / 180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + 0.5*this.width, this.yPos + this.z)
        path.DrawTo(this.xPos + this.width, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + this.height - this.z)
        path.DrawTo(this.xPos + 0.5*this.width, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height - this.z)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos,
            yPos: this.yPos + this.z,
            width: this.width,
            height: this.height - 2*this.z
        }
    }
}

export class Pentagon extends Shape implements Shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        this.z = (0.5*this.height)/Math.tan(angle * (Math.PI / 180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + 0.5*this.height)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos,
            yPos: this.yPos,
            width: this.width - this.z,
            height: this.height
        }
    }
}

export class Hexagon extends Shape implements Shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        this.z = (0.5*this.height)/Math.tan(angle * (Math.PI / 180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos + this.z, this.yPos)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + 0.5*this.height)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos + this.height)
        path.DrawTo(this.xPos + this.z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + 0.5*this.height)
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
}

export class Ellipse extends Shape implements Shape{
    constructor(xPos: number, yPos: number, width: number, height: number){
        super(xPos, yPos, width, height)
    }

    get shapePath(): string{
        let rx =  0.5*this.width
        let ry = 0.5*this.height
        let cx = this.xPos + rx
        let cy = this.yPos + ry
        let path = new Path()
        path.MoveTo(cx-rx, cy)
        path.arc(rx, ry, 0, 1, 0, 2*rx, 0)
        path.arc(rx, ry, 0, 1, 0, -2*rx, 0)
        path.close()
        console.log(rx, ry, cx, cy)
        console.log(path.toString())
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

export class Tab_RoundedCorners extends Shape implements Shape{
    constructor(xPos: number, yPos: number, width: number, height: number){
        super(xPos, yPos, width, height)
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + this.height)
        path.roundCorners(20)
        path.close()
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
    get strokePath(): string {
        let strokePath: Path = new Path(this.shapePath)
        strokePath.removeClose()
        return strokePath.toString()
    }
}
export class Tab_CutCorners extends Shape implements Shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, length: number){
        super(xPos, yPos, width, height)
        this.z = length
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.z)
        path.DrawTo(this.xPos + this.z, this.yPos)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + this.z)
        path.DrawTo(this.xPos + this.width, this.yPos + this.height)
        path.close()
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
    get strokePath(): string {
        let strokePath: Path = new Path(this.shapePath)
        strokePath.removeClose()
        return strokePath.toString()
    }
}
export class Tab_CutCorner extends Shape implements Shape{
    z: number
    constructor(xPos: number, yPos: number, width: number, height: number, length: number){
        super(xPos, yPos, width, height)
        this.z = length
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width - this.z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + this.z)
        path.DrawTo(this.xPos + this.width, this.yPos + this.height)
        path.close()
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
    get strokePath(): string {
        let strokePath: Path = new Path(this.shapePath)
        strokePath.removeClose()
        return strokePath.toString()
    }
}

class Path{
    path: string;
    constructor(path?: string){
        this.path = path || ""
    }
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
    public arc(rx: number, ry:number, rotation: number, arc:number, sweep: number, eX: number, eY: number){
        this.path+= ["a",rx,ry,rotation,arc,sweep,eX,eY].join(" ")+ " "
    }
    
    public roundCorners(radius): void{
        this.path = roundPathCorners(this.path, radius, false)
    }
    public close(): void{
        this.path += 'Z'
    }
    public removeClose(): void{
        if(this.path.endsWith('Z'))
            this.path = this.path.substring(0,  this.path.length-1)
    }
    public toString(): string{
        return this.path
    }
}