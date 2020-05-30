import powerbi from "powerbi-visuals-api";
export interface dataPoint{
    value: powerbi.PrimitiveValue,
    iconValue?: powerbi.PrimitiveValue,
    selectionId: powerbi.visuals.ISelectionId
}