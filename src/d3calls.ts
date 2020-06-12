export function addHandles(selection){
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

function styleHandle(selection){
    selection.attr("fill", "#f2c811")
    .style("stroke", "#252423")
    .style("stroke-width", 0.5)
}

export function constructFrameFamily(selection){
    let g = selection.append('g')
            .attr("class", function(d){return "frameContainer " + d.buttonShape})
        g.append('path').attr("class", "fill")
        g.append('path').attr("class", "stroke")
}

export function styleFrameFill(selection){
    selection
        .attr("d", function (d) { return d.shapePath })
        .attr("fill", function (d) { return d.buttonFill })
        .style("fill-opacity", function (d) { return d.buttonFillOpacity })
        .style("filter", function (d) { return d.filter })
}

export function styleFrameStroke(selection){
    selection
        .attr("d", function (d) { return d.strokePath })
        .style("fill-opacity", 0)
        .style("stroke", function (d) { return d.buttonStroke })
        .style("stroke-width", function (d) { return d.buttonStrokeWidth })
}


export function constructTitleFamily(selection){
    selection
    .append('foreignObject')
    .attr("class", function(d){return "titleForeignObject " + d.buttonShape})
    .append("xhtml:div")
    .attr("class", "titleTable")
    .append("xhtml:div")
    .attr("class", "titleTableCell")
    .append("xhtml:div")
    .attr("class", "titleContainer")
}

export function styleTitleFO(selection){
    selection
        .attr("height", function (d) { return d.titleFOHeight })
        .attr("width", function (d) { return d.titleFOWidth })
        .attr("x", function (d) { return d.titleFOXPos })
        .attr("y", function (d) { return d.titleFOYPos })
}

export function styleTitleTable(selection){
    selection
    .style("height", "100%")
    .style("width", "100%")
    .style("display", "table")
}

export function styleTitleTableCell(selection){
    selection
    .style("display", "table-cell")
    .style("vertical-align", "middle")
    .style("opacity", function (d) { return d.textFillOpacity })
    .style("font-size", function (d) { return d.fontSize + "pt" })
    .style("font-family", function (d) { return d.fontFamily })
    .style("text-align", function (d) { return d.textAlign })
    .style("color", function (d) { return d.textFill })
    .html("")
    .append(function (d) { return d.titleContent })
}