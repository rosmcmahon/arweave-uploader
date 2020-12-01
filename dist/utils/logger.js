"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.setDebugMessagesOn = void 0;
var ansi_colors_1 = __importDefault(require("ansi-colors"));
var DEBUG_MESSAGES = true;
var setDebugMessagesOn = function (b) { return DEBUG_MESSAGES = b; };
exports.setDebugMessagesOn = setDebugMessagesOn;
var logger = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (DEBUG_MESSAGES) {
        console.log.apply(console, __spreadArrays([ansi_colors_1.default.blue('[arweave-uploader:]')], args));
    }
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map