export function addHandles(selection) {
    selection.append("g")
        .attr("id", "handleHorizontal")
        .attr("class", "handle")
        .append("path")
        .attr("d", "M 0 0 l 6 12 l -12 0 z")
        .call(styleHandle)
    selection.append("g")
        .attr("id", "handleVertical")
        .attr("class", "handle")
        .append("path")
        .attr("d", "M 0 0 l -12 6 l 0 -12 z")
        .call(styleHandle)
}

function styleHandle(selection) {
    selection.attr("fill", "#f2c811")
        .style("stroke", "#252423")
        .style("stroke-width", 0.5)
}

export function constructFrameFamily(selection) {
    let g = selection.append('g')
        .attr("class", function (d) { return "frameContainer " + d.buttonShape })
    g.append('path').attr("class", "fill")
    g.append('path').attr("class", "stroke")
}

export function styleFrameFill(selection) {
    selection
        .attr("d", function (d) { return d.shapePath })
        .attr("fill", function (d) { return d.buttonFill })
        .style("fill-opacity", function (d) { return d.buttonFillOpacity })
        .style("filter", function (d) { return d.filter })
}

export function styleFrameStroke(selection) {
    selection
        .attr("d", function (d) { return d.strokePath })
        .style("fill-opacity", 0)
        .style("stroke", function (d) { return d.buttonStroke })
        .style("stroke-width", function (d) { return d.buttonStrokeWidth })
}


export function constructTitleFamily(selection) {
    selection

        .append("xhtml:div")
        .attr("class", "titleTable")
        .append("xhtml:div")
        .attr("class", "titleTableCell")
        .append("xhtml:div")
        .attr("class", "titleContainer")
}

export function styleTitleFO(selection) {
    selection
        .attr("height", function (d) { return d.titleFOHeight })
        .attr("width", function (d) { return d.titleFOWidth })
        .attr("x", function (d) { return d.titleFOXPos })
        .attr("y", function (d) { return d.titleFOYPos })
}

export function styleTitleTable(selection) {
    selection
        .style("height", "100%")
        .style("width", "100%")
        .style("display", "table")
}

export function styleTitleTableCell(selection) {
    selection
        .style("display", "table-cell")
        .style("vertical-align", "middle")
        .html("")
        .style("text-align", function (d) { return d.textAlign })
}

export function styleTitleContent(selection) {
    selection
        .select('.text')
        .style("opacity", function (d) { return d.textFillOpacity })
        .style("font-size", function (d) { return d.fontSize + "pt" })
        .style("font-family", function (d) { return d.fontFamily })
        .style("color", function (d) { return d.textFill })
}

export function showOnlyTextBorder(selection) {
    selection.select(".text")
        .style("opacity", 0)
    selection.select(".icon")
        .style("opacity", 0)
    selection.select(".textContainer")
        .style("border", "2px black solid")
        .style("box-sizing", "border-box")
}

import * as enums from "./enums"
import { selection } from "d3"
import { ProcessedVisualSettings } from "./processedvisualsettings"


export function sizeTextContainer(selection){
    if(selection.data()[0].icons){
        if(selection.data()[0].iconPlacement == enums.Icon_Placement.left){
            selection
                .style("width", (d: ProcessedVisualSettings)=>{return d.textContainerWidthByIcon})
                .style("maxWidth", (d: ProcessedVisualSettings)=>{return d.maxInlineTextWidth})
                .style("display", "inline-block")
                .style("verticalAlign", "middle")
        } else {
            selection
                .style("width", (d: ProcessedVisualSettings)=>{return d.widthSpaceForText })
                .style("height", (d: ProcessedVisualSettings)=>{return d.textContainerHeight})
        }
    }
    
}

export function styleTextArea(selection) {
    selection
        .call(sizeTextArea)
        .style("display", "inline")
        .style("background", "none")
        .style("outline-width", 0)
        .style("border", 0)
        .style("padding", 0)
        .style("vertical-align", "top")
        .style("resize", "none")
        .style("overflow", "hidden")
        .style("opacity", (d) => { return d.textFillOpacity })
        .style("font-size", (d) => { return d.fontSize + "pt" })
        .style("font-family", (d) => { return d.fontFamily })
        .style("color", (d) => { return d.textFill })
        .style("display", "table-cell")
        .style("text-align", (d) => { return d.textAlign })
        .html((d) => { return d.text })
}

export function sizeTextArea(selection){
    selection
        .style("width", (d) => {console.log(d.textWidth); return d.textWidth+1 +'px' })
        .style("height", (d) => { console.log(d.textHeight); return d.textHeight + 'px' })
        .style("min-width", 40)
        .style("min-height", 22)

        if(selection.data()[0].icons){
            console.log("here...")
            if(selection.data()[0].iconPlacement == enums.Icon_Placement.left){
                selection
                    .style("position", "absolute")
                    .style("right", 0)
            } else {
                selection
                .style("bottom", 0)
            }
        }
}