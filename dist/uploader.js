"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
var arweave_1 = __importDefault(require("arweave"));
var logger_1 = require("./utils/logger");
var utils_1 = require("./utils/utils");
var arweave = arweave_1.default.init({
    host: 'arweave.net',
    protocol: 'https',
});
var upload = function (tx, wallet) { return __awaiter(void 0, void 0, void 0, function () {
    var tStart, status, wait, err_1, now, err_2, tries, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, arweave.transactions.sign(tx, wallet)];
            case 1:
                _a.sent();
                return [4, arweave.transactions.post(tx)];
            case 2:
                _a.sent();
                logger_1.logger('New txid', tx.id);
                tStart = new Date().valueOf();
                return [4, utils_1.getStatus(tx.id)];
            case 3:
                status = _a.sent();
                wait = 6;
                _a.label = 4;
            case 4:
                if (!(status === 404 && wait--)) return [3, 10];
                logger_1.logger('Initial 404 detected. Waiting 5 seconds...', status);
                return [4, utils_1.sleep(5000)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                return [4, utils_1.getStatus(tx.id)];
            case 7:
                status = _a.sent();
                return [3, 9];
            case 8:
                err_1 = _a.sent();
                logger_1.logger('Network error getting status. Ignoring & waiting...', status);
                wait++;
                status = 404;
                return [3, 9];
            case 9: return [3, 4];
            case 10:
                if (status === 400 || status === 404 || status === 410) {
                    logger_1.logger('Invalid transaction detected. Status ' + status, 'Throwing error');
                    throw new Error('Invalid transaction detected. Status ' + status);
                }
                _a.label = 11;
            case 11:
                if (!(status === 202)) return [3, 17];
                now = (new Date().valueOf() - tStart) / (1000 * 60);
                logger_1.logger("Mining for " + now.toFixed(1) + " mins. " + status);
                return [4, utils_1.sleep(30000)];
            case 12:
                _a.sent();
                _a.label = 13;
            case 13:
                _a.trys.push([13, 15, , 16]);
                return [4, utils_1.getStatus(tx.id)];
            case 14:
                status = _a.sent();
                return [3, 16];
            case 15:
                err_2 = _a.sent();
                logger_1.logger('Network error retrieving status.', status, 'Continuing...');
                status = 202;
                return [3, 16];
            case 16: return [3, 11];
            case 17:
                logger_1.logger('Finished mining period with status', status);
                if (status === 200) {
                    logger_1.logger("Success", status);
                    return [2, tx.id];
                }
                if (!(status === 404)) return [3, 25];
                tries = 3;
                _a.label = 18;
            case 18: return [4, utils_1.sleep(40000)];
            case 19:
                _a.sent();
                _a.label = 20;
            case 20:
                _a.trys.push([20, 22, , 23]);
                return [4, utils_1.getStatus(tx.id)];
            case 21:
                status = _a.sent();
                logger_1.logger('tries', tries, 'status', status);
                return [3, 23];
            case 22:
                err_3 = _a.sent();
                logger_1.logger('Network error getting status. Ignoring & waiting...', status);
                tries++;
                status = 404;
                return [3, 23];
            case 23:
                if (status === 200) {
                    logger_1.logger("Success", status);
                    return [2, tx.id];
                }
                _a.label = 24;
            case 24:
                if (--tries) return [3, 18];
                _a.label = 25;
            case 25:
                logger_1.logger('Failure', status, '. Retrying post tx');
                tx.addTag('Retry', (new Date().valueOf() / 1000).toString());
                return [4, exports.upload(tx, wallet)];
            case 26: return [2, _a.sent()];
        }
    });
}); };
exports.upload = upload;
//# sourceMappingURL=uploader.js.map