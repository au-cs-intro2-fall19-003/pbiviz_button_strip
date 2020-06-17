import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var rocketsE9D7B5E2197F4868970D16E2455AB0AD: IVisualPlugin = {
    name: 'rocketsE9D7B5E2197F4868970D16E2455AB0AD',
    displayName: 'Button Strip',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["rocketsE9D7B5E2197F4868970D16E2455AB0AD"] = rocketsE9D7B5E2197F4868970D16E2455AB0AD;
}

export default rocketsE9D7B5E2197F4868970D16E2455AB0AD;