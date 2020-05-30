import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import { VisualSettings } from "./settings";
import * as enums from "./enums"
import {calculateWordDimensions} from './functions'
import {dataPoint} from './interfaces'

export class Frame {
    textWidth: number
    settings: VisualSettings;
    i: number
    n: number
    options: VisualUpdateOptions
    dataPoints: dataPoint[]
    widthSoFar: number;
    static widthSoFar: number = 0
    static selectionId: powerbi.visuals.ISelectionId;    
    constructor(i: number, dataPoints: dataPoint[], settings: VisualSettings, selectionManager: ISelectionManager, options: VisualUpdateOptions) {
        this.settings = settings
        this.dataPoints = dataPoints
        this.n = this.dataPoints.length
        this.i = i
        this.options = options
        if (this.indexInRow == 0){
            Frame.widthSoFar = 0
            Frame.selectionId = selectionManager.hasSelection() ? selectionManager.getSelectionIds()[0] as powerbi.visuals.ISelectionId : null
        }
            
        this.widthSoFar = Frame.widthSoFar
        Frame.widthSoFar += this.width
    }
    get rowLength(): number {
        switch (this.settings.button.layout) {
            case (enums.Button_Layout.horizontal):
                return this.n
            case (enums.Button_Layout.vertical):
                return 1
            case (enums.Button_Layout.grid):
                return Math.max(1, this.settings.button.rowLength)
        }
    }
    get isSelected(): boolean{
        return Frame.selectionId && Frame.selectionId.getKey() == this.dataPoints[this.i].selectionId.getKey() 
    }
    get rowNumber(): number {
        return Math.floor(this.i / this.rowLength)
    }
    get indexInRow(): number {
        return this.i % this.rowLength
    }
    get framesInRow(): number {
        return (this.numRows - 1) * this.rowLength > this.i || this.n % this.rowLength == 0 ? this.rowLength : this.n % this.rowLength
    }
    get numRows(): number {
        return Math.ceil(this.n / this.rowLength)
    }
    get rowStartingIndex(): number {
        return this.rowNumber * this.rowLength
    }
    get rowText(): string[] {
        return this.dataPoints.slice(this.rowStartingIndex, this.rowStartingIndex + this.framesInRow).map(function(dp){return dp.value}) as string[]
    }
    get text(): string {
        return this.dataPoints[this.i].value as string
    }
    get fill(): string {
        return this.isSelected ? '#eeeded' : this.settings.button.color
    }
    get fill_opacity(): number {
        return 1 - this.settings.button.transparency / 100
    }
    get stroke(): string {
        return this.settings.button.stroke
    }
    get strokeWidth(): number{
        return this.settings.button.strokeWidth
    }
    get padding(): number {
        let padding = Math.max(0, this.settings.button.padding)
        return Math.min(this.options.viewport.width / (4 * this.n), padding)
    }
    get viewportWidthForAllText(): number{
        let totalPadding = (this.framesInRow - 1) * this.settings.button.padding;
        let totalMargins = (this.framesInRow * 2) * this.settings.text.hmargin;
        return this.options.viewport.width - totalPadding - totalMargins;
    }
    get widthForText(): number{
        return this.width - 2*this.settings.text.hmargin
    }
    get height(): number {
        switch (this.settings.button.sizingMethod) {
            case (enums.Button_Sizing_Method.fixed):
                return this.settings.button.buttonHeight
            default:
                return (this.options.viewport.height - this.padding * (this.numRows - 1)) / this.numRows
        }

    }
    get width(): number {
        switch (this.settings.button.sizingMethod) {
            case enums.Button_Sizing_Method.uniform:
                return (this.options.viewport.width - this.padding * (this.rowLength - 1)) / (this.rowLength)
            case enums.Button_Sizing_Method.fixed:
                return this.settings.button.buttonWidth
            case enums.Button_Sizing_Method.dynamic:
                let totalTextWidth = calculateWordDimensions(this.rowText.join(""), this.settings.text.fontFamily, this.settings.text.fontSize + "pt").width
                let textWidth = calculateWordDimensions(this.text, this.settings.text.fontFamily, this.settings.text.fontSize + "pt").width
                let buttonWidthScaleFactor = this.viewportWidthForAllText / totalTextWidth
                let width = textWidth * buttonWidthScaleFactor + 2 * this.settings.text.hmargin
                return width
        }
    }
    get y_pos(): number {
        return this.rowNumber * (this.height + this.padding)
    }
    get x_pos(): number {
        switch (this.settings.button.sizingMethod) {
            case enums.Button_Sizing_Method.fixed:
                let areaTaken = this.framesInRow * this.width + (this.framesInRow - 1) * this.padding
                let areaRemaining = this.options.viewport.width - areaTaken
                switch (this.settings.button.buttonAlignment) {
                    case enums.Align.left:
                        return this.indexInRow * (this.width + this.padding)
                    case enums.Align.right:
                        return areaRemaining + this.indexInRow * (this.width + this.padding)
                    case enums.Align.center:
                        return areaRemaining / 2 + this.indexInRow * (this.width + this.padding)

                }
            case enums.Button_Sizing_Method.uniform:
                return this.indexInRow * (this.width + this.padding)
            case enums.Button_Sizing_Method.dynamic:
                return this.widthSoFar + this.indexInRow * this.padding
        }
    }
    
}