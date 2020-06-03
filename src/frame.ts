import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import { VisualSettings } from "./settings";
import * as enums from "./enums"
import {calculateWordDimensions} from './functions'
import {dataPoint} from './interfaces'
import { Title } from "./title";

export class Frame {
    textWidth: number
    settings: VisualSettings;
    i: number
    n: number
    options: VisualUpdateOptions
    dataPoints: dataPoint[]
    widthSoFar: number;
    static widthSoFar: number = 0
    static selectionIdKey: string;
    static totalTextHmargin: number    
    constructor(i: number, dataPoints: dataPoint[], settings: VisualSettings, selectionManager: ISelectionManager, options: VisualUpdateOptions) {
        this.settings = settings
        this.dataPoints = dataPoints
        this.n = this.dataPoints.length
        this.i = i
        this.options = options
        if (this.indexInRow == 0){
            Frame.widthSoFar = 0;
            Frame.totalTextHmargin = 0
            if(selectionManager.hasSelection())
                Frame.selectionIdKey = (selectionManager.getSelectionIds()[0] as powerbi.visuals.ISelectionId).getKey() || Frame.selectionIdKey
            else 
                Frame.selectionIdKey = null
        }
            
        this.widthSoFar = Frame.widthSoFar
        Frame.widthSoFar += this.width
        Frame.totalTextHmargin += 2*this.hmargin
    }
    get rowLength(): number {
        switch (this.settings.layout.buttonLayout) {
            case (enums.Button_Layout.horizontal):
                return this.n
            case (enums.Button_Layout.vertical):
                return 1
            case (enums.Button_Layout.grid):
                return Math.max(1, this.settings.layout.rowLength)
        }
    }
    get isSelected(): boolean{
        return Frame.selectionIdKey == this.dataPoints[this.i].selectionId.getKey() 
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
        return this.isSelected ? this.settings.button.colorS :  this.settings.button.colorU
    }
    get fill_opacity(): number {
        return 1 - (this.isSelected ? this.settings.button.transparencyS : this.settings.button.transparencyU) / 100
    }
    get stroke(): string {
        return this.isSelected ? this.settings.button.strokeS :  this.settings.button.strokeU
    }
    get strokeWidth(): number{
        return this.isSelected ? this.settings.button.strokeWidthS :  this.settings.button.strokeWidthU
    }
    get padding(): number {
        let padding = Math.max(0, this.settings.layout.padding)
        return Math.min(this.options.viewport.width / (4 * this.n), padding)
    }
    get hmargin(): number {
        return  this.isSelected ? this.settings.text.hmarginS : this.settings.text.hmarginU
    }
    get viewportWidthForAllText(): number{
        let totalPadding = (this.framesInRow - 1) * this.settings.layout.padding;
        return this.options.viewport.width - totalPadding - Frame.totalTextHmargin;
    }
    get widthForText(): number{
        return this.width - 2*this.hmargin
    }
    get font_size(): number {
        return this.isSelected ? this.settings.text.fontSizeS : this.settings.text.fontSizeU
    }
    get font_family(): string {
        return this.isSelected ? this.settings.text.fontFamilyS : this.settings.text.fontFamilyU
    }
    get height(): number {
        switch (this.settings.layout.sizingMethod) {
            case (enums.Button_Sizing_Method.fixed):
                return this.settings.layout.buttonHeight - this.shadowSpace
            default:
                return ((this.options.viewport.height - this.padding * (this.numRows - 1)) / this.numRows) - this.shadowSpace
        }

    }
    get width(): number {
        switch (this.settings.layout.sizingMethod) {
            case enums.Button_Sizing_Method.uniform:
                return (this.options.viewport.width - this.padding * (this.rowLength - 1)) / (this.rowLength) - this.shadowSpace
            case enums.Button_Sizing_Method.fixed:
                return this.settings.layout.buttonWidth - this.shadowSpace
            case enums.Button_Sizing_Method.dynamic:
                let totalTextWidth = calculateWordDimensions(this.rowText.join(""), this.font_family, this.font_size + "pt").width
                let textWidth = calculateWordDimensions(this.text, this.font_family, this.font_size + "pt").width
                let buttonWidthScaleFactor = this.viewportWidthForAllText / totalTextWidth
                let width = textWidth * buttonWidthScaleFactor + 2 * this.hmargin - this.shadowSpace
                return width
        }
    }
    get y_pos(): number {
        return this.rowNumber * (this.height + this.padding + this.shadowSpace) + this.shadowSpace/2
    }
    get x_pos(): number {
        switch (this.settings.layout.sizingMethod) {
            case enums.Button_Sizing_Method.fixed:
                let areaTaken = this.framesInRow * this.width + (this.framesInRow - 1) * this.padding
                let areaRemaining = this.options.viewport.width - areaTaken
                switch (this.settings.layout.buttonAlignment) {
                    case enums.Align.left:
                        return this.indexInRow * (this.width + this.padding + this.shadowSpace) + this.shadowSpace/2
                    case enums.Align.right:
                        return areaRemaining + this.indexInRow * (this.width + this.padding + this.shadowSpace) + this.shadowSpace/2
                    case enums.Align.center:
                        return areaRemaining / 2 + this.indexInRow * (this.width + this.padding + this.shadowSpace) + this.shadowSpace/2

                }
            case enums.Button_Sizing_Method.uniform:
                return this.indexInRow * (this.width + this.padding + this.shadowSpace) + this.shadowSpace/2
            case enums.Button_Sizing_Method.dynamic:
                return this.widthSoFar + this.indexInRow * (this.padding + this.shadowSpace) + this.shadowSpace/2
        }
    }

    get shadowSpace(): number {
        return this.settings.effects.shadow ? 10 : 0
    }

    get filters(): string{
        let filters = ""
        filters+= this.settings.effects.shadow ? "url(#drop-shadow)" : ""
        return filters
    }
    
}