import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import { VisualSettings } from "./settings";
import * as enums from "./enums"
import {calculateWordDimensions} from './functions'
import {Frame} from './frame'
import {dataPoint} from './interfaces'

export class Title {
    i: number
    dataPoints: dataPoint[]
    settings: VisualSettings;
    options: VisualUpdateOptions
    frameData: Frame
    static maxTextHeight: number;
    static selectionId: powerbi.visuals.ISelectionId;
    constructor(i: number, dataPoints: dataPoint[], settings: VisualSettings, selectionManager: ISelectionManager, options: VisualUpdateOptions, frameData: Frame) {
        this.i = i
        this.dataPoints = dataPoints
        this.settings = settings
        this.options = options
        this.frameData = frameData
        if(i == 0){
            Title.selectionId = selectionManager.hasSelection() ? selectionManager.getSelectionIds()[0] as powerbi.visuals.ISelectionId : null

            if (this.settings.icon.icons){
                Title.maxTextHeight = Math.max.apply(Math, this.dataPoints.map((dp, i) => { //Todo fix -2 bug
                    return calculateWordDimensions(dp.value as string, this.settings.text.fontFamily, this.settings.text.fontSize + "pt", (this.frameData.widthForText-2)+'px').height; 
                }))
            }
        }

        
    }
    get isSelected(): boolean{
        return Title.selectionId && Title.selectionId.getKey() == this.dataPoints[this.i].selectionId.getKey() 
    }
    get text(): string {
        return this.dataPoints[this.i].value as string
    }
    get fill(): string {
        return this.settings.text.color
    }
    get fill_opacity(): number {
        return 1 - this.settings.text.transparency / 100
    }
    get align(): string {
        return this.settings.text.alignment
    }
    get font_size(): number {
        return this.settings.text.fontSize
    }
    get font_family(): string {
        return this.settings.text.fontFamily
    }
    get padding(): number {
        return this.settings.text.hmargin
    }
    get width(): number {
        return this.frameData.widthForText
    }
    get textContainerHeight(): number {
        return Title.maxTextHeight + this.settings.text.vmargin
    }
    get iconWidth(): number {
        return this.frameData.width - 2*this.settings.icon.hmargin
    }
    get maxInlineTextWidth(): number {
        return Math.floor(this.frameData.width - this.settings.icon.width - this.settings.icon.padding - 2*this.settings.text.hmargin)
    }
    get content(): HTMLDivElement {
        let titleContainer = document.createElement('div')
        titleContainer.className = "titleContainer"

        let textContainer = document.createElement('div')
        textContainer.className = 'textContainer'
        textContainer.style.position = 'relative'
        textContainer.style.paddingLeft = this.settings.text.hmargin + 'px'
        textContainer.style.paddingRight = this.settings.text.hmargin + 'px'

        let text = document.createElement('span')
        text.className = 'text'
        text.textContent = this.text

        if (this.settings.icon.icons) {
            let img = document.createElement('div')
            img.className = 'icon'
            img.style.backgroundImage = "url("+(this.dataPoints[this.i].iconValue || "https://via.placeholder.com/150") +")"
            img.style.backgroundRepeat = 'no-repeat'
            img.style.backgroundSize = 'contain'

            switch (this.settings.icon.placement) {
                case enums.Icon_Placement.left:
                    titleContainer.style.display = 'inline-block'

                    img.style.minWidth = this.settings.icon.width + 'px'
                    img.style.height = this.settings.icon.width + 'px'
                    img.style.display = 'inline-block'
                    img.style.verticalAlign = 'middle'

                    textContainer.style.paddingLeft = this.settings.icon.padding + 'px'
                    textContainer.style.display = 'inline-block'
                    textContainer.style.verticalAlign = 'middle'

                    textContainer.style.maxWidth = this.maxInlineTextWidth + 'px'
                    textContainer.style.width = calculateWordDimensions(this.text, this.settings.text.fontFamily, this.settings.text.fontSize + "pt").width
                        + this.settings.icon.padding + this.settings.text.hmargin >= Math.floor(this.maxInlineTextWidth) ? 'min-content' : 'auto'

                    textContainer.append(text)
                    titleContainer.append(img, textContainer)
                    break
                default:
                    titleContainer.style.position = 'relative'
                    titleContainer.style.height = this.frameData.height + 'px'

                    img.style.width = this.iconWidth + 'px'
                    img.style.marginLeft = this.settings.icon.hmargin + 'px'
                    img.style.marginRight = this.settings.icon.hmargin + 'px' 
                    img.style.height = (this.frameData.height - this.textContainerHeight - this.settings.icon.padding) + 'px'

                    textContainer.style.width = this.width + 'px'
                    text.style.width = this.width + 'px'
                    textContainer.style.height = this.textContainerHeight + 'px'
                    switch (this.settings.icon.placement) {
                        case enums.Icon_Placement.above:
                            img.style.backgroundPosition = 'center bottom'
                            textContainer.style.position = 'absolute'
                            textContainer.style.bottom = '0'
                            textContainer.append(text)
                            titleContainer.append(img, textContainer)
                            break
                        case enums.Icon_Placement.below:
                            // img.style.backgroundPosition = 'center top'
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

}