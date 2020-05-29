export function calculateWordDimensions(text: string, fontFamily: string, fontSize: string, width?: string): { width: number, height: number } {
    var div = document.createElement('div');
    div.style.fontFamily = fontFamily
    div.style.fontSize = fontSize
    div.style.width = width || 'auto'
    div.style.whiteSpace = width ? "normal" : "nowrap"
    div.style.position = "absolute";
    div.innerHTML = text
    document.body.appendChild(div);
    var dimensions = {
        width: div.offsetWidth,
        height: div.offsetHeight
    }
    div.parentNode.removeChild(div);
        return dimensions;
}