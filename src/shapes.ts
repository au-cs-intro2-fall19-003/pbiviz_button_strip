import {containerProperties, Handle} from "./interfaces"
import {roundPathCorners} from "./rounding"
import { path } from "d3"
export class Shape{
    xPos: number
    yPos: number
    width: number
    height: number
    radius: number
    static _handleFocused: boolean = false
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

    get handles(): any[]{
        return []
    }

    public get handleFocused(): boolean {
        return Shape._handleFocused
    }
    public set handleFocused(x: boolean){
        Shape._handleFocused = x
    }    
}

export interface Shape{
    xPos: number,
    yPosd: number,
    width: number,
    height: number,
    shapePath: string,
    strokePath: string,
    titleFOPoints: containerProperties,
    handles: any[]
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
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        if(!this.handleFocused)
            Parallelogram._z = this.height/Math.tan(angle*(Math.PI/180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos + Parallelogram._z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos)
        path.DrawTo(this.xPos + this.width - Parallelogram._z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos + Parallelogram._z,
            yPos: this.yPos,
            width: this.width - 2*Parallelogram._z,
            height: this.height
        }
    }

    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.z
                }, 
                get yPos(): number {
                    return this.buttonYPos
                },
                axis: 'x',
                propName: 'parallelogramAngle',
                get z(): number {
                    return Parallelogram._z
                },
                set z(x: number){
                    Parallelogram._z = x
                },
                get disp(): number {
                    return Math.floor(Math.atan(this.buttonHeight/this.z) * (180 / Math.PI))
                },
            }
        ]
        return handles
    }
}

export class ParallelogramVertical extends Shape implements Shape{
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        if(!this.handleFocused)
        ParallelogramVertical._z = this.width/Math.tan(angle*(Math.PI/180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + ParallelogramVertical._z )
        path.DrawTo(this.xPos + this.width , this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height -  ParallelogramVertical._z )
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos,
            yPos: this.yPos + ParallelogramVertical._z,
            width: this.width,
            height: this.height - 2*ParallelogramVertical._z
        }
    }
    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.buttonWidth - 5
                }, 
                get yPos(): number {
                    return this.buttonYPos + this.z
                },
                axis: 'y',
                propName: 'parallelogramAngle',
                get z(): number {
                    return ParallelogramVertical._z
                },
                set z(x: number){
                    ParallelogramVertical._z = x
                },
                get disp(): number {
                    return Math.floor(Math.atan(this.buttonWidth/this.z) * (180 / Math.PI))
                },
            }
        ]
        return handles
    }
}

export class Chevron extends Shape implements Shape{
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        if(!this.handleFocused)
            Chevron._z = (0.5*this.height)/Math.tan(angle*(Math.PI/180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width - Chevron._z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + 0.5*this.height)
        path.DrawTo(this.xPos + this.width - Chevron._z , this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos + Chevron._z , this.yPos + 0.5*this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos + Chevron._z,
            yPos: this.yPos,
            width: this.width - 2*Chevron._z,
            height: this.height
        }
    }
    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.buttonWidth - this.z
                }, 
                get yPos(): number {
                    return this.buttonYPos
                },
                axis: 'x',
                propName: 'chevronAngle',
                get z(): number {
                    return Chevron._z
                },
                set z(x: number){
                    Chevron._z = this.buttonWidth - x
                },
                get disp(): number {
                    return Math.floor(Math.atan(this.buttonHeight/(2*this.z)) * (180 / Math.PI))
                },
            }
        ]
        return handles
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
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        if(!this.handleFocused)
            Pentagon._z = 0.5*this.height/Math.tan(angle*(Math.PI/180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width - Pentagon._z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + 0.5*this.height)
        path.DrawTo(this.xPos + this.width - Pentagon._z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos,
            yPos: this.yPos,
            width: this.width - Pentagon._z,
            height: this.height
        }
    }

    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.buttonWidth - this.z
                }, 
                get yPos(): number {
                    return this.buttonYPos
                },
                axis: 'x',
                propName: 'pentagonAngle',
                get z(): number {
                    return Pentagon._z
                },
                set z(x: number){
                    Pentagon._z = this.buttonWidth - x
                },
                get disp(): number {
                    return Math.floor(Math.atan(this.buttonHeight/(2*this.z)) * (180 / Math.PI))
                },
            }
        ]
        return handles
    }
}

export class Hexagon extends Shape implements Shape{
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, angle: number, radius: number){
        super(xPos, yPos, width, height, radius)
        if(!this.handleFocused)
            Hexagon._z = 0.5*this.height/Math.tan(angle*(Math.PI/180))
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos + Hexagon._z, this.yPos)
        path.DrawTo(this.xPos + this.width - Hexagon._z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + 0.5*this.height)
        path.DrawTo(this.xPos + this.width - Hexagon._z, this.yPos + this.height)
        path.DrawTo(this.xPos + Hexagon._z, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + 0.5*this.height)
        path.close()
        path.roundCorners(this.radius)
        return path.toString()
    }

    get titleFOPoints(): containerProperties{
        return {
            xPos: this.xPos + Hexagon._z,
            yPos: this.yPos,
            width: this.width - 2*Hexagon._z,
            height: this.height
        }
    }

    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.buttonWidth - this.z
                }, 
                get yPos(): number {
                    return this.buttonYPos
                },
                axis: 'x',
                propName: 'hexagonAngle',
                get z(): number {
                    return Hexagon._z
                },
                set z(x: number){
                    Hexagon._z = this.buttonWidth - x
                },
                get disp(): number {
                    return Math.floor(Math.atan(this.buttonHeight/(2*this.z)) * (180 / Math.PI))
                },
            }
        ]
        return handles
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
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, length: number){
        super(xPos, yPos, width, height)
        if(!this.handleFocused)
            Tab_CutCorners._z = length
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos + Tab_CutCorners._z)
        path.DrawTo(this.xPos + Tab_CutCorners._z, this.yPos)
        path.DrawTo(this.xPos + this.width - Tab_CutCorners._z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + Tab_CutCorners._z)
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
    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.buttonWidth - this.z
                }, 
                get yPos(): number {
                    return this.buttonYPos
                },
                axis: 'x',
                propName: 'tab_cutCornersLength',
                get z(): number {
                    return Tab_CutCorners._z
                },
                set z(x: number){
                    Tab_CutCorners._z = this.buttonWidth - x
                },
                get disp(): number {
                    return Math.floor(this.z)
                }
            }
        ]
        return handles
    }
}
export class Tab_CutCorner extends Shape implements Shape{
    static _z: number;
    constructor(xPos: number, yPos: number, width: number, height: number, length: number){
        super(xPos, yPos, width, height)
        if(!this.handleFocused)
            Tab_CutCorner._z = length
    }

    get shapePath(): string{
        let path = new Path()
        path.MoveTo(this.xPos, this.yPos + this.height)
        path.DrawTo(this.xPos, this.yPos)
        path.DrawTo(this.xPos + this.width - Tab_CutCorner._z, this.yPos)
        path.DrawTo(this.xPos + this.width, this.yPos + Tab_CutCorner._z)
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

    get handles(): Handle[]{
        let handles: Handle[] = [
            {
                buttonXPos: this.xPos,
                buttonYPos: this.yPos,
                buttonWidth: this.width,
                buttonHeight: this.height,
                get xPos(): number {
                    return this.buttonXPos + this.buttonWidth - this.z
                }, 
                get yPos(): number {
                    return this.buttonYPos
                },
                axis: 'x',
                propName: 'tab_cutCornerLength',
                get z(): number {
                    return Tab_CutCorner._z
                },
                set z(x: number){
                    Tab_CutCorner._z = this.buttonWidth - x
                },
                get disp(): number {
                    return Math.floor(this.z)
                }
            }
        ]
        return handles
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