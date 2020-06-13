import powerbi from "powerbi-visuals-api";

import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import { VisualSettings } from "./settings";
import {dataPoint, stateIds, Handle} from './interfaces'
import * as enums from "./enums"
import {calculateWordDimensions, getPropertyStateNames} from './functions'
import {Shape, Rectangle, Parallelogram, Chevron, Ellipse, Pentagon, Hexagon, Tab_RoundedCorners, Tab_CutCorners, Tab_CutCorner, ChevronVertical, ParallelogramVertical} from "./shapes"

export class ProcessedVisualSettings{
    i: number;
    dataPoints: dataPoint[];
    settings: VisualSettings;
    options: VisualUpdateOptions
    widthSoFar: number;
    static widthSoFar: number; 
    static totalTextHmargin: number;
    static maxTextHeight: number;

    static selectionIdKeys: string[];
    static hoveredIdKey: string;
    static selectionManagerUnboundIndexes: number[];
    static hoveredIndexUnbound: number;
    static textareaFocusedIndex: number = null
    
    
    constructor(i: number, dataPoints: dataPoint[], 
                settings: VisualSettings, selectionManager: ISelectionManager, 
                stateIds: stateIds, 
                options: VisualUpdateOptions){
        this.dataPoints = dataPoints
        
        this.settings = settings
        this.options = options
        this.i = i
        if (i == 0){
            ProcessedVisualSettings.selectionManagerUnboundIndexes = stateIds.selectionManagerUnbound.getSelectionIndexes()
            ProcessedVisualSettings.hoveredIdKey = stateIds.hoveredIdKey
            ProcessedVisualSettings.hoveredIndexUnbound = stateIds.hoveredIndexUnbound
            ProcessedVisualSettings.selectionIdKeys = (selectionManager.getSelectionIds() as powerbi.visuals.ISelectionId[]).map(x => x.getKey()) as string[]
            // console.log(this.dataPoints[0].value)
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

    getCorrectPropertyStateName(obj: string, prop: string): string{
        let propertyStateNames = getPropertyStateNames(prop)
        let name: string = ""
        if(this.isSelected  && this.settings[obj][propertyStateNames.selected] != null)
            name = name || propertyStateNames.selected
        if(this.isHovered && this.settings[obj][propertyStateNames.hover] != null && this.settings[obj]['hover'])
            name = name || propertyStateNames.hover
        if(!this.isSelected && this.settings[obj][propertyStateNames.unselected] != null)
            name = name || propertyStateNames.unselected
        return name
    }

    get isSelected(): boolean {
        switch(this.settings.content.source){
            case enums.Content_Source.databound:
                return  this.dataPoints[this.i].selectionId && 
                        ProcessedVisualSettings.selectionIdKeys && 
                        ProcessedVisualSettings.selectionIdKeys.indexOf(this.dataPoints[this.i].selectionId.getKey() as string) > -1
            case enums.Content_Source.fixed:
                if(this.settings.content.multiselect)  
                    return ProcessedVisualSettings.selectionManagerUnboundIndexes && ProcessedVisualSettings.selectionManagerUnboundIndexes.indexOf(this.i) > -1
                else
                    return ProcessedVisualSettings.selectionManagerUnboundIndexes.length > 0 && ProcessedVisualSettings.selectionManagerUnboundIndexes[0] == this.i
        }
        
    }
    get isHovered(): boolean {
        switch(this.settings.content.source){
            case enums.Content_Source.databound:
                return  this.dataPoints[this.i].selectionId && 
                        ProcessedVisualSettings.hoveredIdKey &&
                        ProcessedVisualSettings.hoveredIdKey == this.dataPoints[this.i].selectionId.getKey()
            case enums.Content_Source.fixed:
                return ProcessedVisualSettings.hoveredIndexUnbound == this.i
        }
    }
    get textareaIsFocused(): boolean {
        return ProcessedVisualSettings.textareaFocusedIndex == this.i
    }

    get viewportWidth(): number {
        return this.options.viewport.width - this.effectSpace
    }
    get viewportHeight(): number {
        return this.options.viewport.height - this.effectSpace
    }

    private _text: string  = null;
    get text(): string {
        return this._text || this.dataPoints[this.i].value as string
    }
    set text(t: string)  {
        this._text = t
    }
    get textFill(): string {
        return this.settings.text[this.getCorrectPropertyStateName("text", "color")]
    }
    get textFillOpacity(): number {
        return 1 - (this.settings.text[this.getCorrectPropertyStateName("text", "transparency")]) / 100
    }
    get fontSize(): number {
        return this.settings.text[this.getCorrectPropertyStateName("text", "fontSize")]
    }
    get fontFamily(): string {
        return this.settings.text[this.getCorrectPropertyStateName("text", "fontFamily")]
    }
    get textAlign(): string {
        return this.settings.text[this.getCorrectPropertyStateName("text", "alignment")]
    }
    get textHmargin(): number {
        return this.settings.text[this.getCorrectPropertyStateName("text", "hmargin")]
    }
    get textVmargin(): number {
        return this.settings.text[this.getCorrectPropertyStateName("text", "vmargin")]
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
    get inlineTextWidth(): number{
        return calculateWordDimensions(this.text, this.fontFamily, this.fontSize + "pt").width
    }
    get textHeight(): number {
        return calculateWordDimensions(this.text as string, this.fontFamily, this.fontSize + "pt", (this.maxInlineTextWidth - 2) + 'px').height;
    }
    get textWidth(): number {
        // console.log(this.widthSpaceForText)
        // console.log(calculateWordDimensions(this.text as string, this.fontFamily, this.fontSize + "pt", (this.maxInlineTextWidth - 2) + 'px'))
        return calculateWordDimensions(this.text as string, this.fontFamily, this.fontSize + "pt", (this.maxInlineTextWidth - 2) + 'px').width;
    }
    get textContainerHeight(): number {
        return ProcessedVisualSettings.maxTextHeight + this.textVmargin
    }
    get maxInlineTextWidth(): number {
        let w = this.titleFOWidth - 2*this.textHmargin
        if(this.settings.icon.icons)
            w -= this.iconWidth + this.iconHmargin
        return Math.floor(w)
    }
    get textContainerWidthByIcon(): string {
        // return 'auto'
        // console.log(this.text)
        return this.inlineTextWidth + this.textHmargin + this.iconHmargin >= Math.floor(this.maxInlineTextWidth) && this.settings.icon.icons ? 'min-content' : 'auto'
    }

    get buttonFill(): string {
        return this.settings.button[this.getCorrectPropertyStateName("button", "color")]
    }
    get buttonFillOpacity(): number {
        return 1 - (this.settings.button[this.getCorrectPropertyStateName("button", "transparency")]) / 100
    }
    get buttonStroke(): string {
        return this.settings.button[this.getCorrectPropertyStateName("button", "stroke")]
    }
    get buttonStrokeWidth(): number{
        return this.settings.button[this.getCorrectPropertyStateName("button", "strokeWidth")]
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
        return this.dataPoints[this.i].iconValue as string
    }
    get iconWidth(): number {
        return this.settings.icon[this.getCorrectPropertyStateName("icon", "width")]
    }
    get iconHmargin(): number {
        return this.settings.icon[this.getCorrectPropertyStateName("icon", "hmargin")]
    }
    get iconTopMargin(): number{
        return this.settings.icon[this.getCorrectPropertyStateName("icon", "topMargin")]
    }
    get iconBottomMargin(): number{
        return this.settings.icon[this.getCorrectPropertyStateName("icon", "bottomMargin")]
    }
    get spaceForIcon(): number {
        return this.titleFOWidth - 2*this.iconHmargin
    }
    get iconPlacement(): enums.Icon_Placement {
        return this.settings.icon[this.getCorrectPropertyStateName("icon", "placement")]
    }
    get iconHeight(): number {
        return this.titleFOHeight - this.textContainerHeight - this.iconTopMargin - this.iconBottomMargin
    }
    get iconOpacity(): number {
        return 1 - (this.settings.icon[this.getCorrectPropertyStateName("icon", "transparency")])/100
    }


    get shadowSpace(): number {
        return this.settings.effects.shadow ? 3*(this.shadowMaxDistance+this.shadowMaxStrength) : 0
    }
    get shadowColor(): string {
        return this.settings.effects[this.getCorrectPropertyStateName("effects", "shadowColor")]
    }
    get shadowTransparency(): number {
        return 1 - this.settings.effects[this.getCorrectPropertyStateName("effects", "shadowTransparency")]/100
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
    get shadowDirectionCoords(): {x: number, y: number}{
        return this.getshadowDirectionCoords(this.settings.effects[this.getCorrectPropertyStateName("effects", "shadowDirection")])
    }
    get shadowDistance(): number {
        return this.settings.effects[this.getCorrectPropertyStateName("effects", "shadowDistance")]
    } 
    get shadowMaxDistance(): number {
        return Math.max(this.settings.effects.shadowDistanceS, this.settings.effects.shadowDistanceU, this.settings.effects.shadowDistanceH)
    }
    get shadowStrength(): number {
        return this.settings.effects[this.getCorrectPropertyStateName("effects", "shadowStrength")]
    }
    get shadowMaxStrength(): number{
        return Math.max(this.settings.effects.shadowStrengthS, this.settings.effects.shadowStrengthU, this.settings.effects.shadowStrengthH)
    }

    get glowColor(): string {
        return this.settings.effects[this.getCorrectPropertyStateName("effects", "glowColor")]
    }
    get glowTransparency(): number {
        return 1 - this.settings.effects[this.getCorrectPropertyStateName("effects", "glowTransparency")]/100
    }
    get glowStrength(): number {
        return this.settings.effects[this.getCorrectPropertyStateName("effects", "glowStrength")]
    }
    get glowMaxStrength(): number{
        return Math.max(this.settings.effects.glowStrengthS, this.settings.effects.glowStrengthU, this.settings.effects.glowStrengthH)
    }
    get glowSpace(): number {
        return this.settings.effects.glow ? 3*(this.glowMaxStrength) : 0
    }

    get effectSpace(): number {
        return Math.max(this.shadowSpace, this.glowSpace, this.buttonStrokeWidth)
    }
    get filter(): string{
        return "url(#filter" + this.i + ")"
    }


    get buttonWidth(): number {
        switch (this.settings.layout.sizingMethod) {
            case enums.Button_Sizing_Method.uniform:
                return (this.viewportWidth - this.buttonHPadding * (this.rowLength - 1)) / (this.rowLength)
            case enums.Button_Sizing_Method.fixed:
                return this.settings.layout.buttonWidth
            case enums.Button_Sizing_Method.dynamic:
                let buttonWidthScaleFactor = (this.inlineTextWidth / this.allTextWidth) * this.rowLength
                return ((this.viewportWidth - this.buttonHPadding * (this.rowLength - 1)) / (this.rowLength)) * buttonWidthScaleFactor
        }
    }
    get buttonHeight(): number {
        switch (this.settings.layout.sizingMethod) {
            case (enums.Button_Sizing_Method.fixed):
                return this.settings.layout.buttonHeight
            default:
                return ((this.viewportHeight - this.buttonVPadding * (this.numRows - 1)) / this.numRows)
        }

    }
    get buttonXpos(): number {
        switch (this.settings.layout.sizingMethod) {
            case enums.Button_Sizing_Method.fixed:
                let areaTaken = this.framesInRow * this.buttonWidth + (this.framesInRow - 1) * this.buttonHPadding 
                let areaRemaining = this.viewportWidth - areaTaken
                switch (this.settings.layout.buttonAlignment) {
                    case enums.Align.left:
                        return this.indexInRow * (this.buttonWidth + this.buttonHPadding) + this.effectSpace/2
                    case enums.Align.right:
                        return areaRemaining + this.indexInRow * (this.buttonWidth + this.buttonHPadding) + this.effectSpace/2
                    case enums.Align.center:
                        return areaRemaining / 2 + this.indexInRow * (this.buttonWidth + this.buttonHPadding)  + this.effectSpace/2

                }
            case enums.Button_Sizing_Method.uniform:
                return this.indexInRow * (this.buttonWidth + this.buttonHPadding) + this.effectSpace/2
            case enums.Button_Sizing_Method.dynamic:
                return this.widthSoFar + this.indexInRow * (this.buttonHPadding) + this.effectSpace/2
        }
    }
    get buttonYpos(): number {
        return this.rowNumber * (this.buttonHeight + this.buttonVPadding) + this.effectSpace/2
    }

    get textElement(): HTMLSpanElement {
        let text = document.createElement('span')
        text.className = 'text'
        text.textContent = this.text
        text.style.width = this.widthSpaceForText + 'px'
        if(this.iconPlacement != enums.Icon_Placement.left){
            text.style.position = 'absolute'
            text.style.right = '0'
        }
        if(this.iconPlacement == enums.Icon_Placement.below){
            text.style.bottom = '0'
        }
        return text
    }

    get textContainer(): HTMLDivElement {
        let textContainer = document.createElement('div')
        textContainer.className = 'textContainer'
        textContainer.style.position = 'relative'
        if(this.iconPlacement == enums.Icon_Placement.left){
            textContainer.style.display = 'inline-block'
            textContainer.style.verticalAlign = 'middle'
            textContainer.style.maxWidth = this.maxInlineTextWidth + 'px'
            textContainer.style.width = this.textContainerWidthByIcon + 'px'
        } else {
            textContainer.style.width = this.widthSpaceForText + 'px'
            textContainer.style.height = this.textContainerHeight + 'px'   
        }
        return textContainer
    }

    get img(): HTMLDivElement{
        let img = document.createElement('div')
        img.className = 'icon'
        img.style.backgroundImage = "url(" + this.iconURL + ")"
        img.style.backgroundRepeat = 'no-repeat'
        img.style.backgroundSize = 'contain'
        img.style.opacity = this.iconOpacity.toString()

        if(this.iconPlacement == enums.Icon_Placement.left){
            img.style.minWidth = this.iconWidth + 'px'
            img.style.height = this.iconWidth + 'px'
            img.style.display = 'inline-block'
            img.style.verticalAlign = 'middle'
            img.style.marginRight = this.iconHmargin + 'px'
            img.style.backgroundPosition = 'center center'
        } else {
            img.style.width = this.spaceForIcon + 'px'
            img.style.height = this.iconHeight + 'px'
            img.style.backgroundSize = Math.min(this.iconWidth, this.spaceForIcon) + 'px ' + this.iconHeight + 'px' 
            img.style.margin = this.iconTopMargin + 'px ' + this.iconHmargin + 'px ' + this.iconBottomMargin + 'px '
            if(this.iconPlacement == enums.Icon_Placement.above){
                img.style.backgroundPosition = 'center bottom'
            } else {
                img.style.backgroundPosition = 'center top'
                img.style.position = 'absolute'
                img.style.bottom = '0'
            }
        }
        return img
    }


    get titleContent(): HTMLDivElement {
        let titleContainer = document.createElement('div')
        titleContainer.className = "titleContainer"       
        titleContainer.style.paddingLeft = this.textHmargin + 'px'
        titleContainer.style.paddingRight = this.textHmargin + 'px'
        
        let text = this.textElement
        let textContainer = this.textContainer
        let img = this.img
        textContainer.append(text)
        if (this.settings.icon.icons) {
            if(this.iconPlacement == enums.Icon_Placement.left){
                titleContainer.style.display = 'inline-block'
                titleContainer.append(img, textContainer)
            } else {
                titleContainer.style.height = this.titleFOHeight + 'px'
                titleContainer.style.maxHeight = this.titleFOHeight + 'px'
                if(this.iconPlacement == enums.Icon_Placement.above)
                    titleContainer.append(img, textContainer)
                else
                    titleContainer.append(textContainer, img)
            }
        } else
            titleContainer.append(textContainer)
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
                if(this.settings.layout.buttonLayout != enums.Button_Layout.vertical)
                    return new Parallelogram(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.parallelogramAngle, this.shapeRoundedCornerRadius)
                else
                    return new ParallelogramVertical(this.buttonXpos, this.buttonYpos, this.buttonWidth, this.buttonHeight, this.parallelogramAngle, this.shapeRoundedCornerRadius)
            case enums.Button_Shape.chevron:
                if(this.settings.layout.buttonLayout != enums.Button_Layout.vertical)
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
                if(this.settings.layout.buttonLayout != enums.Button_Layout.vertical)
                    return -1*(Parallelogram._z || this.buttonHeight/Math.tan(this.parallelogramAngle*(Math.PI/180)))
            case enums.Button_Shape.chevron:
                if(this.settings.layout.buttonLayout != enums.Button_Layout.vertical)
                    return -1*(Chevron._z || (0.5*this.buttonHeight)/Math.tan(this.chevronAngle*(Math.PI/180)))
            default:
                return 0
        }
    }

    get alterVerticalPadding(): number {
        switch(this.buttonShape){
            case enums.Button_Shape.parallelogram:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.vertical)
                    return -1*(ParallelogramVertical._z || this.buttonWidth/Math.tan(this.parallelogramAngle*(Math.PI/180)))
            case enums.Button_Shape.chevron:
                if(this.settings.layout.buttonLayout == enums.Button_Layout.vertical)
                    return -1*(ChevronVertical._z || (0.5*this.buttonWidth)/Math.tan(this.chevronAngle*(Math.PI/180)))
            default:
                return 0
        }
    }
    get handles(): Handle[] {
        return this.shape.handles
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