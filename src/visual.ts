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


class frame {
    data: string
    fill: string
    fill_opacity: number
    hPadding: number
    wPadding: number
    height: number
    width: number
    y_pos: number
    x_pos: number
}

class title {
    text: string
    fill: string
    fill_opacity: number
    align: Text_Align
    font_size: number
    y_pos: number
    x_pos: number
    text_anchor: Text_Anchor
}

enum Text_Align {
    center = "center",
    left = "left",
    right = "right"
}

enum Text_Anchor {
    start = "Start",
    middle = "Middle",
    end = "End"
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
        return VisualSettings.enumerateObjectInstances(settings, options);
    }


    private calcPadding(padding: number, n: number, vw): number {
        return Math.floor((Math.min(vw / (4 * n), Math.max(0, padding))))
    }


    private calcFrames(data: string[], settings: VisualSettings, options: VisualUpdateOptions): frame[] {
        let frames: frame[] = [];
        for (let i = 0; i < data.length; i++) {
            let frame: frame = {
                data: data[i],
                fill: settings.button.color,
                fill_opacity: 1 - settings.button.transparency/100,
                hPadding: 50,
                get height(): number {
                    return options.viewport.height - this.hPadding
                },
                wPadding: this.calcPadding(settings.button.padding, data.length, options.viewport.width),
                get width(): number {
                    return (options.viewport.width / data.length - this.wPadding)
                },
                get y_pos(): number {
                    return this.hPadding / 2
                },
                get x_pos(): number {
                    return i * (this.width + this.wPadding) + this.wPadding / 2
                }

            }
            frames.push(frame)
        }
        return frames;
    }

    private calcTitles(data: string[], settings: VisualSettings, options: VisualUpdateOptions, frames: frame[]): title[] {
        let titles: title[] = []

        for (let i = 0; i < data.length; i++) {
            let title: title = {
                text: data[i],
                fill: settings.text.color,
                fill_opacity: 1 - settings.text.transparency/100,
                align: settings.text.alignment as Text_Align,
                get y_pos(): number {
                    return frames[i].y_pos + frames[i].height/2 + this.font_size/4
                },
                get x_pos(): number {
                    switch(this.align){
                        case Text_Align.left:
                            return frames[i].x_pos
                        case Text_Align.center:
                            return frames[i].x_pos + frames[i].width/2
                        case Text_Align.right:
                            return frames[i].x_pos + frames[i].width
                    }
                },
                font_size: settings.text.fontSize,
                get text_anchor(): Text_Anchor{
                    switch(this.align){
                        case Text_Align.left:
                            return Text_Anchor.start
                        case Text_Align.center:
                            return Text_Anchor.middle
                        case Text_Align.right:
                            return Text_Anchor.end
                    }
                }

            }
            titles.push(title)
        }
        return titles
    }

    public update(options: VisualUpdateOptions) {

        this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.pages = <string[]>options.dataViews[0].categorical.categories[0].values;
        let frames = this.calcFrames(this.pages, this.visualSettings, options)
        let titles = this.calcTitles(this.pages, this.visualSettings, options, frames)

        console.log(this.visualSettings.text.transparency)

        this.svg
            .style('width', options.viewport.width)
            .style('height', options.viewport.height)


        let xrects = this.container.selectAll('rect').data(frames)
        xrects.exit().remove()
        xrects.enter().append('rect')
            .attr("class", "frame");

        let rects = this.container.selectAll('rect').data(frames)
        rects
            .attr("fill", function (d) { return d.fill })
            .style("fill-opacity", function (d) { return d.fill_opacity })
            .attr("height", function (d) { return d.height })
            .attr("width", function (d) { return d.width })
            .attr("y", function (d) { return d.y_pos })
            .attr("x", function (d) { return d.x_pos })



        let xtexts = this.container.selectAll('text').data(titles)
        xtexts.exit().remove()
        xtexts.enter().append('text')
            .attr("class", "title");

        let texts = this.container.selectAll('text').data(titles)
        texts
            .html(function (d) { return d.text })
            .attr("fill", function (d) { return d.fill })
            .style("fill-opacity", function (d) { return d.fill_opacity })
            .style("font-size", function (d) { return d.font_size + "px"})
            // .attr("height", function (d) { return d.height })
            // .attr("width", function (d) { return d.width })
            .attr("y", function (d) { return d.y_pos })
            .attr("x", function (d) { return d.x_pos })
            .attr("text-anchor", function (d) { return d.text_anchor })


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