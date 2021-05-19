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
var axios_1 = __importDefault(require("axios"));
var logger_1 = require("./utils/logger");
var utils_1 = require("./utils/utils");
var arweave = arweave_1.default.init({
    host: 'arweave.net',
    protocol: 'https',
});
var getFullStatus = function (txid) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, e_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _b = (_a = JSON).stringify;
                return [4, axios_1.default.get("https://arweave.net/tx/" + txid + "/status")];
            case 1: return [2, _b.apply(_a, [(_c.sent()).data])];
            case 2:
                e_1 = _c.sent();
                if (e_1.response && e_1.response.data) {
                    return [2, JSON.stringify(e_1.response.data)];
                }
                return [2, JSON.stringify(e_1)];
            case 3: return [2];
        }
    });
}); };
var upload = function (tx, wallet, userReference) { return __awaiter(void 0, void 0, void 0, function () {
    var uRef, postStatus, tStart, status, wait, err_1, fullStatus_1, now, err_2, tries, err_3, fullStatus;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                uRef = '';
                if (userReference) {
                    uRef = '[' + userReference + ']';
                }
                return [4, arweave.transactions.sign(tx, wallet)];
            case 1:
                _a.sent();
                logger_1.logger(uRef, 'New txid', tx.id);
                postStatus = 0;
                _a.label = 2;
            case 2:
                if (!(postStatus !== 200)) return [3, 5];
                return [4, arweave.transactions.post(tx)];
            case 3:
                postStatus = (_a.sent()).status;
                logger_1.logger(uRef, 'Tx post upload status', postStatus);
                return [4, utils_1.sleep(5000)];
            case 4:
                _a.sent();
                return [3, 2];
            case 5:
                tStart = new Date().valueOf();
                return [4, utils_1.getStatus(tx.id)];
            case 6:
                status = _a.sent();
                wait = 60;
                _a.label = 7;
            case 7:
                if (!((status === 404 || status === 410) && wait--)) return [3, 13];
                logger_1.logger(uRef, "Initial " + status + " detected. Waiting 30 seconds...", status);
                return [4, utils_1.sleep(30000)];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9:
                _a.trys.push([9, 11, , 12]);
                return [4, utils_1.getStatus(tx.id)];
            case 10:
                status = _a.sent();
                return [3, 12];
            case 11:
                err_1 = _a.sent();
                logger_1.logger(uRef, 'Network error getting status. Ignoring & waiting...', status);
                wait++;
                status = 404;
                return [3, 12];
            case 12: return [3, 7];
            case 13:
                if (!(status === 400 || status === 404 || status === 410)) return [3, 15];
                return [4, getFullStatus(tx.id)];
            case 14:
                fullStatus_1 = _a.sent();
                logger_1.logger(uRef, 'Possible invalid transaction detected. Status ' + status, '\n' + fullStatus_1, '\nThrowing error');
                throw new Error('Possible invalid transaction detected. Status '
                    + status + ':'
                    + fullStatus_1);
            case 15:
                if (!(status === 202)) return [3, 21];
                now = (new Date().valueOf() - tStart) / (1000 * 60);
                logger_1.logger(uRef, "Mining for " + now.toFixed(1) + " mins. " + status);
                return [4, utils_1.sleep(30000)];
            case 16:
                _a.sent();
                _a.label = 17;
            case 17:
                _a.trys.push([17, 19, , 20]);
                return [4, utils_1.getStatus(tx.id)];
            case 18:
                status = _a.sent();
                return [3, 20];
            case 19:
                err_2 = _a.sent();
                logger_1.logger(uRef, 'Network error retrieving status.', status, 'Continuing...');
                status = 202;
                return [3, 20];
            case 20: return [3, 15];
            case 21:
                logger_1.logger(uRef, 'Finished mining period with status', status);
                if (status === 200) {
                    logger_1.logger(uRef, "Success", status);
                    return [2, tx.id];
                }
                if (!(status === 404 || status === 410)) return [3, 29];
                tries = 12;
                _a.label = 22;
            case 22: return [4, utils_1.sleep(40000)];
            case 23:
                _a.sent();
                _a.label = 24;
            case 24:
                _a.trys.push([24, 26, , 27]);
                return [4, utils_1.getStatus(tx.id)];
            case 25:
                status = _a.sent();
                logger_1.logger(uRef, 'tries', tries, 'status', status);
                return [3, 27];
            case 26:
                err_3 = _a.sent();
                logger_1.logger(uRef, 'Network error getting status. Ignoring & waiting...', status);
                tries++;
                status = 404;
                return [3, 27];
            case 27:
                if (status === 200) {
                    logger_1.logger(uRef, "Success", status);
                    return [2, tx.id];
                }
                _a.label = 28;
            case 28:
                if (--tries) return [3, 22];
                _a.label = 29;
            case 29: return [4, getFullStatus(tx.id)];
            case 30:
                fullStatus = _a.sent();
                logger_1.logger(uRef, 'Possible failure. Status ', status, '. Retrying post tx. Full error:\n', fullStatus);
                tx.addTag('Retry', (new Date().valueOf() / 1000).toString());
                return [4, exports.upload(tx, wallet)];
            case 31: return [2, _a.sent()];
        }
    });
}); };
exports.upload = upload;
//# sourceMappingURL=uploader.js.map