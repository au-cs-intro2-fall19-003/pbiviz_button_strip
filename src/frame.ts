import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import { VisualSettings } from "./settings";
import { ProcessedVisualSettings } from "./processedvisualsettings";
import * as enums from "./enums"
import {calculateWordDimensions} from './functions'
import {dataPoint} from './interfaces'
import { Title } from "./title";

export class Frame extends ProcessedVisualSettings{
    textWidth: number
    settings: VisualSettings;
    i: number
    options: VisualUpdateOptions
    dataPoints: dataPoint[]

    constructor(i: number, dataPoints: dataPoint[], settings: VisualSettings, selectionManager: ISelectionManager, options: VisualUpdateOptions) {
        super(i, dataPoints, settings, selectionManager, options)
        this.settings = settings
        this.dataPoints = dataPoints
        this.i = i
        this.options = options
    }
    
}