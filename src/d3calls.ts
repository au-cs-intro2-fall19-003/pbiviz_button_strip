export function styleTitleFOs(selection){
    selection
        .attr("height", function (d) { return d.titleFOHeight })
        .attr("width", function (d) { return d.titleFOWidth })
        .attr("x", function (d) { return d.titleFOXPos })
        .attr("y", function (d) { return d.titleFOYPos })
}