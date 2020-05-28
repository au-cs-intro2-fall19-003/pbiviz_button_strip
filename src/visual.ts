/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import * as enums from "./enums"


class Frame {
    textWidth: number
    settings: VisualSettings;
    i: number
    n: number
    options: VisualUpdateOptions
    data: string[]
    static widthSoFar: number = 0
    widthSoFar: number;
    constructor(i: number, data: string[], settings: VisualSettings, options: VisualUpdateOptions) {
        this.settings = settings
        this.data = data
        this.n = this.data.length
        this.i = i
        this.options = options
        if (this.indexInRow == 0)
            Frame.widthSoFar = 0
        this.widthSoFar = Frame.widthSoFar
        Frame.widthSoFar += this.width
    }
    public getTextWidth(text: string, font: string): number {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
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
    get rowData(): string[] {
        return this.data.slice(this.rowStartingIndex, this.rowStartingIndex + this.framesInRow)
    }
    get text(): string {
        return this.data[this.i]
    }
    get fill(): string {
        return this.settings.button.color
    }
    get fill_opacity(): number {
        return 1 - this.settings.button.transparency / 100
    }
    get padding(): number {
        let padding = Math.max(0, this.settings.button.padding)
        return Math.min(this.options.viewport.width / (4 * this.n), padding)
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
                let totalPadding = (this.framesInRow - 1) * this.settings.button.padding;
                let totalMargins = (this.framesInRow * 2) * this.settings.text.margin;
                let viewportWidthForText = this.options.viewport.width - totalPadding - totalMargins;
                let totalTextWidth = this.getTextWidth(this.rowData.join(""), this.settings.text.fontSize + "pt " + this.settings.text.fontFamily);
                let textWidth = this.getTextWidth(this.text, this.settings.text.fontSize + "pt " + this.settings.text.fontFamily);
                let buttonWidthScaleFactor = viewportWidthForText / totalTextWidth
                let width = textWidth * buttonWidthScaleFactor + 2 * this.settings.text.margin
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
                console.log(this.framesInRow)
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

class Title {
    settings: VisualSettings;
    n: number
    options: VisualUpdateOptions
    text: string
    frameData: Frame
    constructor(text: string, settings: VisualSettings, options: VisualUpdateOptions, frameData: Frame) {
        this.settings = settings
        this.text = text
        this.options = options
        this.frameData = frameData
    }
    public getTextWidth(text: string, font: string): number {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
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
        return this.settings.text.margin
    }
    get content(): HTMLDivElement {
        let title = document.createElement('div')
        title.className = "title"
        title.style.display = 'inline-block'


        let center = document.createElement('div')
        center.className = 'center'
        center.style.position = 'relative'
        center.style.top = '50%'
        center.style.transform = 'translateY(-50%)'
        title.append(center)

        let text = document.createElement('div')
        text.className = 'text'
        text.style.verticalAlign = 'middle'
        text.style.display = 'inline-block'
        text.textContent = this.text

        if (this.settings.text.icons) {
            let img = document.createElement('img')
            img.className = 'icon'
            img.style.verticalAlign = 'middle'
            img.style.display = 'inline-block'

            img.style.minWidth = this.settings.text.iconWidth + 'px'
            img.src = "https://img.icons8.com/windows/32/000000/plus.png"

            let maxTextWidth: number = this.frameData.width
            maxTextWidth -= this.settings.text.iconWidth + this.settings.text.iconPadding + this.settings.text.margin
            text.style.maxWidth = Math.floor(maxTextWidth) + 'px'
            text.style.width = this.getTextWidth(this.text, this.settings.text.fontSize + "pt " + this.settings.text.fontFamily)
                + this.settings.text.iconPadding + this.settings.text.margin >= Math.floor(maxTextWidth) ? 'min-content' : 'auto'
            text.style.paddingLeft = this.settings.text.iconPadding + 'px'
            title.append(img)
        }

        title.append(text)
        return title
    }

}


export class Visual implements IVisual {
    private target: HTMLElement;
    private visualSettings: VisualSettings;

    private pages: string[] = ["nothing in here yet"];

    // private host: IVisualHost;
    private svg: Selection<SVGElement>;
    private container: Selection<SVGElement>;
    private circle: Selection<SVGElement>;

    constructor(options: VisualConstructorOptions) {

        // console.log('Visual constructor', options);

        this.svg = d3.select(options.element)
            .append('svg')
            .classed('navigator', true);

        this.container = this.svg.append("g")
            .classed('container', true);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        if (settings.button.sizingMethod != enums.Button_Sizing_Method.fixed) {
            delete settings.button.buttonWidth;
            delete settings.button.buttonHeight;
            delete settings.button.buttonAlignment;
        }
        if (settings.button.layout != enums.Button_Layout.grid) {
            delete settings.button.rowLength
        }
        if (!settings.text.icons) {
            delete settings.text.iconWidth
            delete settings.text.iconPadding
        }
        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    private calcFrames(data: string[], settings: VisualSettings, options: VisualUpdateOptions): Frame[] {
        let frames: Frame[] = [];
        for (let i = 0; i < data.length; i++)
            frames.push(new Frame(i, data, settings, options))
        return frames;
    }

    private calcTitles(data: string[], settings: VisualSettings, options: VisualUpdateOptions, frameData: Frame[]): Title[] {
        let titles: Title[] = []
        for (let i = 0; i < data.length; i++)
            titles.push(new Title(data[i], settings, options, frameData[i]))
        return titles
    }

    public update(options: VisualUpdateOptions) {

        this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.pages = <string[]>options.dataViews[0].categorical.categories[0].values;
        let frameData = this.calcFrames(this.pages, this.visualSettings, options)
        let titleData = this.calcTitles(this.pages, this.visualSettings, options, frameData)

        this.svg
            .style('width', options.viewport.width)
            .style('height', options.viewport.height)


        let frames = this.container.selectAll('rect').data(frameData)
        frames.exit().remove()
        frames.enter().append('rect')
            .attr("class", "frame");

        frames = this.container.selectAll('rect').data(frameData)
        frames
            .attr("fill", function (d) { return d.fill })
            .style("fill-opacity", function (d) { return d.fill_opacity })
            .attr("height", function (d) { return d.height })
            .attr("width", function (d) { return d.width })
            .attr("x", function (d) { return d.x_pos })
            .attr("y", function (d) { return d.y_pos })

        let titleFOs = this.container.selectAll('foreignObject').data(titleData)
        titleFOs.exit().remove()
        titleFOs.enter().append('foreignObject')
            .attr("class", "titleForeignObject")
            .append("xhtml:div")
            .attr("class", "titleTable")
            .append("xhtml:div")
            .attr("class", "titleTableCell")
            .append("xhtml:div")
            .attr("class", "titleContainer")
        // .select(function(d, i, n){return (<HTMLElement>n[i]).parentNode})
        // .append("xhtml:img")
        // .attr("class", "icon")



        titleFOs = this.container.selectAll('foreignObject').data(titleData)
            .attr("height", function (d, i) { return frameData[i].height })
            .attr("width", function (d, i) { return frameData[i].width })
            .attr("x", function (d, i) { return frameData[i].x_pos })
            .attr("y", function (d, i) { return frameData[i].y_pos })


        let titleTables = titleFOs.select('.titleTable')
            .style("height", "100%")
            .style("width", "100%")
            .style("display", "table")

        let titleTableCells = titleTables.select(".titleTableCell")
            .style("display", "table-cell")
            .style("vertical-align", "middle")
            .style("opacity", function (d) { return d.fill_opacity })
            .style("font-size", function (d) { return d.font_size + "pt" })
            .style("font-family", function (d) { return d.font_family })
            .style("text-align", function (d) { return d.align })
            .style("color", function (d) { return d.fill })
            .style("padding", function (d) { return '0 ' + d.padding + 'px' })

        let titleContainers = titleTableCells.select(".titleContainer")
            .style('display', 'inline-block')
            .html("")
            .append(function (d) { return d.content })



        // let icons = titles.select(".icon")
        //     .attr("src", "https://cdn0.iconfinder.com/data/icons/shift-free/32/Microsoft-512.png")
        //     .style("width", "100px")
        //     .style("height", "100px")
        //     .style("x", 0)
        //     .style("y", 0)


        // this.initialiseViz(this.target)
        // console.log('Visual update', options);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
}