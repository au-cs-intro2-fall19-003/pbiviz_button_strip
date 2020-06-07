import powerbi from "powerbi-visuals-api";

import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import { VisualSettings } from "./settings";
import {dataPoint} from './interfaces'
import * as enums from "./enums"
import {calculateWordDimensions} from './functions'
import { max } from "d3";
import {Shape, Rectangle, Parallelogram, Chevron, Ellipse, Pentagon, Hexagon, Tab_RoundedCorners, Tab_CutCorners, Tab_CutCorner, ChevronVertical, ParallelogramVertical} from "./shapes"

export class ProcessedVisualSettings{
    i: number;
    dataPoints: dataPoint[];
    settings: VisualSettings;
    options: VisualUpdateOptions
    widthSoFar: number;
    static widthSoFar: number; 
    static selectionIdKey: string;
    static totalTextHmargin: number;
    static maxTextHeight: number;
    constructor(i: number, dataPoints: dataPoint[], settings: VisualSettings, selectionManager: ISelectionManager, options: VisualUpdateOptions){
        this.dataPoints = dataPoints
        this.settings = settings
        this.options = options
        this.i = i
        if (i == 0){
            if(selectionManager.hasSelection())
                ProcessedVisualSettings.selectionIdKey = (selectionManager.getSelectionIds()[0] as powerbi.visuals.ISelectionId).getKey() 
                || ProcessedVisualSettings.selectionIdKey
            else 
                ProcessedVisualSettings.selectionIdKey = null
        }
        if (this.indexInRow == 0){
            ProcessedVisualSettings.widthSoFar = 0;
            ProcessedVisualSettings.totalTextHmargin = 0
            ProcessedVisualSettings.maxTextHeight = 0
        }
        ProcessedVisualSettings.totalTextHmargin += 2*this.textHmargin
        this.widthSoFar = ProcessedVisualSettings.widthSoFar
        ProcessedVisualSettings.widthSoFar += this.buttonWidth
        ProcessedVisualSettings.maxTextHeight = Math.max(this.textHeight, ProcessedVisualSettings.maxTextHeight)
    }

    get isSelected(): boolean {
        return ProcessedVisualSettings.selectionIdKey && ProcessedVisualSettings.selectionIdKey == this.dataPoints[this.i].selectionId.getKey()
    }
    get viewportWidth(): number {
        return this.options.viewport.width
    }
    get viewportHeight(): number {
        return this.options.viewport.height
    }


    get text(): string {
        return this.dataPoints[this.i].value as string
    }
    get textFill(): string {
        return this.isSelected ? this.settings.text.colorS : this.settings.text.colorU
    }
    get textFillOpacity(): number {
        return 1 - (this.isSelected ? this.settings.text.transparencyS : this.settings.text.transparencyU) / 100
    }
    get fontSize(): number {
        return this.isSelected ? this.settings.text.fontSizeS : this.settings.text.fontSizeU
    }
    get fontFamily(): string {
        return this.isSelected ? this.settings.text.fontFamilyS : this.settings.text.fontFamilyU
    }
    get textAlign(): string {
        return this.isSelected ? this.settings.text.alignmentS : this.settings.text.alignmentU
    }
    get textHmargin(): number {
        return this.isSelected ? this.settings.text.hmarginS : this.settings.text.hmarginU
    }
    get textVmargin(): number {
        return this.isSelected ? this.settings.text.vmarginS : this.settings.text.vmarginU
    }
    get widthSpaceForAllText(): number{
        let totalPadding = (this.framesInRow - 1) * this.settings.layout.padding;
        return this.viewportWidth - totalPadding - ProcessedVisualSettings.totalTextHmargin;
    }
    get allTextWidth(): number {
        return calculateWordDimensions(this.rowText.join(""), this.fontFamily, this.fontSize + "pt").width
    }
    get widthSpaceForText(): number{
        return this.titleFOWidth - 2*this.textHmargin
    }
    get textWidth(): number{
        return calculateWordDimensions(this.text, this.fontFamily, this.fontSize + "pt").width
    }
    get textHeight(): number {
        return calculateWordDimensions(this.text as string, this.fontFamily, this.fontSize + "pt", (this.widthSpaceForText - 2) + 'px').height;
    }
    get textContainerHeight(): number {
        return ProcessedVisualSettings.maxTextHeight + this.textVmargin
    }
    get maxInlineTextWidth(): number {
        return Math.floor(this.titleFOWidth - this.iconWidth - this.iconHmargin - 2*this.textHmargin)
    }
    get textContainerWidthByIcon(): string {
        return this.textWidth + this.textHmargin + this.iconHmargin >= Math.floor(this.maxInlineTextWidth) ? 'min-content' : 'auto'
    }


    get buttonFill(): string {
        return this.isSelected ? this.settings.button.colorS :  this.settings.button.colorU
    }
    get buttonFillOpacity(): number {
        return 1 - (this.isSelected ? this.settings.button.transparencyS : this.settings.button.transparencyU) / 100
    }
    get buttonStroke(): string {
        return this.isSelected ? this.settings.button.strokeS :  this.settings.button.strokeU
    }
    get buttonStrokeWidth(): number{
        return this.isSelected ? this.settings.button.strokeWidthS :  this.settings.button.strokeWidthU
    }
    get buttonPadding(): number {
        return this.settings.layout.padding
    }
    get buttonHPadding(): number {
        return this.buttonPadding + this.alterHorizontalPadding
    }
    get buttonVPadding(): number {
        return this.buttonPadding + this.alterVerticalPadding
    }

    get n(): number {
        return this.dataPoints.length
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

    get iconURL(): string {
        return this.dataPoints[this.i].iconValue as string|| "https://via.placeholder.com/150"
    }
    get iconWidth(): number {
        return this.isSelected ? this.settings.icon.widthS : this.settings.icon.widthU
    }
    get iconHmargin(): number {
        return this.isSelected ? this.settings.icon.hmarginS : this.settings.icon.hmarginU
    }
    get iconTopMargin(): number{
        return this.isSelected ? this.settings.icon.topMarginS : this.settings.icon.topMarginU
    }
    get iconBottomMargin(): number{
        return this.isSelected ? this.settings.icon.bottomMarginS : this.settings.icon.bottomMarginU
    }
    get spaceForIcon(): number {
        return this.titleFOWidth - 2*this.iconHmargin
    }
    get iconPlacement(): enums.Icon_Placement {
        return this.isSelected ? this.settings.icon.placementS : this.settings.icon.placementU
    }
    get iconHeight(): number {
        return this.titleFOHeight - this.textContainerHeight - this.iconTopMargin - this.iconBottomMargin
    }


    get shadowSpace(): number {
        return this.settings.effects.shadow ? 3*(this.shadowMaxDistance+this.shadowMaxStrength) : 0
    }
    get shadowColorS(): string {
        return this.settings.effects.shadowColorS
    }
    get shadowColorU(): string {
        return this.settings.effects.shadowColorU
    }
    get shadowTransparencyS(): number {
        return 1 - this.settings.effects.shadowTransparencyS/100
    }
    get shadowTransparencyU(): number {
        return 1 - this.settings.effects.shadowTransparencyU/100
    }
    get shadowTranslateS(): number{
        return 0
    }
    getshadowDirectionCoords(direction: enums.Direction): {x: number, y:number}{
        switch(direction){
            case enums.Direction.bottom_right: return {x: 1, y:1}
            case enums.Direction.bottom: return {x: 0, y:1}
            case enums.Direction.bottom_left: return {x: -1, y:1}
            case enums.Direction.left: return {x: -1, y:0}
            case enums.Direction.center: return {x: 0, y:0}
            case enums.Direction.top_left: return {x: -1, y:-1}
            case enums.Direction.top: return {x: 0, y:-1}
            case enums.Direction.top_right: return {x: 1, y:-1}  
            case enums.Direction.right: return {x: 1, y:0}
            case enums.Direction.custom: return {x: 0, y:0}  
        }
    }
    get shadowDirectionCoordsS(): {x: number, y: number}{
        return this.getshadowDirectionCoords(this.settings.effects.shadowDirectionS)
    }
    get shadowDirectionCoordsU(): {x: number, y: number}{
        return this.getshadowDirectionCoords(this.settings.effects.shadowDirectionU)
    }
    get shadowDistanceS(): number {
        return this.settings.effects.shadowDistanceS
    } 
    get shadowDistanceU(): number {
        return this.settings.effects.shadowDistanceU
    }
    get shadowMaxDistance(): number {
        return Math.max(this.shadowDistanceS, this.shadowDistanceU)
    }
    get shadowStrengthS(): number {
        return this.settings.effects.shadowStrengthS
    }
    get shadowStrengthU(): number {
        return this.settings.effects.shadowStrengthU
    }
    get shadowMaxStrength(): number{
        return Math.max(this.shadowStrengthS, this.shadowStrengthU)
    }

    get glowColorS(): string {
        return this.settings.effects.glowColorS
    }
    get glowColorU(): string {
        return this.settings.effects.glowColorU
    }
    get glowTransparencyS(): number {
        return 1 - this.settings.effects.glowTransparencyS/100
    }
    get glowTransparencyU(): number {
        return 1 - this.settings.effects.glowTransparencyU/100
    }
    get glowStrengthS(): number {
        return this.settings.effects.glowStrengthS
    }
    get glowStrengthU(): number {
        return this.settings.effects.glowStrengthU
    }
    get glowMaxStrength(): number{
        return Math.max(this.glowStrengthS, this.glowStrengthU)
    }
    get glowSpace(): number {
        return this.settings.effects.glow ? 3*(this.glowMaxStrength) : 0
    }

    get effectSpace(): number {
        return Math.max(this.shadowSpace, this.glowSpace, this.buttonStrokeWidth)
    }
    get filters(): string{
        return this.isSelected ? "url(#selected)" : "url(#unselected)"
    }


    get buttonWidth(): number {
        switch (this.settings.layout.sizingMethod) {
            case enums.Button_Sizing_Method.uniform:
                return (this.options.viewport.width - this.buttonHPadding * (this.rowLength - 1)) / (this.rowLength) - this.effectSpace
            case enums.Button_Sizing_Method.fixed:
                return this.settings.layout.buttonWidth - this.effectSpace
            case enums.Button_Sizing_Method.dynamic:
                let buttonWidthScaleFactor = this.widthSpaceForAllText / this.allTextWidth
                let width = this.textWidth * buttonWidthScaleFactor + 2 * this.textHmargin - this.effectSpace
                return width
        }
    }
    get buttonHeight(): number {
        switch (this.settings.layout.sizingMethod) {
            case (enums.Button_Sizing_Method.fixed):
                return this.settings.layout.buttonHeight - this.effectSpace
            default:
                return ((this.viewportHeight - this.buttonVPadding * (this.numRows - 1)) / this.numRows) - this.effectSpace
        }

    }
    get buttonXpos(): number {
        switch (this.settings.layout.sizingMethod) {
            case enums.Button_Sizing_Method.fixed:
                let areaTaken = this.framesInRow * this.buttonWidth + (this.framesInRow - 1) * this.buttonHPadding
                let areaRemaining = this.viewportWidth - areaTaken
                switch (this.settings.layout.buttonAlignment) {
                    case enums.Align.left:
                        return this.indexInRow * (this.buttonWidth + this.buttonHPadding + this.effectSpace) + this.effectSpace/2
                    case enums.Align.right:
                        return areaRemaining + this.indexInRow * (this.buttonWidth + this.buttonHPadding + this.effectSpace) + this.effectSpace/2
                    case enums.Align.center:
                        return areaRemaining / 2 + this.indexInRow * (this.buttonWidth + this.buttonHPadding + this.effectSpace) + this.effectSpace/2

                }
            case enums.Button_Sizing_Method.uniform:
                return this.indexInRow * (this.buttonWidth + this.buttonHPadding + this.effectSpace) + this.effectSpace/2
            case enums.Button_Sizing_Method.dynamic:
                return this.widthSoFar + this.indexInRow * (this.buttonHPadding + this.effectSpace) + this.effectSpace/2
        }
    }
    get buttonYpos(): number {
        return this.rowNumber * (this.buttonHeight + this.buttonVPadding + this.effectSpace) + this.effectSpace/2
    }

    get titleContent(): HTMLDivElement {
        let titleContainer = document.createElement('div')
        titleContainer.className = "titleContainer"

        let textContainer = document.createElement('div')
        textContainer.className = 'textContainer'
        textContainer.style.position = 'relative'
        titleContainer.style.paddingLeft = this.textHmargin + 'px'
        titleContainer.style.paddingRight = this.textHmargin + 'px'

        let text = document.createElement('span')
        text.className = 'text'
        text.textContent = this.text

        if (this.settings.icon.icons) {
            let img = document.createElement('div')
            img.className = 'icon'
            img.style.backgroundImage = "url(" + this.iconURL + ")"
            img.style.backgroundRepeat = 'no-repeat'
            img.style.backgroundSize = 'contain'

            switch (this.iconPlacement) {
                case enums.Icon_Placement.left:
                    titleContainer.style.display = 'inline-block'

                    img.style.minWidth = this.iconWidth + 'px'
                    img.style.height = this.iconWidth + 'px'
                    img.style.display = 'inline-block'
                    img.style.verticalAlign = 'middle'
                    img.style.marginRight = this.iconHmargin + 'px'


                    textContainer.style.display = 'inline-block'
                    textContainer.style.verticalAlign = 'middle'

                    textContainer.style.maxWidth = this.maxInlineTextWidth + 'px'
                    textContainer.style.width = this.textContainerWidthByIcon

                    textContainer.append(text)
                    titleContainer.append(img, textContainer)
                    break
                default:
                    // titleContainer.style.position = 'relative'
                    titleContainer.style.height = this.titleFOHeight + 'px'
                    titleContainer.style.maxHeight = this.titleFOHeight + 'px'

                    img.style.width = this.spaceForIcon + 'px'
                    img.style.marginLeft = this.iconHmargin + 'px'
                    img.style.marginRight = this.iconHmargin + 'px'
                    img.style.marginTop = this.iconTopMargin + 'px'
                    img.style.marginBottom = this.iconBottomMargin + 'px'
                    img.style.height = this.iconHeight + 'px'

                    textContainer.style.width = this.widthSpaceForText + 'px'
                    text.style.width = this.widthSpaceForText + 'px'
                    textContainer.style.height = this.textContainerHeight + 'px'
                    switch (this.iconPlacement) {
                        case enums.Icon_Placement.above:
                            img.style.backgroundPosition = 'center bottom'
                            textContainer.style.position = 'absolute'
                            textContainer.style.bottom = '0'
                            textContainer.append(text)
                            titleContainer.append(img, textContainer)
                            break
                        case enums.Icon_Placement.below:
                            img.style.backgroundPosition = 'center top'
                            img.style.position = 'absolute'
                            img.style.bottom = '0'
                            text.style.position = 'absolute'
                            text.style.bottom = '0'
                            text.style.right = '0'
                            textContainer.append(text)
                            titleContainer.append(textContainer, img)
                            break
                    }
            }

        } else {
            textContainer.append(text)
            titleContainer.append(textContainer)
        }

        return titleContainer
    }

    get buttonShape(): enums.Button_Shape{
        return this.settings.layout.buttonShape
    }
    get parallelogramAngle(): number{
        return this.settings.layout.parallelogramAngle
    }
    get chevronAngle(): number{
        return this.settings.layout.chevronAngle
    }
    get pentagonAngle(): number{
        return this.settings.layout.pentagonAngle
    }
    get hexagonAngle(): number{
        return this.settings.layout.hexagonAngle
    }
    get tab_cutCornersLength(): number{
        return this.settings.layout.tab_cutCornersLength
    }
    get tab_cutCornerLength(): number{
        return this.settings.layout.tab_cutCornerLength
    }

    get shapeRoundedCornerRadius(): number{
        return this.settings.effects.shapeRoundedCornerRadius
    }
    get shape(): Shape{
        switch(this.buttonShape){
            case enums.Button_Shape.rectangle:
                return new Rectangle(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.shapeRoundedCornerRadius)
            case enums.Button_Shape.parallelogram:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.horizontal)
                    return new Parallelogram(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.parallelogramAngle, this.shapeRoundedCornerRadius)
                else
                    return new ParallelogramVertical(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.parallelogramAngle, this.shapeRoundedCornerRadius)
            case enums.Button_Shape.chevron:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.horizontal)
                    return new Chevron(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.chevronAngle, this.shapeRoundedCornerRadius)
                else
                    return new ChevronVertical(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.chevronAngle, this.shapeRoundedCornerRadius)
            case enums.Button_Shape.ellipse:
                return new Ellipse(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight)
            case enums.Button_Shape.pentagon:
                return new Pentagon(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.pentagonAngle, this.shapeRoundedCornerRadius)
            case enums.Button_Shape.hexagon:
                return new Hexagon(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.hexagonAngle, this.shapeRoundedCornerRadius)
            case enums.Button_Shape.tab_roundedCorners:
                return new Tab_RoundedCorners(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight)
            case enums.Button_Shape.tab_cutCorners:
                return new Tab_CutCorners(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.tab_cutCornersLength)
            case enums.Button_Shape.tab_cutCorner:
                return new Tab_CutCorner(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.tab_cutCornerLength)
        }
    }
    get alterHorizontalPadding(): number {
        switch(this.buttonShape){
            case enums.Button_Shape.parallelogram:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.horizontal)
                    return -1*this.buttonHeight/Math.tan(this.parallelogramAngle * (Math.PI / 180))
            case enums.Button_Shape.chevron:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.horizontal)
                    return -0.5*this.buttonHeight/Math.tan(this.chevronAngle * (Math.PI / 180))
            default:
                return 0
        }
    }

    get alterVerticalPadding(): number {
        switch(this.buttonShape){
            case enums.Button_Shape.parallelogram:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.vertical)
                    return -1*this.buttonWidth/Math.tan(this.parallelogramAngle * (Math.PI / 180))
            case enums.Button_Shape.chevron:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.vertical)
                    return -0.5*this.buttonWidth/Math.tan(this.chevronAngle * (Math.PI / 180))
            default:
                return 0
        }
    }

    get titleFOHeight(): number {
        return this.shape.titleFOPoints.height
    }
    get titleFOWidth(): number {
        return this.shape.titleFOPoints.width
    }

    get titleFOXPos(): number {
        return this.shape.titleFOPoints.xPos
    }

    get titleFOYPos(): number {
        return this.shape.titleFOPoints.yPos
    }

    get shapePath(): string{
        return this.shape.shapePath
    }
    get strokePath(): string{
        return this.shape.strokePath
    }
}