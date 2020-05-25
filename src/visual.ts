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
    data: string
    fill: string
    fill_opacity: number
    hPadding: number
    wPadding: number
    height: number
    width: number
    textWidth: number
    y_pos: number
    x_pos: number
}

class Title {
    text: string
    fill: string
    fill_opacity: number
    align: enums.Text_Align
    font_size: number
    font_family: string
    padding: number
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

        console.log('Visual constructor', options);

        this.svg = d3.select(options.element)
            .append('svg')
            .classed('navigator', true);

        this.container = this.svg.append("g")
            .classed('container', true);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        // delete settings.text.fontFamily;
        return VisualSettings.enumerateObjectInstances(settings, options);
    }


    private calcPadding(padding: number, n: number, vw): number {
        return Math.floor((Math.min(vw / (4*n), Math.max(0, padding))))
    }

    private getTextWidth(text: string, font: string): number {
        let canvas = document.createElement("canvas"); 
        let context = canvas.getContext("2d");  
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
    }



    private calcFrames(data: string[], settings: VisualSettings, options: VisualUpdateOptions): Frame[] {
        let frames: Frame[] = [];

        let totalPadding = (data.length - 1)*settings.button.padding;
        let totalMargins = data.length*2*settings.text.margin;
        let viewportWidthForText = options.viewport.width - totalPadding - totalMargins;
        let totalTextWidth = this.getTextWidth(data.join(""), settings.text.fontSize + "pt " + settings.text.fontFamily);
        let buttonWidthScaleFactor = viewportWidthForText/totalTextWidth
        let wPadding = this.calcPadding(settings.button.padding, data.length, options.viewport.width)
        let widthTaken = 0
        for (let i = 0; i < data.length; i++) {
            let frame: Frame = {
                data: data[i],
                fill: settings.button.color,
                fill_opacity: 1 - settings.button.transparency / 100,
                hPadding: 50,
                get height(): number {
                    return options.viewport.height - this.hPadding
                },
                wPadding: wPadding,
                textWidth: this.getTextWidth(data[i], settings.text.fontSize + "pt " + settings.text.fontFamily),
                get width(): number {
                    switch (settings.button.sizingMethod) {
                        case enums.Button_Sizing_Method.uniform:
                            return (options.viewport.width - this.wPadding*(data.length-1))/(data.length)
                        case enums.Button_Sizing_Method.fixed:
                            return 100
                        case enums.Button_Sizing_Method.dynamic:
                            return this.textWidth*buttonWidthScaleFactor + 2*settings.text.margin
                    }
                },
                get y_pos(): number {
                    return this.hPadding/2
                }, 
                x_pos: widthTaken
            }
            frames.push(frame)
            widthTaken += frame.width + wPadding
        }
        return frames;
    }

    private calcTitles(data: string[], settings: VisualSettings, options: VisualUpdateOptions, frameData: Frame[]): Title[] {
        let titles: Title[] = []

        for (let i = 0; i < data.length; i++) {
            let title: Title = {
                text: data[i],
                fill: settings.text.color,
                fill_opacity: 1 - settings.text.transparency / 100,
                align: settings.text.alignment,
                font_size: settings.text.fontSize,
                font_family: settings.text.fontFamily,
                padding: settings.text.margin
            }
            titles.push(title)
        }
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



        let titlesFO = this.container.selectAll('foreignObject').data(titleData)
        titlesFO.exit().remove()
        titlesFO.enter().append('foreignObject')
            .attr("class", "titleForeignObject")
            .append("xhtml:div")
            .attr("class", "titleContainer")
            .append("xhtml:div")
            .attr("class", "title")
        console.log(frameData)
        titlesFO = this.container.selectAll('foreignObject').data(titleData)
            .attr("height", function (d, i) { return frameData[i].height })
            .attr("width", function (d, i) { return frameData[i].width })
            .attr("x", function (d, i) { return frameData[i].x_pos })
            .attr("y", function (d, i) { return frameData[i].y_pos })
        let titlesContaner = titlesFO.select('.titleContainer')
            .style("height", "100%")
            .style("width", "100%")
            .style("display", "table")

        let titles = titlesContaner.select(".title")
            .style("display", "table-cell")
            .style("vertical-align", "middle")
            .style("opacity", function (d) { return d.fill_opacity })
            .style("font-size", function (d) { return d.font_size + "pt" })
            .style("font-family", function (d) { return d.font_family })
            .style("text-align", function (d) { return d.align })
            .style("color", function (d) { return d.fill })
            .style("padding", function (d) { return d.padding + 'px' })
            .html(function (d) { return d.text });


        // var dims = {
        //     n: this.pages.length,
        //     hPadding: 50,
        //     get height(): number {
        //         return options.viewport.height - this.hPadding
        //     },
        //     wPadding: this.visualSettings.button.padding,
        //     get width(): number{
        //         return (options.viewport.width/this.n - this.wPadding)
        //     },

        // }


        // this.container.selectAll('rect')
        //     .data(this.pages)
        //     .attr("fill", this.visualSettings.button.color)
        //     .style("fill-opacity", 0.5)
        //     .attr("height", dims.height)
        //     .attr("width", dims.width)
        //     .attr("y", dims.hPadding/2)
        //     .attr("x", function(d, i){
        //         return i*(dims.width + dims.wPadding) + dims.wPadding/2
        //     })

        // this.container.selectAll('text')
        //     .data(this.pages)
        //     .text(function(d){
        //         return d
        //     })
        //     .attr("fill", "red")
        //     .attr("y", (dims.hPadding+dims.height)/2)
        //     .attr("x", function(d, i){
        //         return i*(dims.width + dims.wPadding) + (dims.wPadding + dims.width)/2
        //     })
        //     .attr("text-anchor", "middle")
        //     .attr("dominant-baseline", "central")
        //     .style("font-size", 20 + "px");


        //update
        // var text = this.container
        //     .selectAll("text")
        //     .data(this.pages)
        //     .enter()
        //     .append("text")
        //     .attr("fill", "black") 
        //     .attr("x", "50%")
        //     .attr("y", "50%")
        //     .attr("dy", "0.35em")
        //     .attr("text-anchor", "middle")
        //     .text(function (d) {
        //         return d;
        //     })

        // //enter
        // text.enter().append("p")
        //     .data(this.pages)
        //     .enter()
        //     .append("text")
        //     .attr("fill", "black") 
        //     .attr("x", "50%")
        //     .attr("y", "50%")
        //     .attr("dy", "0.35em")
        //     .attr("text-anchor", "middle")
        //     .text(function (d) { return d; });


        // for (let i = 0; i < this.pages.length; i++) {
        //     // let rect: Selection<SVGElement> = this.container.append("rect")
        //     //     .classed("rect", true)
        //     //     .style("fill", "red")
        //     //     .style("fill-opacity", 0.5)
        //     //     .style("stroke", "black")
        //     //     .style("stroke-width", 2)
        //     //     .attr("width", dims.width)
        //     //     .attr("height", dims.height);
        //     // let text:  Selection<SVGElement> = rect.append("text")
        //     //     .classed("textValue", true)
        //     //     .text("Value")
        //     //     .attr("x", "50%")
        //     //     .attr("y", "50%")
        //     //     .attr("dy", "0.35em")

        //     //     .attr("fill", "blue")     
        //     //     .style("font-size", dims.fontSizeValue + "px");

        //     let text:  Selection<SVGElement> = rect.append("text")
        //         .classed("textValue", true)
        //         .text("Value")
        //         .attr("x", "50%")
        //         .attr("y", "50%")
        //         .attr("dy", "0.35em")
        //         .attr("text-anchor", "middle")
        //         .attr("fill", "blue")     
        //         .style("font-size", dims.fontSizeValue + "px");

        // }

        // this.initialiseViz(this.target)
        // console.log('Visual update', options);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
}