import powerbi from "powerbi-visuals-api";
import * as enums from "./enums"

export interface dataPoint {
    value: powerbi.PrimitiveValue,
    iconValue?: powerbi.PrimitiveValue,
    selectionId: powerbi.visuals.ISelectionId
}

export interface propertyStateName {
    all: string,
    selected: string,
    unselected: string,
    defaultValue?: string,
}

export interface propertyStateValue {
    all: string | number,
    selected: string | number,
    unselected: string | number,
    defaultValue?: string | number,
}

export interface propertyStatesInput extends propertyStateValue {
    state: enums.State
}

export interface propertyStatesOutput extends propertyStateValue {
    didChange: boolean
}