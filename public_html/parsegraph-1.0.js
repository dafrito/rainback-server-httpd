function parsegraph_Test(name, runner, runnerThisArg)
{
    this._name = name;
    this._runner = [runner, runnerThisArg];
};

parsegraph_Test.prototype.name = function()
{
    return this._name;
};

parsegraph_Test.prototype.isTestSuite = function()
{
    return typeof(this._runner[0]) === "object";
};

parsegraph_Test.prototype.testSuite = function()
{
    return this._runner[0];
};

parsegraph_Test.prototype.isTest = function()
{
    return typeof(this._runner[0]) === "function";
};

parsegraph_Test.prototype.run = function(listener, listenerThisArg, resultDom)
{
    if(this.isTestSuite()) {
        try {
            // The runner is another test or test suite.
            var testResult = this._runner[0].run(listener, listenerThisArg);

            if(testResult.isSuccessful()) {
                testStatus = "Successful";
                testResult = testResult;
            }
            else {
                testStatus = "Failed";
                testResult = testResult;
            }
        }
        catch(ex) {
            testStatus = "Crashed";
            testResult = ex;
        }
    }
    else if(this.isTest()) {
        // The runner is a function.
        var testStatus = "Started";
        var testResult;
        try {
            testResult = this._runner[0].call(this._runner[1], resultDom);
            if(testResult !== undefined) {
                testStatus = "Failed";
            }
            else {
                testStatus = "Successful";
            }
        }
        catch(ex) {
            testResult = ex;
            testStatus = "Crashed";
        }
    }
    else {
        testResult = "Test must either be an object or a function, but given " +typeof(this._runner[0]);
        testStatus = "Crashed";
    }

    return new parsegraph_TestResult(testStatus, testResult, this);
};
parsegraph_Test.prototype.Run = parsegraph_Test.prototype.run;
parsegraph_Test.prototype.runTest = parsegraph_Test.prototype.run;
parsegraph_Test.prototype.runTests = parsegraph_Test.prototype.run;
parsegraph_Test.prototype.runAllTests = parsegraph_Test.prototype.run;
parsegraph_Test.prototype.runAllTests = parsegraph_Test.prototype.run;
parsegraph_Test.prototype.runalltests = parsegraph_Test.prototype.run;
parsegraph_Test.prototype.start = parsegraph_Test.prototype.run;

parsegraph_Test.prototype.test = function() {
    if(arguments.length > 0) {
        return this.addTest.apply(this, arguments);
    }
    return this.run();
};
parsegraph_Test.prototype.Test = parsegraph_Test.prototype.test;

function parsegraph_TestResult(testStatus, testResult, test)
{
    this._status = testStatus;
    this._result = testResult;
    this._test = test;
};

parsegraph_TestResult.prototype.testStatus = function()
{
    return this._status;
};

parsegraph_TestResult.prototype.testResult = function()
{
    return this._result;
};

parsegraph_TestResult.prototype.test = function()
{
    return this._test;
};

var parsegraph_AllTests;

function parsegraph_TestSuite(name, dontAutoadd)
{
    if(name === undefined) {
        this._name = "Test";
    }
    else {
        this._name = name;
    }

    this._tests = [];

    if(!dontAutoadd && parsegraph_AllTests) {
        parsegraph_AllTests.addTest(this);
    }
};

parsegraph_TestSuite.prototype.name = function()
{
    return this._name;
};

parsegraph_TestSuite.prototype.toString = function()
{
    return "TestSuite \"" + this.name() + "\" with " + this._tests.length + " tests";
};

parsegraph_TestSuite.prototype.addTest = function(testName, runner, runnerThisArg)
{
    if(typeof(testName) === "object") {
        return this.addTest(
            testName.name(),
            testName
        );
    }
    if(typeof(testName) === "function") {
        return this.addTest(
            this.name() + " " + (this._tests.length + 1),
            testName,
            runner
        );
    }
    var test = new parsegraph_Test(testName, runner, runnerThisArg);
    this._tests.push(test);
    return test;
};
parsegraph_TestSuite.prototype.AddTest = parsegraph_TestSuite.prototype.addTest;
parsegraph_TestSuite.prototype.Add = parsegraph_TestSuite.prototype.addTest;
parsegraph_TestSuite.prototype.add = parsegraph_TestSuite.prototype.addTest;

function parsegraph_TestSuiteResult()
{
    this._testsStarted = 0;
    this._testsSuccessful = 0;
    this._testsFailed = 0;
    this._testsCrashed = 0;

    this._aggregateResult = document.createElement("h2");

    this._resultList = document.createElement("ul");
};

parsegraph_TestSuiteResult.prototype.connect = function(container)
{
    this.disconnect();

    this._container = container;
    this._container.appendChild(this._aggregateResult);
    this._container.appendChild(this._resultList);
};

parsegraph_TestSuiteResult.prototype.disconnect = function()
{
    if(!this._container) {
        return;
    }
    this._container.removeChild(this._aggregateResult);
    this._container.removeChild(this._resultList);
    this._container = null;
};


parsegraph_TestSuiteResult.prototype.resultList = function()
{
    return this._resultList;
};

parsegraph_TestSuiteResult.prototype.aggregateResult = function()
{
    return this._aggregateResult;
};

parsegraph_TestSuiteResult.prototype.testStarted = function()
{
    ++(this._testsStarted);
};

parsegraph_TestSuiteResult.prototype.testsStarted = function()
{
    return this._testsStarted;
};

parsegraph_TestSuiteResult.prototype.testsSuccessful = function()
{
    return this._testsSuccessful;
};

parsegraph_TestSuiteResult.prototype.testsFailed = function()
{
    return this._testsFailed;
};

parsegraph_TestSuiteResult.prototype.testsCrashed = function()
{
    return this._testsCrashed;
};

parsegraph_TestSuiteResult.prototype.testFinished = function(result)
{
    ++(this["_tests" + result.testStatus()]);
};

parsegraph_TestSuiteResult.prototype.isSuccessful = function()
{
    return this._testsStarted > 0 &&
        this._testsStarted == this._testsSuccessful &&
        this._testsFailed == 0 &&
        this._testsCrashed == 0;
};

parsegraph_TestSuiteResult.prototype.toString = function()
{
    if(this.isSuccessful()) {
        return "All " +
            this.testsStarted() +
            " tests ran successfully.";
    }
    else {
        return this.testsSuccessful() + " of " +
            this.testsStarted() + " tests ran successfully. " +
            this.testsFailed() + " failed, " +
            this.testsCrashed() + " crashed";
    }
};

parsegraph_TestSuite.prototype.run = function(listener, listenerThisArg)
{
    var notify = function() {
        if(listener) {
            listener.apply(listenerThisArg, arguments);
        }
    };

    var testResults = new parsegraph_TestSuiteResult();

    // Run the given listener for each test object.
    this._tests.forEach(function(test) {
        if(test.isTestSuite()) {
            var resultLine = document.createElement("li");
            resultLine.appendChild(document.createTextNode(test.name()));
            testResults.resultList().appendChild(resultLine);

            notify("TestStarted", test);
            testResults.testStarted();

            // Run the test.
            var result = test.run(listener, listenerThisArg);

            if(result.testStatus() == "Crashed") {
                resultLine.appendChild(document.createElement("br"));
                resultLine.appendChild(
                    document.createTextNode(result.testResult().toString())
                );
                resultLine.appendChild(document.createElement("br"));
                resultLine.appendChild(document.createElement("pre"));
                console.log(result.testResult().stack);
                resultLine.lastChild.innerHTML = result.testResult().stack.replace(
                    /[\r\n]+/g, "<br/>"
                );
                return;
            }

            resultLine.appendChild(result.testResult().resultList());
            if(result.testStatus() === "Successful") {
                resultLine.style.display = "none";
            }

            testResults.testFinished(result);
            notify("TestFinished", result);

            resultLine.className = result.testStatus();
            resultLine.insertBefore(
                document.createTextNode(": " + result.testResult()),
                result.testResult().resultList()
            );
        }
        else if(test.isTest()) {
            var resultLine = document.createElement("li");
            resultLine.appendChild(document.createTextNode(test.name()));
            testResults.resultList().appendChild(resultLine);

            notify("TestStarted", test);
            testResults.testStarted();

            // Run the test.
            var result = test.run(listener, listenerThisArg, resultLine);

            testResults.testFinished(result);
            notify("TestFinished", result);

            resultLine.className = result.testStatus();
            if(result.testStatus() === "Crashed") {
                resultLine.appendChild(document.createElement("br"));
                resultLine.appendChild(
                    document.createTextNode(result.testResult().toString())
                );
                resultLine.appendChild(document.createElement("br"));
                resultLine.appendChild(document.createElement("pre"));
                resultLine.lastChild.innerHTML = result.testResult().stack.replace(
                    /[\r\n]+/g, "<br/>"
                );
            }
            else if(result.testStatus() !== "Successful") {
                resultLine.appendChild(document.createElement("br"));
                resultLine.appendChild(document.createTextNode(result.testResult()));
            }

            if(result.testStatus() === "Successful") {
                resultLine.style.display = "none";
            }
        }
    }, this);

    testResults.aggregateResult().innerHTML = testResults.toString();

    return testResults;
};

parsegraph_AllTests = new parsegraph_TestSuite("parsegraph");

parsegraph_TestSuite_Tests = new parsegraph_TestSuite();
parsegraph_TestSuite_Tests.addTest(function() {
    var ts = new parsegraph_TestSuite("Default", false);
});
getNumberParts_FARRAY=new Float64Array(1);
getNumberParts_UARRAY=new Uint8Array(getNumberParts_FARRAY.buffer);
// http://stackoverflow.com/questions/9383593/extracting-the-exponent-and-mantissa-of-a-javascript-number
function getNumberParts(x)
{
    var float = getNumberParts_FARRAY;
    var bytes = getNumberParts_UARRAY;
    float[0] = x;

    var sign = bytes[7] >> 7,
        exponent = ((bytes[7] & 0x7f) << 4 | bytes[6] >> 4) - 0x3ff;
    bytes[7] = 0x3f;
    bytes[6] |= 0xf0;
    return {
        sign: sign,
        exponent: exponent,
        mantissa: float[0]
    };
}
function parsegraph_datesEqual(a, b)
{
    if(a == undefined || b == undefined) {
        return a == undefined && b == undefined;
    }
    return a.getDate() == b.getDate() && a.getMonth() == b.getMonth() && a.getFullYear() == b.getFullYear();
}

function parsegraph_dateGreater(a, b)
{
    if(a == undefined) {
        return false;
    }
    if(b == undefined) {
        return true;
    }

    if(a.getFullYear() <= b.getFullYear()) {
        if(a.getFullYear() !== b.getFullYear()) {
            // a.getFullYear() < b.getFullYear()
            return false;
        }
        // a.getFullYear() === b.getFullYear()
        if(a.getMonth() <= b.getMonth()) {
            if(a.getMonth() !== b.getMonth()) {
                // a.getMonth() < b.getMonth()
                return false;
            }
            // a.getMonth() === b.getMonth()
            return a.getDate() > b.getDate();
        }
        // a.getMonth() > b.getMonth()
        return true;
    }
    // a.getFullYear() > b.getFullYear()
    return true;
}

parsegraph_Date_Tests = new parsegraph_TestSuite("parsegraph_Date");

parsegraph_Date_Tests.addTest("parsegraph_dateGreater", function(dom) {
    if(parsegraph_dateGreater(
        new Date(2016, 0, 1),
        new Date(2017, 0, 1)
    )) {
        return "2016 is showing as greater than 2017?!";
    }
    if(!parsegraph_dateGreater(
        new Date(2018, 0, 1),
        new Date(2017, 0, 1)
    )) {
        return "2018 is showing as less than 2017?!";
    }
});

function parsegraph_getListOfDays()
{
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}

function parsegraph_getListOfMonths()
{
    return [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
}

parsegraph_OFFSET = new Date().getTime();
function parsegraph_getRuntimeInMillis()
{
    return parsegraph_getTimeInMillis() - parsegraph_OFFSET;
}

function parsegraph_getTimeInMillis()
{
    return new Date().getTime();
}

parsegraph_TIMEOUT = 40000;

function parsegraph_outputMonth(d, includeYear)
{
    var str = parsegraph_getListOfMonths()[d.getMonth()];
    if(includeYear || includeYear === undefined) {
        str += " " + d.getFullYear();
    }
    return str;
}

function parsegraph_outputDate(d, includeDate, includeTime, includeToday)
{
    var timeString = "";
    if(includeDate || includeDate === undefined) {
        if(
            parsegraph_datesEqual(d, new Date()) &&
            (includeToday || includeToday === undefined)
        ) {
            timeString += "Today, ";
        }

        var dayOfWeek = parsegraph_getListOfDays();
        timeString += dayOfWeek[d.getDay()] + ", ";

        var months = parsegraph_getListOfMonths();
        timeString += months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
        if(includeTime || includeTime === undefined) {
            timeString += " at ";
        }
    }
    if(includeTime || includeTime === undefined) {
        var outputMinutes = function() {
            if(d.getMinutes() < 10) {
                return "0" + d.getMinutes();
            }
            return d.getMinutes().toString();
        };
        if(d.getHours() == 12) {
            timeString += d.getHours() + ":" + outputMinutes() + " PM";
        } else if(d.getHours() > 12) {
            timeString += (d.getHours() - 12) + ":" + outputMinutes() + " PM";
        } else if(d.getHours() == 0) {
            timeString += "12:" + outputMinutes() + " AM";
        } else {
            timeString += d.getHours() + ":" + outputMinutes() + " AM";
        }
    }
    return timeString;
}

function parsegraph_previousMonth(d)
{
    d = new Date(d);
    if(d.getMonth() == 0) {
        d.setFullYear(d.getFullYear() - 1, 11, d.getDate());
    }
    else {
        d.setMonth(d.getMonth() - 1);
    }
    return d;
}

function parsegraph_nextMonth(d)
{
    d = new Date(d);
    if(d.getMonth() == 11) {
        d.setFullYear(d.getFullYear() + 1, 0, d.getDate());
    }
    else {
        d.setMonth(d.getMonth() + 1);
    }
    return d;
}

function parsegraph_previousDay(d)
{
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    d.setDate(d.getDate() - 1);
    return d;
}

function parsegraph_nextDay(d)
{
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    d.setDate(d.getDate() + 1);
    return d;
}

function parsegraph_previousWeek(d)
{
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    d.setDate(d.getDate() - 7);
    return d;
}

function parsegraph_nextWeek(d)
{
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    d.setDate(d.getDate() + 7);
    return d;
}

function parsegraph_getFirstDayOfWeek(d)
{
    while(d.getDay() != 0) {
        d = parsegraph_previousDay(d);
    }
    return d;
}

// From http://www.itacanet.org/the-sun-as-a-source-of-energy/part-3-calculating-solar-angles/
function getSunriseAndSunset(inputDatetime, signedLongitude, signedLatitude)
{
    if(isNaN(signedLongitude)) {
        throw new Error("Longitude must not be NaN");
    }
    if(isNaN(signedLatitude)) {
        throw new Error("Latitude must not be NaN");
    }
    if(inputDatetime == null) {
        throw new Error("Input date must not be null");
    }

    // constants
    var degreesToRadians = 3.1416 / 180;
    var radiansToDegrees = 180 / 3.1416;

    // day of year
    var monthDays = MonthToYearOffset(inputDatetime);
    var dayOfYear = monthDays + inputDatetime.getDate();

    // local standard time meridian
    var meridian = -(inputDatetime.getTimezoneOffset() / 60) * 15;

    // ...calculate clock minutes after midnight
    var inputMinutesAfterMidnight = 60 * 12;

    // calculate time for purposes of determining declination and EOT adjustment;  note that this is
    // an approximation because the EOT is not taken into account;  the precise solar time value is
    // calculated below.  note that for purposes of calculating declination and EOT adjustment, if the
    // user does not enter a time, it is assumed to be 1200 UT

    // ...calculate daylight savings time adjustment
    var daylightAdjustment = 0;
    //if(inputDaylight[0].checked == true) daylightAdjustment = -60;

    // http://stackoverflow.com/questions/11887934/check-if-daylight-saving-time-is-in-effect-and-if-it-is-for-how-many-hours
    var stdTimezoneOffset = (function() {
        var jan = new Date(inputDatetime.getFullYear(), 0, 1);
        var jul = new Date(inputDatetime.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    })();

    if(inputDatetime.getTimezoneOffset() < stdTimezoneOffset) {
        daylightAdjustment -= 60;
        meridian -= 15;
    }

    // ...calculate solar minutes after midnight
    // NOTE!  This equation assumes positive longitude values are for East, and negative values are for West
    var solarMinutesAfterMidnight = inputMinutesAfterMidnight + (4 * (signedLongitude - meridian)) + daylightAdjustment;

    // In Eq. 1.4.2, if m>2 then y =y and m = m-3, otherwise y = y-1 and m = m + 9.
    // In the expression above for t, [x] denotes the integer part of x. 
    var monthNum = inputDatetime.getMonth();
    if(monthNum > 2) {
        correctedYear = inputDatetime.getFullYear();
        correctedMonth = monthNum - 3;
    }
    else {
        correctedYear = inputDatetime.getFullYear() - 1;
        correctedMonth = monthNum + 9;
    }

    // t = {(UT/24.0) + D + [30.6m + 0.5] +[365.25(y-1976)] - 8707.5}/36525
    var t = (
        (solarMinutesAfterMidnight / 60.0 / 24.0) +
        inputDatetime.getDate() +
        Math.floor(30.6 * correctedMonth + 0.5) +
        Math.floor(365.25 * (correctedYear - 1976)) -
        8707.5) /
        36525.0;
    var G = NormalizeTo360(357.528 + 35999.05 * t);
    var C = 1.915 * Math.sin(G * degreesToRadians) + 0.020 * Math.sin(2.0 * G * degreesToRadians);
    var L = NormalizeTo360(280.460 + (36000.770 * t) + C);
    var alpha = L - 2.466 * Math.sin(2.0 * L * degreesToRadians) + 0.053 *  Math.sin(4.0 * L * degreesToRadians);
    var obliquity = 23.4393 - 0.013 * t;
    var declination = radiansToDegrees * Math.atan(
        Math.tan(obliquity * degreesToRadians) *
        Math.sin(alpha * degreesToRadians)
    );
    var eotAdjustment = (L - C - alpha) / 15.0 * 60.0;

    //console.log("t=" + t);
    //console.log("declination=" + declination);
    //console.log("signedLatitude=" + signedLatitude);

    // Get the sunrise and sunset times.
    var sunRiseSetLSoTMinutes = radiansToDegrees * Math.acos(
        -1.0 *
        Math.sin(signedLatitude * degreesToRadians) * Math.sin(declination * degreesToRadians) /
        Math.cos(signedLatitude * degreesToRadians) / Math.cos(declination * degreesToRadians)
    ) * 4;
    //console.log("sunRiseSetLSoTMinutes=" + sunRiseSetLSoTMinutes);

    // if longitude differs greatly from meridian, warn about longitude east/west problem and time zone selection
    if(Math.abs(signedLongitude - meridian) > 30) {
        console.log(
            "WARNING: Longitude (" + signedLongitude + ") differs from time zone meridian (" + meridian + ") by > 30 degrees...check longitude east-west designation and/or time zone and recalculate if necessary. (dist=" + Math.abs(signedLongitude - meridian) + ")"
        );
    }

    // [sunrise in minutes since midnight, sunset in minutes since midnight]
    return [
        12 * 60 - sunRiseSetLSoTMinutes - (4 * (signedLongitude -  meridian)) - eotAdjustment - daylightAdjustment,
        12 * 60 + sunRiseSetLSoTMinutes - (4 * (signedLongitude -  meridian)) - eotAdjustment - daylightAdjustment
    ];
}

function NormalizeTo360(n)
{
    return n - Math.floor(n / 360.0) * 360;
}

(function() {
    var daysInMonths = [
        0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334
    ];
    MonthToYearOffset = function(d)
    {
        return daysInMonths[d.getMonth()];
    }
})();
function parsegraph_focusElement(element)
{
    return window.setTimeout(function() {
        element.focus();
    });
}

function parsegraph_findSelected(selectElement)
{
    var c = selectElement.firstChild;
    while(c != null) {
        if(c.selected) {
            return c;
        }
        c = c.nextSibling;
    }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt
function fixedCharAt(str, idx)
{
    var ret = '';
    str += '';
    var end = str.length;

    var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    while((surrogatePairs.exec(str)) != null) {
        var li = surrogatePairs.lastIndex;
        if(li - 2 < idx) {
            idx++;
        } else {
            break;
        }
    }

    if(idx >= end || idx < 0) {
        return null;
    }

    ret += str.charAt(idx);

    if(/[\uD800-\uDBFF]/.test(ret) && /[\uDC00-\uDFFF]/.test(str.charAt(idx + 1))) {
        // Go one further, since one of the "characters" is part of a surrogate pair
        ret += str.charAt(idx + 1);
    }
    return ret;
}

parsegraph_Browser_Tests = new parsegraph_TestSuite("Browser");

parsegraph_Browser_Tests.addTest("arguments referenced from other closures", function() {

    var foo = function() {
        var args = arguments;
        return function() {
            return args[0];
        };
    }

    var c = foo(1)(2);
    if(c !== 1) {
        return "Closures cannot reference external arguments.";
    }
});
{
    var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
    rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
    rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');
    function isRTL(s){
        return rtlDirCheck.test(s);
    };
}

function parsegraph_Unicode() {
    this.unicodeProperties = {};
    this.unicodeBidiCounts = {};
    this.unicodeCategoryCounts = {};
};

parsegraph_UNICODE_INSTANCE = null;
function parsegraph_defaultUnicode()
{
    if(!parsegraph_UNICODE_INSTANCE) {
        parsegraph_UNICODE_INSTANCE = new parsegraph_Unicode();
        parsegraph_UNICODE_INSTANCE.load.apply(parsegraph_UNICODE_INSTANCE, arguments);
    }
    return parsegraph_UNICODE_INSTANCE;
}

parsegraph_Unicode.prototype.get = function(codeOrLetter)
{
    if(typeof codeOrLetter === "number") {
        return this.unicodeProperties[codeOrLetter];
    }
    return this.unicodeProperties[codeOrLetter.charCodeAt(0)];
};

{
// SemanticCodeValue:[Isolated, Initial, Medial, Final]. Use null for non-applicable.
var unicodeCursiveMap = {
    0x627:[0xfe8d, null, null, 0xfe8e], // ALEF
    0x628:[0xfe8f, 0xfe91, 0xfe92, 0xfe90], // BEH
    0x629:[0xfe93, null, null, 0xfe94], // MARBUTA
    0x62a:[0xfe95,0xfe97, 0xfe98, 0xfe96], // TEH
    0x62b:[0xfe99,0xfe9b,0xfe9c,0xfe9a], // THEH
    0x62c:[0xfe9d,0xfe9f,0xfea0,0xfe9e],// JEEM
    0x62d:[0xfea1,0xfea3, 0xfea4, 0xfea2], // HAH
    0x62e:[0xfea5,0xfea7,0xfea8,0xfea6], // KHAH
    0x62f:[0xfea9,null, null, 0xfeaa], // DAL
    0x630:[0xfeab,null, null, 0xfeac], // THAL
    0x631:[0xfead,null,null,0xfeae], // REH
    0x632:[0xfeaf,null,null,0xfeb0], // ZAIN
    0x633:[0xfeb1,0xfeb3,0xfeb4,0xfeb2],// SEEN
    0x634:[0xfeb5,0xfeb7,0xfeb8,0xfeb6], // SHEEN
    0x635:[0xfeb9,0xfebb,0xfebc,0xfeba], // SAD
    0x636:[0xfebd,0xfebf,0xfec0,0xfebe], // DAD
    0x637:[0xfec1,0xfec3,0xfec4,0xfec2], // TAH
    0x638:[0xfec5,0xfec7,0xfec8,0xfec6], // ZAH
    0x639:[0xfec9,0xfecb,0xfecc,0xfeca], // AIN
    0x63a:[0xfecd,0xfecf,0xfed0,0xfece], // GHAIN
    0x641:[0xfed1,0xfed3,0xfed4,0xfed2], // FEH
    0x642:[0xfed5,0xfed7,0xfed8,0xfed6], // QAF
    0x643:[0xfed9,0xfedb,0xfedc,0xfeda], // KAF
    0x644:[0xfedd,0xfedf,0xfee0, 0xfede], // LAM
    0x645:[0xfee1, 0xfee3,0xfee4,0xfee2], // MEEM
    0x646:[0xfee5, 0xfee7, 0xfee8, 0xfee6], // NOON
    0x647:[0xfee9, 0xfeeb, 0xfeec, 0xfeea], // HEH
    0x648:[0xfeed,null, null, 0xfeee], // WAW
    0x64a:[0xfef1, 0xfef3, 0xfef4, 0xfef2] // YEH,
};

parsegraph_Unicode.prototype.getCursiveMapping = function(t)
{
    if(typeof t !== "number") {
        t = t.charCodeAt(0);
    }
    return unicodeCursiveMap[t];
};
}

parsegraph_Unicode.prototype.loadFromString = function(t)
{
    var lines = 0;
    var start = 0;
    var ws = /[\n\r]/;
    for(var i = 0; i < t.length; ++i) {
        if(ws.test(t[i])) {
            var charData = t.substring(start, i).split(';');
            if(lines < 100) {
                //console.log(charData);
            }
            start = i + 1;
            ++lines;

            var charNamedData = {
                codeValue: parseInt(charData[0], 16),
                characterName: charData[1],
                generalCategory: charData[2],
                canonicalCombiningClasses: charData[3],
                bidirectionalCategory: charData[4],
                decompositionMapping: charData[5],
                decimalDigitValue: parseInt(charData[6]),
                digitValue: parseFloat(charData[7]),
                numericValue: charData[8],
                mirrored: charData[9],
                unicode10Name: charData[10],
                commentField: charData[11],
                uppercaseMapping: parseInt(charData[12], 16),
                lowercaseMapping: parseInt(charData[13], 16),
                titlecaseMapping: parseInt(charData[14], 16)
            };
            this.unicodeProperties[charNamedData.codeValue] = charNamedData;

            if(!(charNamedData.bidirectionalCategory in this.unicodeBidiCounts)) {
                this.unicodeBidiCounts[charNamedData.bidirectionalCategory] = 1;
            }
            else {
                ++this.unicodeBidiCounts[charNamedData.bidirectionalCategory];
            }
            if(!(charNamedData.generalCategory in this.unicodeCategoryCounts)) {
                this.unicodeCategoryCounts[charNamedData.generalCategory] = 1;
            }
            else {
                ++this.unicodeCategoryCounts[charNamedData.generalCategory];
            }
        }
    }
    //console.log("Text received: " + t.length + " bytes, " + lines + " lines");
};

parsegraph_Unicode.prototype.isArabic = function(letter) {
    if(typeof letter !== "number") {
        letter = letter.charCodeAt(0);
    }
    var data = this.get(letter);
    if(!data) {
        return false;
    }
    var cv = data.codeValue;
    return cv >= 0x621 && cv <= 0x64a;
};

parsegraph_Unicode.prototype.isMark = function(letter) {
    if(typeof letter !== "number") {
        letter = letter.charCodeAt(0);
    }
    var data = this.get(letter);
    if(!data) {
        return false;
    }
    var cat = data.generalCategory;
    return cat === "Mn" || cat === "Mc" || cat === "Me";
};

parsegraph_Unicode.prototype.isArabicDiacritic = function(letter) {
    if(typeof letter !== "number") {
        letter = letter.charCodeAt(0);
    }
    var data = this.get(letter);
    if(!data) {
        return false;
    }
    var cv = data.codeValue;
    return cv >= 0x621 && cv <= 0x64a;
};

parsegraph_Unicode.prototype.load = function(dbURL) {
    if(arguments.length === 0) {
        dbURL = "/UnicodeData.txt";
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", dbURL);
    var that = this;
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            that.loadFromString(xhr.responseText);
            that._loaded = true;
            if(that.onLoad) {
                that.onLoad();
            }
            if(that._onLoad) {
                that._onLoad.call(that._onLoadThisArg || this);
            }
        }
        else {
            //console.log("Receiving " + xhr.readyState + "\n" + xhr.responseText.length + " bytes received.\nTime: " + new Date().getTime()/1000);
        }
    };
    xhr.send();
    return xhr;
};

parsegraph_Unicode.prototype.loaded = function()
{
    return this._loaded;
};

parsegraph_Unicode.prototype.setOnLoad = function(onLoad, onLoadThisArg)
{
    if(this._loaded) {
        throw new Error("Unicode character database is already loaded");
    }
    this._onLoad = onLoad;
    this._onLoadThisArg = onLoadThisArg;
};

/*
0	Code value	normative	Code value in 4-digit hexadecimal format.
1	Character name	normative	These names match exactly the names published in Chapter 14 of the Unicode Standard, Version 3.0.
2	General Category	normative / informative
(see below)	This is a useful breakdown into various "character types" which can be used as a default categorization in implementations. See below for a brief explanation.

General Category

The values in this field are abbreviations for the following. Some of the values are normative, and some are informative. For more information, see the Unicode Standard.

Note: the standard does not assign information to control characters (except for certain cases in the Bidirectional Algorithm). Implementations will generally also assign categories to certain control characters, notably CR and LF, according to platform conventions.

Normative Categories

Abbr.

Description

Lu	Letter, Uppercase
Ll	Letter, Lowercase
Lt	Letter, Titlecase
Mn	Mark, Non-Spacing
Mc	Mark, Spacing Combining
Me	Mark, Enclosing
Nd	Number, Decimal Digit
Nl	Number, Letter
No	Number, Other
Zs	Separator, Space
Zl	Separator, Line
Zp	Separator, Paragraph
Cc	Other, Control
Cf	Other, Format
Cs	Other, Surrogate
Co	Other, Private Use
Cn	Other, Not Assigned (no characters in the file have this property)
Informative Categories

Abbr.

Description

Lm	Letter, Modifier
Lo	Letter, Other
Pc	Punctuation, Connector
Pd	Punctuation, Dash
Ps	Punctuation, Open
Pe	Punctuation, Close
Pi	Punctuation, Initial quote (may behave like Ps or Pe depending on usage)
Pf	Punctuation, Final quote (may behave like Ps or Pe depending on usage)
Po	Punctuation, Other
Sm	Symbol, Math
Sc	Symbol, Currency
Sk	Symbol, Modifier
So	Symbol, Other

3	Canonical Combining Classes	normative	The classes used for the Canonical Ordering Algorithm in the Unicode Standard. These classes are also printed in Chapter 4 of the Unicode Standard.
4	Bidirectional Category	normative	See the list below for an explanation of the abbreviations used in this field. These are the categories required by the Bidirectional Behavior Algorithm in the Unicode Standard. These categories are summarized in Chapter 3 of the Unicode Standard.


Type

Description

L	Left-to-Right
LRE	Left-to-Right Embedding
LRO	Left-to-Right Override
R	Right-to-Left
AL	Right-to-Left Arabic
RLE	Right-to-Left Embedding
RLO	Right-to-Left Override
PDF	Pop Directional Format
EN	European Number
ES	European Number Separator
ET	European Number Terminator
AN	Arabic Number
CS	Common Number Separator
NSM	Non-Spacing Mark
BN	Boundary Neutral
B	Paragraph Separator
S	Segment Separator
WS	Whitespace
ON	Other Neutrals

5	Character Decomposition Mapping	normative	In the Unicode Standard, not all of the mappings are full (maximal) decompositions. Recursive application of look-up for decompositions will, in all cases, lead to a maximal decomposition. The decomposition mappings match exactly the decomposition mappings published with the character names in the Unicode Standard.
6	Decimal digit value	normative	This is a numeric field. If the character has the decimal digit property, as specified in Chapter 4 of the Unicode Standard, the value of that digit is represented with an integer value in this field
7	Digit value	normative	This is a numeric field. If the character represents a digit, not necessarily a decimal digit, the value is here. This covers digits which do not form decimal radix forms, such as the compatibility superscript digits
8	Numeric value	normative	This is a numeric field. If the character has the numeric property, as specified in Chapter 4 of the Unicode Standard, the value of that character is represented with an integer or rational number in this field. This includes fractions as, e.g., "1/5" for U+2155 VULGAR FRACTION ONE FIFTH Also included are numerical values for compatibility characters such as circled numbers.
9	Mirrored	normative	If the character has been identified as a "mirrored" character in bidirectional text, this field has the value "Y"; otherwise "N". The list of mirrored characters is also printed in Chapter 4 of the Unicode Standard.
10	Unicode 1.0 Name	informative	This is the old name as published in Unicode 1.0. This name is only provided when it is significantly different from the Unicode 3.0 name for the character.
11	10646 comment field	informative	This is the ISO 10646 comment field. It is in parantheses in the 10646 names list.
12	Uppercase Mapping	informative	Upper case equivalent mapping. If a character is part of an alphabet with case distinctions, and has an upper case equivalent, then the upper case equivalent is in this field. See the explanation below on case distinctions. These mappings are always one-to-one, not one-to-many or many-to-one. This field is informative.
13	Lowercase Mapping	informative	Similar to Uppercase mapping
14	Titlecase Mapping	informative	Similar to Uppercase mapping
*/

function parsegraph_addEventListener(targetElement, eventName, listener, useCapture)
{
    if(useCapture === undefined) {
        // Unspecified, so default to false.
        useCapture = false;
    }
    if(targetElement.addEventListener) {
        // Standard way.
        return targetElement.addEventListener(eventName, listener, useCapture);
    }

    // Internet Explorer before IE 9.
    window.setTimeout(function() {
        if(!/^on/.test(eventName)) {
            eventName = "on" + eventName;
        }
        targetElement.attachEvent(eventName, listener);
    });
}

function parsegraph_addEventMethod(targetElement, eventName, listener, listenerThisArg, useCapture)
{
    return parsegraph_addEventListener(targetElement, eventName, function() {
        listener.apply(listenerThisArg, arguments);
    }, useCapture);
}

function parsegraph_removeEventListener(targetElement, eventName, listener, useCapture)
{
    if(useCapture === undefined) {
        // Unspecified, so default to false.
        useCapture = false;
    }
    if(targetElement.removeEventListener) {
        // Standard way.
        return targetElement.removeEventListener(eventName, listener, useCapture);
    }

    // Internet Explorer before IE 9.
    window.setTimeout(function() {
        if(!/^on/.test(eventName)) {
            eventName = "on" + eventName;
        }
        targetElement.detachEvent(eventName, listener);
    });
}

function parsegraph_addButtonListener(targetElement, listener, listenerThisArg)
{
    return [
        parsegraph_addEventMethod(targetElement, "click", listener, listenerThisArg),
        parsegraph_addEventMethod(targetElement, "keydown", function(event) {
            if(event.keyCode === 32 || event.keyCode === 13) {
                listener.call(listenerThisArg, event);
            }
        }, this)
    ];
};

// From https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
(function() {
	// Reasonable defaults
	var PIXEL_STEP  = 10;
	var LINE_HEIGHT = 40;
	var PAGE_HEIGHT = 800;

	/**
	 * Mouse wheel (and 2-finger trackpad) support on the web sucks.  It is
	 * complicated, thus this doc is long and (hopefully) detailed enough to answer
	 * your questions.
	 *
	 * If you need to react to the mouse wheel in a predictable way, this code is
	 * like your bestest friend. * hugs *
	 *
	 * As of today, there are 4 DOM event types you can listen to:
	 *
	 *   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
	 *   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
	 *   'MozMousePixelScroll'  -- FF(3.5 only!) (2010-2013) -- don't bother!
	 *   'DOMMouseScroll'       -- FF(0.9.7+) since 2003
	 *
	 * So what to do?  The is the best:
	 *
	 *   normalizeWheel.getEventType();
	 *
	 * In your event callback, use this code to get sane interpretation of the
	 * deltas.  This code will return an object with properties:
	 *
	 *   spinX   -- normalized spin speed (use for zoom) - x plane
	 *   spinY   -- " - y plane
	 *   pixelX  -- normalized distance (to pixels) - x plane
	 *   pixelY  -- " - y plane
	 *
	 * Wheel values are provided by the browser assuming you are using the wheel to
	 * scroll a web page by a number of lines or pixels (or pages).  Values can vary
	 * significantly on different platforms and browsers, forgetting that you can
	 * scroll at different speeds.  Some devices (like trackpads) emit more events
	 * at smaller increments with fine granularity, and some emit massive jumps with
	 * linear speed or acceleration.
	 *
	 * This code does its best to normalize the deltas for you:
	 *
	 *   - spin is trying to normalize how far the wheel was spun (or trackpad
	 *     dragged).  This is super useful for zoom support where you want to
	 *     throw away the chunky scroll steps on the PC and make those equal to
	 *     the slow and smooth tiny steps on the Mac. Key data: This code tries to
	 *     resolve a single slow step on a wheel to 1.
	 *
	 *   - pixel is normalizing the desired scroll delta in pixel units.  You'll
	 *     get the crazy differences between browsers, but at least it'll be in
	 *     pixels!
	 *
	 *   - positive value indicates scrolling DOWN/RIGHT, negative UP/LEFT.  This
	 *     should translate to positive value zooming IN, negative zooming OUT.
	 *     This matches the newer 'wheel' event.
	 *
	 * Why are there spinX, spinY (or pixels)?
	 *
	 *   - spinX is a 2-finger side drag on the trackpad, and a shift + wheel turn
	 *     with a mouse.  It results in side-scrolling in the browser by default.
	 *
	 *   - spinY is what you expect -- it's the classic axis of a mouse wheel.
	 *
	 *   - I dropped spinZ/pixelZ.  It is supported by the DOM 3 'wheel' event and
	 *     probably is by browsers in conjunction with fancy 3D controllers .. but
	 *     you know.
	 *
	 * Implementation info:
	 *
	 * Examples of 'wheel' event if you scroll slowly (down) by one step with an
	 * average mouse:
	 *
	 *   OS X + Chrome  (mouse)     -    4   pixel delta  (wheelDelta -120)
	 *   OS X + Safari  (mouse)     -  N/A   pixel delta  (wheelDelta  -12)
	 *   OS X + Firefox (mouse)     -    0.1 line  delta  (wheelDelta  N/A)
	 *   Win8 + Chrome  (mouse)     -  100   pixel delta  (wheelDelta -120)
	 *   Win8 + Firefox (mouse)     -    3   line  delta  (wheelDelta -120)
	 *
	 * On the trackpad:
	 *
	 *   OS X + Chrome  (trackpad)  -    2   pixel delta  (wheelDelta   -6)
	 *   OS X + Firefox (trackpad)  -    1   pixel delta  (wheelDelta  N/A)
	 *
	 * On other/older browsers.. it's more complicated as there can be multiple and
	 * also missing delta values.
	 *
	 * The 'wheel' event is more standard:
	 *
	 * http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
	 *
	 * The basics is that it includes a unit, deltaMode (pixels, lines, pages), and
	 * deltaX, deltaY and deltaZ.  Some browsers provide other values to maintain
	 * backward compatibility with older events.  Those other values help us
	 * better normalize spin speed.  Example of what the browsers provide:
	 *
	 *                          | event.wheelDelta | event.detail
	 *        ------------------+------------------+--------------
	 *          Safari v5/OS X  |       -120       |       0
	 *          Safari v5/Win7  |       -120       |       0
	 *         Chrome v17/OS X  |       -120       |       0
	 *         Chrome v17/Win7  |       -120       |       0
	 *                IE9/Win7  |       -120       |   undefined
	 *         Firefox v4/OS X  |     undefined    |       1
	 *         Firefox v4/Win7  |     undefined    |       3
	 *
	 */
	normalizeWheel = function(/*object*/ event) /*object*/ {
	  var sX = 0, sY = 0,       // spinX, spinY
		  pX = 0, pY = 0;       // pixelX, pixelY

	  // Legacy
	  if ('detail'      in event) { sY = event.detail; }
	  if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
	  if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
	  if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

	  // side scrolling on FF with DOMMouseScroll
	  if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
		sX = sY;
		sY = 0;
	  }

	  pX = sX * PIXEL_STEP;
	  pY = sY * PIXEL_STEP;

	  if ('deltaY' in event) { pY = event.deltaY; }
	  if ('deltaX' in event) { pX = event.deltaX; }

	  if ((pX || pY) && event.deltaMode) {
		if (event.deltaMode == 1) {          // delta in LINE units
		  pX *= LINE_HEIGHT;
		  pY *= LINE_HEIGHT;
		} else {                             // delta in PAGE units
		  pX *= PAGE_HEIGHT;
		  pY *= PAGE_HEIGHT;
		}
	  }

	  // Fall-back if spin cannot be determined
	  if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
	  if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

	  return { spinX  : sX,
			   spinY  : sY,
			   pixelX : pX,
			   pixelY : pY };
	}
})();

function parsegraph_writeError(ex)
{
    var err = "";
    switch(typeof ex) {
    case "string":
    case "number":
    case "boolean":
    case "function":
        err += ex;
        break;
    case "object":
        if(typeof ex.toString == "function") {
            err += ex.toString();
        }
        else if(typeof ex.toJSON == "function") {
            err += ex.toJSON();
        }
        else {
            err += ex;
        }
        break;
    }
    return err;
};
function parsegraph_Form(name)
{
    // Save the form name.
    if(name === undefined) {
        name = "form";
    }
    this._name = name;

    this._listeners = [];
    this._fields = [];

    // Used in creating field IDs for label names.
    this._formID = parsegraph_generateID() + "-" + this.name();

    // Create the form.
    this._formView = document.createElement("form");
    this._formView.id = this._formID;
    this._formView.className = "parsegraph-form " + this.name();

    // Ensure the form is not submitted.
    parsegraph_addEventMethod(this._formView, "submit", function(event) {
        event.preventDefault();
    }, this);
}

parsegraph_createForm = function(name)
{
    return new parsegraph_Form(name);
};

parsegraph_Form.prototype.asDOM = function()
{
    return this._formView;
};

// Add functions to add HTML elements with text content.
[
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
    "span",
    "p"
].forEach(function(elementType) {
    parsegraph_Form.prototype[elementType] = function(content) {
        var element = this.appendElement(elementType);
        if(content !== undefined) {
            element.innerHTML = content;
        }
        return element;
    };
});

parsegraph_Form.prototype.appendElement = function(elementType)
{
    this._formView.appendChild(document.createElement(elementType));
    return this._formView.lastChild;
};

parsegraph_Form.prototype.addFieldElement = function(type, name, value, choices)
{
    var field = {
        "type":type,
        "name":name,
        "value":value,
        "choices":choices,
        "isButton":function() {
            return field.type == "submit" || field.type == "button";
        },
        "hasValue":function() {
            return !field.isButton() && field.type != "label";
        }
    };
    this._fields.push(field);

    var fieldID = this._formID + "-" + field.name;
    var fieldClass = this.name() + "-" + field.name;
    var fieldElement;

    // Textarea are handled separately.
    if(field.type == "textarea") {
        fieldElement = this.appendElement("textarea");
        fieldElement.id = fieldID;
        fieldElement.name = field.name;
        fieldElement.className = fieldClass;
        if(field.value !== undefined) {
            fieldElement.innerHTML = field.value;
        }
        parsegraph_addEventMethod(fieldElement, "change", function() {
            this.value(field.name, fieldElement.value, "set");
        }, this);
        this.addListener(function(name, value) {
            if(name != field.name) {
                return;
            }
            fieldElement.innerHTML = value;
        });
        field.element = fieldElement;
        return field;
    }

    // Label types.
    if(field.type === "label") {
        fieldElement = this.appendElement("label");
        fieldElement.htmlFor = fieldID;
        fieldElement.innerHTML = field.value;
        fieldElement.className = fieldClass;
        field.element = fieldElement;
        return field;
    }

    // Buttons are handled separately.
    if(field.type == "submit" || field.type == "button") {
        fieldElement = this.appendElement("button");
        fieldElement.type = field.type;
        fieldElement.id = fieldID;
        fieldElement.name = field.name;
        fieldElement.className = fieldClass;

        // Set the label and value to the field value.
        fieldElement.innerHTML = field.value;
        if(field.value !== undefined) {
            fieldElement.value = field.value;
        }

        // Listen for button clicks.
        var onChange = function() {
            this.value(field.name, fieldElement.value, "click");
        };
        if(field.type == "submit") {
            // Submit buttons automatically handle key presses.
            parsegraph_addEventMethod(fieldElement, "click", onChange, this);
        }
        else {
            parsegraph_addButtonListener(fieldElement, onChange, this);
        }

        // Update the button label when the value changes.
        this.addListener(function(name, value, action) {
            if(name != field.name || action == "click") {
                return;
            }
            if(fieldElement.value == value) {
                return;
            }

            // Set the field element's value to the new field value.
            fieldElement.innerHTML = value;
            if(value !== undefined) {
                fieldElement.value = value;
            }
        });

        field.element = fieldElement;
        return field;
    }

    if(field.type == "select") {
        fieldElement = this.appendElement("select")
        field.choices.forEach(function(choice) {
            var childElement = document.createElement("option");
            if(typeof(choice) == "object") {
                childElement.value = choice.value;
                childElement.innerHTML = choice.label;
            } else {
                childElement.value = choice;
                childElement.innerHTML = choice;
            }
            if(field.value == choice) {
                childElement.selected = true;
            }
            fieldElement.appendChild(childElement);
        });

        parsegraph_addEventMethod(fieldElement, "change", function() {
            var selected = parsegraph_findSelected(fieldElement);
            if(selected == null) {
                this.value(field.name, null, "click");
                return;
            }
            this.value(field.name, selected.value, "click");
        }, this);
    }
    else if(field.type == "checkbox") {
        fieldElement = this.appendElement("input");

        // Check the checkbox if the value is truthy.
        if(field.value) {
            fieldElement.checked = field.value;
        }
    }
    else {
        // Basic inputs.
        fieldElement = this.appendElement("input");

        if(field.value !== undefined) {
            // The form field has a value, so assign it.
            fieldElement.value = field.value;
        }
    }

    // Assign properties for finding the element in the HTML document.
    if(field.type != "label") {
        fieldElement.id = fieldID;
        fieldElement.type = field.type;
        fieldElement.name = field.name;
    }
    fieldElement.className = fieldClass;

    // Update the form values using field DOM events.
    if(field.type == "checkbox") {
        // Text-oriented types fire on change events.
        parsegraph_addEventMethod(fieldElement, "change", function() {
            this.value(field.name, fieldElement.checked);
        }, this);
        this.addListener(function(name, value) {
            if(name != field.name) {
                return;
            }
            fieldElement.checked = value;
        }, this);
    }
    else {
        // Text-oriented types fire on change events.
        parsegraph_addEventMethod(fieldElement, "change", function() {
            this.value(field.name, fieldElement.value);
        }, this);
        this.addListener(function(name, value) {
            if(name != field.name) {
                return;
            }
            fieldElement.value = field.value;
        }, this);
    }

    field.element = fieldElement;
    return field;
};

parsegraph_Form.prototype.clone = function()
{
    var copy = parsegraph_createForm(name);
    this.eachField(function(field) {
        copy[field.type](
            field.name,
            field.value,
            field.choices
        );
    }, this);
    return copy;
};

parsegraph_Form.prototype.load = function(src)
{
    if(Array.isArray(src)) {
        // Treat src as a JSON array.
        for(var i = 0; i < src.length; ++i) {
            var field = src[i];
            this.value(field.name, field.value);
        }
    }
    else {
        // Treat src as a JSON object.
        for(var name in src) {
            this.value(name, src[name]);
        }
    }
};

parsegraph_Form.prototype.jsonArray = function()
{
    var serialized = [];
    this.eachField(function(field) {
        if(!field.hasValue()) {
            return;
        }
        serialized.push({
            "name":field.name,
            "value":field.value
        });
    }, this);
    return serialized;
};

parsegraph_Form.prototype.jsonObject = function()
{
    var serialized = {};
    this.eachField(function(field) {
        if(!field.hasValue()) {
            return;
        }
        serialized[field.name] = field.value;
    }, this);
    return serialized;
};

parsegraph_Form.prototype.name = function()
{
    return this._name;
};

// Create functions to quickly add fields of these types.
[
    ["label"],
    ["text"],
    ["textarea"],
    ["password"],
    ["checkbox"],
    ["button"],
    ["submit"],
    ["select", "dropdown", "comboBox", "combo"]
].forEach(function(field) {
    var fieldType = field[0];

    /**
     * Adds a field element of this type.
     */
    var addFieldElement = function(name, value, choices) {
        this.addFieldElement(fieldType, name, value, choices);
    };

    /**
     * Adds a label and a field element of this type.
     */
    var addField = function(name, label, value, choices) {
        var labelElement = this.addFieldElement("label", name, label);
        labelElement.element.className += " " + fieldType + "-label";
        this.addFieldElement(fieldType, name, value, choices);
    };

    // Add a e.g. checkbox() and checkboxField() methods.
    field.forEach(function(fieldName) {
        parsegraph_Form.prototype[fieldName] = addFieldElement;
        parsegraph_Form.prototype[fieldName + "Field"] = addField;
    });
});

parsegraph_Form.prototype.value = function(name, value, action)
{
    var field = this.getFieldByName(name);
    if(field == undefined) {
        return;
    }
    if(action === undefined) {
        action = "set";
    }
    if(value !== undefined) {
        if(action == "set" && field.value === value) {
            return;
        }
        field.value = value;
        this.update(name, value, action);
    }
    return field.value;
};

parsegraph_Form.prototype.clear = function()
{
    this.eachField(function(field) {
        if(field.type == "button" || field.type == "submit" || field.type == "label") {
            return;
        }
        this.value(field.name, null, "set");
    }, this);
};

parsegraph_Form.prototype.getFieldByName = function(name)
{
    var labelField = null;
    for(var i = 0; i < this._fields.length; ++i) {
        var field = this._fields[i];
        if(field.name == name) {
            if(field.type != "label") {
                return field;
            }
            labelField = field;
        }
    }
    return labelField;
};

parsegraph_Form.prototype.elementFor = function(fieldName)
{
    var field = this.getFieldByName(fieldName);
    if(field) {
        return field.element;
    }
    return null;
};

parsegraph_Form.prototype.eachField = function(visitor, visitorThisArg)
{
    for(var i = 0; i < this._fields.length; ++i) {
        visitor.call(visitorThisArg, this._fields[i]);
    }
};

parsegraph_Form.prototype.addListener = function(listener, thisArg)
{
    this._listeners.push([listener, thisArg]);
};

parsegraph_Form.prototype.update = function(name, value, action)
{
    this._listeners.forEach(function(listener) {
        listener[0].call(listener[1], name, value, action);
    }, this);
};
{
    var count = 0;
    function parsegraph_generateID(prefix)
    {
        if(!prefix) {
            prefix = "parsegraph-unique";
        }
        return prefix + "-" + (++count);
    }
}
function viewList(itemCreator)
{
    var listView = document.createElement("div");

    listView.appendChild(itemCreator());

    var button = document.createElement("button");
    button.className = "addAnother visual";
    button.innerHTML = "Add another.";
    addEventListener(button, "click", function() {
        // Insert a new element.
        var item = itemCreator();
        listView.insertBefore(item, button);
    });
    listView.appendChild(button);

    return listView;
}
/**
 * Returns a list of 2-D vertex coordinates that will create
 * a rectangle, centered at the specified position.
 */
function parsegraph_generateRectangleVertices(x, y, w, h)
{
    return [
        x - w / 2, y - h / 2,
        x + w / 2, y - h / 2,
        x + w / 2, y + h / 2,

        x - w / 2, y - h / 2,
        x + w / 2, y + h / 2,
        x - w / 2, y + h / 2
    ];
}

function getVerts(width, length, height)
{
    return [
        // Front
        [-width, length, height], // v0
        [ width, length, height], // v1
        [ width, length,-height], // v2
        [-width, length,-height], // v3

        // Back
        [ width,-length, height], // v4
        [-width,-length, height], // v5
        [-width,-length,-height], // v6
        [ width,-length,-height], // v7

        // Left
        [width, length, height], // v1
        [width,-length, height], // v4
        [width,-length,-height], // v7
        [width, length,-height], // v2

        // Right
        [-width,-length, height], // v5
        [-width, length, height], // v0
        [-width, length,-height], // v3
        [-width,-length,-height], // v6

        // Top
        [ width, length, height], // v1
        [-width, length, height], // v0
        [-width,-length, height], // v5
        [ width,-length, height], // v4

        // Bottom
        [ width,-length,-height], // v7
        [-width,-length,-height], // v6
        [-width, length,-height], // v3
        [ width, length,-height] //v2
    ];
}

function parsegraph_generateRectangleTexcoords()
{
    return [
        0, 0,
        1, 0,
        1, 1,

        0, 0,
        1, 1,
        0, 1
    ];
}

// The following methods were copied from webglfundamentals.org:

/**
 * Creates and compiles a shader.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
function compileShader(gl, shaderSource, shaderType) {
  // Create the shader object
  var shader = gl.createShader(shaderType);
 
  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);
 
  // Compile the shader
  gl.compileShader(shader);
 
  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw new Error("Could not compile shader: " + gl.getShaderInfoLog(shader));
  }
 
  return shader;
}

/**
 * Creates a program from 2 shaders.
 *
 * @param {!WebGLRenderingContext) gl The WebGL context.
 * @param {!WebGLShader} vertexShader A vertex shader.
 * @param {!WebGLShader} fragmentShader A fragment shader.
 * @return {!WebGLProgram} A program.
 */
function createProgram(gl, vertexShader, fragmentShader) {
  // create a program.
  var program = gl.createProgram();
 
  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
 
  // link the program.
  gl.linkProgram(program);
 
  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      // something went wrong with the link
      throw ("program filed to link:" + gl.getProgramInfoLog (program));
  }
 
  return program;
};

/**
 * Creates a shader from the content of a script tag.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} scriptId The id of the script tag.
 * @param {string} opt_shaderType. The type of shader to create.
 *     If not passed in will use the type attribute from the
 *     script tag.
 * @return {!WebGLShader} A shader.
 */
function createShaderFromScriptTag(gl, scriptId, opt_shaderType) {
  // look up the script tag by id.
  var shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw("*** Error: unknown script element: " + scriptId);
  }
 
  // extract the contents of the script tag.
  var shaderSource = shaderScript.text;
 
  // If we didn't pass in a type, use the 'type' from
  // the script tag.
  if (!opt_shaderType) {
    if (shaderScript.type == "x-shader/x-vertex") {
      opt_shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type == "x-shader/x-fragment") {
      opt_shaderType = gl.FRAGMENT_SHADER;
    } else if (!opt_shaderType) {
      throw("*** Error: shader type not set");
    }
  }
 
  return compileShader(gl, shaderSource, opt_shaderType);
};

/**
 * Creates a program from 2 script tags.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} vertexShaderId The id of the vertex shader script tag.
 * @param {string} fragmentShaderId The id of the fragment shader script tag.
 * @return {!WebGLProgram} A program
 */
function createProgramFromScripts(
    gl, vertexShaderId, fragmentShaderId) {
  var vertexShader = createShaderFromScriptTag(gl, vertexShaderId);
  var fragmentShader = createShaderFromScriptTag(gl, fragmentShaderId);
  return createProgram(gl, vertexShader, fragmentShader);
}

function resize(gl) {
  // Get the canvas from the WebGL context
  var canvas = gl.canvas;

  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;

    // Set the viewport to match
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}

function matrixIdentity3x3()
{
    return [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
}

function matrixCopy3x3(src)
{
    return [
        src[0], src[1], src[2],
        src[3], src[4], src[5],
        src[6], src[7], src[8]
    ];
}

function matrixMultiply3x3()
{
    if(arguments.length === 0) {
        throw new Error("At least two matrices must be provided.");
    }
    if(arguments.length === 1) {
        return arguments[0];
    }
    var rv = matrixCopy3x3(arguments[0]);
    for(var i = 1; i < arguments.length; ++i) {
        var a = rv;
        var b = arguments[i];
        rv = [
            a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
            a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
            a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

            a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
            a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
            a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

            a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
            a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
            a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
        ];
    }

    return rv;
}

function matrixTransform2D(world, x, y)
{
    return [
        world[0] * x + world[1] * y + world[2],
        world[3] * x + world[4] * y + world[5]
    ];
}

function makeTranslation3x3(tx, ty) {
    return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1
    ];
}

function makeRotation3x3(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
        c,-s, 0,
        s, c, 0,
        0, 0, 1
    ];
}

function makeScale3x3(sx, sy) {
    if(arguments.length === 1) {
        sy = sx;
    }
    return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1
    ];
}

// http://stackoverflow.com/questions/983999/simple-3x3-matrix-inverse-code-c
function makeInverse3x3(input)
{
    var m = function(col, row) {
        return input[row * 3 + col];
    };
    // computes the inverse of a matrix m
    var det = m(0, 0) * (m(1, 1) * m(2, 2) - m(2, 1) * m(1, 2)) -
                 m(0, 1) * (m(1, 0) * m(2, 2) - m(1, 2) * m(2, 0)) +
                 m(0, 2) * (m(1, 0) * m(2, 1) - m(1, 1) * m(2, 0));

    var invdet = 1 / det;

    return [
        (m(1, 1) * m(2, 2) - m(2, 1) * m(1, 2)) * invdet,
        (m(0, 2) * m(2, 1) - m(0, 1) * m(2, 2)) * invdet,
        (m(0, 1) * m(1, 2) - m(0, 2) * m(1, 1)) * invdet,
        (m(1, 2) * m(2, 0) - m(1, 0) * m(2, 2)) * invdet,
        (m(0, 0) * m(2, 2) - m(0, 2) * m(2, 0)) * invdet,
        (m(1, 0) * m(0, 2) - m(0, 0) * m(1, 2)) * invdet,
        (m(1, 0) * m(2, 1) - m(2, 0) * m(1, 1)) * invdet,
        (m(2, 0) * m(0, 1) - m(0, 0) * m(2, 1)) * invdet,
        (m(0, 0) * m(1, 1) - m(1, 0) * m(0, 1)) * invdet
    ];
}

function midPoint(x1, y1, x2, y2)
{
    return [
        x1 + (x2 - x1) * .5,
        y1 + (y2 - y1) * .5
    ];
}

function make2DProjection(width, height)
{
    return [
        2 / width, 0, 0,
        0, -2 / height, 0,
        -1, 1, 1
    ];
};

function subtractVectors3D(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize3D(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function cross3D(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

function makePerspective(fieldOfViewInRadians, aspect, near, far)
{
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  var rangeInv = 1.0 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ];
};

function makeTranslation4x4(tx, ty, tz) {
  return [
     1,  0,  0,  0,
     0,  1,  0,  0,
     0,  0,  1,  0,
    tx, ty, tz,  1
  ];
}

function makeXRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ];
};

function makeYRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ];
};

function makeZRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return [
     c, s, 0, 0,
    -s, c, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1,
  ];
}

function makeScale4x4(sx, sy, sz) {
  return [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ];
}

function matrixMultiply4x4(a, b) {
  var a00 = a[0*4+0];
  var a01 = a[0*4+1];
  var a02 = a[0*4+2];
  var a03 = a[0*4+3];
  var a10 = a[1*4+0];
  var a11 = a[1*4+1];
  var a12 = a[1*4+2];
  var a13 = a[1*4+3];
  var a20 = a[2*4+0];
  var a21 = a[2*4+1];
  var a22 = a[2*4+2];
  var a23 = a[2*4+3];
  var a30 = a[3*4+0];
  var a31 = a[3*4+1];
  var a32 = a[3*4+2];
  var a33 = a[3*4+3];
  var b00 = b[0*4+0];
  var b01 = b[0*4+1];
  var b02 = b[0*4+2];
  var b03 = b[0*4+3];
  var b10 = b[1*4+0];
  var b11 = b[1*4+1];
  var b12 = b[1*4+2];
  var b13 = b[1*4+3];
  var b20 = b[2*4+0];
  var b21 = b[2*4+1];
  var b22 = b[2*4+2];
  var b23 = b[2*4+3];
  var b30 = b[3*4+0];
  var b31 = b[3*4+1];
  var b32 = b[3*4+2];
  var b33 = b[3*4+3];
  return [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
          a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
          a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
          a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
          a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
          a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
          a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
          a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
          a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
          a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
          a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
          a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
          a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
          a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
          a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
          a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];
}

function makeInverse4x4(m) {
  var m00 = m[0 * 4 + 0];
  var m01 = m[0 * 4 + 1];
  var m02 = m[0 * 4 + 2];
  var m03 = m[0 * 4 + 3];
  var m10 = m[1 * 4 + 0];
  var m11 = m[1 * 4 + 1];
  var m12 = m[1 * 4 + 2];
  var m13 = m[1 * 4 + 3];
  var m20 = m[2 * 4 + 0];
  var m21 = m[2 * 4 + 1];
  var m22 = m[2 * 4 + 2];
  var m23 = m[2 * 4 + 3];
  var m30 = m[3 * 4 + 0];
  var m31 = m[3 * 4 + 1];
  var m32 = m[3 * 4 + 2];
  var m33 = m[3 * 4 + 3];
  var tmp_0  = m22 * m33;
  var tmp_1  = m32 * m23;
  var tmp_2  = m12 * m33;
  var tmp_3  = m32 * m13;
  var tmp_4  = m12 * m23;
  var tmp_5  = m22 * m13;
  var tmp_6  = m02 * m33;
  var tmp_7  = m32 * m03;
  var tmp_8  = m02 * m23;
  var tmp_9  = m22 * m03;
  var tmp_10 = m02 * m13;
  var tmp_11 = m12 * m03;
  var tmp_12 = m20 * m31;
  var tmp_13 = m30 * m21;
  var tmp_14 = m10 * m31;
  var tmp_15 = m30 * m11;
  var tmp_16 = m10 * m21;
  var tmp_17 = m20 * m11;
  var tmp_18 = m00 * m31;
  var tmp_19 = m30 * m01;
  var tmp_20 = m00 * m21;
  var tmp_21 = m20 * m01;
  var tmp_22 = m00 * m11;
  var tmp_23 = m10 * m01;

  var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

  var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

  return [
    d * t0,
    d * t1,
    d * t2,
    d * t3,
    d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
          (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
    d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
          (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
    d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
          (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
    d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
          (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
    d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
          (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
    d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
          (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
    d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
          (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
    d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
          (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
    d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
          (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
    d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
          (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
    d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
          (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
    d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
          (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
  ];
}

function matrixVectorMultiply4x4(v, m) {
  var dst = [];
  for (var i = 0; i < 4; ++i) {
    dst[i] = 0.0;
    for (var j = 0; j < 4; ++j)
      dst[i] += v[j] * m[j * 4 + i];
  }
  return dst;
};

/**
 * Returns a 4x4 matrix that, positioned from the camera position,
 * looks at the target, a position in 3-space, angled using the
 * up vector.
 */
function makeLookAt(cameraPosition, target, up) {
  var zAxis = normalize3D(
      subtractVectors3D(cameraPosition, target));
  var xAxis = cross3D(up, zAxis);
  var yAxis = cross3D(zAxis, xAxis);

  return [
     xAxis[0], xAxis[1], xAxis[2], 0,
     yAxis[0], yAxis[1], yAxis[2], 0,
     zAxis[0], zAxis[1], zAxis[2], 0,
     cameraPosition[0],
     cameraPosition[1],
     cameraPosition[2],
     1];
}

// End methods from webglfundamentals.org
function parsegraph_SingleGraphApplication()
{
}

/**
 * Creates a new parsegraph_Surface.
 */
parsegraph_SingleGraphApplication.prototype.createSurface = function() {
    return new parsegraph_Surface();
};

parsegraph_SingleGraphApplication.prototype.createGraph = function(surface) {
    var graph = new parsegraph_Graph(this._surface);
    GRAPH = graph;
    return graph;
};

parsegraph_SingleGraphApplication.prototype.start = function(container) {
    // Always immediately initialize constants for use by application objects.
    parsegraph_initialize();

    // Create and globalize the graph.
    this._surface = this.createSurface();
    this._graph = this.createGraph();
    this._container = container;
    this._glyphAtlas = null;

    // Start initializing by loading Unicode for text.
    var uni = new parsegraph_Unicode();
    this._unicode = uni;
    var that = this;
    uni.onLoad = function() {
        that.onUnicodeLoaded.call(that);
    };
    uni.load();

    // Export the Unicode instance.
    parsegraph_UNICODE_INSTANCE = uni;
};

parsegraph_SingleGraphApplication.prototype.sessionNode = function() {
    return this._sessionNode;
};

parsegraph_SingleGraphApplication.prototype.createSessionNode = function(graph, userLogin, node) {
    var car = new parsegraph_Caret('b');
    car.setGlyphAtlas(graph.glyphAtlas());
    car.label("Hello, " + userLogin.username + ".");
    return car.node();
};

parsegraph_SingleGraphApplication.prototype.onLogout = function() {
    //console.log("onLogout");
    this._sessionNode.disconnectNode();
    this._sessionNode = null;
};

parsegraph_SingleGraphApplication.prototype.onLogin = function(userLogin, node) {
    var graph = this.graph();

    try {
        var createdNode = this.createSessionNode(graph, userLogin, node);
        if(!createdNode) {
            if(!node.hasNode(parsegraph_DOWNWARD)) {
                throw new Error("Factory function does not return a node, nor did it connect one.");
            }
            else {
                // Check if the created node was already connected.
                createdNode = node.nodeAt(parsegraph_DOWNWARD);
            }
        }
        else {
            node.connectNode(parsegraph_DOWNWARD, createdNode);
        }
        this._sessionNode = createdNode;
    }
    catch(ex) {
        console.log("Crashed during login construction: ", ex);
    }

    if(!this._environmentProtocol) {
        this._environmentProtocol = new parsegraph_EnvironmentProtocol(new WebSocket(
            "ws://localhost:8080/environment/live", "parsegraph-environment-protocol"
        ), graph,
            function(obj) {
                console.log(obj);
                //graph.cameraBox().setCamera(userLogin.username, obj);
            }, this
        );
    }
};

parsegraph_SingleGraphApplication.prototype.graph = function() {
    return this._graph;
};
parsegraph_SingleGraphApplication.prototype.unicode = function() {
    return this._unicode;
};
parsegraph_SingleGraphApplication.prototype.surface = function() {
    return this._surface;
};
parsegraph_SingleGraphApplication.prototype.glyphAtlas = function() {
    return this._glyphAtlas;
};

parsegraph_SingleGraphApplication.prototype.renderTimer = function() {
    return this._renderTimer;
};

parsegraph_SingleGraphApplication.prototype.onRender = function() {
    //console.log("Rendering");
    var graph = this.graph();
    var surface = this.surface();

    graph.input().Update(new Date());
    var t = alpha_GetTime();
    start = t;
    if(graph.needsRepaint()) {
        surface.paint(50);
    }
    surface.render();
    if(graph.input().UpdateRepeatedly() || graph.needsRepaint()) {
        if(this._cameraProtocol && graph.input().UpdateRepeatedly()) {
            this._cameraProtocol.update();
        }
        this._renderTimer.schedule();
    }
    //console.log("Done");
};

parsegraph_SingleGraphApplication.prototype.cameraName = function() {
    return "parsegraph_login_camera";
};

parsegraph_SingleGraphApplication.prototype.container = function() {
    return this._container;
};

parsegraph_SingleGraphApplication.prototype.loginWidget = function() {
    return this._loginWidget;
};

parsegraph_SingleGraphApplication.prototype.scheduleRender = function() {
    if(this._renderTimer) {
        this._renderTimer.schedule();
    }
};

parsegraph_SingleGraphApplication.prototype.scheduleRepaint = function() {
    this._graph.scheduleRepaint();
};

parsegraph_SingleGraphApplication.prototype.onUnicodeLoaded = function() {
    //console.log("Unicode loaded")
    // Verify preconditions for this application state.
    var graph = this.graph();
    var surface = this.surface();
    var uni = this.unicode();
    if(!graph) {
        throw new Error("A graph must have already been constructed.");
    }
    if(!surface) {
        throw new Error("A surface must have already been constructed.");
    }
    if(!uni) {
        throw new Error("A Unicode object must have already been constructed.");
    }

    // Create and set the glyph atlas if necessary.
    if(!this._glyphAtlas) {
        this._glyphAtlas = parsegraph_buildGlyphAtlas();
        graph.setGlyphAtlas(this.glyphAtlas());
        graph.glyphAtlas().setUnicode(uni);
    }

    this.container().appendChild(surface.container());

    this._loginWidget = new parsegraph_LoginWidget(surface, graph);
    this._loginWidget.authenticate();
    graph.world().plot(this._loginWidget.root());

    var cameraProtocol;

    this._loginWidget.setLoginListener(function(res, userLogin, node) {
        //console.log("Logged in")
        this.onLogin(userLogin, node);
        this._loginWidget.setLogoutListener(function() {
            this.onLogout(userLogin, node);
        }, this);
    }, this);

    var cameraName = this.cameraName();
    if(typeof cameraName === "string" && localStorage.getItem(cameraName) != null) {
        try {
            var cameraData = JSON.parse(localStorage.getItem(cameraName));
            graph.camera().restore(cameraData);
        } catch(e) {
            console.log(
                "Failed to parse saved camera state.\n" + parsegraph_writeError(e)
            );
        }
    }

    // Schedule the repaint.
    this._renderTimer = new parsegraph_AnimationTimer();
    var start = alpha_GetTime();
    this._renderTimer.setListener(function() {
        this.onRender();
    }, this);
    this._graph.input().SetListener(function(affectedPaint, eventSource, inputAffectedCamera) {
        if(affectedPaint) {
            this._graph.scheduleRepaint();
        }
        this.scheduleRender();
        if(inputAffectedCamera) {
            if(this._cameraProtocol) {
                this._cameraProtocol.update();
            }
            if(typeof cameraName === "string") {
                localStorage.setItem(cameraName, JSON.stringify(this._graph.camera().toJSON()));
            }
        }
    }, this);
    this.scheduleRender();
    this._graph.onScheduleRepaint = function() {
        this.scheduleRender();
    };
    this._graph.onScheduleRepaintThisArg = this;
};
function parsegraph_ArrayList()
{
    this.data = [];
    this._length = 0;
}

parsegraph_ArrayList.prototype.clear = function()
{
    this._length = 0;
}

parsegraph_ArrayList.prototype.length = function()
{
    return this._length;
}

parsegraph_ArrayList.prototype.slice = function()
{
    return this.data.slice(0, this._length);
}

parsegraph_ArrayList.prototype.push = function()
{
    for(var i = 0; i < arguments.length; ++i) {
        if(this._length == this.data.length) {
            this.data.push(arguments[i]);
        }
        else {
            this.data[this._length] = arguments[i];
        }
        this._length++;
    }
}

parsegraph_ArrayList.prototype.at = function(i)
{
    if(i >= this.length || i < 0) {
        throw new Error("Index out of bounds: " + i);
    }
    return this.data[i];
}

parsegraph_ArrayList_Tests = new parsegraph_TestSuite("parsegraph_ArrayList");


parsegraph_ArrayList_Tests.addTest("new parsegraph_ArrayList", function() {
    var l = new parsegraph_ArrayList();
});
function parsegraph_Float32List()
{
    this.data = new Float32Array(8);
    this._length = 0;
}

parsegraph_Float32List.prototype.push = function()
{
    for(var i = 0; i < arguments.length; ++i) {
        if(this._length == this.data.length) {
            var created = new Float32Array(2 * this.data.length);
            for(var i = 0; i < this.data.length; ++i) {
                created[i] = this.data[i];
            }
            this.data = created;
        }
        var v = arguments[i];
        if(Number.isNaN(v)) {
            throw new Error("Pushed value is NaN");
        }
        this.data[this._length++] = v;
    }
}

parsegraph_Float32List.prototype.clear = function()
{
    this._length = 0;
}

parsegraph_Float32List.prototype.length = function()
{
    return this._length;
}

parsegraph_Float32List.prototype.slice = function()
{
    return this.data.subarray(0, this._length);
}

var audioTransition = 1.2;
function alpha_WeetCubeWidget()
{
    var surface;
    if(arguments.length === 0) {
        surface = new parsegraph_Surface();
    }
    else {
        surface = arguments[0];
    }
    this.surface = surface;

    this.camera = new alpha_Camera(surface);
    this.camera.SetFovX(60);
    this.camera.SetFarDistance(1000);
    this.camera.SetNearDistance(.1);

    this.input = new alpha_Input(surface, this.camera);
    this.input.SetMouseSensitivity(.4);

    this.input.SetOnKeyDown(this.onKeyDown, this);

    this.cubePainter = null;
    this.rotq = 0;
    this._elapsed = 0;
    this._frozen = false;
    var amt = 7;
    this._xMax = amt;
    this._yMax = amt;
    this._zMax = amt;

    this._audioOut=null;

    this._freqs=[440*1.33, 440, 440*.67, 440*.67*.67, 440*.67*.67*.67];

    var randomFrequencyNodeCreator = function(nodeType, minFreq, freqRange) {
        return function(audio) {
            var osc=audio.createOscillator();
            //osc.type=nodeType;
            var tRand = Math.random();
            if(tRand < .1) {
                osc.type = "triangle";
            }
            else if(tRand < .6) {
                osc.type='sawtooth';
            }
            else if(tRand < .8) {
                osc.type='sine';
            }
            else {
                osc.type='square';
            }
            osc.frequency.value=minFreq+Math.random()*freqRange;
            osc.start();
            var g = audio.createGain();
            g.gain.setValueAtTime(0, audio.currentTime);
            g.gain.linearRampToValueAtTime(0.8, audio.currentTime + audioTransition);
            osc.connect(g);
            return g;
        };
    };

    var fixedFrequencyNodeCreator = function(nodeType, freqs) {
        return function(audio) {
            var osc=audio.createOscillator();
            osc.type=nodeType;
            osc.frequency.value=freqs[this._nodesPainted%freqs.length];
            osc.start();
            var g = audio.createGain();
            g.gain.setValueAtTime(0, audio.currentTime);
            g.gain.linearRampToValueAtTime(0.8, audio.currentTime + audioTransition);
            osc.connect(g);
            return g;
        }
    };

    this._audioModes = [
        randomFrequencyNodeCreator("sawtooth", 24, 64),
        fixedFrequencyNodeCreator("sine", this._freqs),
        randomFrequencyNodeCreator("square", 16, 128),
        randomFrequencyNodeCreator("triangle", 64, 1024),
        fixedFrequencyNodeCreator("sawtooth", this._freqs),
        fixedFrequencyNodeCreator("triangle", this._freqs),
        randomFrequencyNodeCreator("sine", 320, 640),
        randomFrequencyNodeCreator("sawtooth", 64, 96),
    ];

    this._currentAudioMode = 0;
    /*this._audioModes = [function(audio) {
        var osc=audio.createOscillator();
        osc.type='sawtooth';
        //osc.type = "square";
        //osc.type = "sine";
        if(osc.type === "sine" || osc.type === "triangle") {
            //osc.frequency.value=freqs[z%freqs.length];
            osc.frequency.value=Math.max(320, 320+Math.random()*980);//freqs[z%freqs.length];
        }
        else if (osc.type === "square") {
            osc.frequency.value=this._freqs[this._nodesPainted%this._freqs.length];
            //osc.frequency.value=Math.max(4, Math.random()*200);//freqs[z%freqs.length];
        }
        else if(osc.type === "sawtooth") {
            osc.frequency.value=Math.max(320, 320+Math.random()*200);//freqs[z%freqs.length];
        }else {
            osc.frequency.value=Math.min(1000, Math.random()*4000);//freqs[z%freqs.length];
            //osc.frequency.value=freqs[z%freqs.length];
        }
        //osc.type = "square";
        //osc.frequency.value=Math.max(8, Math.random()*100);
        osc.start();
        //console.log(c.position);

        var randZ = Math.random() * 30;
        var randY = Math.random() * 5;
        //console.log(i, j, k, randY, randZ);
        var g = audio.createGain();
        //g.gain.setValueAtTime(0.1, audio.currentTime);
        g.gain.setValueAtTime(0, audio.currentTime);
        g.gain.linearRampToValueAtTime(audio.currentTime + 0.8, .1);
        //g.gain.exponentialRampToValueAtTime(.01, audio.currentTime + randY);
        //g.gain.linearRampToValueAtTime(0, audio.currentTime + randY + randZ);
        osc.connect(g);
        return g;
    }
    //this.createSquareAudioNode,
    //this.createSineAudioNode,
    //this.createTriangleAudioNode,
    //this.createSawtoothAudioNode
];
    this._audioModes = [this.createSineAudioNode, this.createSawtoothAudioNode];
    */

    this.camera.GetParent().SetPosition(-1, -1, this._zMax * -5.0);
    this.camera.GetParent().SetOrientation(alpha_QuaternionFromAxisAndAngle(
        0, 1, 0, Math.PI
    ));
}

alpha_WeetCubeWidget.prototype.createAudioNode = function(audio)
{
    var creator = this._audioModes[this._currentAudioMode];
    var n = creator.call(this, audio);
    //console.log("Creating audio node: ", this._currentAudioMode, n);
    return n;
};

alpha_WeetCubeWidget.prototype.onKeyDown = function(key)
{
    //console.log(key);
    switch(key) {
    case "Enter":
    case "Return":
        this.switchAudioMode();
        return true;
    default:
        // Key unhandled.
        return false;
    }
};

alpha_WeetCubeWidget.prototype.switchAudioMode = function()
{
    this._currentAudioMode = (this._currentAudioMode + 1) % this._audioModes.length;
    this._modeSwitched = true;
};

alpha_WeetCubeWidget.prototype.Tick = function(elapsed, frozen)
{
    if(elapsed === undefined || Number.isNaN(elapsed)) {
        throw new Error("elapsed must be provided.");
    }

    this.input.Update(elapsed);
    this._elapsed = elapsed;
    this._frozen = frozen;
}

alpha_WeetCubeWidget.prototype.refresh = function()
{
    if(this.cubePainter) {
        this.cubePainter.Init(this._xMax * this._yMax * this._zMax);
    }
}

alpha_WeetCubeWidget.prototype.setMax = function(max)
{
    this._xMax = max;
    this._yMax = max;
    this._zMax = max;
    this.refresh();
}

alpha_WeetCubeWidget.prototype.setXMax = function(xMax)
{
    this._xMax = xMax;
    this.refresh();
};

alpha_WeetCubeWidget.prototype.setYMax = function(yMax)
{
    this._yMax = yMax;
    this.refresh();
};

alpha_WeetCubeWidget.prototype.setZMax = function(zMax)
{
    this._zMax = zMax;
    this.refresh();
};

alpha_WeetCubeWidget.prototype.setRotq = function(rotq)
{
    this.rotq = rotq;
};

alpha_WeetCubeWidget.prototype.paint = function()
{
    var elapsed = this._elapsed;
    var rotq = this.rotq;
    var audio=this.surface.audio();
    if(!this.cubePainter) {
        this.cubePainter = new alpha_WeetPainter(this.surface.gl());
        this.cubePainter.Init(this._xMax * this._yMax * this._zMax);
    }
    else {
        this.cubePainter.Clear();
    }

    if(!this._audioOut) {
        //console.log("Creating audio out");
        this._audioOut=audio.createGain();
        var compressor = audio.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.reduction.value = -20;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        compressor.connect(audio.destination);
        this._audioCompressorOut=compressor;
        this._audioOut.connect(compressor);
        this._modeAudioNodes = [];
        this._audioNodes = [];
        this._audioNodePositions = [];
    }
    else if(this._modeSwitched) {
        var oldModeNodes = [].concat(this._modeAudioNodes);
        setTimeout(function() {
            oldModeNodes.forEach(function(node) {
                node.disconnect();
            });
        }, 1000 * (audioTransition + 0.1));
    }
    var createAudioNodes = this._audioNodes.length == 0;

    var c = new alpha_Physical(this.camera);
    var az=0;

    this._nodesPainted = 0;
    var panner;


    var cubeSize = 1;
    for(var i = 0; i < this._xMax; ++i) {
        for(var j = 0; j < this._yMax; ++j) {
            for(var k = 0; k < this._zMax; ++k) {
                c.modelMode = alpha_PHYSICAL_ROTATE_TRANSLATE_SCALE;
                c.SetScale(1, 1, 1);
                c.orientation.Set(0, 0, 0, 1);
                c.position.Set(0, 0, 0);
                c.scale.Set(1, 1, 1);
                c.Rotate(rotq*2*k/10, 0, 1, 1);
                c.Rotate(rotq*2*i/15, 1, 0, 0);
                c.Rotate(rotq*2*j/10, 1, 0, 1);
                c.SetPosition(3*i, 3*j, 3*k);
                c.SetScale(cubeSize, cubeSize, cubeSize);
                this.cubePainter.Cube(c.GetModelMatrix());
                var makeAudio = Math.random() < .1;
                if(createAudioNodes && makeAudio) {
                    var node = this.createAudioNode(audio);
                    panner=audio.createPanner();
                    panner.panningModel = 'HRTF';
                    panner.distanceModel = 'exponential';
                    panner.rolloffFactor = 2;
                    panner.coneInnerAngle = 360;
                    panner.coneOuterAngle = 0;
                    panner.coneOuterGain = 0;
                    panner.connect(this._audioOut);
                    node.connect(panner);
                    this._modeAudioNodes.push(node);
                    this._audioNodes.push(panner);
                    this._audioNodePositions.push(this._nodesPainted);
                }
                else if(this._nodesPainted === this._audioNodePositions[az]) {
                    panner = this._audioNodes[az];
                    if(this._modeSwitched) {
                        this._modeAudioNodes[az].gain.linearRampToValueAtTime(0, audio.currentTime + audioTransition);
                        var node = this.createAudioNode(audio);
                        this._modeAudioNodes[az] = node;
                        node.connect(panner);
                    }
                    az++;
                } else {
                    panner = null;
                }

                if(panner) {
                    var wv=c.GetModelMatrix();
                    var cx, cy, cz;
                    cx = c.position[0] + cubeSize/2;
                    cy = c.position[1] + cubeSize/2;
                    cz = c.position[2] + cubeSize/2;
                    cx = wv[12];
                    cy = wv[13];
                    cz = wv[14];
                    //console.log(cx, cy, cz);
                    if(panner.positionX) {
                        panner.positionX.value=cx;
                        panner.positionY.value=cy;
                        panner.positionZ.value=cz;
                    }
                    else {
                        panner.setPosition(cx, cy, cz);
                    }
                }
                ++this._nodesPainted;
            }
        }

        // Not really necessary, but just constraining the value of this so it
        // doesn't get massive when running in the background.
        if(rotq >= 360) {
            rotq = 0;
        }
        if(!this._frozen) {
            rotq = rotq + 0.2 * elapsed;
        }
    }
    //console.log("dataX=" + this.cubePainter._dataX);

    this._modeSwitched = false;
    this.rotq = rotq;
    if(this._listener) {
        this._listener.call(this._listenerThisArg);
    }
};

alpha_WeetCubeWidget.prototype.setUpdateListener = function(listener, listenerThisArg)
{
    this._listener = listener;
    this._listenerThisArg = listenerThisArg || this;
}

alpha_WeetCubeWidget.prototype.render = function()
{
    var gl = this.surface.gl();
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    audio = this.surface.audio();
    var listener=audio.listener;
    if(listener.forwardX) {
  listener.forwardX.value = 0;
  listener.forwardY.value = 0;
  listener.forwardZ.value = -1;
  listener.upX.value = 0;
  listener.upY.value = 1;
  listener.upZ.value = 0;
} else {
  listener.setOrientation(0,0,-1,0,1,0);
}

    var cm=this.camera.GetParent().GetModelMatrix();
    var xPos=cm[12];
    var yPos=cm[13];
    var zPos=cm[14];
    if(listener.positionX) {
      listener.positionX.value = xPos;
      listener.positionY.value = yPos;
      listener.positionZ.value = zPos;
    } else {
      listener.setPosition(xPos,yPos,zPos);
    }
    //console.log(xPos + ", " + yPos + ", " + zPos);

    var projection;
    if(arguments.length > 0) {
        projection = this.camera.UpdateProjection(arguments[0], arguments[1]);
    }
    else {
        projection = this.camera.UpdateProjection();
    }
    //console.log("projection is" + projection.toString());
    var viewMatrix = this.camera.GetViewMatrix().Multiplied(projection);
    //console.log("CameraViewMatrix is" + this.camera.GetViewMatrix().toString());
    //console.log("viewMatrix is " + viewMatrix.toString());
    this.cubePainter.Draw(viewMatrix);
    gl.clear(gl.DEPTH_BUFFER_BIT);
};
function parsegraph_timeout(name, timeoutMs)
{
    if(arguments.length === 1) {
        if(typeof arguments[0] === "number") {
            name = null;
            timeoutMs = arguments[0];
        }
        else {
            timeoutMs = parsegraph_TIMEOUT;
        }
    }
    else if(arguments.length === 0) {
        name = null;
        timeoutMs = parsegraph_TIMEOUT;
    }
    var startTime = parsegraph_getTimeInMillis();
    return function() {
        if(parsegraph_getTimeInMillis() - startTime <= timeoutMs) {
            // Not timed out yet.
            return;
        }

        // Report the timeout.
        if(name) {
            throw new Error("Timeout '" + name + "' after " + timeoutMs + "msecs exceeded.");
        }
        throw new Error("Timeout after " + timeoutMs + "msecs exceeded.");
    };
}

function parsegraph_AnimationTimer()
{
    this.timerId = null;

    var that = this;
    this.fire = function() {
        that.timerId = null;
        if(that.listener) {
            return that.listener[0].apply(that.listener[1], arguments);
        }
    };
};

parsegraph_AnimationTimer.prototype.schedule = function()
{
    // Do nothing if the timer is already scheduled.
    if(this.timerId) {
        return;
    }

    //console.log(new Error("Scheduling animation timer."));
    this.timerId = requestAnimationFrame(this.fire);
};

parsegraph_AnimationTimer.prototype.setListener = function(listener, thisArg)
{
    if(!listener) {
        this.listener = null;
        return;
    }

    this.listener = [listener, thisArg];
};

parsegraph_AnimationTimer.prototype.cancel = function()
{
    if(!this.timerId) {
        return;
    }

    cancelAnimationFrame(this.timerId);
    this.timerId = null;
};

function parsegraph_TimeoutTimer()
{
    this.delay = 0;

    this.timerId = null;

    /**
     * Forwards event arguments to the listener.
     */
    var that = this;
    this.fire = function() {
        that.timerId = null;
        if(that.listener) {
            return that.listener[0].apply(that.listener[1], arguments);
        }
    };
};

parsegraph_TimeoutTimer.prototype.setDelay = function(ms)
{
    this.delay = ms;
};

parsegraph_TimeoutTimer.prototype.delay = function()
{
    return this.delay;
};

parsegraph_TimeoutTimer.prototype.schedule = function()
{
    if(this.timerId) {
        return;
    }

    this.timerId = window.setTimeout(this.fire, this.delay);
};

parsegraph_TimeoutTimer.prototype.setListener = function(listener, thisArg)
{
    if(!listener) {
        this.listener = null;
        return;
    }
    if(!thisArg) {
        thisArg = this;
    }
    this.listener = [listener, thisArg];
};

parsegraph_TimeoutTimer.prototype.cancel = function()
{
    if(this.timerId) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
    }
};

function parsegraph_IntervalTimer()
{
    this.delay = 0;

    this.timerId = null;

    /**
     * Forwards event arguments to the listener.
     */
    var that = this;
    this.fire = function() {
        if(that.listener) {
            return that.listener[0].apply(that.listener[1], arguments);
        }
    };
};

/**
 * Sets the delay, in milliseconds.
 */
parsegraph_IntervalTimer.prototype.setDelay = function(ms)
{
    this.delay = ms;
};

/**
 * Gets the delay, in milliseconds.
 */
parsegraph_IntervalTimer.prototype.delay = function()
{
    return this.delay;
};

parsegraph_IntervalTimer.prototype.schedule = function()
{
    if(this.timerId) {
        return;
    }

    this.timerId = window.setInterval(this.fire, this.delay);
};

parsegraph_IntervalTimer.prototype.setListener = function(listener, thisArg)
{
    if(!listener) {
        this.listener = null;
        return;
    }
    if(!thisArg) {
        thisArg = this;
    }
    this.listener = [listener, thisArg];
};

parsegraph_IntervalTimer.prototype.cancel = function()
{
    if(this.timerId) {
        window.clearInterval(this.timerId);
        this.timerId = null;
    }
};
function parsegraph_BufferPage(pagingBuffer, renderFunc, renderFuncThisArg)
{
    if(!renderFuncThisArg) {
        renderFuncThisArg = this;
    }
    if(!renderFunc) {
        renderFunc = function(gl, numIndices) {
            //console.log("Drawing " + numIndices + " indices");
            gl.drawArrays(gl.TRIANGLES, 0, numIndices);
        };
    }

    this.buffers = [];
    this.glBuffers = [];
    this.needsUpdate = true;
    this.renderFunc = renderFunc;
    this.renderFuncThisArg = renderFuncThisArg;

    // Add a buffer entry for each vertex attribute.
    pagingBuffer._attribs.forEach(function() {
        this.buffers.push([]);
        this.glBuffers.push(null);
    }, this);
}

parsegraph_BufferPage.prototype.isEmpty = function()
{
    if(this.buffers.length === 0) {
        return true;
    }
    for(var j = 0; j < this.buffers.length; ++j) {
        var buffer = this.buffers[j];
        if(buffer.length === 0) {
            return true;
        }
    }
    return false;
}

/**
 * appendData(attribIndex, value1, value2, ...);
 * appendData(attribIndex, valueArray);
 *
 * Adds each of the specified values to the working buffer. If the value is an
 * array, each of its internal values are added.
 */
parsegraph_BufferPage.prototype.appendData = function(attribIndex/*, ... */)
{
    // Ensure attribIndex points to a valid attribute.
    if(attribIndex < 0 || attribIndex > this.buffers.length - 1) {
        throw new Error("attribIndex is out of range. Given: " + attribIndex);
    }
    if(typeof(attribIndex) !== "number") {
        throw new Error("attribIndex must be a number.");
    }

    /**
     * Adds the specified value to the current vertex attribute buffer.
     */
    var pagingBuffer = this;
    var appendValue = function(value) {
        var numAdded = 0;
        if(typeof value.forEach == "function") {
            value.forEach(function(x) {
                numAdded += appendValue.call(this, x);
            }, this);
            return numAdded;
        }
        if(typeof value.length == "number") {
            for(var i = 0; i < value.length; ++i) {
                numAdded += appendValue.call(this, value[i]);
            }
            return numAdded;
        }
        if(Number.isNaN(value) || typeof value != "number") {
            throw new Error("Value is not a number: " + value);
        }
        this.buffers[attribIndex].push(value);
        this.needsUpdate = true;

        return 1;
    };

    // Add each argument individually.
    var cumulativeAdded = 0;
    for(var i = 1; i < arguments.length; ++i) {
        cumulativeAdded += appendValue.call(this, arguments[i]);
    }
    return cumulativeAdded;
};

parsegraph_BufferPage.prototype.appendRGB = function(attribIndex, color)
{
    if(typeof color.r == "function") {
        return this.appendData(attribIndex, color.r(), color.g(), color.b());
    }
    return this.appendData(attribIndex, color.r, color.g, color.b);
};

parsegraph_BufferPage.prototype.appendRGBA = function(attribIndex, color)
{
    if(typeof color.r == "function") {
        return this.appendData(attribIndex, color.r(), color.g(), color.b(), color.a());
    }
    return this.appendData(attribIndex, color.r, color.g, color.b, color.a);
};

/**
 * Manages the low-level paging of vertex attributes. For
 * demonstrations of use, see any painter class.
 */
function parsegraph_PagingBuffer(gl, program)
{
    // Contains vertex attribute information used for drawing. Provide using
    // defineAttrib.
    this._attribs = [];

    // Contains buffer data for each page.
    this._pages = [];

    this._gl = gl;
    this._program = program;
}

function parsegraph_createPagingBuffer(gl, program)
{
    return new parsegraph_PagingBuffer(gl, program);
}

parsegraph_PagingBuffer.prototype.isEmpty = function()
{
    // Check each page's buffer, failing early if possible.
    if(this._pages.length === 0) {
        return true;
    }
    for(var i = 0; i < this._pages.length; ++i) {
        if(this._pages[i].isEmpty()) {
            return true;
        }
    }
    return false;
};

parsegraph_PagingBuffer.prototype.addPage = function(renderFunc, renderFuncThisArg)
{
    // Create a new page.
    var page = new parsegraph_BufferPage(this, renderFunc, renderFuncThisArg);

    // Add the page.
    this._pages.push(page);
    page.id = this._pages.length - 1;

    // Return the working page.
    return page;
};

parsegraph_PagingBuffer.prototype.getWorkingPage = function()
{
    if(this._pages.length === 0) {
        throw new Error("Refusing to create a new page; call addPage()");
    }
    return this._pages[this._pages.length - 1];
};

/**
 * Defines an attribute for data entry.
 *
 * name - the attribute name in this paging buffer's GL program
 * numComponents - the number of components in the named attribute type (1, 2, 3, or 4)
 * drawMode - the WebGL draw mode. Defaults to gl.STATIC_DRAW
 */
parsegraph_PagingBuffer.prototype.defineAttrib = function(name, numComponents, drawMode)
{
    if(drawMode == undefined) {
        drawMode = this._gl.STATIC_DRAW;
    }
    // Add a new buffer entry for this new attribute.
    this._pages.forEach(function(page) {
        page.buffers.push([]);
        page.glBuffers.push(null);
    });

    var attrib = {
        "name": name,
        "numComponents": numComponents,
        "drawMode": drawMode
    };

    attrib.location = this._gl.getAttribLocation(
        this._program,
        attrib.name
    );

    this._attribs.push(attrib);

    return this._attribs.length - 1;
};

parsegraph_PagingBuffer.prototype.appendRGB = function(/**/)
{
    var page = this.getWorkingPage();
    return page.appendRGB.apply(page, arguments);
};

parsegraph_PagingBuffer.prototype.appendRGBA = function(/**/)
{
    var page = this.getWorkingPage();
    return page.appendRGBA.apply(page, arguments);
};

parsegraph_PagingBuffer.prototype.appendData = function(/**/)
{
    var page = this.getWorkingPage();
    return page.appendData.apply(page, arguments);
}

/**
 * Deletes all buffers and empties values.
 */
parsegraph_PagingBuffer.prototype.clear = function()
{
    // Clear the buffers for all pages.
    this._pages.forEach(function(page) {
        this._attribs.forEach(function(attrib, attribIndex) {
            //if(page.glBuffers[attribIndex] != null) {
                //this._gl.deleteBuffer(page.glBuffers[attribIndex]);
                //page.glBuffers[attribIndex] = null;
            //}
            page.buffers[attribIndex] = [];
        }, this);
        page.needsUpdate = true;
    }, this);
};

/**
 * Render each page. This function sets up vertex attribute buffers and calls drawArrays
 * for each page.
 *
 * gl.drawArrays(gl.TRIANGLES, 0, numVertices)
 *
 * where numVertices is calculated from the appended data size / component count. The least-filled
 * buffer is used for the size, if the sizes differ.
 */
parsegraph_PagingBuffer.prototype.renderPages = function()
{
    var count = 0;

    // Enable used vertex attributes.
    this._attribs.forEach(function(attrib) {
        if(attrib.location == -1) {
            return;
        }
        this._gl.enableVertexAttribArray(attrib.location);
    }, this);

    // Draw each page.
    this._pages.forEach(function(page) {
        var numIndices;

        // Prepare each vertex attribute.
        this._attribs.forEach(function(attrib, attribIndex) {
            if(attrib.location == -1) {
                return;
            }
            // Bind the buffer, creating it if necessary.
            if(page.glBuffers[attribIndex] == null) {
                page.glBuffers[attribIndex] = this._gl.createBuffer();
            }
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, page.glBuffers[attribIndex]);

            // Load buffer data if the page needs an update.
            var bufferData = page.buffers[attribIndex];
            if(page.needsUpdate && bufferData.length > 0) {
                //console.log("Pushing bytes to GL");
                parsegraph_glBufferData_BYTES += bufferData.length;
                this._gl.bufferData(
                    this._gl.ARRAY_BUFFER,
                    new Float32Array(bufferData),
                    attrib.drawMode
                );
            }

            // Set up the vertex attribute pointer.
            this._gl.vertexAttribPointer(
                attrib.location,
                attrib.numComponents,
                this._gl.FLOAT,
                false,
                0,
                0
            );

            var thisNumIndices = bufferData.length / attrib.numComponents;
            if(Math.round(thisNumIndices) != thisNumIndices) {
                throw new Error("Odd number of indices for attrib " + attrib.name + ". Wanted " + Math.round(thisNumIndices) + ", but got " + thisNumIndices);
            }
            if(numIndices == undefined) {
                numIndices = thisNumIndices;
            }
            else {
                numIndices = Math.min(numIndices, thisNumIndices);
            }
        }, this);

        // Draw the page's triangles.
        if(numIndices > 0) {
            page.renderFunc.call(page.renderFuncThisArg, this._gl, numIndices);
            count += numIndices/3;
        }

        page.needsUpdate = false;
    }, this);

    // Disable used variables.
    this._attribs.forEach(function(attrib) {
        if(attrib.location == -1) {
            return;
        }
        this._gl.disableVertexAttribArray(attrib.location);
    }, this);

    return count;
};
parsegraph_safeParse = function(text)
{
    if(text === undefined) {
        throw new Error("Text is undefined.");
    }
    try {
        return JSON.parse(text);
    } catch(ex) {
        return {
            "status":"error",
                "message":"Could not read server response due to error reading '" + text + "<br/>" + ex
        };
    }
}

/**
 * Creates a callback that safely parses the XHR response
 * as a JSON object. If the XHR response does not properly
 * parse, then a new JSON object is given.
 */
parsegraph_safeParseCallback = function(callback, callbackThisArg)
{
    return function(xhr) {
        if(callback != undefined) {
            callback.call(callbackThisArg, parsegraph_safeParse(xhr.responseText));
        }
    };
}

/*
 * Constructs a new client for the specified command server.
 */
function parsegraph_CommandClient(serverUrl)
{
    this._serverUrl = serverUrl;
};

/**
 * Returns the URL for server requests.
 */
parsegraph_CommandClient.prototype.serverUrl = function()
{
    return this._serverUrl;
}

parsegraph_CommandClient.prototype.setSession = function(response)
{
    if(response.status != "ok") {
        throw new Error("Response must be valid, got: " + response);
    }

    this._selector = response.selector;
    this._token = response.token;
    this._username = response.username;
}

parsegraph_CommandClient.prototype.discardSession = function()
{
    delete this._selector;
    delete this._token;
    delete this._username;
}

parsegraph_CommandClient.prototype.sessionSelector = function()
{
    return this._selector;
}

parsegraph_CommandClient.prototype.sessionToken = function()
{
    return this._token;
}

parsegraph_CommandClient.prototype.username = function()
{
    return this._username;
}

parsegraph_CommandClient.prototype.setUsername = function(username)
{
    this._username = username;
}

parsegraph_CommandClient.prototype.hasSession = function()
{
    return this._selector !== undefined;
}

parsegraph_CommandClient.prototype.sendRawCommand = function(request, callback, callbackThisArg)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            if(callback != undefined) {
                callback.call(callbackThisArg, xhr);
            }
        }
    };
    xhr.open("POST", this.serverUrl(), true);
    xhr.send(request);
    return xhr;
}

parsegraph_CommandClient.prototype.sendAnonymousCommand = function(
    commandName,
    parameters,
    requestBody,
    callback,
    callbackThisArg)
{
    var request = commandName + "\n";
    request += parameters + "\n";
    request += requestBody;
    return this.sendRawCommand(
        request,
        parsegraph_safeParseCallback(callback, callbackThisArg)
    );
};

parsegraph_CommandClient.prototype.sendCommand = function(
    commandName,
    parameters,
    requestBody,
    callback,
    callbackThisArg)
{
    if(!this.hasSession()) {
        throw new Error("No session available to send with command.");
    }
    var request = commandName + "\n";
    request += "selector=" + this._selector + "&token=" + this._token + "\n";
    request += parameters + "\n";
    request += requestBody;
    return this.sendRawCommand(
        request,
        parsegraph_safeParseCallback(callback, callbackThisArg)
    );
};
function parsegraph_DepthTraversal(root)
{
    this._nodes = [root];
    this._states = [null];
    this._iterationState = [0];
    this._depth = 1;
}

parsegraph_DepthTraversal.prototype.canVisit = function()
{
    return this._depth > 0;
};

/**
 * Visits each node of the given document tree, depth-first.
 *
 * visitor(node, levelState) where node is the visited node, and levelState is the
 * user-defined data common to the children under iteration.
 */
parsegraph_DepthTraversal.prototype.visit = function(visitor, visitorThisArg)
{
    var node = this._nodes[this._nodes.length - 1];
    if(!node) {
        throw new Error("No node available for traversal.");
    }

    // Visit the currently positioned node.
    if(this._iterationState[this._iterationState.length - 1] != 2) {
        var s = visitor.call(visitorThisArg, node, this._states[this._states.length - 1]);
        this._states[this._states.length - 1] = s;
    }

    // Move to the next available node.
    if(this._iterationState[this._iterationState.length - 1] == 0 && node.firstChild) {
        this._iterationState[this._iterationState.length - 1] = 1;
        // The current node has children, so advance to those.
        this._nodes.push(node.firstChild);
        this._states.push(null);
        this._iterationState.push(false);
        this._depth++;
    }
    else if(node.nextSibling) {
        // The current node has a sibling, so advance to that.
        this._nodes[this._nodes.length - 1] = node.nextSibling;
        this._iterationState[this._iterationState.length - 1] = 0;
    }
    else {
        // The current node has nothing to advance to, so retreat.
        visitor.call(visitorThisArg, null, this._states[this._states.length - 1]);
        this._nodes.pop();
        this._states.pop();
        this._iterationState.pop();
        this._iterationState[this._iterationState.length - 1] = 2;
        this._depth--;
    }
};

parsegraph_DepthTraversal_Tests = new parsegraph_TestSuite("parsegraph_DepthTraversal");

parsegraph_DepthTraversal_Tests.addTest("parsegraph_DepthTraversal", function() {
    var dom = document.createElement("html");
    dom.appendChild(document.createElement("head"));
    dom.appendChild(document.createElement("body"));
    dom.lastChild.appendChild(document.createElement("div"));
    dom.lastChild.lastChild.appendChild(document.createElement("p"));
    dom.lastChild.appendChild(document.createElement("form"));
    dom.lastChild.appendChild(document.createElement("div"));

    var traversal = new parsegraph_DepthTraversal(dom);
    var i = 0;
    while(traversal.canVisit()) {
        if(i > 100) {
            throw new Error("UNSTOPPABLE");
        }
        ++i;
        traversal.visit(function(node, levelState) {
            //console.log(node, levelState);
            return "LEVEL";
        });
    }
});
// Line length computation must be decoupled from character insertion for correct widths to be calculated
// sanely.
//
// ... or I handle all the cases in-place.

parsegraph_Label_Tests = new parsegraph_TestSuite("parsegraph_Label");

parsegraph_Label_Tests.addTest("parsegraph_buildGlyphAtlas", function() {
    var glyphAtlas = parsegraph_buildGlyphAtlas();
    if(!glyphAtlas) {
        return "No glyph atlas created";
    }
});

parsegraph_Label_Tests.addTest("new parsegraph_Label", function() {
    var glyphAtlas = parsegraph_buildGlyphAtlas();
    var label = new parsegraph_Label(glyphAtlas);
    if(!label) {
        return "No label created";
    }
});

parsegraph_Label_Tests.addTest("parsegraph_Label.label", function() {
    var glyphAtlas = parsegraph_buildGlyphAtlas();
    var label = new parsegraph_Label(glyphAtlas);
    if(!label) {
        return "No label created";
    }

    var car = new parsegraph_Caret('s');
    car.setGlyphAtlas(glyphAtlas);
    car.label("No time");
});

function parsegraph_Line(label, text)
{
    if(!label) {
        throw new Error("Label must not be null");
    }
    this._label = label;

    // The glyphs contains the memory representation of the Unicode string represented by this line.
    //
    // Diacritics are represented as additional characters in Unicode. These characters result in a
    // unique texture rendering of the modified glyph.
    this._glyphs = [];
    this._width = 0;
    this._height = this.glyphAtlas().letterHeight();
    if(arguments.length > 1 && text.length > 0) {
        this.appendText(text);
    }
}

parsegraph_Line_Tests = new parsegraph_TestSuite("parsegraph_Line");

parsegraph_Line_Tests.addTest("new parsegraph_Line", function() {
    var atlas = new parsegraph_GlyphAtlas();
    var label = new parsegraph_Label(atlas);
    var l = new parsegraph_Line(label);
    var f = 0;
    try {
        var l = new parsegraph_Line(null);
        f = 2;
    }
    catch(ex) {
        f = 3;
    }
    if(f !== 3) {
        return "Failed to recognize null label";
    }
});

parsegraph_Line.prototype.isEmpty = function()
{
    return this._width === 0;
}

parsegraph_Line.prototype.glyphAtlas = function()
{
    return this._label.glyphAtlas();
}

parsegraph_Line.prototype.remove = function(pos, count)
{
    var removed = this._glyphs.splice(pos, count);
    removed.forEach(function(glyphData) {
        this._width -= glyphData.width;
    }, this);
}

parsegraph_Line.prototype.appendText = function(text)
{
    var i = 0;
    var atlas = this.glyphAtlas();
    if(!atlas) {
        throw new Error("Line cannot add text without the label having a GlyphAtlas.");
    }
    var u = this.glyphAtlas().unicode();
    if(!u) {
        throw new Error("Unicode definition must be provided.");
    }

    var checkTimeout = parsegraph_timeout("parsegraph_Line.appendText");
    while(true) {
        checkTimeout();

        // Retrieve letter.
        var letter = fixedCharAt(text, i);

        // Test for completion.
        if(letter === null) {
            return;
        }

        var glyphData = atlas.getGlyph(letter);
        this._glyphs.push(glyphData);

        // Increment.
        this._height = Math.max(this._height, glyphData.height);
        this._width += glyphData.width;
        i += letter.length;
    }
};

parsegraph_Line.prototype.insertText = function(pos, text)
{
    var i = 0;
    var atlas = this.glyphAtlas();
    if(!atlas) {
        throw new Error("Line cannot add text without the label having a GlyphAtlas.");
    }
    var checkTimeout = parsegraph_timeout("parsegraph_Line.insertText");

    var spliced = [pos, 0];
    while(true) {
        checkTimeout();

        // Retrieve letter.
        var letter = fixedCharAt(text, i);

        // Test for completion.
        if(letter === null) {
            break;
        }

        var glyphData = atlas.getGlyph(letter);
        spliced.push(glyphData);

        // Increment.
        this._height = Math.max(this._height, glyphData.height);
        this._width += glyphData.width;
        i += letter.length;
    }

    this._glyphs.splice.apply(this._glyphs, spliced);
};

parsegraph_Line.prototype.getText = function()
{
    var t = "";
    this._glyphs.forEach(function(glyphData) {
        t += glyphData.letter;
    });
    return t;
}
parsegraph_Line.prototype.text = parsegraph_Line.prototype.getText;

parsegraph_Line.prototype.linePos = function()
{
    return this._linePos;
}

parsegraph_Line.prototype.label = function()
{
    return this._label;
}

parsegraph_Line.prototype.width = function()
{
    return this._width;
}

parsegraph_Line.prototype.height = function()
{
    return this._height;
}

parsegraph_Line.prototype.posAt = function(limit)
{
    var w = 0;
    for(var i = 0; i < limit && i < this._glyphs.length; ++i) {
        w += this._glyphs[i].width;
    }
    return w;
}

parsegraph_Line.prototype.glyphs = function()
{
    return this._glyphs;
}

//////////////////////////////////////
//
// LABEL CONSTRUCTOR
//
//////////////////////////////////////

function parsegraph_Label(glyphAtlas)
{
    if(!glyphAtlas) {
        throw new Error("Label requires a GlyphAtlas.");
    }
    this._glyphAtlas = glyphAtlas;
    this._wrapWidth = null;
    this._lines = [];
    this._caretLine = 0;
    this._caretPos = 0;
    this._editable = false;
    this._onTextChangedListener = null;
    this._onTextChangedListenerThisArg = null;
}

parsegraph_Label.prototype.glyphAtlas = function()
{
    return this._glyphAtlas;
}

parsegraph_Label.prototype.isEmpty = function()
{
    for(var i = 0; i < this._lines.length; ++i) {
        var l = this._lines[i];
        if(!l.isEmpty()) {
            return false;
        }
    }
    return true;
}

parsegraph_Label_Tests.addTest("isEmpty", function() {
    var atlas = parsegraph_buildGlyphAtlas();
    var l = new parsegraph_Label(atlas);
    if(!l.isEmpty()) {
        return "New label must begin as empty.";
    }
    l.setText("No time");
    if(l.isEmpty()) {
        return "Label with text must test as non-empty.";
    }
});

parsegraph_Label.prototype.forEach = function(func, funcThisArg)
{
    if(!funcThisArg) {
        funcThisArg = this;
    }
    this._lines.forEach(func, funcThisArg);
}

parsegraph_Label.prototype.getText = function()
{
    var t = "";
    this._lines.forEach(function(l) {
        if(t.length > 0) {
            t += '\n';
        }
        t += l.getText();
    });
    return t;
}
parsegraph_Label.prototype.text = parsegraph_Label.prototype.getText;

parsegraph_Label.prototype.setText = function(text)
{
    if(typeof text !== "string") {
        text = "" + text;
    }
    this._lines = [];
    this._currentLine = 0;
    this._currentPos = 0;
    this._width = 0;
    this._height = 0;
    text.split(/\n/).forEach(function(textLine) {
        var l = new parsegraph_Line(this, textLine);
        this._lines.push(l);
        this._width = Math.max(this._width, l.width());
        this._height += l.height();
    }, this);
}

parsegraph_Label.prototype.moveCaretDown = function(world)
{
    console.log("Moving caret down");
}

parsegraph_Label.prototype.moveCaretUp = function(world)
{
    console.log("Moving caret up");
}

parsegraph_Label.prototype.moveCaretBackward = function(world)
{
    if(this._caretPos === 0) {
        if(this._caretLine <= 0) {
            return false;
        }
        this._caretLine--;
        this.caretPos = this._lines[this._caretLine]._glyphs.length;
        return true;
    }
    this._caretPos--;
    return true;
}

parsegraph_Label.prototype.moveCaretForward = function()
{
    if(this._caretPos == this._lines[this._caretLine]._glyphs.length) {
        if(this._caretLine === this._lines.length - 1) {
            // At the end.
            return false;
        }
        this._caretLine++;
        this._caretPos = 0;
        return true;
    }
    this._caretPos++;
    return true;
}

parsegraph_Label.prototype.backspaceCaret = function()
{
    var line = this._lines[this._caretLine];
    if(this._caretPos === 0) {
        if(this._caretLine === 0) {
            // Can't backspace anymore.
            return false;
        }
        this._caretLine--;
        this._caretPos = this._lines[this._caretLine]._glyphs.length;
        this.textChanged();
        return true;
    }
    this._caretPos--;
    line.remove(this._caretPos, 1);
    this._width = null;
    this.textChanged();
    return true;
}

parsegraph_Label.prototype.deleteCaret = function()
{
    var line = this._lines[this._caretLine];
    if(this._caretPos > line._glyphs.length - 1) {
        return false;
    }
    line.remove(this._caretPos, 1);
    this._width = null;
    this.textChanged();
    return true;
}

parsegraph_Label.prototype.ctrlKey = function(key)
{
    switch(key) {
    case "Control":
    case "Alt":
    case "Shift":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowDown":
    case "ArrowUp":
    case "Delete":
    case "Escape":
    case "PageUp":
    case "PageDown":
    case "Home":
    case "End":
    case "CapsLock":
    case "ScrollLock":
    case "NumLock":
    case "Insert":
    case "Break":
    case "Insert":
    case "Enter":
    case "Tab":
    case "Backspace":
    case "F1":
    case "F2":
    case "F3":
    case "F4":
    case "F5":
    case "F6":
    case "F7":
    case "F8":
    case "F9":
    case "F10":
    case "F11":
    case "F12":
    default:
        break;
    }
    return false;
}

parsegraph_Label.prototype.key = function(key)
{
    switch(key) {
    case "Control":
    case "Alt":
    case "Shift":
        break;
    case "ArrowLeft":
        return this.moveCaretBackward();
    case "ArrowRight":
        return this.moveCaretForward();
    case "ArrowDown":
        return this.moveCaretDown();
    case "ArrowUp":
        return this.moveCaretUp();
    case "Delete":
        return this.deleteCaret();
    case "Escape":
        break;
    case "PageUp":
    case "PageDown":
    case "Home":
    case "End":
    case "CapsLock":
    case "ScrollLock":
    case "NumLock":
    case "Insert":
    case "Break":
    case "Insert":
    case "Enter":
    case "Tab":
        break;
    case "Backspace":
        return this.backspaceCaret();
    case "F1":
    case "F2":
    case "F3":
    case "F4":
    case "F5":
    case "F6":
    case "F7":
    case "F8":
    case "F9":
    case "F10":
    case "F11":
    case "F12":
        break;
    default:
        // Insert some character.
        //this.setText(this._labelNode._label.text() + key);

        while(this._caretLine > this._lines.length) {
            this._lines.push(new parsegraph_Line(this));
        }
        var insertLine = this._lines[this._caretLine];
        var insertPos = Math.min(this._caretPos, insertLine._glyphs.length);
        if(insertPos === insertLine._glyphs.length) {
            insertLine.appendText(key);
        }
        else {
            insertLine.insertText(insertPos, key);
        }

        if(this._width !== null) {
            this._width = Math.max(insertLine.width(), this._width);
            this._height = Math.max(this._height, insertLine.height());
        }
        this._caretPos += key.length;
        this.textChanged();
        return true;
    }
    return false;
}

parsegraph_Label.prototype.onTextChanged = function(listener, listenerThisArg)
{
    this._onTextChangedListener = listener;
    this._onTextChangedListenerThisArg = listenerThisArg;
};

parsegraph_Label.prototype.textChanged = function()
{
    if(this._onTextChangedListener) {
        return this._onTextChangedListener.call(this._onTextChangedListenerThisArg, this);
    }
};

parsegraph_Label.prototype.editable = function()
{
    return this._editable;
};

parsegraph_Label.prototype.setEditable = function(editable)
{
    this._editable = editable;
};

parsegraph_Label.prototype.click = function(x, y)
{
    if(y < 0 && x < 0) {
        this._caretLine = 0;
        this._caretPos = 0;
    }
    var curX = 0;
    var curY = 0;
    for(var i = 0; i < this._lines.length; ++i) {
        var line = this._lines[i];
        if(y > curY + line.height() && i != this._lines.length - 1) {
            // Some "next" line.
            curY += line.height();
            continue;
        }
        // Switch the caret line.
        this._caretLine = i;

        if(x < 0) {
            this._caretPos = 0;
            return;
        }
        for(var j = 0; j < line._glyphs.length; ++j) {
            var glyphData = line._glyphs[j];
            if(x > curX + glyphData.width) {
                curX += glyphData.width;
                continue;
            }
            if(x > curX + glyphData.width/2) {
                curX += glyphData.width;
                continue;
            }

            this._caretPos = j;
            //console.log("CaretPos=" + this._caretPos);
            return;
        }

        this._caretPos = line._glyphs.length;
        return;
    }
    throw new Error("click fall-through that should not be reached");
};

parsegraph_Label_Tests.addTest("Click before beginning", function() {
    var atlas = parsegraph_buildGlyphAtlas();
    var l = new parsegraph_Label(atlas);
    l.setText("No time");
    l.click(-5, -5);

    if(l.caretLine() != 0) {
        return "caretLine";
    }
    if(l.caretPos() != 0) {
        return "caretPos";
    }
});

parsegraph_Label_Tests.addTest("Click on second character", function() {
    var atlas = parsegraph_buildGlyphAtlas();
    var l = new parsegraph_Label(atlas);
    l.setText("No time");
    l.click(atlas.getGlyph('N').width + 1, 0);

    if(l.caretLine() != 0) {
        return "caretLine";
    }
    if(l.caretPos() != 1) {
        return "l.caretPos()=" + l.caretPos();
    }
});

parsegraph_Label_Tests.addTest("Click on second line", function() {
    var atlas = parsegraph_buildGlyphAtlas();
    var l = new parsegraph_Label(atlas);
    l.setText("No time\nLol");
    l.click(atlas.getGlyph('L').width + 1, l.lineAt(0).height() + 1);

    if(l.caretLine() != 1) {
        return "caretLine";
    }
    if(l.caretPos() != 1) {
        return "l.caretPos()=" + l.caretPos();
    }
});

parsegraph_Label_Tests.addTest("Click past end", function() {
    var atlas = parsegraph_buildGlyphAtlas();
    var l = new parsegraph_Label(atlas);
    l.setText("No time\nLol");
    l.click(atlas.getGlyph('L').width + 1, l.lineAt(0).height() + l.lineAt(1).height() + 1);

    if(l.caretLine() != 1) {
        return "caretLine";
    }
    if(l.caretPos() != 1) {
        return "l.caretPos()=" + l.caretPos();
    }
});

parsegraph_Label.prototype.lineAt = function(n)
{
    return this._lines[n];
};

parsegraph_Label.prototype.caretLine = function()
{
    return this._caretLine;
};

parsegraph_Label.prototype.caretPos = function()
{
    return this._caretPos;
};

parsegraph_Label.prototype.getCaretRect = function(outRect)
{
    if(!outRect) {
        outRect = new parsegraph_Rect();
    }
    var y = 0;
    for(var i = 0; i < this._caretLine; ++i) {
        y += this._lines[i].height();
    }
    var line = this._lines[this._caretLine];
    var x = line.posAt(this._caretPos);
    var cw = 5;
    outRect.setX(x + cw/2);
    outRect.setWidth(cw);
    outRect.setY(y + line.height()/2);
    outRect.setHeight(line.height());
    return outRect;
};

parsegraph_Label.prototype.glyphPos = function()
{
    return this._caretPos;
};

parsegraph_Label.prototype.fontSize = function()
{
    return this._glyphAtlas.fontSize();
};

parsegraph_Label.prototype.glyphAtlas = function()
{
    return this._glyphAtlas;
};

parsegraph_Label.prototype.width = function()
{
    if(this._width === null) {
        this._width = 0;
        this._lines.forEach(function(l) {
            this._width = Math.max(this._width, l.width());
        }, this);
    }
    return this._width;
};

parsegraph_Label.prototype.height = function()
{
    return this._height;
};

parsegraph_Label.prototype.paint = function(painter, worldX, worldY, fontScale)
{
    if(this.glyphAtlas() !== painter.glyphAtlas()) {
        throw new Error("Painter must use the same glyph atlas as this label: " + this.glyphAtlas() + ", " + painter.glyphAtlas());
    }
    var x = 0;
    var y = 0;
    var u = this._glyphAtlas.unicode();
    var direction = "WS";

    this._lines.forEach(function(l, i) {
        var startRun = 0;
        var endRun = startRun;
        var runDirection = direction;
        var runWidth = 0;
        var j = 0;
        var glyphData = l._glyphs[j];
        while(l._glyphs.length > 0) {
            glyphData = l._glyphs[j];
            var glyphDirection = direction;
            var unicodeData = u.get(glyphData.letter);
            if(unicodeData) {
                switch(unicodeData.bidirectionalCategory) {
                case "L":
                case "LRE":
                case "LRO":
                case "EN":
                case "ES":
                case "ET":
                    // Left-to-right.
                    glyphDirection = "L";
                    break;
                case "R":
                case "AL":
                case "AN":
                case "RLE":
                case "RLO":
                    // Right-to-left
                    glyphDirection = "R";
                    break;
                case "PDF":
                case "CS":
                case "ON":
                case "WS":
                case "P":
                case "BN":
                case "S":
                case "NSM":
                case "B":
                    // Neutral characters
                    glyphDirection = direction;
                    break;
                default:
                    throw new Error("Unrecognized character: \\u" + glyphData.letter.charCodeAt(0).toString(16));
                }
            }
            else {
                glyphDirection = direction;
            }
            if(direction === "WS" && glyphDirection !== "WS") {
                // Use the glyph's direction if there is none currently in use.
                direction = glyphDirection;
            }
            if(j < l._glyphs.length - 1 && direction === glyphDirection) {
                ++j;
                continue;
            }
            endRun = j;

            // Draw the run.
            if(direction === "L" || direction === "WS") {
                //console.log("Drawing LTR run from " + startRun + " to " + endRun + ".");
                for(var q = startRun; q <= endRun; ++q) {
                    glyphData = l._glyphs[q];
                    if(u.isMark(glyphData.letter)) {
                        continue;
                    }
                    z=1;
                    var nextGlyph = l._glyphs[q + z];
                    while(nextGlyph && u.isMark(nextGlyph.letter)) {
                        ++z;
                        nextGlyph = l._glyphs[q + z];
                        if(!nextGlyph) {
                            nextGlyph = null;
                            break;
                        }
                    }
                    // Add diacritics.
                    glyphData = glyphData.letter;
                    for(var i = 1; i < z; ++i) {
                        glyphData += l._glyphs[q + i].letter;
                    }
                    glyphData = this._glyphAtlas.getGlyph(glyphData);
                    painter.drawGlyph(glyphData, worldX + x, worldY + y, fontScale);
                    x += glyphData.width * fontScale;
                }
            }
            else {
                //console.log("Drawing RTL run from " + startRun + " to " + endRun + ".");
                var cursiveMapping;

                // The neighboring, non-mark, memory-representative glyphs.
                var nextGlyph = null;
                var prevGlyph = null;

                // q is the current glyph under iteration.
                var q = endRun;

                // z is the distance from q the nextGlyph.
                var z = 1;
                while(q >= startRun) {
                    glyphData = l._glyphs[q];

                    // Next is in reading order.
                    if(q > startRun && endRun !== startRun) {
                        z = 1;
                        prevGlyph = l._glyphs[q - z];
                        while(u.isMark(prevGlyph.letter)) {
                            ++z;
                            prevGlyph = l._glyphs[q - z];
                            if(!prevGlyph) {
                                prevGlyph = null;
                                break;
                            }
                        }
                        if(prevGlyph && !u.isArabic(prevGlyph.letter)) {
                            prevGlyph = null;
                        }
                        else if(prevGlyph) {
                            cursiveMapping = u.getCursiveMapping(prevGlyph.letter);
                            if(!cursiveMapping[2]) {
                                // Prev glyph can't be joined to, so ignore it.
                                prevGlyph = null;
                            }
                        }
                    }
                    else {
                        prevGlyph = null;
                    }
                    if(q < endRun && endRun !== startRun) {
                        z = 1;
                        nextGlyph = l._glyphs[q + z];
                        while(u.isMark(nextGlyph.letter)) {
                            ++z;
                            nextGlyph = l._glyphs[q + z];
                            if(!nextGlyph) {
                                nextGlyph = null;
                                break;
                            }
                        }
                        if(nextGlyph && !u.isArabic(nextGlyph.letter)) {
                            nextGlyph = null;
                        }
                        else if(nextGlyph) {
                            cursiveMapping = u.getCursiveMapping(nextGlyph.letter);
                            if(!cursiveMapping[3]) {
                                // Next glyph can't be joined to, so ignore it.
                                nextGlyph = null;
                            }
                        }
                    }
                    else {
                        nextGlyph = null;
                    }

                    var namedCharData = u.get(glyphData.letter);
                    var cursiveMapping = u.getCursiveMapping(namedCharData.codeValue);

                    if(namedCharData.codeValue === 0x627 && prevGlyph && prevGlyph.letter.charCodeAt(0) === 0x644) {
                        // LAM WITH ALEF.
                        if(prevGlyph) {
                            // Has a previous glyph, so final.
                            glyphData = 0xfefc;
                        }
                        else {
                            glyphData = 0xfefb;
                        }
                        // Decrement twice to skip the ligature'd character.
                        --q;
                    }
                    else if(cursiveMapping) {
                        if(nextGlyph) {
                            if(prevGlyph) {
                                if(cursiveMapping[2]) {
                                    glyphData = cursiveMapping[2]; // medial
                                }
                                else if(cursiveMapping[3]) {
                                    glyphData = cursiveMapping[3]; // final
                                }
                                else {
                                    glyphData = cursiveMapping[0]; // isolated
                                }
                            }
                            else {
                                // Next is, but previous wasn't.
                                if(cursiveMapping[1]) {
                                    glyphData = cursiveMapping[1]; // initial
                                }
                                else {
                                    glyphData = cursiveMapping[0]; // isolated
                                }
                            }
                        }
                        else if(prevGlyph) {
                            if(cursiveMapping[3]) {
                                glyphData = cursiveMapping[3]; // final
                            }
                            else {
                                glyphData = cursiveMapping[0]; // isolated
                            }
                        }
                    }
                    if(typeof glyphData === "object") {
                        glyphData = glyphData.letter;
                    }
                    if(typeof glyphData === "number") {
                        glyphData = String.fromCharCode(glyphData);
                    }
                    if(typeof glyphData !== "string") {
                        throw new Error("glyphData should be a string by now.");
                    }
                    // Add diacritics.
                    for(var i = 1; i < z; ++i) {
                        glyphData += l._glyphs[q + i].letter;
                    }
                    // Convert to object.
                    glyphData = this._glyphAtlas.getGlyph(glyphData);

                    painter.drawGlyph(glyphData, worldX + x, worldY + y, fontScale);
                    x += glyphData.width * fontScale;
                    --q;
                }
            }

            // Set the new glyph direction.
            direction = glyphDirection;
            startRun = j;
            endRun = startRun;
            ++j;
            if(j === l._glyphs.length) {
                break;
            }
        }
        y += l.height() * fontScale;
        x = 0;
    }, this);
};
function parsegraph_Color(r, g, b, a)
{
    if(arguments.length === 3) {
        a = 1;
    }
    if(arguments.length < 3) {
        throw new Error("Color must be given initial component values.");
    }
    this._r = Math.min(1, Math.max(0, r));
    this._g = Math.min(1, Math.max(0, g));
    this._b = Math.min(1, Math.max(0, b));
    this._a = Math.min(1, Math.max(0, a));
}

parsegraph_Color.prototype.r = function() {
    return this._r;
};

parsegraph_Color.prototype.g = function() {
    return this._g;
};

parsegraph_Color.prototype.b = function() {
    return this._b;
};

parsegraph_Color.prototype.a = function() {
    return this._a;
};

parsegraph_Color.prototype.setA = function(value) {
    this._a = Math.min(1, Math.max(0, value));
    return this;
};

parsegraph_Color.prototype.setR = function(value) {
    this._r = Math.min(1, Math.max(0, value));
    return this;
};

parsegraph_Color.prototype.setG = function(value) {
    this._g = Math.min(1, Math.max(0, value));
    return this;
};

parsegraph_Color.prototype.setB = function(value) {
    this._b = Math.min(1, Math.max(0, value));
    return this;
};

parsegraph_Color.prototype.multiply = function(other) {
    return new parsegraph_Color(
        this.r() * other.r(),
        this.g() * other.g(),
        this.b() * other.b(),
        this.a() * other.a()
    );
};

parsegraph_Color.prototype.premultiply = function(other) {
    return new parsegraph_Color(
        (this.a() * this.r()) + (other.r() * (1.0 - this.a())),
        (this.a() * this.g()) + (other.g() * (1.0 - this.a())),
        (this.a() * this.b()) + (other.b() * (1.0 - this.a())),
        1.0
    );
};

parsegraph_Color.prototype.asRGB = function() {
    return "rgb(" +
        Math.round(this._r * 255) + ", " +
        Math.round(this._g * 255) + ", " +
        Math.round(this._b * 255) + ")"
};

function parsegraph_inverseSRGBCompanding(v)
{
    if(v <= 0.04045) {
        return v/12.92;
    }
    return Math.pow((v+0.055)/1.055, 2.4);
}

function parsegraph_SRGBCompanding(v)
{
    if(v <= 0.0031308) {
        return v*12.92;
    }
    return 1.055*Math.pow(v,1/2.4)-0.055;
}

parsegraph_Color.prototype.luminance = function() {
    // sRGB color model.
    var x1 = parsegraph_inverseSRGBCompanding(this.r());
    var y1 = parsegraph_inverseSRGBCompanding(this.g());
    var z1 = parsegraph_inverseSRGBCompanding(this.b());
    return x1 * 0.648431 + y1 * 0.321152 + z1 * 0.155886;
};

parsegraph_Color.prototype.interpolate = function(other, interp) {
    //console.log("Interpolating");
    interp = Math.min(1, Math.max(0, interp));

    var e = 216/24389;
    var k = 24389/27;

    //console.log("r=" + this.r() + ", g=" + this.g()+ ", b=" + this.b());
    var x1 = parsegraph_inverseSRGBCompanding(this.r());
    var y1 = parsegraph_inverseSRGBCompanding(this.g());
    var z1 = parsegraph_inverseSRGBCompanding(this.b());
    //console.log("x1=" + x1 + ", y1=" + y1 + ", z1=" + z1);

    var xref1 = x1*0.648431;
    var yref1 = y1*0.321152;
    var zref1 = z1*0.155886;

    var fx1;
    if(xref1 > e) {
        fx1 = Math.pow(xref1, 1/3);
    }
    else {
        fx1 = (k*xref1+16)/116;
    }
    var fy1;
    if(yref1 > e) {
        fy1 = Math.pow(yref1, 1/3);
    }
    else {
        fy1 = (k*yref1+16)/116;
    }
    var fz1;
    if(zref1 > e) {
        fz1 = Math.pow(zref1, 1/3);
    }
    else {
        fz1 = (k*zref1+16)/116;
    }

    var L1 = 116*fy1-16;
    var a1 = 500*(fx1-fy1);
    var b1 = 200*(fy1-fz1);
    //console.log("L=" + L1 + ", a1=" + a1 + ", b1=" + b1);

    var C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
    var H1 = Math.atan2(a1, b1);
    if(H1 < 0) {
        H1 + 2 * Math.PI;
    }

    //console.log("L=" + L1 + ", C1=" + C1 + ", H1=" + H1);

    var x2 = parsegraph_inverseSRGBCompanding(other.r());
    var y2 = parsegraph_inverseSRGBCompanding(other.g());
    var z2 = parsegraph_inverseSRGBCompanding(other.b());

    var xref2 = x2/0.648431;
    var yref2 = y2/0.321152;
    var zref2 = z2/0.155886;

    var fx2;
    if(xref2 > e) {
        fx2 = Math.pow(xref2, 1/3);
    }
    else {
        fx2 = (k*xref2+16)/116;
    }
    var fy2;
    if(yref2 > e) {
        fy2 = Math.pow(yref2, 1/3);
    }
    else {
        fy2 = (k*yref2+16)/116;
    }
    var fz2;
    if(zref2 > e) {
        fz2 = Math.pow(zref2, 1/3);
    }
    else {
        fz2 = (k*zref2+16)/116;
    }
    var L2 = 116*fy2-16;
    var a2 = 500*(fx2-fy2);
    var b2 = 200*(fy2-fz2);

    var C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
    var H2 = Math.atan2(a2, b2);
    if(H2 < 0) {
        H2 + 2 * Math.PI;
    }
    console.log("L2=" + L2 + ", C2=" + C2 + ", H2=" + H2);

    var L3 = L1 + (L2 - L1) * interp;
    var C3 = C1 + (C2 - C1) * interp;
    var H3 = H1 + (H2 - H1) * interp;
    console.log("L3=" + L3 + ", C3=" + C3 + ", H3=" + H3);

    var a3 = C3 * Math.cos(H3);
    var b3 = C3 * Math.sin(H3);
    //console.log("L3=" + L3 + ", a3=" + a3 + ", b3=" + b3);

    var fy3 = (L3 + 16)/116;
    var fz3 = fy3 - b3/200;
    var fx3 = a3/500+fy3;

    var zref3 = Math.pow(fz3, 3);
    if(zref3 <= e) {
        zref3 = (116*fz3-16)/k;
    }

    var yref3;
    if(L3 > k * e) {
        yref3 = Math.pow((L3+16)/116, 3);
    }
    else {
        yref3 = L3/k;
    }

    var xref3 = Math.pow(fx3, 3);
    if(xref3 <= e) {
        xref3 = (116*fx3-16)/k;
    }

    var x3 = xref3*0.648431;
    var y3 = yref3*0.321152;
    var z3 = zref3*0.155886;
    //console.log("x3=" + x3 + ", y3=" + y3 + ", z3=" + z3);

    return new parsegraph_Color(
        parsegraph_SRGBCompanding(x3),
        parsegraph_SRGBCompanding(y3),
        parsegraph_SRGBCompanding(z3),
        this.a() + (other.a() - this.a()) * interp
    );
};

parsegraph_fromRGB = function(rgb, defaultAlpha)
{
    // Default alpha to 255.
    if(arguments.length === 1) {
        defaultAlpha = 255;
    }

    // Extract the color from the string, as formatted in asRGB.
    var value = [];
    rgb.trim().substring("rgb(".length, rgb.length - 1).split(',').forEach(function(c) {
        value.push(c.trim() - 0);
    });
    if(value.length < 3) {
        throw new Error("Failed to parse color");
    }
    if(value.length === 3) {
        value.push(defaultAlpha);
    }

    // Return a new color.
    return new parsegraph_Color(value[0]/255, value[1]/255, value[2]/255, value[3]/255);
};

parsegraph_Color.prototype.clone = function() {
    return parsegraph_createColor(this.r(), this.g(), this.b(), this.a());
};

parsegraph_Color.prototype.equals = function(other) {
    return this.r() === other.r() && this.g() === other.g() && this.b() === other.b() && this.a() === other.a();
};

function parsegraph_createColor(r, g, b, a)
{
    return new parsegraph_Color(r, g, b, a);
}

parsegraph_Color_Tests = new parsegraph_TestSuite("parsegraph_Color");

parsegraph_Color_Tests.addTest("parsegraph_Color.simplify", function() {
});

parsegraph_Color_Tests.addTest("parsegraph_Color.interpolate trivial", function() {
    var r = new parsegraph_Color(0, 0, 1);
    var b = new parsegraph_Color(1, 1, 0);
    var c = r.interpolate(b, 0);
    if(!c.equals(r)) {
        return "Trivial interpolate (interp=0) does not work: " + c.asRGB();
    }
});

parsegraph_Color_Tests.addTest("parsegraph_Color.interpolate trivial", function() {
    var r = new parsegraph_Color(0, 0, 1);
    var b = new parsegraph_Color(1, 1, 0);
    var c = r.interpolate(b, 1);
    if(!c.equals(b)) {
        return "Trivial interpolate (interp=1) does not work: " + c.asRGB();
    }
});

parsegraph_Color_Tests.addTest("parsegraph_Color.interpolate", function() {
    var r = new parsegraph_Color(0, 0, 1);
    var b = new parsegraph_Color(1, 1, 0);
    var c = r.interpolate(b, 0);
    if(!c.equals(new parsegraph_Color(0, 1, 0))) {
        return "Colors do not interpolate properly: " + c.asRGB();
    }
});
function parsegraph_createException(exceptionCode)
{
    if(arguments.length > 1) {
        return new Error(parsegraph_nameStatus(exceptionCode) + "\nArgument: " + arguments[1]);
    }
    return new Error(parsegraph_nameStatus(exceptionCode));
}
parsegraph_DEFAULT_EXTENT_BOUNDS = 1;

parsegraph_NUM_EXTENT_BOUND_COMPONENTS = 2;

function parsegraph_Extent(copy)
{
    if(copy !== undefined && copy._bounds) {
        this._numBounds = copy._numBounds;
        this._bounds = new Float32Array(copy._bounds);
    }
    else {
        this._numBounds = 0;
        this._bounds = null;
    }

    this._start = 0;
}

parsegraph_Extent.prototype.forEach = function(func, thisArg) {
    for(var i = 0; i < this._numBounds; ++i) {
        func.call(
            thisArg,
            this.boundLengthAt(i),
            this.boundSizeAt(i),
            i
        );
    }
};

parsegraph_Extent.prototype.clone = function() {
    return new parsegraph_Extent(this);
};

parsegraph_Extent.prototype.clear = function() {
    this._numBounds = 0;
};

parsegraph_Extent.prototype.numBounds = function() {
    return this._numBounds;
};

parsegraph_Extent.prototype.hasBounds = function() {
    return this.numBounds() > 0;
};

parsegraph_Extent.prototype.boundLengthAt = function(index) {
    return this._bounds[parsegraph_NUM_EXTENT_BOUND_COMPONENTS * ((this._start + index) % this.boundCapacity())];
};

parsegraph_Extent.prototype.boundSizeAt = function(index) {
    return this._bounds[parsegraph_NUM_EXTENT_BOUND_COMPONENTS * ((this._start + index) % this.boundCapacity()) + 1];
};

parsegraph_Extent.prototype.setBoundLengthAt = function(index, length) {
    this._bounds[parsegraph_NUM_EXTENT_BOUND_COMPONENTS * ((this._start + index) % this.boundCapacity())] = length;
};

parsegraph_Extent.prototype.setBoundSizeAt = function(index, size) {
    this._bounds[parsegraph_NUM_EXTENT_BOUND_COMPONENTS * ((this._start + index) % this.boundCapacity()) + 1] = size;
};

parsegraph_Extent.prototype.realloc = function(capacity)
{
    if(capacity < parsegraph_DEFAULT_EXTENT_BOUNDS) {
        capacity  = parsegraph_DEFAULT_EXTENT_BOUNDS;
    }
    var oldBounds = this._bounds;
    var oldCap = this.boundCapacity();
    if(oldCap >= capacity) {
        // TODO This could shrink.
        throw new Error("Cannot shrink Extent capacity");
    }

    // Change the capacity.
    this._bounds = new Float32Array(parsegraph_NUM_EXTENT_BOUND_COMPONENTS * capacity);

    if(oldBounds) {
        if(this._start + this._numBounds > oldCap) {
            var frontBounds = (this._start + this._numBounds) - oldCap;
            // TODO See if this can be copied more efficiently, and if that matters.
            for(var i = 0; i < parsegraph_NUM_EXTENT_BOUND_COMPONENTS * (this._numBounds - frontBounds); ++i) {
                this._bounds[i] = oldBounds[this._start + i];
            }
            for(var i = 0; i < parsegraph_NUM_EXTENT_BOUND_COMPONENTS * (this._numBounds - frontBounds); ++i) {
                this._bounds[(this._numBounds - frontBounds) + i] = oldBounds[i];
            }
        }
        else {
            // Can do it in a single copy.
            for(var i = 0; i < parsegraph_NUM_EXTENT_BOUND_COMPONENTS * this._numBounds; ++i) {
                this._bounds[i] = oldBounds[this._start + i];
            }
        }
        //console.log(oldBounds, "to", this._bounds);
    }

    this._start = 0;

    return 0;
}

parsegraph_Extent.prototype.prependLS = function(length, size) {
    if(isNaN(length)) {
        throw new Error("Length must not be NaN");
    }
    if(length == 0) {
        // Drop empty lengths.
        return;
    }
    // Do not allow negative length values.
    if(length < 0) {
        var str = "Non-positive bound lengths are not allowed, but "
            + length
            + " was given anyway.";
        throw new Error(str);
    }

    if(this.boundCapacity() == this.numBounds()) {
        // Completely full, so expand.
        var newCap = parsegraph_DEFAULT_EXTENT_BOUNDS;
        if(this.boundCapacity() > 0) {
            newCap = 2 * this.boundCapacity();
        }
        this.realloc(newCap);
    }

    if(this._start == 0) {
        this._start = this.boundCapacity() - 1;
    }
    else {
        --(this._start);
    }

    ++(this._numBounds);
    this.setBoundLengthAt(0, length);
    this.setBoundSizeAt(0, size);
}

parsegraph_Extent.prototype.boundCapacity = function()
{
    if(!this._bounds) {
        return 0;
    }
    return this._bounds.length / parsegraph_NUM_EXTENT_BOUND_COMPONENTS;
};

parsegraph_Extent.prototype.appendLS = function(length, size)
{
    if(isNaN(length)) {
        throw new Error("Length must not be NaN");
    }
    if(length === 0) {
        // Drop empty lengths.
        return;
    }
    if(length < 0) {
        var str;
        str = "Non-positive bound lengths are not allowed, but "
            + length
            + " was given anyway.";
        throw new Error(str);
    }

    if(this.numBounds() > 0) {
        var lastSize = this.boundSizeAt(this.numBounds() - 1);
        if(
            (isNaN(lastSize) && isNaN(size)) || (lastSize === size)
        ) {
            this.setBoundLengthAt(this.numBounds() - 1,
                this.boundLengthAt(this.numBounds() - 1) + length
            );
            return;
        }
    }

    if(this.boundCapacity() == this.numBounds()) {
        // Completely full, so expand.
        var newCap = parsegraph_DEFAULT_EXTENT_BOUNDS;
        if(this.boundCapacity() > 0) {
            newCap = 2 * this.boundCapacity();
        }
        this.realloc(newCap);
    }

    ++(this._numBounds);
    this.setBoundLengthAt(this.numBounds() - 1, length);
    this.setBoundSizeAt(this.numBounds() - 1, size);
}

parsegraph_Extent.prototype.prependSL = function(size, length)
{
    this.prependLS(length, size);
}

parsegraph_Extent.prototype.appendSL = function(size, length)
{
    this.appendLS(length, size);
}

parsegraph_Extent.prototype.adjustSize = function(adjustment)
{
    // Adjust the size of each bound.
    for(var i = 0; i < this.numBounds(); ++i) {
        var size = this.boundSizeAt(i);
        // Ignore empty sizes.
        if(!isNaN(size)) {
            this.setBoundSizeAt(i, size + adjustment);
        }
    }
}

parsegraph_Extent.prototype.simplify = function()
{
    var totalLength = 0;
    var maxSize = NaN;
    for(var i = 0; i < this.numBounds(); ++i) {
        totalLength += this.boundLengthAt(i);

        var size = this.boundSizeAt(i);
        if(isNaN(maxSize)) {
            maxSize = size;
        }
        else if(!isNaN(size)) {
            maxSize = Math.max(maxSize, size);
        }
    }
    this.clear();
    this.appendLS(totalLength, maxSize);
};

parsegraph_Extent.prototype.sizeAt = function(offset)
{
    // Do not allow negative offsets.
    if(offset < 0) {
        throw parsegraph_createException(parsegraph_OFFSET_IS_NEGATIVE);
    }

    // Determine the bound at the given offset.
    var pos = 0;
    for(var i = 0; i < this.numBounds(); ++i) {
        var thisBoundLength = this.boundLengthAt(i);
        if(offset <= pos + thisBoundLength) {
            break;
        }
        pos += thisBoundLength;
    }
    // Return NaN if the offset is beyond the full size of this extent.
    if(i == this.numBounds()) {
        return NaN;
    }

    // Return the size at the determined bound.
    return this.boundSizeAt(i);
}

parsegraph_Extent.prototype.combineBound = function(
    newBoundStart,
    newBoundLength,
    newBoundSize)
{
    // Create the extent to be merged.
    var added = new parsegraph_Extent();
    added.appendLS(newBoundLength, newBoundSize);

    // Copy the combined result into this extent.
    this.copyFrom(this.combinedExtent(added, newBoundStart));
}

parsegraph_Extent.prototype.copyFrom = function(from)
{
    this._numBounds = from._numBounds;
    this._bounds = from._bounds;
    from.clear();
};

parsegraph_Extent.prototype.combineExtent = function(
    given,
    lengthAdjustment,
    sizeAdjustment,
    scale)
{
    // Combine the extent into this one, creating a new extent in the process.
    var result = this.combinedExtent(given, lengthAdjustment, sizeAdjustment, scale);

    // Copy the combined result into this extent.
    this.copyFrom(result);
}

parsegraph_Extent.prototype.combinedExtent = function(
    given,
    lengthAdjustment,
    sizeAdjustment,
    scale)
{
    if(lengthAdjustment === undefined) {
        lengthAdjustment = 0;
    }
    if(sizeAdjustment === undefined) {
        sizeAdjustment = 0;
    }
    if(scale === undefined) {
        scale = 1.0;
    }
    if(lengthAdjustment < 0) {
        var result = given.combinedExtent(
            this,
            -lengthAdjustment/scale,
            -sizeAdjustment/scale,
            1/scale
        );
        result.scale(scale);
        result.adjustSize(
            sizeAdjustment
        );
        return result;
    }
    else if(lengthAdjustment > 0) {
        // We have a length adjustment.
        var givenCopy = given.clone();
        givenCopy.prependLS(
            lengthAdjustment/scale,
            NaN
        );
        return this.combinedExtent(
            givenCopy,
            0,
            sizeAdjustment,
            scale
        );
    }

    var thisBound = 0;
    var thisPosition = 0;
    var givenBound = 0;
    var givenPosition = 0;

    // Returns this bound's size
    var getThisSize = function() {
        if(thisBound >= this.numBounds()) {
            throw new Error("Getting this bound's size past the " +
                "end of this extent.");
        }
        return this.boundSizeAt(thisBound);
    };

    // Returns given's bound's size
    var getGivenSize = function() {
        if(givenBound >= given.numBounds()) {
            throw new Error("Getting given's size past the end of " +
                "given's extent.");
        }
        var rv = given.boundSizeAt(givenBound);
        if(isNaN(rv)) {
            return NaN;
        }
        return scale * rv + sizeAdjustment;
    };

    // Moves to this extent's next bound. true is returned as long as
    // thisBound is valid.
    var getThisNextBound = function() {
        if(thisBound >= this.numBounds()) {
            throw new Error("Getting past end of this extent.");
        }
        thisPosition += this.boundLengthAt(thisBound);
        ++thisBound;
        return thisBound != this.numBounds();
    };

    // Increments given's iterator. true is returned as long as givenBound
    // is valid.
    var getGivenNextBound = function() {
        if(givenBound >= given.numBounds()) {
            throw new Error("Getting past end of given bound.");
        }
        givenPosition += scale * given.boundLengthAt(givenBound);
        ++givenBound;
        return givenBound != given.numBounds();
    };

    var givenReach = function() {
        if(givenBound >= given.numBounds()) {
            return givenPosition;
        }
        return givenPosition + scale * given.boundLengthAt(givenBound);
    };

    var thisReach = function() {
        if(thisBound == this.numBounds()) {
            return thisPosition;
        }
        return thisPosition + this.boundLengthAt(thisBound);
    };

    // Create the aggregate result.
    var result = new parsegraph_Extent();

    // Iterate over each bound.
    var combinedIteration = 0;
    while(givenBound != given.numBounds() && thisBound != this.numBounds()) {
        //console.log("Iterating over each bound.");
        //console.log("This reach: " + thisReach.call(this) + ", size: " + getThisSize.call(this) + ", pos: " + thisPosition);
        //console.log("Given reach: " + givenReach.call(this) + ", size: " + getGivenSize.call(this) + ", pos: " + givenPosition);
        ++combinedIteration;
        var thisSize = getThisSize.call(this);
        var givenSize = getGivenSize.call(this);

        var newSize;
        if(!isNaN(thisSize) && !isNaN(givenSize)) {
            newSize = Math.max(thisSize, givenSize);
        }
        else if(!isNaN(thisSize)) {
            newSize = thisSize;
        }
        else {
            newSize = givenSize;
        }

        result.appendLS(
            Math.min(
                thisReach.call(this),
                givenReach.call(this)
            ) - Math.max(
                thisPosition,
                givenPosition
            ),
            newSize
        );

        if(thisReach.call(this) == givenReach.call(this)) {
            // This bound ends at the same position as given's
            // bound, so increment both iterators.
            getThisNextBound.call(this);
            getGivenNextBound.call(this);
        }
        else if(thisReach.call(this) < givenReach()) {
            // This bound ends before given's bound, so increment
            // this bound's iterator.
            getThisNextBound.call(this);
        }
        else {
            // Assert: thisReach() > givenReach()
            // Given's bound ends before this bound, so increment
            // given's iterator.
            getGivenNextBound.call(this);
        }
    }

    if(givenBound != given.numBounds()) {
        // Finish off given last overlapping bound to get completely
        // in sync with givens.
        result.appendLS(
            givenReach.call(this) - thisReach.call(this),
            getGivenSize.call(this)
        );
        while(getGivenNextBound.call(this)) {
            result.appendLS(
                scale * given.boundLengthAt(givenBound),
                getGivenSize.call(this)
            );
        }
    }
    else if(thisBound != this.numBounds()) {
        // Finish off this extent's last overlapping bound to get completely
        // in sync with given's iterator.
        result.appendLS(
            thisReach.call(this) - givenReach.call(this),
            getThisSize.call(this)
        );
        while(getThisNextBound.call(this)) {
            result.appendLS(
                this.boundLengthAt(thisBound),
                getThisSize.call(this)
            );
        }
    }

    return result;
}

parsegraph_Extent.prototype.scale = function(factor)
{
    this.forEach(function(length, size, i) {
        this.setBoundLengthAt(i, length * factor);
        if(!isNaN(this.boundSizeAt(i))) {
            this.setBoundSizeAt(i, size * factor);
        }
    }, this);
};

parsegraph_Extent.prototype.separation = function(
    given,
    positionAdjustment,
    allowAxisOverlap,
    givenScale,
    axisMinimum)
{
    if(positionAdjustment === undefined) {
        positionAdjustment = 0;
    }
    if(allowAxisOverlap === undefined) {
        allowAxisOverlap = true;
    }
    if(axisMinimum === undefined) {
        axisMinimum = 0;
    }
    if(givenScale === undefined) {
        givenScale = 1.0;
    }
    //console.log("Separation(positionAdjustment=" + positionAdjustment + ")");

    var thisBound = 0;
    var givenBound = 0;

    var thisPosition = 0;

    // The position of given. This is in this node's space.
    var givenPosition = 0;

    /**
     * Moves the iterator for this extent to its next bound.
     *
     * The iterator is just a fancy counter. Both the position
     * and the bound index are tracked.
     */
    var incrementThisBound = function() {
        thisPosition += this.boundLengthAt(thisBound);
        ++thisBound;
    };

    var givenBoundLength = function() {
        return givenScale * given.boundLengthAt(givenBound);
    };

    var givenBoundSize = function() {
        var rv = given.boundSizeAt(givenBound);
        if(isNaN(rv)) {
            return rv;
        }
        return givenScale * rv;
    };

    var thisBoundSize = function() {
        return this.boundSizeAt(thisBound);
    };

    /**
     * Moves the iterator for the given extent to the next bound.
     *
     * The iterator is just a fancy counter. Both the position
     * and the bound index are tracked.
     */
    var incrementGivenBound = function() {
        givenPosition += givenBoundLength();
        ++givenBound;
    };

    var givenAtEnd = function() {
        return givenBound == given.numBounds();
    };

    var thisExtent = this;
    var thisAtEnd = function() {
        return thisBound == thisExtent.numBounds();
    };

    // extentSeparation is the minimum distance to separate this extent
    // from the given extent, so that they do not overlap if facing one
    // another.
    var extentSeparation = 0;

    // Adjust this extent's iterator to account for the position adjustment.
    if(positionAdjustment < 0) {
        while(
            !givenAtEnd()
            && givenPosition + givenBoundLength() <= -positionAdjustment
        ) {
            // If we don't allow axis overlap, then be sure to include these bounds
            // that are being skipped.
            var boundSeparation = givenBoundSize();
            if(
                !allowAxisOverlap
                && !isNaN(boundSeparation)
                && boundSeparation > extentSeparation
            ) {
                extentSeparation = boundSeparation + axisMinimum;
            }
            incrementGivenBound.call(this);
        }
    }
    else {
        // Positive positionAdjustment.
        while(
            !thisAtEnd()
            && thisPosition + this.boundLengthAt(thisBound) <= positionAdjustment
        ) {
            var boundSeparation = thisBoundSize.call(this);
            if(
                !allowAxisOverlap
                && !isNaN(boundSeparation)
                && boundSeparation > extentSeparation
            ) {
                extentSeparation = boundSeparation;
            }
            incrementThisBound.call(this);
        }
    }

    // While the iterators still have bounds in both extents.
    while(!givenAtEnd() && !thisAtEnd()) {
        // Calculate the separation between these bounds.
        //console.log("Separating");
        //console.log("This bound size: " + this.boundSizeAt(thisBound));
        //console.log("Given bound size: " + givenBoundSize());
        var thisSize = this.boundSizeAt(thisBound);
        var givenSize = givenBoundSize();
        var boundSeparation;
        if(!isNaN(thisSize) && !isNaN(givenSize)) {
             boundSeparation = thisSize + givenSize;
        }
        else if(!allowAxisOverlap) {
            if(!isNaN(thisSize)) {
                boundSeparation = thisSize + axisMinimum;
            }
            else if(!isNaN(givenSize)) {
                boundSeparation = givenSize + axisMinimum;
            }
            else {
                // Both extents are empty at this location.
                boundSeparation = 0;
            }
        }
        else {
            // Axis overlap is allowed.
            boundSeparation = 0;
        }
        if(boundSeparation > extentSeparation) {
            extentSeparation = boundSeparation;
            //console.log("Found new separation of " + extentSeparation + ".");
        }

        // Increment the iterators to the next testing point.

        // endComparison is a difference that indicates which bound
        // ends soonest.
        var endComparison =
            (thisPosition + this.boundLengthAt(thisBound) - positionAdjustment)
            - (givenPosition + givenScale * given.boundLengthAt(givenBound));

        if(endComparison == 0) {
            // This bound ends at the same position as given's bound,
            // so increment both.

            incrementGivenBound.call(this);
            incrementThisBound.call(this);
        }
        else if(endComparison > 0) {
            // This bound ends after given's bound, so increment the
            // given bound's iterator.
            incrementGivenBound.call(this);
        }
        if(endComparison < 0) {
            // Given's bound ends after this bound, so increment this
            // bound's iterator.
            incrementThisBound.call(this);
        }
    }

    if(!allowAxisOverlap) {
        // Calculate the separation between the remaining bounds of given and
        // the separation boundary.
        var startTime = parsegraph_getTimeInMillis();
        while(!givenAtEnd()) {
            if(parsegraph_getTimeInMillis() - startTime > parsegraph_TIMEOUT) {
                throw new Error("Extent separation timed out");
            }

            var givenSize = given.boundSizeAt(givenBound);
            if(!isNaN(givenSize)) {
                extentSeparation = Math.max(extentSeparation, givenScale * givenSize + axisMinimum);
            }
            ++givenBound;
        }
    }

    return extentSeparation;
}

parsegraph_Extent.prototype.boundingValues = function(outVal)
{
    var totalLength = 0;
    var minSize = NaN;
    var maxSize = NaN;

    for(var iter = 0; iter != this.numBounds(); ++iter) {
        totalLength += this.boundLengthAt(iter);

        var size = this.boundSizeAt(iter);
        if(isNaN(minSize)) {
            minSize = size;
        }
        else if(!isNaN(size)) {
            minSize = Math.min(minSize, size);
        }

        if(isNaN(maxSize)) {
            maxSize = size;
        }
        else if(!isNaN(size)) {
            maxSize = Math.max(maxSize, size);
        }
    }

    if(!outVal) {
        outVal = [null, null, null];
    }
    outVal[0] = totalLength;
    outVal[1] = minSize;
    outVal[2] = maxSize;
    return outVal;
};

parsegraph_Extent.prototype.equals = function(other)
{
    // Exit quickly if we are comparing with ourselves.
    if(this === other) {
        return true;
    }

    // Ensure the sizes match.
    if(!other || this.numBounds() != other.numBounds()) {
        return false;
    }

    // Compare the bounds for equality.
    for(var i = 0; i < this.numBounds(); ++i) {
        if(this.boundLengthAt(i) !== other.boundLengthAt(i)) {
            return false;
        }
        var thisSize = this.boundSizeAt(i);
        var otherSize = other.boundSizeAt(i);
        if(isNaN(thisSize) && isNaN(otherSize)) {
            // Both NaN.
            continue;
        }
        // Fail if one is NaN and the other is not.
        if(isNaN(thisSize) || isNaN(otherSize)) {
            return false;
        }
        if(this.boundSizeAt(i) !== other.boundSizeAt(i)) {
            return false;
        }
    }
    return true;
}

parsegraph_Extent.prototype.dump = function(message)
{
    if(message !== undefined) {
        parsegraph_log(message);
    }

    var offset = 0;
    for(var i = 0; i < this.numBounds(); ++i) {
        parsegraph_log(
            "" + offset + ": [length=" + this.boundLengthAt(i) + ", size=" +
            this.boundSizeAt(i) + "]"
        );
        offset += this.boundLengthAt(i);
    }
}

parsegraph_Extent.prototype.toDom = function(message)
{
    var rv = document.createElement("table");
    rv.className = "parsegraph_Extent";

    if(message !== undefined) {
        var titleRow = document.createElement("tr");
        rv.appendChild(titleRow);
        titleRow.appendChild(document.createElement("th"));
        titleRow.lastChild.innerHTML = message;
        titleRow.lastChild.colSpan = 3;
    }

    var headerRow = document.createElement("tr");
    rv.appendChild(headerRow);
    headerRow.appendChild(document.createElement("th"));
    headerRow.lastChild.innerHTML = "Offset";
    headerRow.appendChild(document.createElement("th"));
    headerRow.lastChild.innerHTML = "Length";
    headerRow.appendChild(document.createElement("th"));
    headerRow.lastChild.innerHTML = "Size";

    var offset = 0;
    for(var i = 0; i < this.numBounds(); ++i) {
        var boundRow = document.createElement("tr");
        rv.appendChild(boundRow);

        boundRow.appendChild(document.createElement("td"));
        boundRow.lastChild.innerHTML = offset;

        boundRow.appendChild(document.createElement("td"));
        boundRow.lastChild.innerHTML = this.boundLengthAt(i);

        boundRow.appendChild(document.createElement("td"));
        boundRow.lastChild.innerHTML = this.boundSizeAt(i);

        offset += this.boundLengthAt(i);
    }

    return rv;
}

function parsegraph_createExtent(copy)
{
    return new parsegraph_Extent(copy);
}

parsegraph_Extent_Tests = new parsegraph_TestSuite("parsegraph_Extent");

parsegraph_Extent_Tests.addTest("parsegraph_Extent.simplify", function() {
    var extent = new parsegraph_Extent();
    extent.appendLS(10, 20);
    extent.appendLS(5, 20);
    extent.simplify();
    if(extent.numBounds() !== 1) {
        return "Simplify must merge bounds with equal sizes.";
    }
});

parsegraph_Extent_Tests.addTest("parsegraph_Extent.numBounds", function() {
    var extent = new parsegraph_Extent();
    if(extent.numBounds() !== 0) {
        return "Extent must begin with an empty numBounds.";
    }
    extent.appendLS(1, 15);
    if(extent.numBounds() !== 1) {
        return "Append must only add one bound.";
    }
    extent.appendLS(1, 20);
    extent.appendLS(1, 25);
    if(extent.numBounds() !== 3) {
        return "Append must only add one bound per call.";
    }
});

parsegraph_Extent_Tests.addTest("parsegraph_Extent.separation", function() {
    var forwardExtent = new parsegraph_Extent();
    var backwardExtent = new parsegraph_Extent();

    var testSeparation = function(expected) {
        return forwardExtent.separation(backwardExtent) ==
            backwardExtent.separation(forwardExtent) &&
            forwardExtent.separation(backwardExtent) == expected;
    };

    forwardExtent.appendLS(50, 10);
    backwardExtent.appendLS(50, 10);
    if(!testSeparation(20)) {
        console.log(testSeparation(20));
        console.log(forwardExtent.separation(backwardExtent));
        console.log(backwardExtent.separation(forwardExtent));
        return "For single bounds, separation should be equivalent to the size of the " +
            "forward and backward extents.";
    }

    backwardExtent.appendLS(50, 20);
    forwardExtent.appendLS(50, 20);
    if(!testSeparation(40)) {
        return false;
    }

    backwardExtent.appendLS(50, 20);
    forwardExtent.appendLS(50, 40);
    if(!testSeparation(60)) {
        return false;
    }

    backwardExtent.appendLS(50, 10);
    forwardExtent.appendLS(50, 10);
    if(!testSeparation(60)) {
        return false;
    }
});

parsegraph_Extent_Tests.addTest("parsegraph_Extent.Simple combinedExtent", function(resultDom) {
    var rootNode = new parsegraph_Extent();
    var forwardNode = new parsegraph_Extent();

    rootNode.appendLS(50, 25);
    forwardNode.appendLS(12, 6);
    var separation = rootNode.separation(forwardNode);

    var combined = rootNode.combinedExtent(forwardNode, 0, separation);

    var expected = new parsegraph_Extent();
    expected.appendLS(12, separation + 6);
    expected.appendLS(38, 25);

    if(!expected.equals(combined)) {
        resultDom.appendChild(
            expected.toDom("Expected forward extent")
        );
        resultDom.appendChild(
            combined.toDom("Actual forward extent")
        );
        return "Combining extents does not work.";
    }
});

parsegraph_Extent_Tests.addTest("parsegraph_Extent.equals", function(resultDom) {
    var rootNode = new parsegraph_Extent();
    var forwardNode = new parsegraph_Extent();

    rootNode.appendLS(10, 10);
    rootNode.appendLS(10, NaN);
    rootNode.appendLS(10, 15);

    forwardNode.appendLS(10, 10);
    forwardNode.appendLS(10, NaN);
    forwardNode.appendLS(10, 15);

    if(!rootNode.equals(forwardNode)) {
        return "Equals does not handle NaN well.";
    }
});

parsegraph_Extent_Tests.addTest("parsegraph_Extent.combinedExtent with NaN", function(resultDom) {
    var rootNode = new parsegraph_Extent();
    var forwardNode = new parsegraph_Extent();


    rootNode.appendLS(50, 25);

    forwardNode.appendLS(10, NaN);
    forwardNode.setBoundSizeAt(0, NaN);
    if(!isNaN(forwardNode.boundSizeAt(0))) {
        return forwardNode.boundSizeAt(0);
    }
    forwardNode.appendLS(30, 5);


    var separation = rootNode.separation(forwardNode);
    if(separation != 30) {
        return "Separation doesn't even match. Actual=" + separation;
    }

    var combined = rootNode.combinedExtent(forwardNode,
        0,
        separation
    );

    var expected = new parsegraph_Extent();
    expected.appendLS(10, 25);
    expected.appendLS(30, 35);
    expected.appendLS(10, 25);

    if(!expected.equals(combined)) {
        resultDom.appendChild(
            expected.toDom("Expected forward extent")
        );
        resultDom.appendChild(
            combined.toDom("Actual forward extent")
        );
        return "Combining extents does not work.";
    }
});

parsegraph_Extent_Tests.addTest("parsegraph_Extent.combinedExtent", function(resultDom) {
    var rootNode = new parsegraph_Extent();
    var forwardNode = new parsegraph_Extent();

    rootNode.appendLS(50, 25);
    forwardNode.appendLS(12, 6);
    var separation = rootNode.separation(forwardNode);

    var combined = rootNode.combinedExtent(forwardNode,
        25 - 6,
        separation
    );

    var expected = new parsegraph_Extent();
    expected.appendLS(19, 25);
    expected.appendLS(12, separation + 6);
    expected.appendLS(19, 25);

    if(!expected.equals(combined)) {
        resultDom.appendChild(
            expected.toDom("Expected forward extent")
        );
        resultDom.appendChild(
            combined.toDom("Actual forward extent")
        );
        return "Combining extents does not work.";
    }
});

parsegraph_checkExtentsEqual = function(caret, direction, expected, resultDom)
{
    if(caret.node().extentsAt(direction).equals(expected)) {
        return true;
    }
    if(resultDom) {
        resultDom.appendChild(
            expected.toDom(
                "Expected " + parsegraph_nameNodeDirection(direction) + " extent"
            )
        );
        resultDom.appendChild(
            caret.node().extentsAt(direction).toDom(
                "Actual " + parsegraph_nameNodeDirection(direction) + " extent"
            )
        );
        resultDom.appendChild(document.createTextNode(
            "Extent offset = " + caret.node().extentOffsetAt(direction)
        ));
    }
    return false;
};
parsegraph_NULL_NODE_ALIGNMENT = 0;
parsegraph_DO_NOT_ALIGN = 1;
parsegraph_ALIGN_NEGATIVE = 2;
parsegraph_ALIGN_CENTER = 3;
parsegraph_ALIGN_POSITIVE = 4;

// Used to align inward nodes.
parsegraph_ALIGN_HORIZONTAL = 5;
parsegraph_ALIGN_VERTICAL = 6;

function parsegraph_nameNodeAlignment(given)
{
    switch(given) {
        case parsegraph_NULL_NODE_ALIGNMENT:
            return "NULL_NODE_ALIGNMENT";
        case parsegraph_DO_NOT_ALIGN:
            return "DO_NOT_ALIGN";
        case parsegraph_ALIGN_NEGATIVE:
            return "ALIGN_NEGATIVE";
        case parsegraph_ALIGN_CENTER:
            return "ALIGN_CENTER";
        case parsegraph_ALIGN_POSITIVE:
            return "ALIGN_POSITIVE";
        case parsegraph_ALIGN_HORIZONTAL:
            return "ALIGN_HORIZONTAL";
        case parsegraph_ALIGN_VERTICAL:
            return "ALIGN_VERTICAL";
    }
    throw parsegraph_createException(parsegraph_BAD_NODE_ALIGNMENT, given);
}

function parsegraph_readNodeAlignment(given)
{
    if(typeof(given) === "number") {
        return given;
    }
    if(typeof(given) === "string") {
        given = given.toLowerCase();
        switch(given) {
        case 'none':
        case 'no':
            return parsegraph_DO_NOT_ALIGN;
        case 'negative':
        case 'neg':
        case 'n':
            return parsegraph_ALIGN_NEGATIVE;
        case 'positive':
        case 'pos':
        case 'p':
            return parsegraph_ALIGN_POSITIVE;
        case 'center':
        case 'c':
            return parsegraph_ALIGN_CENTER;
        case 'vertical':
        case 'v':
            return parsegraph_ALIGN_VERTICAL;
        case 'horizontal':
        case 'h':
            return parsegraph_ALIGN_HORIZONTAL;
        }
    }

    return parsegraph_NULL_NODE_ALIGNMENT;
}
function parsegraph_readNodeDirection(given)
{
    if(typeof(given) === "number") {
        return given;
    }
    if(typeof(given) === "string") {
        switch(given.charAt(0)) {
        case 'f':
        case 'F':
            return parsegraph_FORWARD;
            break;
        case 'b':
        case 'B':
            return parsegraph_BACKWARD;
            break;
        case 'u':
        case 'U':
            return parsegraph_UPWARD;
            break;
        case 'd':
        case 'D':
            return parsegraph_DOWNWARD;
            break;
        case 'i':
        case 'I':
            return parsegraph_INWARD;
            break;
        case 'o':
        case 'O':
            return parsegraph_OUTWARD;
            break;
        }
    }

    return parsegraph_NULL_NODE_DIRECTION;
}

function parsegraph_nameNodeDirection(given)
{
    switch(given) {
        case parsegraph_NULL_NODE_DIRECTION:
            return "NULL_NODE_DIRECTION";
        case parsegraph_FORWARD:
            return "FORWARD";
        case parsegraph_BACKWARD:
            return "BACKWARD";
        case parsegraph_DOWNWARD:
            return "DOWNWARD";
        case parsegraph_UPWARD:
            return "UPWARD";
        case parsegraph_INWARD:
            return "INWARD";
        case parsegraph_OUTWARD:
            return "OUTWARD";
    }
    throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION, given);
}
parsegraph_isNodeDirection = parsegraph_nameNodeDirection;

function parsegraph_reverseNodeDirection(given)
{
    switch(given) {
        case parsegraph_NULL_NODE_DIRECTION:
            return parsegraph_NULL_NODE_DIRECTION;
        case parsegraph_FORWARD:
            return parsegraph_BACKWARD;
        case parsegraph_BACKWARD:
            return parsegraph_FORWARD;
        case parsegraph_DOWNWARD:
            return parsegraph_UPWARD;
        case parsegraph_UPWARD:
            return parsegraph_DOWNWARD;
        case parsegraph_INWARD:
            return parsegraph_OUTWARD;
        case parsegraph_OUTWARD:
            return parsegraph_INWARD;
    }
    throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION, given);
}

function parsegraph_turnLeft(given)
{
    switch(given) {
        case parsegraph_FORWARD:
            return parsegraph_UPWARD;
        case parsegraph_BACKWARD:
            return parsegraph_DOWNWARD;
        case parsegraph_DOWNWARD:
            return parsegraph_FORWARD;
        case parsegraph_UPWARD:
            return parsegraph_BACKWARD;
        default:
            throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION, given);
    }
}

function parsegraph_turnRight(given)
{
    return parsegraph_reverseNodeDirection(
        parsegraph_turnLeft(given)
    );
}

function parsegraph_turnPositive(direction)
{
    return parsegraph_getPositiveNodeDirection(
        parsegraph_getPerpendicularAxis(direction)
    );
}

function parsegraph_turnNegative(direction)
{
    return parsegraph_reverseNodeDirection(
        parsegraph_turnPositive(direction)
    );
}

function parsegraph_isCardinalDirection(given)
{
    switch(given) {
    case parsegraph_NULL_NODE_DIRECTION:
    case parsegraph_INWARD:
    case parsegraph_OUTWARD:
        return false;
    case parsegraph_UPWARD:
    case parsegraph_DOWNWARD:
    case parsegraph_BACKWARD:
    case parsegraph_FORWARD:
        return true;
    }
    throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION, given);
}

function parsegraph_nameAxis(given)
{
    switch(given) {
    case parsegraph_NULL_AXIS:
        return "NULL_AXIS";
    case parsegraph_VERTICAL_AXIS:
        return "VERTICAL_AXIS";
    case parsegraph_HORIZONTAL_AXIS:
        return "HORIZONTAL_AXIS";
    }
}

function parsegraph_getNodeDirectionAxis(given)
{
    switch(given) {
        case parsegraph_FORWARD:
        case parsegraph_BACKWARD:
            return parsegraph_HORIZONTAL_AXIS;
        case parsegraph_DOWNWARD:
        case parsegraph_UPWARD:
            return parsegraph_VERTICAL_AXIS;
        case parsegraph_INWARD:
        case parsegraph_OUTWARD:
        case parsegraph_NULL_NODE_DIRECTION:
            return parsegraph_NULL_AXIS;
    }
    throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION, given);
}

function parsegraph_isVerticalNodeDirection(given)
{
    return parsegraph_getNodeDirectionAxis(given) === parsegraph_VERTICAL_AXIS;
}

function parsegraph_isHorizontalNodeDirection(given)
{
    return parsegraph_getNodeDirectionAxis(given) === parsegraph_HORIZONTAL_AXIS;
}

function parsegraph_getPerpendicularAxis(axisOrDirection)
{
    switch(axisOrDirection) {
        case parsegraph_HORIZONTAL_AXIS:
            return parsegraph_VERTICAL_AXIS;
            break;
        case parsegraph_VERTICAL_AXIS:
            return parsegraph_HORIZONTAL_AXIS;
        case parsegraph_NULL_AXIS:
            return parsegraph_NULL_AXIS;
        default:
            // Assume it's a direction.
            return parsegraph_getPerpendicularAxis(
                parsegraph_getNodeDirectionAxis(axisOrDirection)
            );
    }
    throw parsegraph_createException(parsegraph_BAD_AXIS, axisOrDirection);
}

function parsegraph_getPositiveNodeDirection(given)
{
    switch(given) {
        case parsegraph_HORIZONTAL_AXIS:
            return parsegraph_FORWARD;
            break;
        case parsegraph_VERTICAL_AXIS:
            return parsegraph_DOWNWARD;
        case parsegraph_NULL_AXIS:
            throw parsegraph_createException(parsegraph_BAD_AXIS, given);
    }
    throw parsegraph_createException(parsegraph_BAD_AXIS, given);
}

function parsegraph_forEachCardinalNodeDirection(func, thisArg)
{
    func.call(thisArg, parsegraph_DOWNWARD);
    func.call(thisArg, parsegraph_UPWARD);
    func.call(thisArg, parsegraph_FORWARD);
    func.call(thisArg, parsegraph_BACKWARD);
}

function parsegraph_getNegativeNodeDirection(given)
{
    return parsegraph_reverseNodeDirection(
        parsegraph_getPositiveNodeDirection(given)
    );
}

function parsegraph_isPositiveNodeDirection(given)
{
    var positiveNodeDirection = parsegraph_getPositiveNodeDirection(
        parsegraph_getNodeDirectionAxis(given)
    );
    return given == positiveNodeDirection;
}

function parsegraph_isNegativeNodeDirection(given)
{
    return parsegraph_isPositiveNodeDirection(
        parsegraph_reverseNodeDirection(given)
    );
}

function parsegraph_nodeDirectionSign(given)
{
    if(parsegraph_isPositiveNodeDirection(given)) {
        return 1;
    }
    return -1;
}

function parsegraph_alternateNodeDirection(given)
{
    switch(given) {
    case parsegraph_DOWNWARD:
    case parsegraph_INWARD:
        return parsegraph_FORWARD;
    case parsegraph_FORWARD:
        return parsegraph_DOWNWARD;
    default:
        throw new Error("NYI");
    }
}
function parsegraph_nameNodeType(given)
{
    switch(given) {
        case parsegraph_NULL_NODE_TYPE:
            return "NULL_NODE_TYPE";
        case parsegraph_SLOT:
            return "SLOT";
        case parsegraph_BLOCK:
            return "BLOCK";
        case parsegraph_BUD:
            return "BUD";
        case parsegraph_SLIDER:
            return "SLIDER";
        case parsegraph_SCENE:
            return "SCENE";
    }
    throw parsegraph_createException(parsegraph_BAD_NODE_TYPE, given);
}

function parsegraph_readNodeType(given)
{
    if(typeof(given) === "object") {
        return given;
    }
    if(typeof(given) === "number") {
        return given;
    }
    if(typeof(given) === "string") {
        given = given.toLowerCase().substring(0, 3);

        switch(given) {
        // 'b' is ambiguous, but blocks are more common, so assume that.
        case 'b':
        case 'bl':
        case 'blo':
            return parsegraph_BLOCK;
        case 'u':
        case 'bu':
        case 'bud':
            return parsegraph_BUD;
        case 's':
        case 'sl':
        case 'slo':
            return parsegraph_SLOT;
        case 'sli':
            return parsegraph_SLIDER;
        case 'sc':
        case 'sce':
            return parsegraph_SCENE;
        }
    }

    console.log("Unknown node type: " + given);
    return parsegraph_NULL_NODE_TYPE;
}
function parsegraph_nameNodeFit(given)
{
    switch(given) {
        case parsegraph_NULL_NODE_FIT:
            return "NULL_NODE_FIT";
        case parsegraph_NODE_FIT_EXACT:
            return "NODE_FIT_EXACT";
        case parsegraph_NODE_FIT_LOOSE:
            return "NODE_FIT_LOOSE";
    }
    throw new Error("Unknown node fit: " + given);
}
function parsegraph_Rect(x, y, width, height)
{
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
}

parsegraph_Rect_Tests = new parsegraph_TestSuite("parsegraph_Rect");

function parsegraph_createRect(x, y, width, height)
{
    return new parsegraph_Rect(x, y, width, height);
}

parsegraph_Rect.prototype.x = function()
{
    return this._x;
};

parsegraph_Rect.prototype.setX = function(x)
{
    this._x = x;
};

parsegraph_Rect.prototype.y = function()
{
    return this._y;
};

parsegraph_Rect.prototype.setY = function(y)
{
    this._y = y;
};

parsegraph_Rect.prototype.height = function()
{
    return this._height;
};

parsegraph_Rect.prototype.setHeight = function(height)
{
    this._height = height;
};

parsegraph_Rect.prototype.width = function()
{
    return this._width;
};

parsegraph_Rect.prototype.setWidth = function(width)
{
    this._width = width;
};

parsegraph_Rect.prototype.toString = function()
{
    return "[Rect " + this.x() + ", " + this.y() + ", " + this.width() + ", " + this.height() + "]";
};

parsegraph_Rect.prototype.vMin = function()
{
    return this.y() - this.height()/2;
};

parsegraph_Rect.prototype.vMax = function()
{
    return this.y() + this.height()/2;
};

parsegraph_Rect_Tests.addTest("vMin", function() {
    var r = new parsegraph_Rect(0, 0, 200, 200);
    if(r.vMin() !== -100) {
        return "vMin, expected -100, got " + r.vMin();
    }
});

parsegraph_Rect_Tests.addTest("vMax", function() {
    var r = new parsegraph_Rect(0, 0, 200, 200);
    if(r.vMax() !== 100) {
        return "vMax, expected 100, got " + r.vMax();
    }
});

parsegraph_Rect.prototype.hMin = function()
{
    return this.x() - this.width()/2;
};

parsegraph_Rect.prototype.hMax = function()
{
    return this.x() + this.width()/2;
};

parsegraph_Rect_Tests.addTest("hMin", function() {
    var r = new parsegraph_Rect(0, 0, 300, 200);
    if(r.hMin() !== -150) {
        return "vMin, expected -150, got " + r.vMin();
    }
});

parsegraph_Rect_Tests.addTest("hMax", function() {
    var r = new parsegraph_Rect(0, 0, 300, 200);
    if(r.hMax() !== 150) {
        return "hMax, expected 150, got " + r.vMax();
    }
});

parsegraph_Rect.prototype.include = function(bx, by, bwidth, bheight)
{
    var ax = this._x;
    var ay = this._y;
    var awidth = this._width;
    var aheight = this._height;

    var leftEdge = Math.min(ax-awidth/2, bx-bwidth/2);
    var rightEdge = Math.max(ax+awidth/2, bx+bwidth/2);
    var topEdge = Math.min(ay-aheight/2, by-bheight/2);
    var bottomEdge = Math.max(ay+aheight/2, by+bheight/2);

    var w = rightEdge - leftEdge;
    var h = bottomEdge - topEdge;
    var x = leftEdge + w/2;
    var y = topEdge + h/2;

    this._x = x;
    this._y = y;
    this._width = w;
    this._height = h;
};

parsegraph_Rect_Tests.addTest("include", function() {
    var r = new parsegraph_Rect(0, 0, 200, 200);
    r.include(0, 400, 200, 200);

    if(r.vMax() !== new parsegraph_Rect(0, 400, 200, 200).vMax()) {
        return "vMax failed to adjust";
    }
    //console.log(r);
});
parsegraph_Size_COUNT = 0;
function parsegraph_Size()
{
    this.id = parsegraph_Size_COUNT++;
    if(arguments.length > 0) {
        this[0] = arguments[0];
        this[1] = arguments[1];
    }
    else {
        this[0] = 0;
        this[1] = 0;
    }
    this.length = 2;
}

function parsegraph_createSize()
{
    var s = new parsegraph_Size();
    if(arguments.length > 1) {
        s[0] = arguments[0];
        s[1] = arguments[1];
    }
    else if(arguments.length > 0) {
        s[0] = arguments[0];
        s[1] = arguments[0];
    }
    return s;
}

parsegraph_Size.prototype.clear = function()
{
    this[0] = 0;
    this[1] = 0;
};
parsegraph_Size.prototype.reset = parsegraph_Size.prototype.clear;

parsegraph_Size.prototype.scale = function(factor)
{
    this[0] *= factor;
    this[1] *= factor;
};

parsegraph_Size.prototype.scaled = function(factor)
{
    return new parsegraph_Size(
        this[0] * factor,
        this[1] * factor
    );
};

parsegraph_Size.prototype.width = function()
{
    return this[0];
};

parsegraph_Size.prototype.setWidth = function(width)
{
    this[0] = width;
};

parsegraph_Size.prototype.height = function()
{
    return this[1];
};

parsegraph_Size.prototype.setHeight = function(height)
{
    this[1] = height;
};

parsegraph_Size.prototype.toString = function()
{
    return "[w=" + this.width() + ", h=" + this.height() + "]";
};
parsegraph_NULL_STATUS = 0;
parsegraph_OK = 1;
parsegraph_BAD_STATUS = 2;
parsegraph_NO_NODE_FOUND = 3;
parsegraph_ALREADY_OCCUPIED = 4;
parsegraph_BAD_NODE_DIRECTION = 5;
parsegraph_BAD_NODE_CONTENT = 6;
parsegraph_BAD_AXIS = 7;
parsegraph_BAD_LAYOUT_STATE = 8;
parsegraph_BAD_NODE_ALIGNMENT = 9;
parsegraph_CANNOT_AFFECT_PARENT = 10;
parsegraph_OFFSET_IS_NEGATIVE = 11;
parsegraph_NODE_IS_ROOT = 12;
parsegraph_BAD_LAYOUT_PREFERENCE = 13;

function parsegraph_nameStatus(given)
{
    switch(given) {
        case parsegraph_NULL_STATUS:
            return "NULL_STATUS";
        case parsegraph_OK:
            return "OK";
        case parsegraph_NO_NODE_FOUND:
            return "NO_NODE_FOUND";
        case parsegraph_ALREADY_OCCUPIED:
            return "ALREADY_OCCUPIED";
        case parsegraph_BAD_NODE_DIRECTION:
            return "BAD_NODE_DIRECTION";
        case parsegraph_BAD_NODE_CONTENT:
            return "BAD_NODE_CONTENT";
        case parsegraph_BAD_AXIS:
            return "BAD_AXIS";
        case parsegraph_BAD_LAYOUT_STATE:
            return "BAD_LAYOUT_STATE";
        case parsegraph_BAD_NODE_ALIGNMENT:
            return "BAD_NODE_ALIGNMENT";
        case parsegraph_NODE_IS_ROOT:
            return "NODE_IS_ROOT";
        case parsegraph_BAD_STATUS:
            return "BAD_STATUS";
        case parsegraph_CANNOT_AFFECT_PARENT:
            return "CANNOT_AFFECT_PARENT";
        case parsegraph_OFFSET_IS_NEGATIVE:
            return "OFFSET_IS_NEGATIVE";
        case parsegraph_BAD_LAYOUT_PREFERENCE:
            return "BAD_LAYOUT_PREFERENCE";
    }
    throw parsegraph_createException(parsegraph_BAD_STATUS, given);
}
function parsegraph_buildGlyphAtlas()
{
    var ga = new parsegraph_GlyphAtlas(
        parsegraph_UPSCALED_FONT_SIZE, "sans-serif", "white"
    );
    ga.setUnicode(parsegraph_defaultUnicode());
    return ga;
}

parsegraph_glBufferData_BYTES = 0;
function parsegraph_clearPerformanceCounters()
{
    parsegraph_glBufferData_BYTES = 0;
}

/**
 * Show a basic graph given a parsegraph_Node.
 */
function parsegraph_showGraph(rootNode)
{
    var surface = new parsegraph_Surface();
    var graph = new parsegraph_Graph(surface);
    graph.world().plot(rootNode, 0, 0, 0.5);
    graph.scheduleRepaint();

    var renderTimer = new parsegraph_AnimationTimer();
    renderTimer.setListener(function() {
        graph.input().Update(new Date());
        if(graph.needsRepaint()) {
            surface.paint(10);
        }
        surface.render();
        if(graph.input().UpdateRepeatedly() || graph.needsRepaint()) {
            renderTimer.schedule();
        }
    });

    graph.input().SetListener(function(affectedPaint) {
        if(affectedPaint) {
            graph.scheduleRepaint();
        }
        renderTimer.schedule();
    });
    renderTimer.schedule();

    return graph.surface().container();
}

function parsegraph_initialize(mathMode) {
    parsegraph_NATURAL_GROUP_SIZE = 250;

    parsegraph_TOUCH_SENSITIVITY = 1;
    parsegraph_MOUSE_SENSITIVITY = 1;

    // Whether Node's forward and backward are switched.
    parsegraph_RIGHT_TO_LEFT = false;

    // Node Direction
    parsegraph_NULL_NODE_DIRECTION = -1;
    parsegraph_INWARD = 0;
    parsegraph_OUTWARD = 1;
    parsegraph_DOWNWARD = 2;
    parsegraph_UPWARD = 3;
    parsegraph_BACKWARD = 4;
    parsegraph_FORWARD = 5;

    parsegraph_NUM_DIRECTIONS = 6;

    // Node Axis
    parsegraph_NULL_AXIS = 6;
    parsegraph_HORIZONTAL_AXIS = 7;
    parsegraph_VERTICAL_AXIS = 8;

    // Node Type
    parsegraph_NULL_NODE_TYPE = 9;
    parsegraph_BUD = 10;
    parsegraph_SLOT = 11;
    parsegraph_BLOCK = 12;
    parsegraph_SLIDER = 13;
    parsegraph_SCENE = 14;

    parsegraph_DEFAULT_NODE_TYPE = parsegraph_BLOCK;

    parsegraph_NULL_NODE_FIT = 14;
    parsegraph_NODE_FIT_EXACT = 15;
    parsegraph_NODE_FIT_LOOSE = 16;

    parsegraph_MAX_PRESS_RELEASE_DELAY = 1.5 * 1000;

    // Background
    parsegraph_BACKGROUND_COLOR = new parsegraph_Color(
        0, 47/255, 57/255, 1
        //256/255, 255/255, 255/255, 1
        //45/255, 84/255, 127/255, 1
    );

    // Font
    parsegraph_UPSCALED_FONT_SIZE = 144;
    parsegraph_RENDERED_FONT_SIZE = parsegraph_UPSCALED_FONT_SIZE/4;
    parsegraph_WRAP_WIDTH = 80 * parsegraph_RENDERED_FONT_SIZE;

    /**
     * The scale at which shrunk nodes are shrunk.
     */
    parsegraph_SHRINK_SCALE = .85;

    /**
     * Base font size.
     */
    parsegraph_FONT_SIZE = 72;

    /**
     * The thickness (diameter) of the line.
     */
    parsegraph_LINE_THICKNESS = 12;

    parsegraph_LINE_COLOR = new parsegraph_Color(.8, .8, .8, .6);
    parsegraph_SELECTED_LINE_COLOR = new parsegraph_Color(.8, .8, .8, 1);

    parsegraph_BUD_RADIUS = 8;

    parsegraph_MIN_BLOCK_HEIGHT = parsegraph_BUD_RADIUS*12;
    parsegraph_MIN_BLOCK_WIDTH = parsegraph_BUD_RADIUS*15;

    // Inter-node spacing
    parsegraph_HORIZONTAL_SEPARATION_PADDING = parsegraph_BUD_RADIUS;
    parsegraph_VERTICAL_SEPARATION_PADDING = parsegraph_BUD_RADIUS;

    // Configures graphs to appear grid-like; I call it 'math-mode'.
    if(mathMode) {
        parsegraph_MIN_BLOCK_WIDTH = parsegraph_BUD_RADIUS*30;
        parsegraph_MIN_BLOCK_HEIGHT = parsegraph_MIN_BLOCK_WIDTH;
        parsegraph_HORIZONTAL_SEPARATION_PADDING = 2;
        parsegraph_VERTICAL_SEPARATION_PADDING = 2;
    }

    /**
     * The separation between leaf buds and their parents.
     */
    parsegraph_BUD_LEAF_SEPARATION = 4.2;

    parsegraph_BUD_TO_BUD_VERTICAL_SEPARATION = parsegraph_BUD_RADIUS*4.5;

    parsegraph_BUD_STYLE = {
        minWidth: parsegraph_BUD_RADIUS*3,
        minHeight: parsegraph_BUD_RADIUS*3,
        horizontalPadding: parsegraph_BUD_RADIUS/2,
        verticalPadding: parsegraph_BUD_RADIUS/2,
        borderColor: new parsegraph_Color(.8, .8, .5, 1),
        backgroundColor: new parsegraph_Color(1, 1, .1, 1),
        selectedBorderColor: new parsegraph_Color(1, 1, 0, 1),
        selectedBackgroundColor: new parsegraph_Color(1, 1, .7, 1),
        brightness: 1.5,
        borderRoundness: parsegraph_BUD_RADIUS*8,
        borderThickness: parsegraph_BUD_RADIUS*2,
        maxLabelChars: null,
        fontColor: new parsegraph_Color(0, 0, 0, 1),
        selectedFontColor: new parsegraph_Color(0, 0, 0, 1),
        fontSize: parsegraph_FONT_SIZE,
        letterWidth: .61,
        verticalSeparation: 10.5 * parsegraph_VERTICAL_SEPARATION_PADDING,
        horizontalSeparation: 7 * parsegraph_HORIZONTAL_SEPARATION_PADDING
    };

    parsegraph_SLIDER_STYLE = {
        minWidth: 2*parsegraph_BUD_RADIUS*24,
        minHeight: 2*parsegraph_BUD_RADIUS*3,
        horizontalPadding: parsegraph_BUD_RADIUS/2,
        verticalPadding: parsegraph_BUD_RADIUS/2,
        borderColor: new parsegraph_Color(.9, .6, .6, 1),
        backgroundColor: new parsegraph_Color(1, .4, .4, 1),
        selectedBorderColor: new parsegraph_Color(1, .7, .7, 1),
        selectedBackgroundColor: new parsegraph_Color(1, .5, .5, 1),
        brightness: 0.5,
        borderRoundness: parsegraph_BUD_RADIUS*8,
        borderThickness: parsegraph_BUD_RADIUS*2,
        maxLabelChars: null,
        fontColor: new parsegraph_Color(0, 0, 0, 1),
        selectedFontColor: new parsegraph_Color(0, 0, 0, 1),
        fontSize: parsegraph_FONT_SIZE * (32/48),
        letterWidth: .61,
        verticalSeparation: 9 * parsegraph_VERTICAL_SEPARATION_PADDING,
        horizontalSeparation: 7 * parsegraph_HORIZONTAL_SEPARATION_PADDING
    };

    parsegraph_BLOCK_STYLE = {
        minWidth: parsegraph_MIN_BLOCK_WIDTH,
        minHeight: parsegraph_MIN_BLOCK_HEIGHT,
        horizontalPadding: 3*parsegraph_BUD_RADIUS,
        verticalPadding: .5*parsegraph_BUD_RADIUS,
        borderColor: new parsegraph_Color(.6, 1, .6, 1),
        backgroundColor: new parsegraph_Color(.75, 1, .75, 1),
        selectedBorderColor: new parsegraph_Color(.8, .8, 1, 1),
        selectedBackgroundColor: new parsegraph_Color(.75, .75, 1, 1),
        brightness: 0.75,
        borderRoundness: parsegraph_BUD_RADIUS*3,
        borderThickness: parsegraph_BUD_RADIUS*2,
        maxLabelChars: null,
        fontColor: new parsegraph_Color(0, 0, 0, 1),
        selectedFontColor: new parsegraph_Color(0, 0, 0, 1),
        fontSize: parsegraph_FONT_SIZE,
        letterWidth: .61,
        verticalSeparation: 6 * parsegraph_VERTICAL_SEPARATION_PADDING,
        horizontalSeparation: 7 * parsegraph_HORIZONTAL_SEPARATION_PADDING
    };

    if(mathMode) {
        parsegraph_BLOCK_STYLE.horizontalPadding = 2*parsegraph_BUD_RADIUS;
        parsegraph_BLOCK_STYLE.verticalPadding = .5*parsegraph_BUD_RADIUS;
    }

    parsegraph_SCENE_STYLE = {
        minWidth: 2048,
        minHeight: 1024,
        horizontalPadding: 0,
        verticalPadding: 0,
        borderColor: new parsegraph_Color(.4, .4, .4, 1),
        backgroundColor: new parsegraph_Color(.5, .5, .5, 1),
        selectedBorderColor: new parsegraph_Color(.9, .9, 1, 1),
        selectedBackgroundColor: new parsegraph_Color(.8, .8, 1, 1),
        brightness: 0.75,
        borderRoundness: parsegraph_BUD_RADIUS*3,
        borderThickness: parsegraph_BUD_RADIUS*1,
        maxLabelChars: null,
        fontColor: new parsegraph_Color(0, 0, 0, 1),
        selectedFontColor: new parsegraph_Color(0, 0, 0, 1),
        fontSize: parsegraph_FONT_SIZE,
        letterWidth: .61,
        verticalSeparation: 6 * parsegraph_VERTICAL_SEPARATION_PADDING,
        horizontalSeparation: 7 * parsegraph_HORIZONTAL_SEPARATION_PADDING
    };

    parsegraph_SLOT_STYLE = {
        minWidth: parsegraph_MIN_BLOCK_WIDTH,
        minHeight: parsegraph_MIN_BLOCK_HEIGHT,
        horizontalPadding: 3*parsegraph_BUD_RADIUS,
        verticalPadding: .5*parsegraph_BUD_RADIUS,
        borderColor: new parsegraph_Color(1, 1, 1, 1),
        backgroundColor: new parsegraph_Color(.75, .75, 1, 1),
        selectedBorderColor: new parsegraph_Color(.95, 1, .95, 1),
        selectedBackgroundColor: new parsegraph_Color(.9, 1, .9, 1),
        brightness: 0.75,
        borderRoundness: parsegraph_BUD_RADIUS*3,
        borderThickness: parsegraph_BUD_RADIUS*2,
        maxLabelChars: null,
        fontColor: new parsegraph_Color(0, 0, 0, 1),
        selectedFontColor: new parsegraph_Color(0, 0, 0, 1),
        fontSize: parsegraph_FONT_SIZE,
        letterWidth: .61,
        verticalSeparation: 6 * parsegraph_VERTICAL_SEPARATION_PADDING,
        horizontalSeparation: 7 * parsegraph_HORIZONTAL_SEPARATION_PADDING
    };

    if(mathMode) {
        parsegraph_SLOT_STYLE.horizontalPadding = 2*parsegraph_BUD_RADIUS;
        parsegraph_SLOT_STYLE.verticalPadding = .5*parsegraph_BUD_RADIUS;
    }

    if(mathMode) {
        //parsegraph_BLOCK_STYLE.verticalPadding = parsegraph_SLOT_STYLE.verticalPadding;
        parsegraph_SLOT_STYLE.borderColor.setA(1);
    }

    parsegraph_EXTENT_BORDER_COLOR = new parsegraph_Color(1, 1, 0, .1);
    parsegraph_EXTENT_BORDER_THICKNESS = parsegraph_LINE_THICKNESS;
    parsegraph_EXTENT_BACKGROUND_COLOR = new parsegraph_Color(1, 0, 0, .5);

    parsegraph_EXTENT_BORDER_ROUNDEDNESS = parsegraph_BUD_RADIUS;
    parsegraph_EXTENT_BORDER_THICKNESS = parsegraph_BUD_RADIUS;
}

function parsegraph_copyStyle(type)
{
    var rv = {};
    var copiedStyle = parsegraph_style(type);

    for(var styleName in copiedStyle) {
        rv[styleName] = copiedStyle[styleName];
    }

    return rv;
}

function parsegraph_style(type)
{
    type = parsegraph_readNodeType(type);

    switch(type) {
    case parsegraph_BUD:
    {
        return parsegraph_BUD_STYLE;
    }
    case parsegraph_SLOT:
    {
        return parsegraph_SLOT_STYLE;
    }
    case parsegraph_BLOCK:
    {
        return parsegraph_BLOCK_STYLE;
    }
    case parsegraph_SLIDER:
    {
        return parsegraph_SLIDER_STYLE;
    }
    case parsegraph_SCENE:
    {
        return parsegraph_SCENE_STYLE;
    }
    case parsegraph_NULL_NODE_TYPE:
    default:
        return null;
    }
};
function parsegraph_log(msg)
{
    return console.log(msg);
}
parsegraph_NODES_PAINTED = 0;

parsegraph_PaintGroup_COUNT = 0;
function parsegraph_PaintGroup(root)
{
    this._id = parsegraph_PaintGroup_COUNT++;

    this._root = arguments[0];
    this._dirty = true;
    this._painter = null;
    this._enabled = true;

    // Manipulated by node.
    this._childPaintGroups = [];

    this._previousPaintState = {
        i: 0,
        ordering: [this],
        commitLayoutFunc: null
    };

    if(arguments.length > 1) {
        this._worldX = arguments[1];
        this._worldY = arguments[2];
        this._userScale = arguments[3];
    }
    else {
        this._worldX = 0;
        this._worldY = 0;
        this._userScale = 1;
    }
};

parsegraph_PaintGroup.prototype.clear = function()
{
    this._childPaintGroups = [];
};

parsegraph_PaintGroup.prototype.setOrigin = function(x, y)
{
    this._worldX = x;
    this._worldY = y;

    if(Number.isNaN(this._worldX)) {
        throw new Error("WorldX must not be NaN.");
    }
    if(Number.isNaN(this._worldY)) {
        throw new Error("WorldY must not be NaN.");
    }
};

parsegraph_PaintGroup.prototype.setScale = function(scale)
{
    this._userScale = scale;
    if(Number.isNaN(this._userScale)) {
        throw new Error("Scale must not be NaN.");
    }
};

parsegraph_PaintGroup.prototype.root = function()
{
    return this._root;
};

parsegraph_PaintGroup.prototype.nodeUnderCoords = function(x, y)
{
    return this._root.nodeUnderCoords(
        x - this._worldX,
        y - this._worldY
    );
};

parsegraph_PaintGroup.prototype.assignParent = function(paintGroup)
{
    this._parent = paintGroup;
};

parsegraph_PaintGroup.prototype.markDirty = function()
{
    this._dirty = true;
    this._previousPaintState.commitLayoutFunc = null;
    this._previousPaintState.i = 0;
    this._previousPaintState.ordering = [this];

    /*this._childPaintGroups.forEach(function(pg) {
        pg.markDirty();
    }, this);*/
};

parsegraph_PaintGroup.prototype.isDirty = function()
{
    return this._dirty;
};

parsegraph_PaintGroup.prototype.painter = function()
{
    return this._painter;
};

parsegraph_PaintGroup.prototype.isEnabled = function()
{
    return this._enabled;
};

parsegraph_PaintGroup.prototype.enable = function()
{
    this._enabled = true;
};

parsegraph_PaintGroup.prototype.disable = function()
{
    this._enabled = false;
};

parsegraph_PaintGroup.prototype.paint = function(gl, backgroundColor, glyphAtlas, shaders, timeout)
{
    this.enable();

    if(!this.isDirty()) {
        return true;
    }
    if(!gl) {
        throw new Error("A WebGL context must be provided.");
    }

    var t = new Date().getTime();
    var pastTime = function() {
        return timeout !== undefined && (new Date().getTime() - t > timeout);
    };

    // Load saved state.
    var savedState = this._previousPaintState;
    var i = savedState.i;
    var ordering = savedState.ordering;

    var cont;
    if(savedState.commitLayoutFunc) {
        cont = savedState.commitLayoutFunc();
    }
    else if(i === 0) {
        cont = this._root.commitLayoutIteratively(timeout);
    }

    if(cont) {
        // Timed out during commitLayout
        savedState.commitLayoutFunc = cont;
        return false;
    }
    else {
        // Committed all layout
        savedState.commitLayoutFunc = null;
        savedState.skippedAny = false;

    }

    // Continue painting.
    while(i < ordering.length) {
        if(pastTime()) {
            savedState.i = i;
            this._dirty = true;
            return false;
        }

        var paintGroup = ordering[i];
        //console.log("Painting " + paintGroup);
        if(paintGroup.isEnabled() && paintGroup.isDirty()) {
            // Paint and render nodes marked for the current group.
            if(!paintGroup._painter) {
                paintGroup._painter = new parsegraph_NodePainter(gl, glyphAtlas, shaders);
                paintGroup._painter.setBackground(backgroundColor);
            }
            var counts = {};
            parsegraph_foreachPaintGroupNodes(paintGroup.root(), function(node) {
                paintGroup._painter.countNode(node, counts);
            }, paintGroup);
            paintGroup._painter.initBlockBuffer(counts);
            parsegraph_foreachPaintGroupNodes(paintGroup.root(), function(node) {
                paintGroup._painter.drawNode(node, shaders);
                parsegraph_NODES_PAINTED++;
            }, paintGroup);
        }
        paintGroup._dirty = false;
        ordering.push.apply(ordering, paintGroup._childPaintGroups);
        ++i;
    }

    savedState.i = 0;
    savedState.ordering = [];
    this._dirty = false;
    return this._dirty;
};

parsegraph_PaintGroup.prototype.toString = function()
{
    return "[parsegraph_PaintGroup " + this._id + "]";
}

parsegraph_PaintGroup.prototype.renderIteratively = function(world, camera)
{
    this.enable();

    this.traverseBreadth(function(paintGroup) {
        paintGroup.render(world, camera);
    }, this);
};

parsegraph_PaintGroup.prototype.traverseBreadth = function(callback, callbackThisArg)
{
    var ordering = [this];

    // Build the node list.
    for(var i = 0; i < ordering.length; ++i) {
        var paintGroup = ordering[i];
        callback.call(callbackThisArg, paintGroup, i);
        ordering.push.apply(ordering, paintGroup._childPaintGroups);
    }
};

parsegraph_PaintGroup.prototype.render = function(world, camera)
{
    if(!this.isEnabled()) {
        return;
    }
    if(!this._painter) {
        return;
    }

    // Do not render paint groups that cannot be seen.
    var s = this._painter.bounds();
    if(camera && !parsegraph_containsAny(
        -camera.x() + camera.width()/(camera.scale()*2),
        -camera.y() + camera.height()/(camera.scale()*2),
        camera.width() / camera.scale(),
        camera.height() / camera.scale(),
        s.x(),
        s.y(),
        s.width(),
        s.height()
    )) {
        //console.log(this);
        return;
    }

    //console.log("Rendering paint group: " + this._worldX + " " + this._worldY + " " + this._userScale);
    //console.log("Rendering", this, this._painter.bounds());

    this._painter.render(
        matrixMultiply3x3(
            makeScale3x3(this._userScale),
            matrixMultiply3x3(makeTranslation3x3(this._worldX, this._worldY), world)
        ),
        this._userScale * camera.scale()
    );
};

function parsegraph_foreachPaintGroupNodes(root, callback, callbackThisArg)
{
    // TODO Make this overwrite the current node, since it's no longer needed, and see
    // if this increases performance.
    var ordering = [root];
    var addNode = function(node, direction) {
        // Do not add the parent.
        if(!node.isRoot() && node.parentDirection() == direction) {
            return;
        }

        // Add the node to the ordering if it exists.
        if(node.hasNode(direction)) {
            var child = node.nodeAt(direction);

            // Do not add nodes foreign to the given group.
            if(!child.localPaintGroup() || !child.localPaintGroup().isEnabled()) {
                ordering.push(child);
            }
        }
    };

    for(var i = 0; i < ordering.length; ++i) {
        var node = ordering[i];
        addNode(node, parsegraph_INWARD);
        addNode(node, parsegraph_DOWNWARD);
        addNode(node, parsegraph_UPWARD);
        addNode(node, parsegraph_BACKWARD);
        addNode(node, parsegraph_FORWARD);
        callback.call(callbackThisArg, node);
    }
};

function parsegraph_findChildPaintGroups(root, callback, callbackThisArg)
{
    // TODO Make this overwrite the current node, since it's no longer needed, and see
    // if this increases performance.
    var ordering = [root];
    var addNode = function(node, direction) {
        // Do not add the parent.
        if(!node.isRoot() && node.parentDirection() == direction) {
            return;
        }

        // Add the node to the ordering if it exists.
        if(node.hasNode(direction)) {
            var child = node.nodeAt(direction);
            if(child.localPaintGroup()) {
                callback.call(callbackThisArg, child.localPaintGroup());
            }
            else {
                ordering.push(child);
            }
        }
    };

    for(var i = 0; i < ordering.length; ++i) {
        var node = ordering[i];
        addNode(node, parsegraph_INWARD);
        addNode(node, parsegraph_DOWNWARD);
        addNode(node, parsegraph_UPWARD);
        addNode(node, parsegraph_BACKWARD);
        addNode(node, parsegraph_FORWARD);
    }
};
function parsegraph_Carousel()
{
    // Carousel-rendered carets.
    this._carouselPaintingDirty = true;
    this._carouselPlots = [];
    this._carouselCallbacks = [];

    // Location of the carousel, in world coordinates.
    this._carouselCoords = [0, 0];
    this._carouselSize = 100;

    this._showCarousel = false;
    this._selectedCarouselPlot = null;

    this._gl = null;
    this._glyphAtlas = null;
    this._shaders = null;

    // GL painters are not created until needed.
    this._fanPainter = null;
}

parsegraph_Carousel.prototype.needsRepaint = function()
{
    return this._carouselPaintingDirty;
};

parsegraph_Carousel.prototype.prepare = function(gl, glyphAtlas, shaders)
{
    this._gl = gl;
    this._glyphAtlas = glyphAtlas;
    this._shaders = shaders;
}

parsegraph_Carousel.prototype.gl = function()
{
    return this._gl;
}

parsegraph_Carousel.prototype.moveCarousel = function(worldX, worldY)
{
    this._carouselCoords[0] = worldX;
    this._carouselCoords[1] = worldY;
};

parsegraph_Carousel.prototype.setCarouselSize = function(size)
{
    this._carouselSize = size;
};

parsegraph_Carousel.prototype.showCarousel = function()
{
    this._showCarousel = true;
};

parsegraph_Carousel.prototype.isCarouselShown = function()
{
    return this._showCarousel;
};

parsegraph_Carousel.prototype.hideCarousel = function()
{
    this._selectedCarouselPlot = null;
    this._showCarousel = false;
};

parsegraph_Carousel.prototype.addToCarousel = function(node, callback, thisArg)
{
    this._carouselCallbacks.push([callback, thisArg]);
    if(!node) {
        throw new Error("Node must not be null");
    }
    if(!node.localPaintGroup && node.root) {
        // Passed a Caret.
        node = node.root();
    }
    if(!node.localPaintGroup()) {
        node.setPaintGroup(new parsegraph_PaintGroup(node));
    }
    this._carouselPlots.push(node);
};

parsegraph_Carousel.prototype.clearCarousel = function()
{
    this._carouselPlots.splice(0, this._carouselPlots.length);
    this._carouselCallbacks.splice(0, this._carouselCallbacks.length);
    this._selectedCarouselPlot = null;
};

parsegraph_Carousel.prototype.removeFromCarousel = function(node)
{
    if(!node) {
        throw new Error("Node must not be null");
    }
    if(!node.localPaintGroup && node.root) {
        // Passed a Caret.
        node = node.root();
    }
    for(var i in this._carouselPlots) {
        if(this._carouselPlots[i] === node) {
            var removed = this._carouselPlots.splice(i, 1);
            this._carouselCallbacks.splice(i, 1);
            if(this._selectedCarouselPlot === removed) {
                this._selectedCarouselPlot = null;
            }
            return removed;
        }
    }
    return null;
};

parsegraph_Carousel.prototype.clickCarousel = function(x, y, asDown)
{
    if(!this.isCarouselShown()) {
        return false;
    }

    // Transform client coords to world coords.
    var mouseInWorld = matrixTransform2D(
        makeInverse3x3(this.camera().worldMatrix()),
        x, y
    );
    x = mouseInWorld[0];
    y = mouseInWorld[1];

    if(Math.sqrt(
        Math.pow(Math.abs(x - this._carouselCoords[0]), 2) +
        Math.pow(Math.abs(y - this._carouselCoords[1]), 2)
    ) < this._carouselSize * .75
    ) {
        if(asDown) {
            // Down events within the inner region are treated as 'cancel.'
            this.hideCarousel();
            this.scheduleRepaint();
            return true;
        }

        // Up events within the inner region are ignored.
        return false;
    }

    var angleSpan = 2 * Math.PI / this._carouselPlots.length;
    var mouseAngle = Math.atan2(y - this._carouselCoords[1], x - this._carouselCoords[0]);
    if(mouseAngle < 0) {
        // Upward half.
        mouseAngle = 2 * Math.PI + mouseAngle;
    }

    var i = Math.floor(this._carouselPlots.length * (mouseAngle) / (2 * Math.PI));

    // Click was within a carousel caret; invoke the listener.
    //console.log(alpha_ToDegrees(mouseAngle) + " degrees = caret " + i);
    var carouselPlot = this._carouselPlots[i];
    var callback = this._carouselCallbacks[i][0];
    var thisArg = this._carouselCallbacks[i][1];
    callback.call(thisArg);

    this.mouseOver(x, y);
    this.scheduleRepaint();

    return true;
};

parsegraph_Carousel.prototype.mouseOverCarousel = function(x, y)
{
    if(!this.isCarouselShown()) {
        return false;
    }

    var mouseInWorld = matrixTransform2D(
        makeInverse3x3(this.camera().worldMatrix()),
        x, y
    );
    x = mouseInWorld[0];
    y = mouseInWorld[1];

    var angleSpan = 2 * Math.PI / this._carouselPlots.length;
    var mouseAngle = Math.atan2(y - this._carouselCoords[1], x - this._carouselCoords[0]);
    //var i = Math.floor(this._carouselPlots.length * mouseAngle / (2 * Math.PI));
    //console.log(i * angleSpan);
    if(this._fanPainter) {
        this._fanPainter.setSelectionAngle(mouseAngle);
    }
    this.scheduleCarouselRepaint();
    return true;
};

parsegraph_Carousel.prototype.arrangeCarousel = function()
{
    var angleSpan = this._carouselPlots.length / (2 * Math.PI);

    var parsegraph_CAROUSEL_RADIUS = 250;
    var parsegraph_MAX_CAROUSEL_SIZE = 150;

    this._carouselPlots.forEach(function(root, i) {
        var paintGroup = root.localPaintGroup();

        // Set the origin.
        var caretRad = angleSpan/2 + (i / this._carouselPlots.length) * (2 * Math.PI);
        paintGroup.setOrigin(
            parsegraph_CAROUSEL_RADIUS * Math.cos(caretRad),
            parsegraph_CAROUSEL_RADIUS * Math.sin(caretRad)
        );

        // Set the scale.
        var commandSize = root.extentSize();
        var xMax = parsegraph_MAX_CAROUSEL_SIZE;
        var yMax = parsegraph_MAX_CAROUSEL_SIZE;
        var xShrinkFactor = 1;
        var yShrinkFactor = 1;
        if(commandSize.width() > xMax) {
            xShrinkFactor = commandSize.width() / xMax;
        }
        if(commandSize.height() > yMax) {
            yShrinkFactor = commandSize.height() / yMax;
        }
        paintGroup.setScale(1/Math.max(xShrinkFactor, yShrinkFactor));
    }, this);
};

parsegraph_Carousel.prototype.scheduleCarouselRepaint = function()
{
    //console.log("Scheduling carousel repaint.");
    this._carouselPaintingDirty = true;
    if(this.onScheduleRepaint) {
        this.onScheduleRepaint();
    }
};

parsegraph_Carousel.prototype.paint = function()
{
    if(this._carouselPaintingDirty && this._showCarousel) {
        // Paint the carousel.
        //console.log("Painting the carousel");
        for(var i in this._carouselPlots) {
            var paintGroup = this._carouselPlots[i];
            paintGroup.paint(
                this.gl(),
                this.surface().backgroundColor(),
                this.glyphAtlas(),
                this._shaders
            );
        }
        this.arrangeCarousel();

        // Paint the background highlighting fan.
        if(!this._fanPainter) {
            this._fanPainter = new parsegraph_FanPainter(this.gl());
        }
        else {
            this._fanPainter.clear();
        }
        var fanPadding = 1.2;
        this._fanPainter.setAscendingRadius(fanPadding * this._carouselSize);
        this._fanPainter.setDescendingRadius(fanPadding * 2 * this._carouselSize);
        this._fanPainter.selectRad(
            this._carouselCoords[0], this._carouselCoords[1],
            0, Math.PI * 2,
            parsegraph_createColor(1, 1, 1, 1),
            parsegraph_createColor(.5, .5, .5, .4)
        );

        this._carouselPaintingDirty = false;
    }
};

parsegraph_Carousel.prototype.render = function(world)
{
    if(this._showCarousel && !this._carouselPaintingDirty) {
        //console.log("Rendering the carousel");
        this._fanPainter.render(world);
    }

    // Render the carousel if requested.
    if(this._showCarousel && !this._carouselPaintingDirty) {
        for(var i in this._carouselPlots) {
            var paintGroup = this._carouselPlots[i];
            paintGroup.render(
                matrixMultiply3x3(makeTranslation3x3(
                    this._carouselCoords[0], this._carouselCoords[1]
                ),
                world)
            );
        }
    }
};
function parsegraph_CameraBox(graph)
{
    // Camera boxes.
    this._showCameraBoxes = true;
    this._cameraBoxDirty = true;
    this._cameraBoxes = {};
    this._cameraBoxPainter = null;

    this._graph = graph;
    this._gl = null;
    this._glyphAtlas = null;
    this._shaders = null;
}

parsegraph_CameraBox.prototype.needsRepaint = function()
{
    return this._cameraBoxDirty;
};

parsegraph_CameraBox.prototype.gl = function()
{
    return this._gl;
}

parsegraph_CameraBox.prototype.glyphAtlas = function()
{
    return this._glyphAtlas;
}

parsegraph_CameraBox.prototype.prepare = function(gl, glyphAtlas, shaders)
{
    this._gl = gl;
    this._glyphAtlas = glyphAtlas;
    this._shaders = shaders;
}

parsegraph_CameraBox.prototype.setCamera = function(name, camera)
{
    this._cameraBoxes[name] = camera;
    this._cameraBoxDirty = true;
    this._graph.scheduleRepaint();
};

parsegraph_CameraBox.prototype.removeCamera = function(name)
{
    delete this._cameraBoxes[name];
    this._cameraBoxDirty = true;
    this.scheduleRepaint();
};

parsegraph_CameraBox.prototype.paint = function()
{
    if(this._showCameraBoxes && this._cameraBoxDirty) {
        if(!this._cameraBoxPainter) {
            this._cameraBoxPainter = new parsegraph_CameraBoxPainter(
                this.gl(), this.glyphAtlas(), this._shaders
            );
        }
        else {
            this._cameraBoxPainter.clear();
        }
        this._cameraBoxPainter._blockPainter.initBuffer(this._cameraBoxes.length);
        var rect = new parsegraph_Rect();
        for(var name in this._cameraBoxes) {
            var cameraBox = this._cameraBoxes[name];
            var hw = cameraBox.width/cameraBox.scale;
            var hh = cameraBox.height/cameraBox.scale;
            rect.setX(-cameraBox.cameraX + hw/2);
            rect.setY(-cameraBox.cameraY + hh/2);
            rect.setWidth(cameraBox.width/cameraBox.scale);
            rect.setHeight(cameraBox.height/cameraBox.scale);
            this._cameraBoxPainter.drawBox(name, rect, cameraBox.scale);
        }
        this._cameraBoxDirty = false;
    }
}

parsegraph_CameraBox.prototype.render = function(world)
{
    if(this._showCameraBoxes && !this._cameraBoxDirty) {
        var gl = this.gl();
        gl.enable(gl.BLEND);
        gl.blendFunc(
            gl.SRC_ALPHA, gl.DST_ALPHA
        );
        this._cameraBoxPainter.render(world);
    }
};
/**
 * Renders an interactive parsegraph in an HTML canvas.
 *
 * TODO Add gridX and gridY camera listeners, with support for loading from an infinite grid of cells.
 *
 * TODO Add camera-movement listener, to let nodes watch for camera movement, and thus let nodes detect
 * when they are approaching critical screen boundaries:
 *
 * enteringScreen
 * leavingScreen
 *
 * Node distance is radially calculated (using the viewport's diagonal) from the camera's center, adjusted by some constant.
 *
 * hysteresis factor gives the +/- from some preset large distance (probably some hundreds of bud radiuses). Ignoring hysteresis,
 * then when the camera moves, the node's relative position may be changed. This distance is recalculated, and if it is above
 * some threshold plus hysteresis constant, and the node's state was 'near', then the node's leavingScreen is called, and the node's state is set to 'far'.
 *
 * Likewise, if the distance is lower than the same threshold minus hysteresis constant, and the node's state was 'far', then the node's enteringScreen is
 * called, and the node's state is set to 'near'.
 *
 * This distance is checked when the node is painted and also when the camera is moved.
 *
 * TODO Figure out how changing the grid size might change things.
 *
 * Grid updates based only on camera movement. Updates are reported in terms of cells made visible in either direction.
 * The number of potentially visible grid cells is determined for each axis using the camera's axis size adjusted by some constant.
 *
 * Use graph.container() to add it to the DOM.
 */
function parsegraph_Graph()
{
    // Allow surface to be created implicitly.
    var surface;
    if(arguments.length == 0) {
        surface = new parsegraph_Surface();
    }
    else {
        surface = arguments[0];
    }
    if(!surface) {
        throw new Error("Surface must be given");
    }
    this._surface = surface;
    this._canvas = surface.canvas();
    this._container = surface.container();

    this._glyphAtlas = null;

    this._world = new parsegraph_World(this);
    this._carousel = new parsegraph_Carousel(this);
    this._cameraBox = new parsegraph_CameraBox(this);

    this._surface.addPainter(this.paint, this);
    this._surface.addRenderer(this.render, this);

    this._camera = this._world.camera();

    this._input = new parsegraph_Input(this, this.camera());

    this._shaders = {};
};
parsegraph_Graph_Tests = new parsegraph_TestSuite("parsegraph_Graph");

parsegraph_Graph.prototype.shaders = function()
{
    return this._shaders;
};

parsegraph_Graph.prototype.cameraBox = function()
{
    return this._cameraBox;
};

parsegraph_Graph.prototype.world = function()
{
    return this._world;
};

parsegraph_Graph.prototype.carousel = function()
{
    return this._carousel;
};

parsegraph_Graph.prototype.camera = function()
{
    return this._world.camera();
};

parsegraph_Graph.prototype.surface = function()
{
    return this._surface;
};

parsegraph_Graph.prototype.gl = function()
{
    return this.surface().gl();
};

parsegraph_Graph.prototype.container = function()
{
    return this.surface().container();
};

parsegraph_Graph.prototype.canvas = function()
{
    return this.surface().canvas();
};

parsegraph_Graph.prototype.input = function()
{
    return this._input;
};

/**
 * Schedules a repaint. The onScheduleRepaint callback is responsible for making this
 * happen.
 *
 * The previous world paint state is cleared if this is called; this can be used to reset
 * a paint in progress.
 */
parsegraph_Graph.prototype.scheduleRepaint = function()
{
    //console.log(new Error("Scheduling repaint"));
    this._world.scheduleRepaint();
    if(this.onScheduleRepaint) {
        this.onScheduleRepaint.call(this.onScheduleRepaintThisArg);
    }
};

parsegraph_Graph.prototype.needsRepaint = function()
{
    return this._world.needsRepaint() || (this._carousel.isCarouselShown() && this._carousel.needsRepaint()) || this._cameraBox.needsRepaint();
};

parsegraph_Graph.prototype.glyphAtlas = function()
{
    if(!this._glyphAtlas) {
        throw new Error("Graph does not have a glyph atlas");
    }
    return this._glyphAtlas;
}

parsegraph_Graph.prototype.setGlyphAtlas = function(glyphAtlas)
{
    this._glyphAtlas = glyphAtlas;
}

parsegraph_Graph.prototype.plot = function()
{
    return this.world().plot.apply(this.world(), arguments);
}

/**
 * Paints the graph up to the given time, in milliseconds.
 *
 * Returns true if the graph completed painting.
 */
parsegraph_Graph.prototype.paint = function(timeout)
{
    //console.log("Painting Graph, timeout=" + timeout);
    this._shaders.gl = this.gl();
    this._shaders.glyphAtlas = this.glyphAtlas();
    this._shaders.timeout = timeout;

    this._cameraBox.prepare(this.gl(), this.glyphAtlas(), this._shaders);
    this._cameraBox.paint();
    this._carousel.prepare(this.gl(), this.glyphAtlas(), this._shaders);
    this._carousel.paint();
    var rv = this._world.paint(timeout);

    this._input.paint();
    return rv;
};

parsegraph_Graph.prototype.render = function()
{
    var world = this.camera().project();
    this._world.render(world);
    this._carousel.render(world);
    this._cameraBox.render(world);
    this._input.render(world);
};
function parsegraph_World(graph)
{
    // World-rendered graphs.
    this._worldPaintingDirty = true;
    this._worldRoots = [];

    // The node currently under the cursor.
    this._nodeUnderCursor = null;

    this._previousWorldPaintState = null;

    this._camera = null;

    this._graph = graph;
}

parsegraph_World_Tests = new parsegraph_TestSuite("parsegraph_World");

parsegraph_World.prototype.camera = function()
{
    if(!this._camera) {
        this._camera = new parsegraph_Camera(this._graph);
    }
    return this._camera;
};

parsegraph_World.prototype.setCamera = function(camera)
{
    this._camera = camera;
};


/**
 * Plots the given paint group, or creates one if constructor
 * arguments are given.
 *
 * The paint group is returned. Passing a paint group directly is the
 * preferred method. The position of the graph is the one used when
 * rendering. The caller manages the position.
 *
 * plot(node)
 * plot(root, worldX, worldY, userScale)
 */
parsegraph_World.prototype.plot = function(node, worldX, worldY, userScale)
{
    if(!node) {
        throw new Error("Node must not be null");
    }
    if(!node.localPaintGroup && node.root) {
        // Passed a Caret.
        node = node.root();
    }
    if(!node.localPaintGroup()) {
        node.setPaintGroup(new parsegraph_PaintGroup(node));
    }
    if(arguments.length > 1) {
        node.localPaintGroup().setOrigin(worldX, worldY);
        node.localPaintGroup().setScale(userScale);
    }
    this._worldRoots.push(node);
};

parsegraph_World_Tests.addTest("parsegraph_World.plot", function() {
    var w = new parsegraph_World();

    var f = 0;
    try {
        f = 1;
        w.plot(null, 0, 0, 1);
        f = 2;
    }
    catch(ex) {
        f = 3;
    }
    if(f != 3) {
        return "parsegraph_plot must fail with null node";
    }
});

parsegraph_World_Tests.addTest("world.plot with caret", function() {
    var w = new parsegraph_World();
    var car = new parsegraph_Caret('b');
    var f = 0;
    try {
        f = 1;
        w.plot(car, 0, 0, 1);
        f = 2;
    }
    catch(ex) {
        f = ex;
    }
    if(f != 2) {
        return "parsegraph_plot must handle being passed a Caret: " + f;
    }
});

/**
 *
 */
parsegraph_World.prototype.removePlot = function(plot)
{
    for(var i in this._worldRoots) {
        if(this._worldRoots[i] === plot) {
            if(this._previousWorldPaintState) {
                this._previousWorldPaintState = null;
            }
            return this._worldRoots.splice(i, 1);
        }
    }
    return null;
};

/**
 * Receives a mouseover event at the given coordinates, in client space.
 *
 * Returns true if this event processing requires a graph repaint.
 */
parsegraph_World.prototype.mouseOver = function(x, y)
{
    if(!this._camera) {
        // Never rendered.
        return;
    }
    //console.log("mouseover: " + x + ", " + y);
    var mouseInWorld = matrixTransform2D(
        makeInverse3x3(this.camera().worldMatrix()),
        x, y
    );
    x = mouseInWorld[0];
    y = mouseInWorld[1];

    var selectedNode = this.nodeUnderCoords(x, y);
    if(this._nodeUnderCursor === selectedNode) {
        // The node under cursor is already the node under cursor, so don't
        // do anything.
        //console.log("Node was the same");
        return false;
    }

    if(this._nodeUnderCursor && this._nodeUnderCursor !== selectedNode) {
        //console.log("Node is changing, so repainting.");
        this._nodeUnderCursor.setSelected(false);
        this.scheduleRepaint();
    }

    this._nodeUnderCursor = selectedNode;
    if(!selectedNode) {
        // No node was actually found.
        //console.log("No node actually found.");
        return false;
    }

    if(selectedNode.type() == parsegraph_SLIDER) {
        //console.log("Selecting slider and repainting");
        selectedNode.setSelected(true);
        this.scheduleRepaint();
    }
    else if(selectedNode.hasClickListener() && !selectedNode.isSelected()) {
        //console.log("Selecting node and repainting");
        selectedNode.setSelected(true);
        this.scheduleRepaint();
    }

    return true;
};

parsegraph_World.prototype.boundingRect = function(outRect)
{
    if(!outRect) {
        outRect = new parsegraph_Rect();
    }
    this._worldRoots.forEach(function(plot) {
        plot.commitLayoutIteratively();

        // Get plot extent data.
        var nx = plot.localPaintGroup()._worldX;
        var ny = plot.localPaintGroup()._worldY;

        var boundingValues = [0, 0, 0];
        plot.extentsAt(parsegraph_FORWARD).boundingValues(boundingValues);
        var h = boundingValues[0];
        plot.extentsAt(parsegraph_DOWNWARD).boundingValues(boundingValues);
        var w = boundingValues[0];

        var be = nx - plot.extentOffsetAt(parsegraph_FORWARD);
        var ue = ny - plot.extentOffsetAt(parsegraph_DOWNWARD);
        var fe = be + w;
        var de = ue + h;

        // Get rect values.
        var w = fe + be;
        var h = de + ue;

        // Calculate center by averaging axis extremes.
        var cx = be + w/2;
        var cy = ue + h/2;

        // Get current bounding rect.
        var inx = outRect._x;
        var iny = outRect._y;
        var inw = outRect._width;
        var inh = outRect._height;

        var outw;
        var outh;
        var outx;
        var outy;

        if(!inw || !inh || !inx || !iny) {
            outw = w;
            outh = h;
            outx = cx;
            outy = cy;
        }
        else {
            // Combine rect extents.
            var hmin = Math.min(inx - inw/2, cx - w/2);
            var hmax = Math.max(inx + inw/2, cx + w/2);
            var vmin = Math.min(iny - inh/2, cy - h/2);
            var vmax = Math.max(iny + inh/2, cy + h/2);

            // Calculate width and center.
            outw = hmax - hmin;
            outh = vmax - vmin;
            outx = hmin + outw/2;
            outy = vmin + outh/2;
        }

        // Store results.
        outRect._x = outx;
        outRect._y = outy;
        outRect._width = outw;
        outRect._height = outh;
    });

    return outRect;
};

parsegraph_World_Tests.addTest("boundingRect", function() {
    var w = new parsegraph_World();
    var car = new parsegraph_Caret('b');
    w.plot(car);
    var r = w.boundingRect();
    //console.log(r);
    if(Number.isNaN(r.width())) {
        return "Width must not be NaN";
    }
});

parsegraph_World.prototype.scheduleRepaint = function()
{
    //console.log(new Error("Scheduling repaint"));
    this._worldPaintingDirty = true;
    this._previousWorldPaintState = null;
};

parsegraph_World.prototype.nodeUnderCursor = function()
{
    return this._nodeUnderCursor;
};

/**
 * Tests whether the given position, in world space, is within a node.
 */
parsegraph_World.prototype.nodeUnderCoords = function(x, y)
{
    // Test if there is a node under the given coordinates.
    for(var i = this._worldRoots.length - 1; i >= 0; --i) {
        var selectedNode = this._worldRoots[i].nodeUnderCoords(x, y);
        if(selectedNode) {
            // Node located; no further search.
            return selectedNode;
        }
    }
    return null;
};

parsegraph_World.prototype.needsRepaint = function()
{
    return this._worldPaintingDirty;
};

parsegraph_World.prototype.paint = function(timeout)
{
    //console.log("Painting Graph, timeout=" + timeout);
    var t = new Date().getTime();
    var pastTime = function() {
        return timeout !== undefined && (new Date().getTime() - t > timeout);
    };
    var timeRemaining = function() {
        if(timeout === undefined) {
            return timeout;
        }
        return Math.max(0, timeout - (new Date().getTime() - t));
    };

    if(this._worldPaintingDirty) {
        // Restore the last state.
        var i = 0;
        var savedState;
        if(this._previousWorldPaintState !== null) {
            savedState = this._previousWorldPaintState;
            this._previousWorldPaintState = null;
            i = savedState;
        }
        else {
            parsegraph_PAINT_START = new Date();
            parsegraph_NODES_PAINTED = 0;
        }

        while(i < this._worldRoots.length) {
            if(pastTime()) {
                this._previousWorldPaintState = i;
                return false;
            }
            var plot = this._worldRoots[i];
            var paintGroup = plot.localPaintGroup();
            if(!paintGroup) {
                throw new Error("Plot no longer has a paint group?!");
            }
            parsegraph_PAINTING_GLYPH_ATLAS = this._graph.glyphAtlas();
            var paintCompleted = paintGroup.paint(
                this._graph.gl(),
                this._graph.surface().backgroundColor(),
                this._graph.glyphAtlas(),
                this._graph._shaders,
                timeRemaining()
            );
            parsegraph_PAINTING_GLYPH_ATLAS = null;

            if(!paintCompleted) {
                this._previousWorldPaintState = i;
                return false;
            }

            ++i;
        }
        this._worldPaintingDirty = false;
    }

    if(!this._worldPaintingDirty && parsegraph_NODES_PAINTED > 0) {
        var paintDuration = (new Date().getTime() - parsegraph_PAINT_START.getTime());
        console.log("Painted " + parsegraph_NODES_PAINTED + " nodes over " + (paintDuration/1000) + "s. (" + (parsegraph_NODES_PAINTED/(paintDuration/1000)) + " nodes/sec)");
        parsegraph_NODES_PAINTED = 0;
        parsegraph_PAINT_START = null;
    }
};

parsegraph_World.prototype.render = function(world)
{
    for(var i in this._worldRoots) {
        var plot = this._worldRoots[i];
        var paintGroup = plot.localPaintGroup();
        if(!paintGroup) {
            throw new Error("Plot no longer has a paint group?!");
        }
        paintGroup.renderIteratively(world, this.camera());
    }
};
// These are additional tests for graph's layout.

parsegraph_Graph_Tests.addTest("parsegraph_Graph", function() {
    var caret = new parsegraph_Caret(parsegraph_SLOT);
    if(caret.node().type() !== parsegraph_SLOT) {
        return "Graph must use the provided type for its root.";
    }
    caret = new parsegraph_Caret(parsegraph_BUD);
    if(caret.node().type() !== parsegraph_BUD) {
        return "Graph must use the provided type for its root.";
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph.spawn", function() {
    var caret = new parsegraph_Caret('b');
    if(
       caret.has(parsegraph_FORWARD) ||
       caret.has(parsegraph_BACKWARD) ||
       caret.has(parsegraph_UPWARD) ||
       caret.has(parsegraph_DOWNWARD)
    ) {
        return "Graph roots must begin as leaves.";
    }

    caret.spawn(parsegraph_FORWARD, parsegraph_SLOT);
    if(!caret.has(parsegraph_FORWARD)) {
        return "Graph must add nodes in the specified direction.";
    }
    if(
        caret.has(parsegraph_DOWNWARD) ||
        caret.has(parsegraph_BACKWARD) ||
        caret.has(parsegraph_UPWARD)
    ) {
        return "Graph must not add nodes in incorrect directions.";
    }

    caret.erase(parsegraph_FORWARD);
    if(
       caret.has(parsegraph_FORWARD) ||
       caret.has(parsegraph_BACKWARD) ||
       caret.has(parsegraph_UPWARD) ||
       caret.has(parsegraph_DOWNWARD)
    ) {
        return "Erase must remove the specified node.";
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Trivial layout", function() {
    // Spawn the graph.
    //console.log("TRIV");
    var caret = new parsegraph_Caret('b');
    caret.node().commitLayoutIteratively();

    // Run the comparison tests.
    if(
        caret.node().extentOffsetAt(parsegraph_FORWARD) !=
        caret.node().blockStyle().minHeight / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().verticalPadding
    ) {
        console.log(caret.node().extentOffsetAt(parsegraph_FORWARD));
        console.log(caret.node().blockStyle().minHeight / 2);
        console.log(caret.node().blockStyle().borderThickness);
        console.log(caret.node().blockStyle().verticalPadding);
        console.log(caret.node().blockStyle().minHeight / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().verticalPadding);
        return "Forward extent offset for block must match.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_BACKWARD) !=
        caret.node().blockStyle().minHeight / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().verticalPadding
    ) {
        console.log(caret.node().extentOffsetAt(parsegraph_BACKWARD));
        console.log(caret.node().blockStyle().minHeight / 2);
        console.log(caret.node().blockStyle().borderThickness);
        console.log(caret.node().blockStyle().verticalPadding);
        return "Backward extent offset for block must match.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_UPWARD) !=
        caret.node().blockStyle().minWidth / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().horizontalPadding
    ) {
        console.log(caret.node().extentOffsetAt(parsegraph_UPWARD));
        console.log(caret.node().blockStyle().minWidth / 2);
        console.log(caret.node().blockStyle().borderThickness);
        console.log(caret.node().blockStyle().horizontalPadding);
        return "Upward extent offset for block must match.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_DOWNWARD) !=
        caret.node().blockStyle().minWidth / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().horizontalPadding
    ) {
        console.log(caret.node().extentOffsetAt(parsegraph_DOWNWARD));
        console.log(caret.node().blockStyle().minWidth / 2);
        console.log(caret.node().blockStyle().borderThickness);
        console.log(caret.node().blockStyle().horizontalPadding);
        return "Downward extent offset for block must match.";
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with forward bud", function() {
    // Spawn the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_FORWARD, parsegraph_BUD);
    caret.node().commitLayoutIteratively();

    // Run the comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        caret.node().blockStyle().minHeight / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().verticalPadding,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth/ 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth/ 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with backward bud", function() {
    // Spawn the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_BACKWARD, parsegraph_BUD);
    caret.node().commitLayoutIteratively();
    caret.moveToRoot();

    // Run the comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        caret.node().blockStyle().minHeight / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().verticalPadding,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        caret.node().blockStyle().minHeight / 2 +
        caret.node().blockStyle().borderThickness +
        caret.node().blockStyle().verticalPadding,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bud').minWidth +
        parsegraph_style('bud').borderThickness * 2 +
        parsegraph_style('bud').horizontalPadding * 2 +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('block').minWidth / 2 +
        parsegraph_style('block').borderThickness +
        parsegraph_style('block').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bud').minWidth +
        parsegraph_style('bud').borderThickness * 2 +
        parsegraph_style('bud').horizontalPadding * 2 +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('block').minWidth / 2 +
        parsegraph_style('block').borderThickness +
        parsegraph_style('block').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with downward bud", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.node().commitLayoutIteratively();
    caret.moveToRoot();

    // Run the comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('block').verticalPadding +
        parsegraph_style('block').borderThickness +
        parsegraph_style('block').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }


    diff = expect(
        parsegraph_style('block').verticalPadding +
        parsegraph_style('block').borderThickness +
        parsegraph_style('block').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('block').minWidth / 2 +
        parsegraph_style('block').borderThickness +
        parsegraph_style('block').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('block').minWidth / 2 +
        parsegraph_style('block').borderThickness +
        parsegraph_style('block').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Bud with downward block", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BUD);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BLOCK);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run the comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('bu').verticalPadding
        + parsegraph_style('bu').borderThickness
        + parsegraph_style('bu').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').verticalPadding
        + parsegraph_style('bu').borderThickness
        + parsegraph_style('bu').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style("b").minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style("b").minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Bud with vertical blocks, two deep", function(dom) {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BUD);

    var depth = 2;
    caret.push();
    for(var i = 0; i < depth; ++i) {
        caret.spawnMove(parsegraph_UPWARD, parsegraph_BLOCK);
    }
    caret.pop();
    caret.push();
    for(var i = 0; i < depth; ++i) {
        caret.spawnMove(parsegraph_DOWNWARD, parsegraph_BLOCK);
    }
    caret.pop();
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var computedBlockSize = parsegraph_style('b').verticalPadding * 2
        + parsegraph_style('b').borderThickness * 2
        + parsegraph_style('b').minHeight
        + caret.node().nodeAt(parsegraph_UPWARD).verticalSeparation(parsegraph_UPWARD);

    var diff = expect(
        computedBlockSize * (depth - 1)
        + parsegraph_style('b').verticalPadding * 2
        + parsegraph_style('b').borderThickness * 2
        + parsegraph_style('b').minHeight
        + caret.node().verticalSeparation(parsegraph_UPWARD)
        + parsegraph_style('bu').verticalPadding
        + parsegraph_style('bu').borderThickness
        + parsegraph_style('bu').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        computedBlockSize * (depth - 1)
        + parsegraph_style('b').verticalPadding * 2
        + parsegraph_style('b').borderThickness * 2
        + parsegraph_style('b').minHeight
        + caret.node().verticalSeparation(parsegraph_UPWARD)
        + parsegraph_style('bu').verticalPadding
        + parsegraph_style('bu').borderThickness
        + parsegraph_style('bu').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with upward bud", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_UPWARD, parsegraph_BUD);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }


    diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with upward and downward buds", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);

    caret.spawn(parsegraph_UPWARD, parsegraph_BUD);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with forward and backward buds", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_FORWARD, parsegraph_BUD);
    caret.spawn(parsegraph_BACKWARD, parsegraph_BUD);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').minWidth +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').horizontalPadding * 2 +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').minWidth +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').horizontalPadding * 2 +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Double Axis Sans Backward T layout", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_FORWARD, parsegraph_BUD);
    caret.spawn(parsegraph_UPWARD, parsegraph_BUD);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    if(
        caret.node().extentOffsetAt(parsegraph_BACKWARD) !=
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_UPWARD) !=
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Positive Direction Layout", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_UPWARD, parsegraph_BUD);
    caret.spawn(parsegraph_FORWARD, parsegraph_BUD);
    caret.node().commitLayoutIteratively();

    // Run the tests.
    if(
        caret.node().extentOffsetAt(parsegraph_BACKWARD) !=
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_UPWARD) !=
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('bu').minHeight +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').verticalPadding * 2 +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }


    diff = expect(
        parsegraph_style('bu').minHeight +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').verticalPadding * 2 +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Negative Direction Layout", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_BACKWARD, parsegraph_BUD);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    if(
        caret.node().extentOffsetAt(parsegraph_BACKWARD) !=
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_UPWARD) !=
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').minWidth +
        2 * parsegraph_style('bu').horizontalPadding +
        2 * parsegraph_style('bu').borderThickness +
        caret.node().horizontalSeparation(parsegraph_DOWNWARD) +
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').horizontalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minWidth +
        caret.node().horizontalSeparation(parsegraph_DOWNWARD) +
        parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Double Axis layout", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_BACKWARD, parsegraph_BUD);
    caret.spawn(parsegraph_FORWARD, parsegraph_BUD);
    caret.spawn(parsegraph_UPWARD, parsegraph_BUD);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    if(
        caret.node().extentOffsetAt(parsegraph_BACKWARD) !=
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_UPWARD) !=
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('bu').minHeight +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').verticalPadding * 2 +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').minHeight / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').verticalPadding,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_FORWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').minWidth +
        2 * parsegraph_style('bu').horizontalPadding +
        2 * parsegraph_style('bu').borderThickness +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').horizontalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minWidth +
        caret.node().horizontalSeparation(parsegraph_FORWARD) +
        parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Block with shrunk bud", function(resultDom) {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.fitExact();
    caret.spawnMove(parsegraph_FORWARD, parsegraph_BUD);
    caret.shrink();
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    var expectedSeparation = parsegraph_style('b').minWidth / 2
        + parsegraph_style('b').horizontalPadding
        + parsegraph_style('b').borderThickness
        + parsegraph_SHRINK_SCALE * caret.node().horizontalSeparation(parsegraph_FORWARD)
        + parsegraph_SHRINK_SCALE * (
            parsegraph_style('bu').horizontalPadding
            + parsegraph_style('bu').borderThickness
            + parsegraph_style('bu').minWidth / 2
        );
    if(
        caret.node().separationAt(parsegraph_FORWARD)
        != expectedSeparation
    ) {
        return "Expected forward separation = " + expectedSeparation + ", actual = " + caret.node().separationAt(parsegraph_FORWARD);
    }

    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var downwardExtent = new parsegraph_Extent();
    downwardExtent.appendLS(
        parsegraph_style('b').minWidth
        + parsegraph_style('b').borderThickness * 2
        + parsegraph_style('b').horizontalPadding * 2,
        parsegraph_style('b').verticalPadding
        + parsegraph_style('b').borderThickness
        + parsegraph_style('b').minHeight / 2
    );
    downwardExtent.appendLS(
        parsegraph_SHRINK_SCALE
            * caret.node().horizontalSeparation(parsegraph_FORWARD),
        parsegraph_SHRINK_SCALE * parsegraph_LINE_THICKNESS / 2
    );
    downwardExtent.appendLS(
        parsegraph_SHRINK_SCALE * (
            2 * parsegraph_style('bu').horizontalPadding
            + 2 * parsegraph_style('bu').borderThickness
            + parsegraph_style('bu').minWidth
        ),
        parsegraph_SHRINK_SCALE * (
            parsegraph_style('bu').horizontalPadding
            + parsegraph_style('bu').borderThickness
            + parsegraph_style('bu').minWidth / 2
        )
    );

    if(!caret.node().extentsAt(parsegraph_DOWNWARD).equals(downwardExtent)) {
        //graph._nodePainter.enableExtentRendering();
        //resultDom.appendChild(
            //graph._container
        //);
        resultDom.appendChild(
            downwardExtent.toDom("Expected downward extent")
        );
        resultDom.appendChild(
            caret.node().extentsAt(parsegraph_DOWNWARD).toDom("Actual downward extent")
        );
        resultDom.appendChild(document.createTextNode(
            "Extent offset = " + caret.node().extentOffsetAt(parsegraph_DOWNWARD)
        ));
        return "Downward extent differs.";
    }

    var blockHeight = parsegraph_style('b').minHeight
        + parsegraph_style('b').borderThickness * 2
        + parsegraph_style('b').verticalPadding * 2

    var budHeight = parsegraph_style('bu').minHeight
        + parsegraph_style('bu').borderThickness * 2
        + parsegraph_style('bu').verticalPadding * 2

    var forwardExtent = new parsegraph_Extent();
    forwardExtent.appendLS(
        blockHeight / 2 - parsegraph_SHRINK_SCALE * budHeight / 2,
        parsegraph_style('b').minWidth / 2
            + parsegraph_style('b').horizontalPadding
            + parsegraph_style('b').borderThickness
    );
    forwardExtent.appendLS(
        parsegraph_SHRINK_SCALE * budHeight,
        parsegraph_style('b').minWidth / 2
            + parsegraph_style('b').horizontalPadding
            + parsegraph_style('b').borderThickness
            + parsegraph_SHRINK_SCALE * caret.node().horizontalSeparation(parsegraph_FORWARD)
            + parsegraph_SHRINK_SCALE * budHeight
    );
    forwardExtent.appendLS(
        blockHeight / 2 - parsegraph_SHRINK_SCALE * budHeight / 2,
        parsegraph_style('b').minWidth / 2
            + parsegraph_style('b').horizontalPadding
            + parsegraph_style('b').borderThickness
    );

    if(!caret.node().extentsAt(parsegraph_FORWARD).equals(forwardExtent)) {
        graph._nodePainter.enableExtentRendering();
        resultDom.appendChild(
            graph._container
        );
        resultDom.appendChild(
            forwardExtent.toDom("Expected forward extent")
        );
        resultDom.appendChild(
            caret.node().extentsAt(parsegraph_FORWARD).toDom("Actual forward extent")
        );
        resultDom.appendChild(document.createTextNode(
            "Extent offset = " + caret.node().extentOffsetAt(parsegraph_FORWARD)
        ));
        return "Forward extent differs.";
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Bud with 2-deep shrunk downward block", function(resultDom) {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BUD);
    caret.fitExact();
    caret.spawnMove(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.shrink();
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BLOCK);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    var downwardExtent = new parsegraph_Extent();
    downwardExtent.appendLS(
        parsegraph_SHRINK_SCALE * (
            parsegraph_style('b').minWidth
            + parsegraph_style('b').borderThickness * 2
            + parsegraph_style('b').horizontalPadding * 2
        ),
        parsegraph_style('bu').verticalPadding + parsegraph_style('bu').borderThickness + parsegraph_style('bu').minHeight / 2
        + parsegraph_SHRINK_SCALE * caret.node().verticalSeparation(parsegraph_DOWNWARD)
        + parsegraph_SHRINK_SCALE * 2 * (parsegraph_style('bu').verticalPadding + parsegraph_style('bu').borderThickness + parsegraph_style('bu').minHeight / 2)
        + parsegraph_SHRINK_SCALE * caret.node().nodeAt(parsegraph_DOWNWARD).verticalSeparation(parsegraph_DOWNWARD)
        + parsegraph_SHRINK_SCALE * (parsegraph_style('b').minHeight + parsegraph_style('b').verticalPadding * 2 + parsegraph_style('b').borderThickness * 2)
    );

    if(!parsegraph_checkExtentsEqual(caret, parsegraph_DOWNWARD, downwardExtent, resultDom)) {
        // TODO Insert graph.
        return "Downward extent differs.";
    }
});

parsegraph_Graph_Tests.addTest("parsegraph_Graph - Double Axis Sans Forward T layout", function() {
    // Build the graph.
    var caret = new parsegraph_Caret(parsegraph_BLOCK);
    caret.spawn(parsegraph_BACKWARD, parsegraph_BUD);
    caret.spawn(parsegraph_UPWARD, parsegraph_BUD);
    caret.spawn(parsegraph_DOWNWARD, parsegraph_BUD);
    caret.moveToRoot();
    caret.node().commitLayoutIteratively();

    // Run comparison tests.
    if(
        caret.node().extentOffsetAt(parsegraph_BACKWARD) !=
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    if(
        caret.node().extentOffsetAt(parsegraph_UPWARD) !=
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    ) {
        return "Graphs symmetric about the root should have symmetric extent offsets.";
    }

    var expect = function(expected, actual) {
        var diff = expected - actual;
        if(diff) {
            console.log("expected=" + expected + ", actual=" + actual);
        }
        return diff;
    };

    var diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_FORWARD)
    );
    if(diff) {
        console.log(
            "Forward extent (offset to center=" +
            caret.node().extentOffsetAt(parsegraph_FORWARD) +
            ")"
        );
        var forwardExtent = caret.node().extentsAt(parsegraph_FORWARD);
        forwardExtent.forEach(function(length, size, i) {
            console.log(i + ". l=" + length + ", s=" + size);
        });

        console.log("UPWARDExtent (offset to center=" +
            caret.node().extentOffsetAt(parsegraph_UPWARD) +
            ")"
        );
        var UPWARDExtent = caret.node().extentsAt(parsegraph_UPWARD);
        UPWARDExtent.forEach(function(length, size, i) {
            console.log(i + ". l=" + length + ", s=" + size);
        });

        return "Forward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').verticalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minHeight +
        caret.node().verticalSeparation(parsegraph_UPWARD) +
        parsegraph_style('b').verticalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minHeight / 2,
        caret.node().extentOffsetAt(parsegraph_BACKWARD)
    );
    if(diff) {
        return "Backward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').minWidth +
        2 * parsegraph_style('bu').horizontalPadding +
        2 * parsegraph_style('bu').borderThickness +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('b').minWidth / 2 +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').horizontalPadding,
        caret.node().extentOffsetAt(parsegraph_UPWARD)
    );
    if(diff) {
        return "Upward extent offset is off by " + diff;
    }

    diff = expect(
        parsegraph_style('bu').horizontalPadding * 2 +
        parsegraph_style('bu').borderThickness * 2 +
        parsegraph_style('bu').minWidth +
        caret.node().horizontalSeparation(parsegraph_BACKWARD) +
        parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2,
        caret.node().extentOffsetAt(parsegraph_DOWNWARD)
    );
    if(diff) {
        return "Downward extent offset is off by " + diff;
    }
});

parsegraph_Graph_Tests.addTest("Centrally aligned back-and-forth", function() {
    var car = new parsegraph_Caret('b');
    car.spawnMove('d', 'bu');
    car.align('f', 'c');
    car.spawnMove('f', 'bu');
    car.spawnMove('d', 'bu');

    car.root().commitLayoutIteratively();
    var sep = car.root().separationAt(parsegraph_DOWNWARD);

    //console.log("Bud size: " + (parsegraph_style('bu').horizontalPadding * 2 +
        //parsegraph_style('bu').borderThickness * 2 +
        //parsegraph_style('bu').minWidth));
    //console.log("Vertical separation: " + car.root().verticalSeparation(parsegraph_DOWNWARD));
    //console.log("Block size: " + (parsegraph_style('b').horizontalPadding * 2 +
        //parsegraph_style('b').borderThickness * 2 +
        //parsegraph_style('b').minWidth));
    //console.log(sep);
    /*return sep - (
        (parsegraph_style('b').horizontalPadding +
        parsegraph_style('b').borderThickness +
        parsegraph_style('b').minWidth / 2) +
        car.root().verticalSeparation(parsegraph_DOWNWARD) +
        (parsegraph_style('bu').horizontalPadding +
        parsegraph_style('bu').borderThickness +
        parsegraph_style('bu').minWidth / 2)
    );*/
});

parsegraph_Graph_Tests.addTest("Label test", function() {
    var car = new parsegraph_Caret('b');
    car.setGlyphAtlas(parsegraph_buildGlyphAtlas());
    car.label('No time');

    car.root().commitLayoutIteratively();
});
var parsegraph_RESET_CAMERA_KEY = "Escape";
var parsegraph_CLICK_KEY = "q";

var parsegraph_MOVE_UPWARD_KEY = "ArrowUp";
var parsegraph_MOVE_DOWNWARD_KEY = "ArrowDown";
var parsegraph_MOVE_BACKWARD_KEY = "ArrowLeft";
var parsegraph_MOVE_FORWARD_KEY = "ArrowRight";
var parsegraph_CARET_COLOR = new parsegraph_Color(0, 0, 0, .5);
var parsegraph_FOCUSED_SPOTLIGHT_COLOR = new parsegraph_Color(1, 1, 1, .5);
var parsegraph_FOCUSED_SPOTLIGHT_SCALE = 6;

//var parsegraph_MOVE_UPWARD_KEY = "w";
//var parsegraph_MOVE_DOWNWARD_KEY = "s";
//var parsegraph_MOVE_BACKWARD_KEY = "a";
//var parsegraph_MOVE_FORWARD_KEY = "d";

var parsegraph_ZOOM_IN_KEY = "Shift";
var parsegraph_ZOOM_OUT_KEY = " ";

function parsegraph_Input(graph, camera)
{
    this._graph = graph;
    this._camera = camera;

    var attachedMouseListener = null;
    var mousedownTime = null;

    var touchX;
    var touchY;

    var lastMouseX = 0;
    var lastMouseY = 0;

    this._updateRepeatedly = false;

    this._caretPainter = null;
    this._caretPos = [];
    this._caretColor = parsegraph_CARET_COLOR;
    this._focusedNode = null;
    this._focusedLabel = false;

    this._spotlightPainter = null;
    this._spotlightColor = parsegraph_FOCUSED_SPOTLIGHT_COLOR;

    this.lastMouseCoords = function() {
        return [lastMouseX, lastMouseY];
    };

    this.lastMouseX = function() {
        return lastMouseX;
    };

    this.lastMouseY = function() {
        return lastMouseY;
    };

    // Whether the container is focused and not blurred.
    var focused = false;

    // A map of event.key's to a true value.
    this.keydowns = {};

    var checkForNodeClick = function(clientX, clientY) {
        var mouseInWorld = matrixTransform2D(
            makeInverse3x3(this._camera.worldMatrix()),
            clientX, clientY
        );
        //console.log(clientX, clientY);
        //console.log(mouseInWorld);
        var selectedNode = graph.world().nodeUnderCoords(mouseInWorld[0], mouseInWorld[1]);
        if(!selectedNode) {
            //console.log("No node found under coords:", mouseInWorld);
            return null;
        }

        //console.log("Node found for coords:", mouseInWorld, selectedNode);

        // Check if the selected node was a slider.
        if(selectedNode.type() == parsegraph_SLIDER) {
            //console.log("Slider node!");
            selectedSlider = selectedNode;
            attachedMouseListener = sliderListener;
            sliderListener.call(this, clientX, clientY);
            this._graph.scheduleRepaint();
            return selectedNode;
        }

        // Check if the selected node has a click listener.
        if(selectedNode.hasClickListener()) {
            //console.log("Selected Node has click listener", selectedNode);
            var rv = selectedNode.click();
            if(rv !== false) {
                return selectedNode;
            }
        }

        // Check if the label was clicked.
        //console.log("Clicked");
        if(selectedNode._label && !Number.isNaN(selectedNode._labelX) && selectedNode._label.editable()) {
            //console.log("Clicked label");
            selectedNode._label.click(
                (mouseInWorld[0] - selectedNode._labelX) / selectedNode._labelScale,
                (mouseInWorld[1] - selectedNode._labelY) / selectedNode._labelScale
            );
            console.log(selectedNode._label.caretLine());
            console.log(selectedNode._label.caretPos());
            this._focusedLabel = true;
            this._focusedNode = selectedNode;
            this._graph.scheduleRepaint();
            return selectedNode;
        }
        if(selectedNode && !selectedNode.ignoresMouse()) {
            //console.log("Setting focusedNode to ", selectedNode);
            this._focusedNode = selectedNode;
            this._focusedLabel = false;
            this._graph.scheduleRepaint();
            //console.log("Selected Node has nothing", selectedNode);
            return selectedNode;
        }

        return null;
    };

    parsegraph_addEventListener(graph.container(), "focus", function(event) {
        focused = true;
    });

    parsegraph_addEventListener(graph.container(), "blur", function(event) {
        focused = false;
    });

    /**
     * The receiver of all graph canvas wheel events.
     */
    var onWheel = function(event) {
        event.preventDefault();

        // Get the mouse coordinates, relative to bottom-left of the canvas.
        var boundingRect = graph.canvas().getBoundingClientRect();
        var x = event.clientX - boundingRect.left;
        var y = event.clientY - boundingRect.top;

        var wheel = normalizeWheel(event);

        // Adjust the scale.
        var numSteps = .4 * -wheel.spinY;
        camera.zoomToPoint(Math.pow(1.1, numSteps), x, y);
        this.Dispatch(false, "wheel", true);
    };
    parsegraph_addEventMethod(graph.canvas(), "DOMMouseScroll", onWheel, this, false);
    parsegraph_addEventMethod(graph.canvas(), "mousewheel", onWheel, this, false);

    var zoomTouchDistance = 0;
    var monitoredTouches = [];
    var getTouchByIdentifier = function(identifier) {
        for(var i = 0; i < monitoredTouches.length; ++i) {
            if(monitoredTouches[i].identifier == identifier) {
                return monitoredTouches[i];
            }
        }
        return null;
    };

    var removeTouchByIdentifier = function(identifier) {
        for(var i = 0; i < monitoredTouches.length; ++i) {
            if(monitoredTouches[i].identifier == identifier) {
                monitoredTouches.splice(i--, 1);
            }
        }
        return null;
    };

    /*
     * Touch event handling
     */

    parsegraph_addEventMethod(graph.canvas(), "touchmove", function(event) {
        if(!focused) {
            return;
        }
        event.preventDefault();
        //console.log("touchmove");

        for(var i = 0; i < event.changedTouches.length; ++i) {
            var touch = event.changedTouches[i];
            var touchRecord = getTouchByIdentifier(touch.identifier);

            if(monitoredTouches.length == 1) {
                // Move.
                camera.adjustOrigin(
                    (touch.clientX - touchRecord.x) / camera.scale(),
                    (touch.clientY - touchRecord.y) / camera.scale()
                );
                this.Dispatch(false, "touchmove");
            }
            touchRecord.x = touch.clientX;
            touchRecord.y = touch.clientY;
            lastMouseX = touch.clientX;
            lastMouseY = touch.clientY;
        }

        var realMonitoredTouches = 0;
        monitoredTouches.forEach(function(touchRec) {
            if(touchRec.touchstart) {
                realMonitoredTouches++;
            }
        }, this);
        if(realMonitoredTouches > 1) {
            // Zoom.
            var dist = Math.sqrt(
                Math.pow(
                    monitoredTouches[1].x - monitoredTouches[0].x,
                    2
                ) +
                Math.pow(
                    monitoredTouches[1].y - monitoredTouches[0].y,
                    2
                )
            );
            var zoomCenter = midPoint(
                monitoredTouches[0].x, monitoredTouches[0].y,
                monitoredTouches[1].x, monitoredTouches[1].y
            );
            camera.zoomToPoint(
                dist / zoomTouchDistance,
                zoomCenter[0],
                zoomCenter[1]
            );
            this.Dispatch(false, "touchzoom");
            zoomTouchDistance = dist;
        }
    }, this);

    var selectedSlider = null;
    var sliderListener = function(mouseX, mouseY) {
        // Get the current mouse position, in world space.
        var mouseInWorld = matrixTransform2D(
            makeInverse3x3(camera.worldMatrix()),
            mouseX, mouseY
        );
        var x = mouseInWorld[0];
        var y = mouseInWorld[1];

        //if(parsegraph_isVerticalNodeDirection(selectedSlider.parentDirection())) {
            var nodeWidth = selectedSlider.absoluteSize().width();
            if(x <= selectedSlider.absoluteX() - nodeWidth / 2) {
                // To the left!
                selectedSlider.setValue(0);
            }
            else if(x >= selectedSlider.absoluteX() + nodeWidth / 2) {
                // To the right!
                selectedSlider.setValue(1);
            }
            else {
                // In between.
                //console.log("x=" + x);
                //console.log("selectedSlider.absoluteX()=" + selectedSlider.absoluteX());
                //console.log("PCT: " + (x - selectedSlider.absoluteX()));
                //console.log("In between: " + ((nodeWidth/2 + x - selectedSlider.absoluteX()) / nodeWidth));
                selectedSlider.setValue((nodeWidth/2 + x - selectedSlider.absoluteX()) / nodeWidth);
            }
            selectedSlider.layoutWasChanged();
        //}
        if(selectedSlider.hasClickListener()) {
            selectedSlider.click();
        }
        this.Dispatch(true, "slider");
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        return true;
    };

    var touchstartTime;

    parsegraph_addEventMethod(graph.canvas(), "touchstart", function(event) {
        event.preventDefault();
        focused = true;

        for(var i = 0; i < event.changedTouches.length; ++i) {
            var touch = event.changedTouches.item(i);
            var touchRec = {
                "identifier": touch.identifier,
                "x":touch.clientX,
                "y":touch.clientY,
                "touchstart":null
            };
            monitoredTouches.push(touchRec);
            lastMouseX = touch.clientX;
            lastMouseY = touch.clientY;

            // Get the current mouse position, in world space.
            //alert(camera.worldMatrix());
            if(graph.carousel().clickCarousel(lastMouseX, lastMouseY, true)) {
                return;
            }

            if(checkForNodeClick.call(this, lastMouseX, lastMouseY)) {
                // A significant node was clicked.
                this.Dispatch(true, "touchstart");
                touchstartTime = null;
                return;
            }

            touchRec.touchstart = Date.now();
            touchstartTime = Date.now();
        }

        var realMonitoredTouches = 0;
        monitoredTouches.forEach(function(touchRec) {
            if(touchRec.touchstart) {
                realMonitoredTouches++;
            }
        }, this);
        if(realMonitoredTouches > 1) {
            // Zoom.
            zoomTouchDistance = Math.sqrt(
                Math.pow(
                    monitoredTouches[1].x - monitoredTouches[0].x,
                    2
                ) +
                Math.pow(
                    monitoredTouches[1].y - monitoredTouches[0].y,
                    2
                )
            );
            this.Dispatch(false, "touchzoomstart");
        }
    }, this, true);

    var isDoubleTouch = false;
    var touchendTimeout = 0;

    var afterTouchTimeout = function() {
        touchendTimeout = null;

        if(isDoubleTouch) {
            // Double touch ended.
            isDoubleTouch = false;
            return;
        }

        // Single touch ended.
        isDoubleTouch = false;
    };

    var removeTouchListener = function(event) {
        //console.log("touchend");
        for(var i = 0; i < event.changedTouches.length; ++i) {
            var touch = event.changedTouches.item(i);
            removeTouchByIdentifier(touch.identifier);
        }

        if(touchstartTime != null && Date.now() - touchstartTime < parsegraph_CLICK_DELAY_MILLIS) {
            touchendTimeout = setTimeout(afterTouchTimeout, parsegraph_CLICK_DELAY_MILLIS);
        }

        graph.carousel().clickCarousel(lastMouseX, lastMouseY, false);

        return true;
    };

    parsegraph_addEventListener(graph.canvas(), "touchend", removeTouchListener);
    parsegraph_addEventListener(graph.canvas(), "touchcancel", removeTouchListener);

    /*
     * Mouse event handling
     */

    /**
     * Receives events that cause the camera to be moved.
     */
    var mouseDragListener = function(mouseX, mouseY) {
        var deltaX = mouseX - lastMouseX;
        var deltaY = mouseY - lastMouseY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        camera.adjustOrigin(
            deltaX / camera.scale(),
            deltaY / camera.scale()
        );
        this.Dispatch(false, "mouseDrag world", true);
    };

    parsegraph_addEventMethod(graph.canvas(), "mousemove", function(event) {
        if(graph.carousel().isCarouselShown()) {
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            this.Dispatch(graph.mouseOverCarousel(event.clientX, event.clientY), "mousemove carousel");
            return;
        }

        // Moving during a mousedown i.e. dragging (or zooming)
        if(attachedMouseListener) {
            return attachedMouseListener.call(this, event.clientX, event.clientY);
        }

        // Just a mouse moving over the (focused) canvas.
        this.Dispatch(graph.world().mouseOver(event.clientX, event.clientY), "mousemove world", false);
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }, this);

    parsegraph_addEventMethod(graph.canvas(), "mousedown", function(event) {
        //console.log("Mousedown!");
        focused = true;
        event.preventDefault();
        graph.canvas().focus();

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        if(graph.carousel().isCarouselShown()) {
            //console.log("Clickcarousel");
            graph.carousel().clickCarousel(event.clientX, event.clientY, true);
            // Carousel was hidden.
            if(!graph.carousel().isCarouselShown()) {
                this.Dispatch(graph.mouseOver(lastMouseX, lastMouseY), "mouseover after carousel hide");
            }
            return;
        }

        if(checkForNodeClick.call(this, lastMouseX, lastMouseY)) {
            // A significant node was clicked.
            //console.log("Node clicked.");
            this.Dispatch(true, "mousedown node");
            mousedownTime = null;
            return;
        }

        this._focusedLabel = false;
        this._focusedNode = null;
        if(this._caretPainter) {
            this._caretPainter.initBuffer(1);
        }
        if(this._spotlightPainter) {
            this._spotlightPainter.clear();
        }

        // Dragging on the canvas.
        attachedMouseListener = mouseDragListener;
        //console.log("Repainting graph");
        this.Dispatch(false, "mousedown canvas");

        //console.log("Setting mousedown time");
        mousedownTime = Date.now();

        // This click is a second click following a recent click; it's a double-click.
        if(mouseupTimeout) {
            window.clearTimeout(mouseupTimeout);
            mouseupTimeout = null;
            isDoubleClick = true;
        }
    }, this);

    var isDoubleClick = false;
    var mouseupTimeout = 0;

    var afterMouseTimeout = function() {
        mouseupTimeout = null;

        if(isDoubleClick) {
            // Double click ended.
            isDoubleClick = false;
            //console.log("Double click detected");
        }
        else {
            //console.log("Single click detected");
        }

        // Single click ended.
        isDoubleClick = false;

        // We double-clicked.
    };

    var removeMouseListener = function(event) {
        //console.log("MOUSEUP");

        if(!attachedMouseListener) {
            if(graph.carousel().clickCarousel(lastMouseX, lastMouseY, false)) {
                // Mouseup affected carousel.

                // Carousel was hidden.
                if(!graph.carousel().isCarouselShown()) {
                    this.Dispatch(graph.mouseOver(lastMouseX, lastMouseY), "mouseup");
                }
                return;
            }
            //console.log("No attached listeenr");
            return;
        }
        attachedMouseListener = null;

        if(
            mousedownTime != null
            && Date.now() - mousedownTime < parsegraph_CLICK_DELAY_MILLIS
        ) {
            //console.log("Click detected");
            if(isDoubleClick) {
                afterMouseTimeout();
                return;
            }
            mouseupTimeout = setTimeout(
                afterMouseTimeout,
                parsegraph_CLICK_DELAY_MILLIS/5
            );
        }
        else {
            //console.log("Click missed timeout");
        }
    };

    var getproperkeyname = function(event) {
        var keyName = event.key;
        //console.log(keyName + " " + event.keyCode);
        switch(keyName) {
            case "Enter": return keyName;
            case "Escape": return keyName;
            case "ArrowLeft": return keyName;
            case "ArrowUp": return keyName;
            case "ArrowRight": return keyName;
            case "ArrowDown": return keyName;
        }
        switch(event.keyCode) {
            case 13: keyName = "Enter"; break;
            case 27: keyName = "Escape"; break;
            case 37: keyName = "ArrowLeft"; break;
            case 38: keyName = "ArrowUp"; break;
            case 39: keyName = "ArrowRight"; break;
            case 40: keyName = "ArrowDown"; break;
        }
        return keyName;
    };

    parsegraph_addEventMethod(document, "keydown", function(event) {
        if(event.altKey || event.metaKey) {
            //console.log("Key event had ignored modifiers");
            return;
        }
        if(event.ctrlKey && event.shiftKey) {
            return;
        }

        var keyName = getproperkeyname(event);
        if(this._focusedNode && focused) {
            if(event.key.length === 0) {
                return;
            }
            if(this._focusedNode._label && event.ctrlKey) {
                if(this._focusedNode._label.ctrlKey(event.key)) {
                    //console.log("LAYOUT CHANGED");
                    this._focusedNode.layoutWasChanged();
                    this._graph.scheduleRepaint();
                    return;
                }
            }
            else if(this._focusedNode.hasKeyListener() && this._focusedNode.key(event.key) !== false
            ) {
                console.log("KEY PRESSED FOR LISTENER; LAYOUT CHANGED");
                this._focusedNode.layoutWasChanged();
                this._graph.scheduleRepaint();
                return;
            }
            else if(this._focusedNode._label && this._focusedNode._label.editable() && this._focusedNode._label.key(event.key)) {
                //console.log("LABEL ACCEPTS KEY; LAYOUT CHANGED");
                this._focusedNode.layoutWasChanged();
                this._graph.scheduleRepaint();
                return;
            }
            // Didn't move the caret, so interpret it as a key move
            // on the node itself.
            var node = this._focusedNode;
            var skipHorizontalInward = event.ctrlKey;
            var skipVerticalInward = event.ctrlKey;
            while(true) {
                switch(event.key) {
                case parsegraph_RESET_CAMERA_KEY:
                    this._focusedNode = null;
                    this._focusedLabel = false;
                    break;
                case parsegraph_MOVE_BACKWARD_KEY:
                    var neighbor = node.nodeAt(parsegraph_BACKWARD);
                    if(neighbor) {
                        this._focusedNode = neighbor;
                        this._focusedLabel = true;
                        this._graph.scheduleRepaint();
                        return;
                    }
                    neighbor = node.nodeAt(parsegraph_OUTWARD);
                    if(neighbor) {
                        this._focusedNode = neighbor;
                        this._focusedLabel = true;
                        this._graph.scheduleRepaint();
                        return;
                    }
                    break;
                case parsegraph_MOVE_FORWARD_KEY:
                    if(
                        node.hasNode(parsegraph_INWARD) &&
                        node.nodeAlignmentMode(parsegraph_INWARD) != parsegraph_ALIGN_VERTICAL &&
                        !skipHorizontalInward
                    ) {
                        this._focusedNode = node.nodeAt(parsegraph_INWARD);
                        this._focusedLabel = true;
                        this._graph.scheduleRepaint();
                        return;
                    }
                    //console.log("ArrowRight");
                    var neighbor = node.nodeAt(parsegraph_FORWARD);
                    if(neighbor) {
                        this._focusedNode = neighbor;
                        this._focusedLabel = !event.ctrlKey;
                        this._graph.scheduleRepaint();
                        return;
                    }
                    neighbor = node.nodeAt(parsegraph_OUTWARD);
                    if(neighbor) {
                        console.log("Going outward");
                        skipHorizontalInward = true;
                        node = neighbor;
                        continue;
                    }
                    // Search up the parents hoping that an inward node can be escaped.
                    while(true) {
                        if(node.isRoot()) {
                            // The focused node is not within an inward node.
                            return;
                        }
                        var pdir = node.parentDirection();
                        node = node.nodeAt(pdir);
                        if(pdir === parsegraph_OUTWARD) {
                            // Found the outward node to escape.
                            skipHorizontalInward = true;
                            break;
                        }
                    }
                    // Continue traversing using the found node.
                    continue;
                case parsegraph_MOVE_DOWNWARD_KEY:
                    neighbor = node.nodeAt(parsegraph_DOWNWARD);
                    if(neighbor) {
                        this._focusedNode = neighbor;
                        this._graph.scheduleRepaint();
                        this._focusedLabel = true;
                        return;
                    }
                    break;
                case parsegraph_MOVE_UPWARD_KEY:
                    neighbor = node.nodeAt(parsegraph_UPWARD);
                    if(neighbor) {
                        this._focusedNode = neighbor;
                        this._graph.scheduleRepaint();
                        this._focusedLabel = true;
                        return;
                    }
                    break;
                case "Backspace":
                    break;
                case "Tab":
                    var toNode = event.shiftKey ?
                        this._focusedNode._prevTabNode :
                        this._focusedNode._nextTabNode;
                    if(toNode) {
                        this._focusedNode = toNode;
                        this._graph.scheduleRepaint();
                        event.preventDefault();
                        break;
                    }
                    // Fall through otherwise.
                    break;
                case "Enter":
                    if(this._focusedNode.hasKeyListener()) {
                        if(this._focusedNode.key("Enter")) {
                            // Node handled it.
                            event.preventDefault();
                            break;
                        }
                        // Nothing handled it.
                    }
                    // Fall through.
                default:
                    return;
                }
                break;
            }

            if(this._focusedNode) {
                return;
            }
            if(event.key === parsegraph_RESET_CAMERA_KEY) {
                this._graph.scheduleRepaint();
                return;
            }
        }

        if(this.keydowns[keyName]) {
            // Already processed.
            //console.log("Key event, but already processed.");
            return;
        }
        this.keydowns[keyName] = new Date();

        switch(keyName) {
        case parsegraph_CLICK_KEY:
            //console.log("Q key for click pressed!");
            if(graph.carousel().clickCarousel(lastMouseX, lastMouseY, true)) {
                // Mousedown affected carousel.

                // Carousel was hidden.
                if(!graph.carousel().isCarouselShown()) {
                    this.Dispatch(graph.mouseOver(lastMouseX, lastMouseY), "q");
                }
                return;
            }
            if(graph.nodeUnderCursor()) {
                graph.nodeUnderCursor().click();
            }
            // fall through
        case parsegraph_ZOOM_IN_KEY:
        case parsegraph_ZOOM_OUT_KEY:
        case parsegraph_MOVE_DOWNWARD_KEY:
        case parsegraph_MOVE_UPWARD_KEY:
        case parsegraph_MOVE_BACKWARD_KEY:
        case parsegraph_MOVE_FORWARD_KEY:
        case parsegraph_RESET_CAMERA_KEY:
            this.Dispatch(false, "keydown", true);
            break;
        }
    }, this);

    parsegraph_addEventMethod(document, "keyup", function(event) {
        var keyName = getproperkeyname(event);

        if(!this.keydowns[keyName]) {
            // Already processed.
            return;
        }
        delete this.keydowns[keyName];

        switch(keyName) {
        case parsegraph_CLICK_KEY:
            if(graph.carousel().clickCarousel(lastMouseX, lastMouseY, false)) {
                // Keyup affected carousel.

                // Carousel was hidden.
                if(!graph.carousel().isCarouselShown()) {
                    this.Dispatch(graph.mouseOver(lastMouseX, lastMouseY), "q carousel");
                }
            }
            // fall through
        case parsegraph_ZOOM_IN_KEY:
        case parsegraph_ZOOM_OUT_KEY:
        case parsegraph_RESET_CAMERA_KEY:
        case parsegraph_MOVE_DOWNWARD_KEY:
        case parsegraph_MOVE_UPWARD_KEY:
        case parsegraph_MOVE_BACKWARD_KEY:
        case parsegraph_MOVE_FORWARD_KEY:
            this.Dispatch(false, "keyup", true);
            break;
        }
    }, this);

    parsegraph_addEventMethod(graph.canvas(), "mouseup", removeMouseListener, this);

    // Ensure the mousemove listener is removed if we switch windows or change focus.
    parsegraph_addEventMethod(graph.canvas(), "mouseout", removeMouseListener, this);

    this.listener = null;
};

parsegraph_Input.prototype.SetListener = function(listener, thisArg)
{
    if(!listener) {
        this.listener = null;
        return;
    }
    if(!thisArg) {
        thisArg = this;
    }
    this.listener = [listener, thisArg];
};

parsegraph_Input.prototype.UpdateRepeatedly = function()
{
    return this._updateRepeatedly;
};

parsegraph_Input.prototype.Update = function(t)
{
    var cam = this._camera;

    var xSpeed = 1000 / cam.scale();
    var ySpeed = 1000 / cam.scale();
    var scaleSpeed = 20;

    var inputChangedScene = false;
    this._updateRepeatedly = false;

    if(this.Get(parsegraph_RESET_CAMERA_KEY) && this._graph.surface()._gl) {
        //var defaultScale = .5;
        var defaultScale = 1;
        var x = this._graph.gl().drawingBufferWidth / 2;
        var y = this._graph.gl().drawingBufferHeight / 2;
        if(cam.x() === x && cam.y() === y) {
            cam.setScale(defaultScale);
        }
        else {
            x = this._graph.gl().drawingBufferWidth / (2 * defaultScale);
            y = this._graph.gl().drawingBufferHeight / (2 * defaultScale);
            cam.setOrigin(x, y);
        }
        inputChangedScene = true;
    }

    if(this.Get(parsegraph_MOVE_BACKWARD_KEY) || this.Get(parsegraph_MOVE_FORWARD_KEY) || this.Get(parsegraph_MOVE_UPWARD_KEY) || this.Get(parsegraph_MOVE_DOWNWARD_KEY)) {
        this._updateRepeatedly = true;
        var x = cam._cameraX + (this.Elapsed(parsegraph_MOVE_BACKWARD_KEY, t) * xSpeed + this.Elapsed(parsegraph_MOVE_FORWARD_KEY, t) * -xSpeed);
        var y = cam._cameraY + (this.Elapsed(parsegraph_MOVE_UPWARD_KEY, t) * ySpeed + this.Elapsed(parsegraph_MOVE_DOWNWARD_KEY, t) * -ySpeed);
        cam.setOrigin(x, y);
        inputChangedScene = true;
    }

    var lastCoords = this.lastMouseCoords();
    if(this.Get(parsegraph_ZOOM_OUT_KEY)) {
        this._updateRepeatedly = true;
        cam.zoomToPoint(Math.pow(1.1, scaleSpeed * this.Elapsed(parsegraph_ZOOM_OUT_KEY, t)),
            this._graph.gl().drawingBufferWidth / 2,
            this._graph.gl().drawingBufferHeight / 2
        );
        inputChangedScene = true;
    }
    if(this.Get(parsegraph_ZOOM_IN_KEY)) {
        this._updateRepeatedly = true;
        cam.zoomToPoint(Math.pow(1.1, -scaleSpeed * this.Elapsed(parsegraph_ZOOM_IN_KEY, t)),
            this._graph.gl().drawingBufferWidth / 2,
            this._graph.gl().drawingBufferHeight / 2
        );
        inputChangedScene = true;
    }
    //this.Dispatch(false, "update", inputChangedScene);

    var x = cam._cameraX;
    var y = cam._cameraY;
    var r = this._graph.world().boundingRect();
    x = Math.max(x, r.x() - r.width()/2);
    x = Math.min(x, r.x() + r.width()/2);
    y = Math.max(y, r.y() - r.height()/2);
    y = Math.min(y, r.y() + r.height()/2);
    //console.log("BR", x, y, r);
    //cam.setOrigin(x, y);

    return inputChangedScene;
};

parsegraph_Input.prototype.Get = function(key)
{
    return this.keydowns[key] ? 1 : 0;
};

parsegraph_Input.prototype.Elapsed = function(key, t)
{
    var v = this.keydowns[key];
    if(!v) {
        return 0;
    }
    var elapsed = (t.getTime() - v.getTime()) / 1000;
    this.keydowns[key] = t;
    return elapsed;
};

parsegraph_Input.prototype.paint = function()
{
    if(!this._caretPainter) {
        this._caretPainter = new parsegraph_BlockPainter(this._graph.gl(), this._graph.shaders());
    }
    if(!this._spotlightPainter) {
        this._spotlightPainter = new parsegraph_SpotlightPainter(
            this._graph.gl(), this._graph.shaders()
        );
    }

    this._caretPainter.initBuffer(1);
    this._caretPainter.setBorderColor(this._caretColor);
    this._caretPainter.setBackgroundColor(this._caretColor);

    this._spotlightPainter.clear();

    if(!this._focusedNode) {
        return;
    }

    var label = this._focusedNode._label;
    if(!label || !label.editable() || !this._focusedLabel) {
        var s = this._focusedNode.absoluteSize();
        var srad = Math.min(
            parsegraph_FOCUSED_SPOTLIGHT_SCALE * s.width() * this._focusedNode.absoluteScale(),
            parsegraph_FOCUSED_SPOTLIGHT_SCALE * s.height() * this._focusedNode.absoluteScale()
        );
        this._spotlightPainter.drawSpotlight(
            this._focusedNode.absoluteX(),
            this._focusedNode.absoluteY(),
            srad,
            this._spotlightColor
        );
        return;
    }

    var cr = label.getCaretRect();
    if(this._focusedNode._labelX != null && this._focusedNode._labelY != null) {
        this._caretPainter.drawBlock(
            this._focusedNode._labelX + cr.x() * this._focusedNode._labelScale,
            this._focusedNode._labelY + cr.y() * this._focusedNode._labelScale,
            this._focusedNode._labelScale * cr.width(),
            this._focusedNode._labelScale * cr.height(),
            0.01,
            0.02,
            1
        );
    }
};

parsegraph_Input.prototype.focusedNode = function()
{
    return this._focusedNode;
}

parsegraph_Input.prototype.setFocusedNode = function(focusedNode)
{
    this._focusedNode = focusedNode;
}

parsegraph_Input.prototype.focusedLabel = function()
{
    return this._focusedLabel;
}

parsegraph_Input.prototype.render = function(world)
{
    var gl = this._graph.gl();
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    this._caretPainter.render(world);
    gl.enable(gl.BLEND);
    this._spotlightPainter.render(world);
}

parsegraph_Input.prototype.Dispatch = function()
{
    if(this.listener) {
        this.listener[0].apply(this.listener[1], arguments);
    }
};
parsegraph_BlockPainter_VertexShader =
"uniform mat3 u_world;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec2 a_texCoord;\n" +
"attribute vec4 a_color;\n" +
"attribute vec4 a_borderColor;\n" +
"attribute float a_borderRoundedness;\n" +
"attribute float a_borderThickness;\n" +
"attribute float a_aspectRatio;\n" +
"\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float borderThickness;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp vec4 contentColor;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = vec4((u_world * vec3(a_position, 1.0)).xy, 0.0, 1.0);" +
    "contentColor = a_color;" +
    "borderColor = a_borderColor;" +
    "borderRoundedness = max(0.001, a_borderRoundedness);" +
    "texCoord = a_texCoord;" +
    "borderThickness = a_borderThickness;" +
    "aspectRatio = a_aspectRatio;" +
"}";

// Derived from https://thebookofshaders.com/07/
parsegraph_BlockPainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "\n" +
    // Adjust for the aspect ratio.
    "st.x = mix(st.x, pow(abs(st.x), 1.0/aspectRatio), step(aspectRatio, 1.0));\n" +
    "st.y = mix(st.y, pow(abs(st.y), aspectRatio), 1.0 - step(aspectRatio, 1.0));\n" +

    // Calculate the distance function.
    "highp float d = length(max(abs(st) - (1.0 - borderRoundedness), 0.0));" +

    // Default antialias implementation.
    "highp float borderTolerance = 0.0;" +
    "highp float inBorder = 1.0 - smoothstep(" +
        "borderRoundedness - borderTolerance, " +
        "borderRoundedness + borderTolerance, " +
        "d" +
    ");" +
    "highp float edgeWidth = 0.0;" +
    "highp float inContent = 1.0 - smoothstep(" +
        "(borderRoundedness - borderThickness) - edgeWidth," +
        "(borderRoundedness - borderThickness) + edgeWidth," +
        "d" +
    ");" +

    // Map the two calculated indicators to their colors.
    "gl_FragColor = vec4(borderColor.rgb, borderColor.a * inBorder);" +
    "gl_FragColor = mix(gl_FragColor, contentColor, inContent);" +
"}";

// Same as above, but using a better antialiasing technique.
parsegraph_BlockPainter_FragmentShader_OES_standard_derivatives =
"#extension GL_OES_standard_derivatives : enable\n" +
"\n" +
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"highp float aastep(float threshold, float value)\n" +
"{\n" +
    "highp float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\n" +
    "return smoothstep(threshold - afwidth, threshold + afwidth, value);\n" +
    //"return step(threshold, value);\n" +
"}\n" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "\n" +
    // Adjust for the aspect ratio.
    "st.x = mix(st.x, pow(abs(st.x), 1.0/aspectRatio), step(aspectRatio, 1.0));\n" +
    "st.y = mix(st.y, pow(abs(st.y), aspectRatio), 1.0 - step(aspectRatio, 1.0));\n" +

    // Calculate the distance function.
    "highp float d = length(max(abs(st) - (1.0 - borderRoundedness), 0.0));" +

    // Using 'OpenGL insights' antialias implementation
    "highp float inBorder = 1.0 - aastep(borderRoundedness, d);\n" +
    "highp float inContent = 1.0 - aastep(borderRoundedness - borderThickness, d);\n" +

    // Map the two calculated indicators to their colors.
    "gl_FragColor = vec4(borderColor.rgb, borderColor.a * inBorder);" +
    "gl_FragColor = mix(gl_FragColor, contentColor, inContent);" +
"}";

// Derived from https://thebookofshaders.com/07/
parsegraph_BlockPainter_SquareFragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "\n" +
    // Adjust for the aspect ratio.
    "st.x = mix(st.x, pow(abs(st.x), 1.0/aspectRatio), step(aspectRatio, 1.0));\n" +
    "st.y = mix(st.y, pow(abs(st.y), aspectRatio), 1.0 - step(aspectRatio, 1.0));\n" +
    "\n"+
    "st.x = abs(st.x);" +
    "st.y = abs(st.y);" +
    "if(st.y < 1.0 - borderThickness && st.x < 1.0 - borderThickness) {" +
        "gl_FragColor = contentColor;" +
    "} else {" +
        "gl_FragColor = borderColor;" +
    "}" +
"}";

// Derived from https://thebookofshaders.com/07/
parsegraph_BlockPainter_ShadyFragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
// Plot a line on Y using a value between 0.0-1.0
"float plot(vec2 st, float pct) {" +
  "return smoothstep(pct-0.02, pct, st.y) - smoothstep(pct, pct+0.02, st.y);" +
"}" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "\n" +
    // Adjust for the aspect ratio.
    "st.x = mix(st.x, pow(abs(st.x), 1.0/aspectRatio), step(aspectRatio, 1.0));\n" +
    "st.y = mix(st.y, pow(abs(st.y), aspectRatio), 1.0 - step(aspectRatio, 1.0));\n" +
    "\n"+
    "gl_FragColor = vec4(vec3(0.5 - (0.3 * st.y)), 1.0);" +
"}";

// Derived from https://thebookofshaders.com/07/
parsegraph_BlockPainter_AngleFragmentShader =
"#extension GL_OES_standard_derivatives : enable\n" +
"\n" +
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
// borderThickness is in [0, 1] terms.
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"void main() {\n" +
    // Adjust for the aspect ratio.
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "st.x = abs(st.x);" +
    "st.y = abs(st.y);" +

    // 1.0 if st is inside the X-axis border.
    "highp float t = borderThickness;" +
    "highp float insideYContent = 1.0 - step(1.0 - t, st.y);" +
    "highp float insideXBorder = step(1.0 - t, st.x);" +

    // y = y1 + m(x - x1)
    "highp float insideBorderAngle = 1.0 - step((st.x - 1.0)/-t, st.y);" +
    "highp float insideContentAngle = 1.0 - step((st.x - 1.0)/-t - aspectRatio, st.y);" +

    "highp float inBorder = step(1.0, insideBorderAngle);\n" +
    "highp float inContent = step(1.0, insideContentAngle * insideYContent);\n" +

    // Map the two calculated indicators to their colors.
    "gl_FragColor = vec4(borderColor.rgb, borderColor.a * inBorder);" +
    "gl_FragColor = mix(gl_FragColor, contentColor, inBorder * inContent);" +
"}";

// Derived from https://thebookofshaders.com/07/
parsegraph_BlockPainter_ParenthesisFragmentShader =
"#extension GL_OES_standard_derivatives : enable\n" +
"\n" +
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    // Adjust for the aspect ratio.
    "st.x = mix(st.x, pow(abs(st.x), 1.0/aspectRatio), step(aspectRatio, 1.0));\n" +
    "st.y = mix(st.y, pow(abs(st.y), aspectRatio), 1.0 - step(aspectRatio, 1.0));\n" +
    "st.x = abs(st.x);" +
    "st.y = abs(st.y);" +

    // 1.0 if st is inside the X-axis border.
    "highp float t = borderThickness;" +
    "highp float insideYContent = step(1.0 - t, st.y);" +
    "highp float insideXBorder = step(1.0 - t, st.x/(1.0 - t/2.0));" +

    "highp float inBorder = step(1.0, 1.0 - insideXBorder + 1.0 - step(1.0, length(vec2((st.x - (1.0 - t))/t, st.y/(1.0 + 2.0*t)))));" +
    "highp float inContent = step(1.0, 1.0 - step(1.0 - t, st.x)*(1.0 - insideYContent) + 1.0 - step(1.0 - t, length(vec2((st.x/(1.0 - t) - (1.0 - t))/t, st.y/(1.0 + 3.0*t)))));" +

    // Map the two calculated indicators to their colors.
    "gl_FragColor = vec4(borderColor.rgb, borderColor.a * inBorder);" +
    "gl_FragColor = mix(gl_FragColor, contentColor, inContent);" +
"}";

// Derived from https://thebookofshaders.com/07/
parsegraph_BlockPainter_CurlyFragmentShader =
"#extension GL_OES_standard_derivatives : enable\n" +
"\n" +
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec4 borderColor;\n" +
"varying highp float borderRoundedness;\n" +
"varying highp vec2 texCoord;\n" +
// borderThickness is in [0, 1] terms.
"varying highp float borderThickness;\n" +
"varying highp float aspectRatio;\n" +
"\n" +
"void main() {\n" +
    // Adjust for the aspect ratio.
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "st.x = abs(st.x);" +
    "st.y = abs(st.y);" +

    "highp float t = borderThickness;" +
    "highp float inBorder = step(st.y, smoothstep(0.0, t, 1.0 - st.x));" +
    "highp float inContent = step(1.0, step(st.y, (1.0-t)*smoothstep(0.0, t, 1.0 - (st.x + t*aspectRatio))));" +

    // Map the two calculated indicators to their colors.
    "gl_FragColor = vec4(borderColor.rgb, borderColor.a * inBorder);" +
    "gl_FragColor = mix(gl_FragColor, contentColor, inBorder * inContent);" +
"}";

function parsegraph_BlockPainter(gl, shaders)
{
    this._gl = gl;
    if(!this._gl || !this._gl.createProgram) {
        throw new Error("A GL interface must be given");
    }
    if(!shaders) {
        throw new Error("A shaders object must be given");
    }

    // Compile the shader program.
    var shaderName = "parsegraph_BlockPainter";
    if(!shaders[shaderName]) {
        var program = gl.createProgram();
        gl.attachShader(
            program,
            compileShader(
                gl,
                parsegraph_BlockPainter_VertexShader,
                gl.VERTEX_SHADER
            )
        );

        var fragProgram = parsegraph_BlockPainter_FragmentShader;
        // OES_standard_derivatives looks worse on FF.
        if(
        navigator.userAgent.indexOf("Firefox") == -1 &&
        gl.getExtension("OES_standard_derivatives") != null) {
            fragProgram = parsegraph_BlockPainter_FragmentShader_OES_standard_derivatives;
        }

        // For development.
   //     gl.getExtension("OES_standard_derivatives");
  //      fragProgram = parsegraph_BlockPainter_CurlyFragmentShader;
//       fragProgram = parsegraph_BlockPainter_ParenthesisFragmentShader;
//        fragProgram = parsegraph_BlockPainter_SquareFragmentShader;
//fragProgram = parsegraph_BlockPainter_AngleFragmentShader;

        gl.attachShader(
            program,
            compileShader(
                gl,
                fragProgram,
                gl.FRAGMENT_SHADER
            )
        );

        gl.linkProgram(program);
        if(!gl.getProgramParameter(
            program, gl.LINK_STATUS
        )) {
            throw new Error("'" + shaderName + "' shader program failed to link.");
        }

        shaders[shaderName] = program;
    }
    this._blockProgram = shaders[shaderName];

    // Prepare buffer using initBuffer(numBlocks). BlockPainter supports a fixed number of blocks.
    this._blockBuffer = null;
    this._numBlocks = null;
    this._numFaces = 0;
    this._numVertices = 0;

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this._blockProgram, "u_world"
    );

    // Setup initial uniform values.
    this._backgroundColor = parsegraph_createColor(1, 1, 1, .15);

    this._borderColor = parsegraph_createColor(
        parsegraph_createColor(1, 1, 1, 1)
    );

    this._bounds = null;
    this.a_position = this._gl.getAttribLocation(this._blockProgram, "a_position");
    this.a_texCoord = this._gl.getAttribLocation(this._blockProgram, "a_texCoord");
    this.a_color = this._gl.getAttribLocation(this._blockProgram, "a_color");
    this.a_borderColor = this._gl.getAttribLocation(this._blockProgram, "a_borderColor");
    this.a_borderRoundedness = this._gl.getAttribLocation(this._blockProgram, "a_borderRoundedness");
    this.a_borderThickness = this._gl.getAttribLocation(this._blockProgram, "a_borderThickness");
    this.a_aspectRatio = this._gl.getAttribLocation(this._blockProgram, "a_aspectRatio");

    // Position: 2 * 4 (two floats)  0-7
    // TexCoord: 2 * 4 (two floats)  8-15
    // Color:    4 * 4 (four floats) 16-31
    // BorColor: 4 * 4 (four floats) 32-47
    // BorRound: 1 * 4 (one float)   48-51
    // BorThick: 1 * 4 (one float)   52-55
    // AspectRa: 1 * 4 (one float)   56-59
    this._stride = 60;
    this._itemBuffer = new DataView(new ArrayBuffer(this._stride));
};

parsegraph_BlockPainter.prototype.bounds = function()
{
    return this._bounds;
};

parsegraph_BlockPainter.prototype.borderColor = function()
{
    return this._borderColor;
};

parsegraph_BlockPainter.prototype.setBorderColor = function(borderColor)
{
    this._borderColor = borderColor;
};

parsegraph_BlockPainter.prototype.backgroundColor = function()
{
    return this._backgroundColor;
};

parsegraph_BlockPainter.prototype.setBackgroundColor = function(backgroundColor)
{
    this._backgroundColor = backgroundColor;
};

parsegraph_BlockPainter.prototype.initBuffer = function(numBlocks)
{
    if(this._numBlocks === numBlocks) {
        // Same number of blocks, so just reset the counters and overwrite.
        this._numVertices = 0;
        this._numFaces = 0;
        return;
    }
    if(this._blockBuffer) {
        this.clear();
    }
    var gl = this._gl;
    this._blockBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._blockBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._stride*6*numBlocks, gl.STATIC_DRAW);
    this._numBlocks = numBlocks;
};

parsegraph_BlockPainter.prototype.clear = function()
{
    if(!this._blockBuffer) {
        return;
    }
    this._gl.deleteBuffer(this._blockBuffer);
    this._blockBuffer = null;
    this._bounds = null;
    this._numBlocks = null;
    this._numFaces = 0;
    this._numVertices = 0;
};

parsegraph_BlockPainter.prototype.drawBlock = function(
    cx, cy, width, height, borderRoundedness, borderThickness, borderScale)
{
    if(this._numFaces / 2 >= this._numBlocks) {
        throw new Error("BlockPainter is full and cannot draw any more blocks.");
    }
    if(!this._blockBuffer) {
        throw new Error("BlockPainter.initBuffer(numBlocks) must be called first.");
    }
    if(!this._bounds) {
        this._bounds = new parsegraph_Rect(cx, cy, width, height);
    }
    else {
        this._bounds.include(cx, cy, width, height);
    }

    var endian = true;

    var buf = this._itemBuffer;

    // Append color data.
    var bg = this.backgroundColor();
    buf.setFloat32(16, bg.r(), endian);
    buf.setFloat32(20, bg.g(), endian);
    buf.setFloat32(24, bg.b(), endian);
    buf.setFloat32(28, bg.a(), endian);

    // Append border color data.
    var borC = this.borderColor();
    buf.setFloat32(32, borC.r(), endian);
    buf.setFloat32(36, borC.g(), endian);
    buf.setFloat32(40, borC.b(), endian);
    buf.setFloat32(44, borC.a(), endian);

    // Append border radius data.
    if(height < width) {
        buf.setFloat32(48, borderScale * borderRoundedness / height, endian);
        buf.setFloat32(52, borderScale * borderThickness / height, endian);
    }
    else {
        // height > width
        buf.setFloat32(48, borderScale * borderRoundedness / width, endian);
        buf.setFloat32(52, borderScale * borderThickness / width, endian);
    }
    buf.setFloat32(56, height/width, endian);

    var stride = this._stride;
    var gl = this._gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this._blockBuffer);

    // Append position and texture coordinate data.
    buf.setFloat32(0, cx - width / 2, endian);
    buf.setFloat32(4, cy - height / 2, endian);
    buf.setFloat32(8, 0, endian);
    buf.setFloat32(12, 0, endian);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._numVertices++*stride, buf.buffer);

    buf.setFloat32(0, cx + width / 2, endian);
    buf.setFloat32(4, cy - height / 2, endian);
    buf.setFloat32(8, 1, endian);
    buf.setFloat32(12, 0, endian);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._numVertices++*stride, buf.buffer);

    buf.setFloat32(0, cx + width / 2, endian);
    buf.setFloat32(4, cy + height / 2, endian);
    buf.setFloat32(8, 1, endian);
    buf.setFloat32(12, 1, endian);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._numVertices++*stride, buf.buffer);

    buf.setFloat32(0, cx - width / 2, endian);
    buf.setFloat32(4, cy - height / 2, endian);
    buf.setFloat32(8, 0, endian);
    buf.setFloat32(12, 0, endian);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._numVertices++*stride, buf.buffer);

    buf.setFloat32(0, cx + width / 2, endian);
    buf.setFloat32(4, cy + height / 2, endian);
    buf.setFloat32(8, 1, endian);
    buf.setFloat32(12, 1, endian);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._numVertices++*stride, buf.buffer);

    buf.setFloat32(0, cx - width / 2, endian);
    buf.setFloat32(4, cy + height / 2, endian);
    buf.setFloat32(8, 0, endian);
    buf.setFloat32(12, 1, endian);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._numVertices++*stride, buf.buffer);

    //console.log(this._numVertices + " verts");
    this._numFaces += 2;
};

parsegraph_BlockPainter.prototype.render = function(world)
{
    if(!this._numFaces) {
        return;
    }
    var gl = this._gl;
    //console.log("Rendering " + this._numVertices + " vertices");

    // Render blocks.
    gl.useProgram(this._blockProgram);
    gl.uniformMatrix3fv(this.u_world, false, world);

    gl.enableVertexAttribArray(this.a_position);
    gl.enableVertexAttribArray(this.a_texCoord);
    gl.enableVertexAttribArray(this.a_color);
    gl.enableVertexAttribArray(this.a_borderColor);
    gl.enableVertexAttribArray(this.a_borderRoundedness);
    gl.enableVertexAttribArray(this.a_borderThickness);
    gl.enableVertexAttribArray(this.a_aspectRatio);

    var stride = this._stride;
    if(!this._blockBuffer) {
        throw new Error("No block buffer to render; BlockPainter.initBuffer(numBlocks) must be called first.");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this._blockBuffer);

    // Position: 2 * 4 (two floats)  0-7
    // TexCoord: 2 * 4 (two floats)  8-15
    // Color:    4 * 4 (four floats) 16-31
    // BorColor: 4 * 4 (four floats) 32-47
    // BorRound: 1 * 4 (one float)   48-51
    // BorThick: 1 * 4 (one float)   52-55
    // AspectRa: 1 * 4 (one float)   56-59
    gl.vertexAttribPointer(this.a_position,          2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(this.a_texCoord,          2, gl.FLOAT, false, stride, 8);
    gl.vertexAttribPointer(this.a_color,             4, gl.FLOAT, false, stride, 16);
    gl.vertexAttribPointer(this.a_borderColor,       4, gl.FLOAT, false, stride, 32);
    gl.vertexAttribPointer(this.a_borderRoundedness, 1, gl.FLOAT, false, stride, 48);
    gl.vertexAttribPointer(this.a_borderThickness,   1, gl.FLOAT, false, stride, 52);
    gl.vertexAttribPointer(this.a_aspectRatio,       1, gl.FLOAT, false, stride, 56);

    gl.drawArrays(gl.TRIANGLES, 0, this._numVertices);

    gl.disableVertexAttribArray(this.a_position);
    gl.disableVertexAttribArray(this.a_texCoord);
    gl.disableVertexAttribArray(this.a_color);
    gl.disableVertexAttribArray(this.a_borderColor);
    gl.disableVertexAttribArray(this.a_borderRoundedness);
    gl.disableVertexAttribArray(this.a_borderThickness);
    gl.disableVertexAttribArray(this.a_aspectRatio);
};
parsegraph_SpotlightPainter_VertexShader =
"uniform mat3 u_world;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec2 a_texCoord;\n" +
"attribute vec4 a_color;\n" +
"\n" +
"varying highp vec2 texCoord;\n" +
"varying highp vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "contentColor = a_color;" +
    "gl_Position = vec4((u_world * vec3(a_position, 1.0)).xy, 0.0, 1.0);" +
    "texCoord = a_texCoord;" +
"}";

parsegraph_SpotlightPainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec2 texCoord;\n" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "\n" +
    "highp float d = min(1.0, length(abs(st)));" +
    "d = 1.0 - pow(d, 0.2);" +
    "gl_FragColor = vec4(contentColor.rgb, contentColor.a * d);" +
"}";

function parsegraph_SpotlightPainter(gl, shaders)
{
    this._gl = gl;
    if(!this._gl || !this._gl.createProgram) {
        throw new Error("A GL interface must be given");
    }

    // Compile the shader program.
    var shaderName = "parsegraph_SpotlightPainter";
    if(!shaders[shaderName]) {
        var program = gl.createProgram();

        gl.attachShader(
            program,
            compileShader(
                gl,
                parsegraph_SpotlightPainter_VertexShader,
                gl.VERTEX_SHADER
            )
        );

        gl.attachShader(
            program,
            compileShader(
                gl,
                parsegraph_SpotlightPainter_FragmentShader,
                gl.FRAGMENT_SHADER
            )
        );

        gl.linkProgram(program);
        if(!gl.getProgramParameter(
            program, gl.LINK_STATUS
        )) {
            throw new Error("SpotlightPainter program failed to link.");
        }

        shaders[shaderName] = program;
    }
    this._program = shaders[shaderName];

    // Prepare attribute buffers.
    this._spotlightBuffer = parsegraph_createPagingBuffer(
        this._gl, this._program
    );
    this.a_position = this._spotlightBuffer.defineAttrib("a_position", 2);
    this.a_texCoord = this._spotlightBuffer.defineAttrib("a_texCoord", 2);
    this.a_color = this._spotlightBuffer.defineAttrib("a_color", 4);

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this._program, "u_world"
    );

    this._spotlightBuffer.addPage();
};

parsegraph_SpotlightPainter.prototype.drawSpotlight = function(
    cx, cy, radius, color)
{
    //console.log(cx + ", " + cy + ", " + radius + " " + color.toString());
    // Append position data.
    this._spotlightBuffer.appendData(
        this.a_position,
        parsegraph_generateRectangleVertices(
            cx, cy, radius * 2, radius * 2
        )
    );

    // Append texture coordinate data.
    this._spotlightBuffer.appendData(
        this.a_texCoord,
        parsegraph_generateRectangleTexcoords()
    );

    // Append color data.
    for(var k = 0; k < 3 * 2; ++k) {
        this._spotlightBuffer.appendData(
            this.a_color,
            color.r(),
            color.g(),
            color.b(),
            color.a()
        );
    }
};

parsegraph_SpotlightPainter.prototype.drawRectSpotlight = function(
    cx, cy, w, h, color)
{
    // Append position data.
    this._spotlightBuffer.appendData(
        this.a_position,
        parsegraph_generateRectangleVertices(
            cx, cy, w, h
        )
    );

    // Append texture coordinate data.
    this._spotlightBuffer.appendData(
        this.a_texCoord,
        parsegraph_generateRectangleTexcoords()
    );

    // Append color data.
    for(var k = 0; k < 3 * 2; ++k) {
        this._spotlightBuffer.appendData(
            this.a_color,
            color.r(),
            color.g(),
            color.b(),
            color.a()
        );
    }
};

parsegraph_SpotlightPainter.prototype.clear = function()
{
    this._spotlightBuffer.clear();
    this._spotlightBuffer.addPage();
};

parsegraph_SpotlightPainter.prototype.render = function(world, scale)
{
    // Render spotlights.
    this._gl.useProgram(
        this._program
    );
    this._gl.uniformMatrix3fv(
        this.u_world,
        false,
        world
    );
    this._spotlightBuffer.renderPages();
};
parsegraph_GlyphPage_COUNT = 0;
function parsegraph_GlyphPage()
{
    this._id = parsegraph_GlyphPage_COUNT++;
    this._glyphTexture = null;
    this._queued = [];
}

/**
 * TODO Allow a max texture width of 1024, by paging the texture.
 * TODO Allow glyph texture data to be downloaded rather than generated.
 *
 * http://webglfundamentals.org/webgl/lessons/webgl-text-glyphs.html
 */
parsegraph_GlyphAtlas_COUNT = 0;
function parsegraph_GlyphAtlas(fontSizePixels, fontName, fillStyle)
{
    this._id = parsegraph_GlyphAtlas_COUNT++;
    this._canvas = document.createElement("canvas");
    this._canvas.width = this.maxTextureWidth();
    this._canvas.height = this.maxTextureWidth();
    this._ctx = this._canvas.getContext("2d");
    this._fontSize = fontSizePixels;
    this._fontName = fontName;
    this._fillStyle = fillStyle;
    this.restoreProperties();

    this._glyphPages = [new parsegraph_GlyphPage()];

    this._glyphData = {};

    // Atlas working position.
    this._padding = this.fontSize() / 4;
    this._x = this._padding;
    this._y = this._padding;
    this._unicode = null;
}

parsegraph_GlyphAtlas.prototype.setUnicode = function(uni)
{
    if(!uni.loaded()) {
        throw new Error("Unicode provided has not been loaded.");
    }
    this._unicode = uni;
}

parsegraph_GlyphAtlas.prototype.unicode = function()
{
    return this._unicode;
}

parsegraph_GlyphAtlas.prototype.toString = function()
{
    return "[GlyphAtlas " + this._id + "]";
}

parsegraph_GlyphAtlas.prototype.getGlyph = function(glyph)
{
    if(typeof glyph !== "string") {
        glyph = String.fromCharCode(glyph);
    }
    var glyphData = this._glyphData[glyph];
    if(glyphData !== undefined) {
        return glyphData;
    }
    var letter = this._ctx.measureText(glyph);

    if(this._x + letter.width + this._padding > this.maxTextureWidth()) {
        // Move to the next row.
        this._x = this._padding;
        this._y += this.letterHeight() + this._padding;
    }
    if(this._y + this.letterHeight() + this._padding > this.maxTextureWidth()) {
        // Move to the next page.
        this._glyphPages.push(new parsegraph_GlyphPage());
        this._x = this._padding;
        this._y = this._padding;
    }
    var glyphPage = this._glyphPages[this._glyphPages.length - 1];

    var glyphData = {
        letter: glyph,
        x: this._x,
        y: this._y,
        width: letter.width,
        height: this.letterHeight(),
        glyphPage: glyphPage
    };
    this._glyphData[glyph] = glyphData;
    glyphPage._queued.push(glyphData);

    this._x += glyphData.width + this._padding;
    this._needsUpdate = true;

    return glyphData;
};
parsegraph_GlyphAtlas.prototype.get = parsegraph_GlyphAtlas.prototype.getGlyph;

parsegraph_GlyphAtlas.prototype.hasGlyph = function(glyph)
{
    var glyphData = this._glyphData[glyph];
    return glyphData !== undefined;
};
parsegraph_GlyphAtlas.prototype.has = parsegraph_GlyphAtlas.prototype.hasGlyph;

/**
 * Updates the given WebGL instance with this texture.
 *
 * ga.update(); // Updates the standard GL instance.
 * ga.update(gl); // Updates the given GL instance and clears old one.
 */
parsegraph_GlyphAtlas.prototype.update = function(gl)
{
    if(arguments.length === 0) {
        gl = this._gl;
    }
    if(!this._needsUpdate && this._gl === gl) {
        return;
    }
    if(this._gl !== gl) {
        this.clear();
    }

    this._needsUpdate = false;
    this._gl = gl;

    this._glyphPages.forEach(function(page) {
        this._ctx.clearRect(0, 0, this.maxTextureWidth(), this.maxTextureWidth());
        page._queued.forEach(function(glyphData) {
            this._ctx.fillText(
                glyphData.letter,
                glyphData.x,
                glyphData.y + this.fontBaseline()
            );
        }, this);

        // Create texture.
        if(!page._glyphTexture) {
            page._glyphTexture = gl.createTexture();
        }

        // Draw from 2D canvas.
        gl.bindTexture(gl.TEXTURE_2D, page._glyphTexture);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this._canvas
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
    }, this);
};

parsegraph_GlyphAtlas.prototype.clear = function()
{
    if(!this._gl) {
        return;
    }
    this._glyphPages.forEach(function(page) {
        if(page._glyphTexture) {
            this._gl.deleteTexture(page._glyphTexture);
        }
    }, this);
};

parsegraph_GlyphAtlas.prototype.imageData = function()
{
    return this._ctx.getImageData(0, 0, this.maxTextureWidth(), this.maxTextureWidth());
};
parsegraph_GlyphAtlas.prototype.getImageData = parsegraph_GlyphAtlas.prototype.imageData;

parsegraph_GlyphAtlas.prototype.needsUpdate = function()
{
    return this._needsUpdate;
};

parsegraph_GlyphAtlas.prototype.restoreProperties = function()
{
    this._ctx.font = this.font();
    this._ctx.fillStyle = this._fillStyle;
    this._needsUpdate = true;
};

parsegraph_GlyphAtlas.prototype.font = function()
{
    return this._fontSize + "px " + this._fontName;
};

parsegraph_GlyphAtlas.prototype.canvas = function()
{
    return this._canvas;
};

parsegraph_GlyphAtlas.prototype.maxTextureWidth = function()
{
    return 1024;
};

parsegraph_GlyphAtlas.prototype.letterHeight = function()
{
    return this.fontSize() * 1.3;
};

parsegraph_GlyphAtlas.prototype.fontBaseline = function()
{
    return this.fontSize();
};

parsegraph_GlyphAtlas.prototype.fontSize = function()
{
    return this._fontSize;
};

parsegraph_GlyphAtlas.prototype.fontName = function()
{
    return this._fontName;
};

parsegraph_GlyphAtlas.prototype.isNewline = function(c)
{
    return c === '\n';
};
// TODO Test lots of glyphs; set a limit if one can be found to exist
// TODO Add caret
// TODO Add runs of selected text

parsegraph_GlyphPainter_VertexShader =
"uniform mat3 u_world;\n" +
"" +
"attribute vec2 a_position;" +
"attribute vec4 a_color;" +
"attribute vec4 a_backgroundColor;" +
"attribute vec2 a_texCoord;" +
"" +
"varying highp vec2 texCoord;" +
"varying highp vec4 fragmentColor;" +
"varying highp vec4 backgroundColor;" +
"" +
"void main() {" +
    "gl_Position = vec4((u_world * vec3(a_position, 1.0)).xy, 0.0, 1.0);" +
   "fragmentColor = a_color;" +
   "backgroundColor = a_backgroundColor;" +
   "texCoord = a_texCoord;" +
"}";

parsegraph_GlyphPainter_FragmentShader =
"uniform sampler2D u_glyphTexture;\n" +
"varying highp vec4 fragmentColor;\n" +
"varying highp vec4 backgroundColor;" +
"varying highp vec2 texCoord;\n" +
"\n" +
"void main() {\n" +
    "highp float opacity = texture2D(u_glyphTexture, texCoord.st).r;" +
    "if(backgroundColor.a == 0.0) {" +
        "gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a * opacity);" +
    "}" +
    "else {" +
        "gl_FragColor = mix(backgroundColor, fragmentColor, opacity);" +
    "}" +
"}";

function parsegraph_GlyphPainter(gl, glyphAtlas, shaders)
{
    this._gl = gl;

    if(!glyphAtlas) {
        throw new Error("Glyph atlas must be provided");
    }
    this._glyphAtlas = glyphAtlas;

    // Compile the shader program.
    var shaderName = "parsegraph_GlyphPainter";
    if(!shaders[shaderName]) {
        var program = gl.createProgram();

        gl.attachShader(
            program, compileShader(
                gl, parsegraph_GlyphPainter_VertexShader, gl.VERTEX_SHADER
            )
        );

        var fragProgram = parsegraph_GlyphPainter_FragmentShader;
        gl.attachShader(
            program, compileShader(gl, fragProgram, gl.FRAGMENT_SHADER)
        );

        gl.linkProgram(program);
        if(!gl.getProgramParameter(
            program, gl.LINK_STATUS
        )) {
            throw new Error("'" + shaderName + "' shader program failed to link.");
        }

        shaders[shaderName] = program;
    }
    this._textProgram = shaders[shaderName];

    // Prepare attribute buffers.
    this._textBuffer = new parsegraph_PagingBuffer(this._gl, this._textProgram);
    this.a_position = this._textBuffer.defineAttrib("a_position", 2);
    this.a_color = this._textBuffer.defineAttrib("a_color", 4);
    this.a_backgroundColor = this._textBuffer.defineAttrib("a_backgroundColor", 4);
    this.a_texCoord = this._textBuffer.defineAttrib("a_texCoord", 2);
    this._textBuffers = {};

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this._textProgram, "u_world"
    );
    this.u_glyphTexture = this._gl.getUniformLocation(
        this._textProgram, "u_glyphTexture"
    );

    this._color = parsegraph_createColor(1, 1, 1, 1);
    this._backgroundColor = parsegraph_createColor(0, 0, 0, 0);
};

parsegraph_GlyphPainter.prototype.setColor = function()
{
    if(arguments.length > 1) {
        this._color = parsegraph_createColor.apply(null, arguments);
    }
    else {
        this._color = arguments[0];
    }
};

parsegraph_GlyphPainter.prototype.setBackgroundColor = function()
{
    if(arguments.length > 1) {
        this._backgroundColor = parsegraph_createColor.apply(null, arguments);
    }
    else {
        this._backgroundColor = arguments[0];
    }
};

parsegraph_GlyphPainter.prototype.fontSize = function()
{
    return this._glyphAtlas.fontSize();
};

parsegraph_GlyphPainter.prototype.glyphAtlas = function()
{
    return this._glyphAtlas;
};

parsegraph_GlyphPainter.prototype.drawGlyph = function(glyphData, x, y, fontScale)
{
    if(typeof glyphData !== "object") {
        glyphData = this._glyphAtlas.getGlyph(glyphData);
    }
    glyphData.painted = true;

    // Select the correct buffer.
    var page = this._textBuffers[glyphData.glyphPage._id];
    if(!page) {
        this._textBuffers[glyphData.glyphPage._id] = this._textBuffer.addPage(function(gl, numIndices) {
            gl.bindTexture(gl.TEXTURE_2D, glyphData.glyphPage._glyphTexture);
            gl.uniform1i(this.u_glyphTexture, 0);
            gl.drawArrays(gl.TRIANGLES, 0, numIndices);
        }, this);
        page = this._textBuffers[glyphData.glyphPage._id];
    }

    // Append position data.
    page.appendData(
        this.a_position,
        [
            x, y,
            x + glyphData.width * fontScale, y,
            x + glyphData.width * fontScale, y + glyphData.height * fontScale,

            x, y,
            x + glyphData.width * fontScale, y + glyphData.height * fontScale,
            x, y + glyphData.height * fontScale
        ]
    );

    this._maxSize = Math.max(this._maxSize, glyphData.width * fontScale);

    // Append color data.
    for(var k = 0; k < 3 * 2; ++k) {
        page.appendData(
            this.a_color,
            this._color.r(),
            this._color.g(),
            this._color.b(),
            this._color.a()
        );
    }
    for(var k = 0; k < 3 * 2; ++k) {
        page.appendData(
            this.a_backgroundColor,
            this._backgroundColor.r(),
            this._backgroundColor.g(),
            this._backgroundColor.b(),
            this._backgroundColor.a()
        );
    }

    // Append texture coordinate data.
    page.appendData(
        this.a_texCoord,
        [
            glyphData.x / this._glyphAtlas.canvas().width,
            glyphData.y / this._glyphAtlas.canvas().height,

            (glyphData.x + glyphData.width) / this._glyphAtlas.canvas().width,
            glyphData.y / this._glyphAtlas.canvas().height,

            (glyphData.x + glyphData.width) / this._glyphAtlas.canvas().width,
            (glyphData.y + glyphData.height) / this._glyphAtlas.canvas().height,

            glyphData.x / this._glyphAtlas.canvas().width,
            glyphData.y / this._glyphAtlas.canvas().height,

            (glyphData.x + glyphData.width) / this._glyphAtlas.canvas().width,
            (glyphData.y + glyphData.height) / this._glyphAtlas.canvas().height,

            glyphData.x / this._glyphAtlas.canvas().width,
            (glyphData.y + glyphData.height) / this._glyphAtlas.canvas().height
        ]
    );
};

parsegraph_GlyphPainter.prototype.clear = function()
{
    this._textBuffers = {};
    this._textBuffer.clear();
    this._maxSize = 0;
};

parsegraph_GlyphPainter.prototype.render = function(world, scale)
{
    //console.log(scale);
    //console.log("Max scale of a single largest glyph would be: " + (this._maxSize *scale));
    if(scale < .1 && this._maxSize*scale < 2) {
        return;
    }

    if(this._maxSize / (world[0]/world[8]) < 1) {
        return;
    }

    var gl = this._gl;
    this.glyphAtlas().update(gl);

    // Load program.
    this._gl.useProgram(
        this._textProgram
    );

    gl.activeTexture(gl.TEXTURE0);

    // Render text.
    gl.uniformMatrix3fv(
        this.u_world,
        false,
        world
    );
    this._textBuffer.renderPages();
};
// TODO Separate coloring and slicing from drawing the circle... Basically, make this actually just draw the fans we want.
parsegraph_FanPainter_VertexShader =
"uniform mat3 u_world;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec4 a_color;\n" +
"attribute vec2 a_texCoord;\n" +
"attribute float a_selectionAngle;\n" +
"\n" +
"varying highp vec4 contentColor;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float selectionAngle;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = vec4((u_world * vec3(a_position, 1.0)).xy, 0.0, 1.0);" +
    "contentColor = a_color;" +
    "texCoord = a_texCoord;" +
    "selectionAngle = a_selectionAngle;" +
"}";

parsegraph_FanPainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp vec2 texCoord;\n" +
"varying highp float selectionAngle;\n" +
"\n" +
"void main() {\n" +
    "highp vec2 st = texCoord;\n" +
    "st = st * 2.0 - 1.0;" +
    "highp float d = min(1.0, length(abs(st)));" +
    "d = 1.0 - pow(d, 0.2);" +
    "highp float fragAngle = atan(st.y, st.x);" +
    "gl_FragColor = vec4(contentColor.rgb, contentColor.a * d);" +
    "gl_FragColor = vec4(contentColor.rgb, contentColor.a * d * (1.0 - abs(selectionAngle - fragAngle) / 3.14159));" +
    /*"if(selectionAngle - fragAngle > (3.14159 / 2.0) || fragAngle - selectionAngle > (3.14159 / 2.0)) {" +
        "gl_FragColor = vec4(contentColor.rgb, contentColor.a * d);" +
    "}" +
    "else {" +*/
        //"gl_FragColor = vec4(contentColor.rgb, contentColor.a * d * (1.0 - abs(abs(fragAngle) - abs(selectionAngle)) / 3.14159));" +
    //"}"
"}";

/**
 * Shows a circle that allows some parts to show as selected.
 */
function parsegraph_FanPainter(gl)
{
    this._gl = gl;
    if(!this._gl || !this._gl.createProgram) {
        throw new Error("A GL interface must be given");
    }

    this._ascendingRadius = 250;
    this._descendingRadius = 250;
    this._selectionAngle = 0;

    // Compile the shader program.
    this.fanProgram = this._gl.createProgram();

    this._gl.attachShader(
        this.fanProgram,
        compileShader(
            this._gl,
            parsegraph_FanPainter_VertexShader,
            this._gl.VERTEX_SHADER
        )
    );

    this._gl.attachShader(
        this.fanProgram,
        compileShader(
            this._gl,
            parsegraph_FanPainter_FragmentShader,
            this._gl.FRAGMENT_SHADER
        )
    );

    this._gl.linkProgram(this.fanProgram);
    if(!this._gl.getProgramParameter(
        this.fanProgram, this._gl.LINK_STATUS
    )) {
        throw new Error("FanPainter program failed to link.");
    }

    // Prepare attribute buffers.
    this._fanBuffer = parsegraph_createPagingBuffer(
        this._gl, this.fanProgram
    );
    this.a_position = this._fanBuffer.defineAttrib("a_position", 2);
    this.a_color = this._fanBuffer.defineAttrib("a_color", 4);
    this.a_texCoord = this._fanBuffer.defineAttrib("a_texCoord", 2);
    this.a_selectionAngle = this._fanBuffer.defineAttrib("a_selectionAngle", 1);

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this.fanProgram, "u_world"
    );
    this.u_time = this._gl.getUniformLocation(
        this.fanProgram, "u_time"
    );

    this._fanBuffer.addPage();
};

parsegraph_FanPainter_Tests = new parsegraph_TestSuite("parsegraph_FanPainter");

parsegraph_FanPainter_Tests.addTest("parsegraph_FanPainter", function(resultDom) {
    var surface = new parsegraph_Surface();
    var painter = new parsegraph_FanPainter(surface.gl());
    painter.selectDeg(0, 0, 0, 90, new parsegraph_Color(0, 0, 0, 1), new parsegraph_Color(1, 0, 1, 1));
});

parsegraph_FanPainter.prototype.selectDeg = function(
    userX, userY,
    startAngle, spanAngle,
    startColor, endColor)
{
    return this.selectRad(
        userX, userY,
        alpha_ToDegrees(startAngle), alpha_ToDegrees(spanAngle),
        startColor, endColor
    );
};

/**
 * Highlights arcs under the given selection.
 */
parsegraph_FanPainter.prototype.selectRad = function(
    userX, userY,
    startAngle, spanAngle,
    startColor, endColor)
//parsegraph_FanPainter.prototype.drawFan = function(
//    cx, cy, radius, color)
{
    //console.log(userx + ", " + userY + ". startAngle=" + startAngle + ", spanAngle=" + spanAngle);

    var radius = this._ascendingRadius + this._descendingRadius;

    // Append position data.
    this._fanBuffer.appendData(
        this.a_position,
        parsegraph_generateRectangleVertices(
            userX, userY, radius * 2, radius * 2
        )
    );

    // Append texture coordinate data.
    this._fanBuffer.appendData(
        this.a_texCoord,
        parsegraph_generateRectangleTexcoords()
    );

    // Append color data.
    var color = startColor;
    for(var k = 0; k < 3 * 2; ++k) {
        this._fanBuffer.appendRGBA(this.a_color, color);
        this._fanBuffer.appendData(this.a_selectionAngle, this._selectionAngle);
    }
};

/**
 * Sets the distance from the center to the brightest point.
 */
parsegraph_FanPainter.prototype.setAscendingRadius = function(ascendingRadius)
{
    this._ascendingRadius = ascendingRadius;
};

/**
 * Sets the distance from the brightest point, to the invisible outer edge.
 */
parsegraph_FanPainter.prototype.setDescendingRadius = function(descendingRadius)
{
    this._descendingRadius = descendingRadius;
};

/**
 * Sets the selection angle, which is an area of radial brightness.
 *
 * [-Math.PI, Math.PI]
 */
parsegraph_FanPainter.prototype.setSelectionAngle = function(selectionAngle)
{
    this._selectionAngle = selectionAngle;
};

parsegraph_FanPainter.prototype.clear = function()
{
    this._fanBuffer.clear();
    this._fanBuffer.addPage();
};

parsegraph_FanPainter.prototype.render = function(viewMatrix)
{
    if(!viewMatrix) {
        throw new Error("A viewMatrix must be provided");
    }
    // Render faces.
    this._gl.useProgram(
        this.fanProgram
    );
    this._gl.uniformMatrix3fv(
        this.u_world,
        false,
        viewMatrix
    );
    this._fanBuffer.renderPages();
};
function parsegraph_NodePainter(gl, glyphAtlas, shaders)
{
    this._gl = gl;
    if(!this._gl || !this._gl.createProgram) {
        throw new Error("A GL interface must be given");
    }

    this._backgroundColor = parsegraph_BACKGROUND_COLOR;

    this._blockPainter = new parsegraph_BlockPainter(this._gl, shaders);
    this._renderBlocks = true;

    this._extentPainter = new parsegraph_BlockPainter(this._gl, shaders);
    this._renderExtents = false;

    this._glyphPainter = new parsegraph_GlyphPainter(this._gl, glyphAtlas, shaders);

    this._renderText = true;

    this._textures = [];
};

parsegraph_NodePainter.prototype.bounds = function()
{
    return this._blockPainter.bounds();
};

parsegraph_NodePainter.prototype.gl = function()
{
    return this._gl;
};

parsegraph_NodePainter.prototype.glyphPainter = function()
{
    return this._glyphPainter;
};

parsegraph_NodePainter.prototype.setBackground = function(color)
{
    if(arguments.length > 1) {
        return this.setBackground(
            parsegraph_createColor.apply(this, arguments)
        );
    }
    this._backgroundColor = color;
};

parsegraph_NodePainter.prototype.backgroundColor = function()
{
    return this._backgroundColor;
};

parsegraph_NodePainter.prototype.render = function(world, scale)
{
    this._gl.disable(this._gl.CULL_FACE);
    this._gl.disable(this._gl.DEPTH_TEST);

    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.DST_ALPHA
    );
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA
    );
    if(this._renderBlocks) {
        this._blockPainter.render(world, scale);
    }
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA
    );

    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.ONE_MINUS_DST_ALPHA
    );
    this._gl.blendFunc(
        this._gl.DST_ALPHA, this._gl.SRC_ALPHA
    );
    if(this._renderExtents) {
        this._extentPainter.render(world, scale);
    }
    this._gl.disable(this._gl.CULL_FACE);
    this._gl.disable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA
    );

    if(this._renderText) {
        this._glyphPainter.render(world, scale);
    }

    this._textures.forEach(function(t) {
        t.render(world);
    });
};

parsegraph_NodePainter.prototype.enableExtentRendering = function()
{
    this._renderExtents = true;
};

parsegraph_NodePainter.prototype.disableExtentRendering = function()
{
    this._renderExtents = false;
};

parsegraph_NodePainter.prototype.isExtentRenderingEnabled = function()
{
    return this._renderExtents;
};

parsegraph_NodePainter.prototype.enableBlockRendering = function()
{
    this._renderBlocks = true;
};

parsegraph_NodePainter.prototype.disableBlockRendering = function()
{
    this._renderBlocks = false;
};

parsegraph_NodePainter.prototype.isBlockRenderingEnabled = function()
{
    return this._renderBlocks;
};

parsegraph_NodePainter.prototype.enableLineRendering = function()
{
    this._renderLines = true;
};

parsegraph_NodePainter.prototype.disableLineRendering = function()
{
    this._renderLines = false;
};

parsegraph_NodePainter.prototype.isLineRenderingEnabled = function()
{
    return this._renderLines;
};

parsegraph_NodePainter.prototype.enableTextRendering = function()
{
    this._renderText = true;
};

parsegraph_NodePainter.prototype.disableTextRendering = function()
{
    this._renderText = false;
};

parsegraph_NodePainter.prototype.isTextRenderingEnabled = function()
{
    return this._renderText;
};

parsegraph_NodePainter.prototype.enableSceneRendering = function()
{
    this._renderScenes = true;
};

parsegraph_NodePainter.prototype.disableSceneRendering = function()
{
    this._renderScenes = false;
};

parsegraph_NodePainter.prototype.isSceneRenderingEnabled = function()
{
    return this._renderScenes;
};

parsegraph_NodePainter.prototype.clear = function()
{
    this._blockPainter.clear();
    this._extentPainter.clear();
    this._glyphPainter.clear();

    var gl = this._gl;
    this._textures.forEach(function(t) {
        t.clear();
        //gl.deleteTexture(t._texture);
    });
    this._textures = [];
};

parsegraph_NodePainter.prototype.drawSlider = function(node, worldX, worldY, userScale)
{
    var style = node.blockStyle();
    var painter = this._blockPainter;

    var drawLine = function(x1, y1, x2, y2, thickness, color) {
        var cx = x1 + (x2 - x1) / 2;
        var cy = y1 + (y2 - y1) / 2;

        var size;
        if(x1 == x2) {
            // Vertical line.
            size = new parsegraph_Size(
                parsegraph_LINE_THICKNESS * userScale * node.absoluteScale() * thickness,
                Math.abs(y2 - y1)
            );
        }
        else {
            // Horizontal line.
            size = new parsegraph_Size(
                Math.abs(x2 - x1),
                parsegraph_LINE_THICKNESS * userScale * node.absoluteScale() * thickness
            );
        }

        if(color === undefined) {
            if(node.isSelected()) {
                color = parsegraph_SELECTED_LINE_COLOR.premultiply(
                    style.backgroundColor
                );
            }
            else {
                color = parsegraph_LINE_COLOR.premultiply(
                    style.backgroundColor
                );
            }
        }

        painter.setBorderColor(color);
        painter.setBackgroundColor(color);
        painter.drawBlock(
            worldX + node.absoluteX() + cx,
            worldY + node.absoluteY() + cy,
            size.width(),
            size.height(),
            0,
            0,
            userScale * node.absoluteScale()
        );
    };

    // Draw the connecting line into the slider.
    switch(node.parentDirection()) {
    case parsegraph_UPWARD:
        // Draw downward connecting line into the horizontal slider.
        drawLine(
            0, -node.absoluteSize().height() / 2,
            0, 0,
            1
        );

        break;
    case parsegraph_DOWNWARD:
        // Draw upward connecting line into the horizontal slider.
        break;
    }

    // Draw the bar that the slider bud is on.
    drawLine(
        -node.absoluteSize().width() / 2, 0,
        node.absoluteSize().width() / 2, 0,
        .8
    );

    // Draw the first and last ticks.

    // If snapping, show the intermediate ticks.

    //if(parsegraph_isVerticalNodeDirection(node.parentDirection())) {
        var value = node.value();
        if(value == null) {
            value = 0.5;
        }

        var sliderWidth = userScale * node.absoluteSize().width();

        if(node.isSelected()) {
            painter.setBorderColor(
                style.selectedBorderColor.premultiply(
                    node.backdropColor()
                )
            );
            painter.setBackgroundColor(
                style.selectedBackgroundColor.premultiply(
                    node.backdropColor()
                )
            );
        }
        else {
            painter.setBorderColor(
                style.borderColor.premultiply(
                    node.backdropColor()
                )
            );
            painter.setBackgroundColor(
                style.backgroundColor.premultiply(
                    node.backdropColor()
                )
            );
        }

        // Draw the slider bud.
        if(Number.isNaN(value)) {
            value = 0;
        }
        painter.drawBlock(
            worldX + node.absoluteX() - sliderWidth / 2 + sliderWidth * value,
            worldY + node.absoluteY(),
            userScale * node.absoluteSize().height()/1.5,
            userScale * node.absoluteSize().height()/1.5,
            style.borderRoundness/1.5,
            style.borderThickness/1.5,
            userScale * node.absoluteScale()
        );
    //}

    if(!node.label()) {
        return;
    }

    var fontScale = .7;
//    this._glyphPainter.setFontSize(
//        fontScale * style.fontSize * userScale * node.absoluteScale()
//    );
    this._glyphPainter.setColor(
        node.isSelected() ?
            style.selectedFontColor :
            style.fontColor
    );

    var sliderWidth = userScale * node.absoluteSize().width();
    var value = node.value();
    if(value == null) {
        value = 0.5;
    }
    //this._glyphPainter.setFontSize(
//        fontScale * style.fontSize * userScale * node.absoluteScale()
//    );
    if(style.maxLabelChars) {
        this._glyphPainter.setWrapWidth(
            fontScale * style.fontSize * style.maxLabelChars * style.letterWidth * userScale * node.absoluteScale()
        );
    }

    var textMetrics = this._glyphPainter.measureText(node.label());
    node._label[0] = worldX + node.absoluteX() - sliderWidth / 2 + sliderWidth * value - textMetrics[0]/2;
    node._label[1] = worldY + node.absoluteY() - textMetrics[1]/2;
    this._glyphPainter.setPosition(node._label[0], node._label[1]);
    this._glyphPainter.drawText(node.label());
};

parsegraph_NodePainter.prototype.drawScene = function(node, worldX, worldY, userScale, shaders)
{
    if(!node.scene()) {
        return;
    }

    var style = node.blockStyle();
    var painter = this._blockPainter;

    var sceneSize = node.sizeWithoutPadding();
    var sceneX = worldX + node.absoluteX();
    var sceneY = worldY + node.absoluteY();

    // Render and draw the scene texture.
    var gl = shaders.gl;
    if(!shaders.framebuffer) {
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        shaders.framebuffer = framebuffer;

        // Thanks to http://learningwebgl.com/blog/?p=1786
        var t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sceneSize.width(), sceneSize.height(), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, sceneSize.width(), sceneSize.height());
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        shaders.framebufferTexture = t;
        shaders.framebufferRenderBuffer = renderbuffer;

    }
    else {
        gl.bindTexture(gl.TEXTURE_2D, shaders.framebufferTexture);
        gl.bindRenderbuffer(gl.RENDERBUFFER, shaders.framebufferRenderBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shaders.framebuffer);

        this._textures.forEach(function(t) {
            //gl.deleteTexture(t._texture);
            t.clear();
        });
        this._textures = [];
    }

    var gl = this.gl();
    gl.clearColor(parsegraph_BACKGROUND_COLOR.r(),
    parsegraph_BACKGROUND_COLOR.g(),
    parsegraph_BACKGROUND_COLOR.b(),
    parsegraph_BACKGROUND_COLOR.a());
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    var s = node.scene();
    s.paint();
    s.render(sceneSize.width(), sceneSize.height());

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var p = new parsegraph_TexturePainter(
        gl, shaders.framebufferTexture, sceneSize.width(), sceneSize.height(), shaders
    );
    p.drawWholeTexture(sceneX - sceneSize.width()/2, sceneY - sceneSize.height()/2, sceneSize.width(), sceneSize.height(), userScale * node.absoluteScale());
    this._textures.push(p);
};

parsegraph_NodePainter.prototype.initBlockBuffer = function(counts)
{
    this._blockPainter.initBuffer(counts.numBlocks);
    this._extentPainter.initBuffer(counts.numExtents);
    this._glyphPainter.clear();
};

parsegraph_NodePainter.prototype.countNode = function(node, counts)
{
    if(!counts.numBlocks) {
        counts.numBlocks = 0;
    }

    if(this.isExtentRenderingEnabled() && node.isRoot()) {
        if(!counts.numExtents) {
            counts.numExtents = 0;
        }
        ++counts.numExtents;
    }

    if(node.type() === parsegraph_SLIDER) {
        if(node.parentDirection() === parsegraph_UPWARD) {
            // Only downward direction is currently supported.
            ++counts.numBlocks;
        }
        // One for the joining line.
        ++counts.numBlocks;
        // One for the block.
        ++counts.numBlocks;
    }
    else {
        parsegraph_forEachCardinalNodeDirection(function(direction) {
            if(node.parentDirection() == direction) {
                return;
            }
            var directionData = node._neighbors[direction];
            // Do not draw lines unless there is a node.
            if(!directionData.node) {
                return;
            }
            // One for the line
            ++counts.numBlocks;
        }, this);

        // One for the block.
        ++counts.numBlocks;
    }
};

parsegraph_NodePainter.prototype.drawNode = function(node, shaders)
{
    var worldX = 0;
    var worldY = 0;
    var userScale = 1;
    if(this.isExtentRenderingEnabled() && node.isRoot()) {
        this.paintExtent(node, worldX, worldY, userScale);
    }

    switch(node.type()) {
    case parsegraph_SLIDER:
        return this.drawSlider(node, worldX, worldY, userScale);
    case parsegraph_SCENE:
        this.paintLines(node, worldX, worldY, userScale);
        this.paintBlock(node, worldX, worldY, userScale);
        return this.drawScene(node, worldX, worldY, userScale, shaders);
    default:
        this.paintLines(node, worldX, worldY, userScale);
        this.paintBlock(node, worldX, worldY, userScale);
    }
};

parsegraph_NodePainter.prototype.paintLines = function(node, worldX, worldY, userScale)
{
    var bodySize = node.size();

    var drawLine = function(direction) {
        if(node.parentDirection() == direction) {
            return;
        }
        var directionData = node._neighbors[direction];
        // Do not draw lines unless there is a node.
        if(!directionData.node) {
            return;
        }

        var selectedColor = parsegraph_SELECTED_LINE_COLOR.premultiply(
            this.backgroundColor()
        );
        var color = parsegraph_LINE_COLOR.premultiply(
            this.backgroundColor()
        );

        var painter = this._blockPainter;
        if(node.isSelected() && node.isSelectedAt(direction)) {
            painter.setBorderColor(selectedColor);
            painter.setBackgroundColor(selectedColor);
        }
        else {
            // Not selected.
            painter.setBorderColor(color);
            painter.setBackgroundColor(color);
        }

        var parentScale = userScale * node.absoluteScale();
        var scale = userScale * directionData.node.absoluteScale();

        if(parsegraph_isVerticalNodeDirection(direction)) {
            var length = parsegraph_nodeDirectionSign(direction)
                * parentScale * (directionData.lineLength + parsegraph_LINE_THICKNESS / 2);
            var thickness = parsegraph_LINE_THICKNESS * scale;
            painter.drawBlock(
                worldX + node.absoluteX(),
                worldY + node.absoluteY() + length / 2,
                thickness,
                Math.abs(length),
                0,
                0,
                scale
            );
        }
        else {
            // Horizontal line.
            var length = parsegraph_nodeDirectionSign(direction)
                * parentScale * (directionData.lineLength + parsegraph_LINE_THICKNESS / 2);
            var thickness = parsegraph_LINE_THICKNESS * scale;
            painter.drawBlock(
                worldX + node.absoluteX() + length / 2,
                worldY + node.absoluteY(),
                Math.abs(length),
                thickness,
                0,
                0,
                scale
            );
        }
    };
    parsegraph_forEachCardinalNodeDirection(drawLine, this);
};

parsegraph_NodePainter.prototype.paintExtent = function(node, worldX, worldY, userScale)
{
    var painter = this._extentPainter;
    painter.setBorderColor(
        parsegraph_EXTENT_BORDER_COLOR
    );
    painter.setBackgroundColor(
        parsegraph_EXTENT_BACKGROUND_COLOR
    );

    var paintBound = function(rect) {
        if(isNaN(rect.height()) || isNaN(rect.width())) {
            return;
        }
        painter.drawBlock(
            worldX + rect.x() + rect.width() / 2,
            worldY + rect.y() + rect.height() / 2,
            rect.width(),
            rect.height(),
            parsegraph_EXTENT_BORDER_ROUNDEDNESS,
            parsegraph_EXTENT_BORDER_THICKNESS,
            userScale * node.absoluteScale()
        );
    };

    var paintDownwardExtent = function() {
        var extent = node.extentsAt(parsegraph_DOWNWARD);
        var rect = parsegraph_createRect(
            node.absoluteX() - userScale * node.absoluteScale() * node.extentOffsetAt(parsegraph_DOWNWARD),
            node.absoluteY(),
            0, 0
        );

        extent.forEach(function(length, size) {
            length *= userScale * node.absoluteScale();
            size *= userScale * node.absoluteScale();
            rect.setWidth(length);
            rect.setHeight(size);
            paintBound(rect);
            rect.setX(rect.x() + length);
        });
    };

    var paintUpwardExtent = function() {
        var extent = node.extentsAt(parsegraph_UPWARD);
        var rect = parsegraph_createRect(
            node.absoluteX() - userScale * node.absoluteScale() * node.extentOffsetAt(parsegraph_UPWARD),
            0,
            0, 0
        );

        extent.forEach(function(length, size) {
            length *= userScale * node.absoluteScale();
            size *= userScale * node.absoluteScale();
            rect.setY(node.absoluteY() - size);
            rect.setWidth(length);
            rect.setHeight(size);
            paintBound(rect);
            rect.setX(rect.x() + length);
        });
    };

    var paintBackwardExtent = function() {
        var extent = node.extentsAt(parsegraph_BACKWARD);
        var rect = parsegraph_createRect(
            0,
            node.absoluteY() - userScale * node.absoluteScale() * node.extentOffsetAt(parsegraph_BACKWARD),
            0, 0
        );

        extent.forEach(function(length, size) {
            length *= userScale * node.absoluteScale();
            size *= userScale * node.absoluteScale();
            rect.setHeight(length);
            rect.setX(node.absoluteX() - size);
            rect.setWidth(size);
            paintBound(rect);
            rect.setY(rect.y() + length);
        });
    };

    var paintForwardExtent = function() {
        var extent = node.extentsAt(parsegraph_FORWARD);
        var rect = parsegraph_createRect(
            node.absoluteX(),
            node.absoluteY() - node.extentOffsetAt(parsegraph_FORWARD) * userScale * node.absoluteScale(),
            0, 0
        );

        extent.forEach(function(length, size, i) {
            length *= userScale * node.absoluteScale();
            size *= userScale * node.absoluteScale();
            rect.setHeight(length);
            rect.setWidth(size);
            paintBound(rect);
            rect.setY(rect.y() + length);
        });
    };

    //paintDownwardExtent();
    //paintUpwardExtent();
    paintBackwardExtent();
    paintForwardExtent();
};

parsegraph_NodePainter.prototype.paintBlock = function(node, worldX, worldY, userScale)
{
    var style = node.blockStyle();
    var painter = this._blockPainter;

    // Set colors if selected.
    if(node.isSelected()) {
        painter.setBorderColor(
            style.selectedBorderColor.premultiply(
                node.backdropColor()
            )
        );
        painter.setBackgroundColor(
            style.selectedBackgroundColor.premultiply(
                node.backdropColor()
            )
        );
    } else {
        painter.setBorderColor(
            style.borderColor.premultiply(
                node.backdropColor()
            )
        );
        painter.setBackgroundColor(
            style.backgroundColor.premultiply(
                node.backdropColor()
            )
        );
    }

    // Draw the block.
    var size = node.absoluteSize().scaled(userScale);
    painter.drawBlock(
        worldX + userScale * node.absoluteX(),
        worldY + userScale * node.absoluteY(),
        size.width(),
        size.height(),
        style.borderRoundness,
        style.borderThickness,
        node.absoluteScale() * userScale
    );

    // Draw the label.
    var label = node._label;
    if(!label) {
        return;
    }
    var fontScale = (style.fontSize * userScale * node.absoluteScale()) / label.fontSize();
    var labelX, labelY;
    this._glyphPainter.setColor(
        node.isSelected() ?
            style.selectedFontColor :
            style.fontColor
    );
    if(node.hasNode(parsegraph_INWARD)) {
        var nestedNode = node.nodeAt(parsegraph_INWARD);
        var nestedSize = nestedNode.extentSize();
        var nodeSize = node.sizeWithoutPadding();
        if(node.nodeAlignmentMode(parsegraph_INWARD) == parsegraph_ALIGN_VERTICAL) {
            // Align vertical.
            labelX = worldX + userScale * node.absoluteX() - fontScale * label.width()/2;
            labelY = worldY + userScale * node.absoluteY() - userScale * node.absoluteScale() * nodeSize.height()/2;
        }
        else {
            // Align horizontal.
            labelX = worldX + userScale * node.absoluteX() - userScale * node.absoluteScale() * nodeSize.width()/2;
            labelY = worldY + userScale * node.absoluteY() - fontScale * label.height()/2;
        }
    }
    else {
        labelX = worldX + userScale * node.absoluteX() - fontScale * label.width()/2;
        labelY = worldY + userScale * node.absoluteY() - fontScale * label.height()/2;
    }
    node._labelX = labelX;
    node._labelY = labelY;
    node._labelScale = fontScale;
    label.paint(this._glyphPainter, labelX, labelY, fontScale);
};
parsegraph_TexturePainter_VertexShader =
"uniform mat3 u_world;\n" +
"" +
"attribute vec2 a_position;" +
"attribute vec2 a_texCoord;" +
"" +
"varying highp vec2 texCoord;" +
"" +
"void main() {" +
    "gl_Position = vec4((u_world * vec3(a_position, 1.0)).xy, 0.0, 1.0);" +
   "texCoord = a_texCoord;" +
"}";

parsegraph_TexturePainter_FragmentShader =
"uniform sampler2D u_texture;\n" +
"varying highp vec2 texCoord;\n" +
"\n" +
"void main() {\n" +
    "gl_FragColor = texture2D(u_texture, texCoord.st);" +
"}";

function parsegraph_TexturePainter(gl, textureId, texWidth, texHeight, shaders)
{
    this._gl = gl;

    // Compile the shader program.
    var shaderName = "parsegraph_TexturePainter";
    if(!shaders[shaderName]) {
        var program = gl.createProgram();

        gl.attachShader(
            program, compileShader(
                gl, parsegraph_TexturePainter_VertexShader, gl.VERTEX_SHADER
            )
        );

        var fragProgram = parsegraph_TexturePainter_FragmentShader;
        gl.attachShader(
            program, compileShader(gl, fragProgram, gl.FRAGMENT_SHADER)
        );

        gl.linkProgram(program);
        if(!gl.getProgramParameter(
            program, gl.LINK_STATUS
        )) {
            throw new Error("'" + shaderName + "' shader program failed to link.");
        }

        shaders[shaderName] = program;
    }
    this._textureProgram = shaders[shaderName];
    this._texture = textureId;
    this._texWidth = texWidth;
    this._texHeight = texHeight;

    // Prepare attribute buffers.
    this._buffer = parsegraph_createPagingBuffer(this._gl, this._textureProgram);
    this.a_position = this._buffer.defineAttrib("a_position", 2);
    this.a_color = this._buffer.defineAttrib("a_color", 4);
    this.a_backgroundColor = this._buffer.defineAttrib("a_backgroundColor", 4);
    this.a_texCoord = this._buffer.defineAttrib("a_texCoord", 2);

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this._textureProgram, "u_world"
    );
    this.u_texture = this._gl.getUniformLocation(
        this._textureProgram, "u_texture"
    );

    this._color = parsegraph_createColor(1, 1, 1, 1);
    this._backgroundColor = parsegraph_createColor(0, 0, 0, 0);

    this._buffer.addPage();
};

parsegraph_TexturePainter.prototype.texture = function()
{
    return this._texture;
};

parsegraph_TexturePainter.prototype.drawWholeTexture = function(x, y, width, height, scale)
{
    return this.drawTexture(
        0, 0, this._texWidth, this._texHeight,
        x, y, width, height, scale
    );
};

parsegraph_TexturePainter.prototype.drawTexture = function(
    iconX, iconY, iconWidth, iconHeight,
    x, y, width, height,
    scale)
{
    // Append position data.
    this._buffer.appendData(
        this.a_position,
        [
            x, y,
            x + width * scale, y,
            x + width * scale, y + height * scale,

            x, y,
            x + width * scale, y + height * scale,
            x, y + height * scale
        ]
    );

    // Append texture coordinate data.
    this._buffer.appendData(
        this.a_texCoord,
        [
            iconX / this._texWidth,
            (iconY + iconHeight) / this._texHeight,

            (iconX + iconWidth) / this._texWidth,
            (iconY + iconHeight) / this._texHeight,

            (iconX + iconWidth) / this._texWidth,
            iconY / this._texHeight,

            iconX / this._texWidth,
            (iconY + iconHeight) / this._texHeight,

            (iconX + iconWidth) / this._texWidth,
            iconY / this._texHeight,

            iconX / this._texWidth,
            iconY / this._texHeight,
        ]
    );
};

parsegraph_TexturePainter.prototype.clear = function()
{
    this._buffer.clear();
    this._buffer.addPage();
};

parsegraph_TexturePainter.prototype.render = function(world)
{
    var gl = this._gl;

    // Load program.
    this._gl.useProgram(
        this._textureProgram
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.uniform1i(this.u_texture, 0);

    // Render text.
    gl.uniformMatrix3fv(this.u_world, false, world);
    this._buffer.renderPages();
};

function parsegraph_Caret(nodeRoot)
{
    if(arguments.length === 0) {
        nodeRoot = new parsegraph_Node(parsegraph_DEFAULT_NODE_TYPE);
    }
    if(typeof nodeRoot != "object") {
        nodeRoot = new parsegraph_Node(parsegraph_readNodeType(nodeRoot));
    }
    this._nodeRoot = nodeRoot;

    // Stack of nodes.
    this._nodes = [this._nodeRoot];

    // A mapping of nodes to their saved names.
    this._savedNodes = null;

    this._labels = [];

    this._glyphAtlas = null;
};

parsegraph_Caret_Tests = new parsegraph_TestSuite("parsegraph_Caret");
parsegraph_Caret_Tests.addTest("new parsegraph_Caret", function() {
    var car = new parsegraph_Caret('s');
    var n = new parsegraph_Node(parsegraph_BLOCK);
    car = new parsegraph_Caret(n);
    car = new parsegraph_Caret();
    if(car.node().type() !== parsegraph_DEFAULT_NODE_TYPE) {
        console.log(parsegraph_DEFAULT_NODE_TYPE);
        return car.node().type() + " is not the default.";
    }
});

parsegraph_Caret.prototype.setGlyphAtlas = function(glyphAtlas)
{
    this._glyphAtlas = glyphAtlas;
};

parsegraph_Caret.prototype.glyphAtlas = function()
{
    if(!this._glyphAtlas) {
        throw new Error("Caret does not have a GlyphAtlas");
    }
    return this._glyphAtlas;
};

parsegraph_Caret.prototype.node = function()
{
    if(this._nodes.length === 0) {
        throw parsegraph_createException(parsegraph_NO_NODE_FOUND);
    }
    return this._nodes[this._nodes.length - 1];
};

parsegraph_Caret.prototype.has = function(inDirection)
{
    inDirection = parsegraph_readNodeDirection(inDirection);
    return this.node().hasNode(inDirection);
};

parsegraph_Caret.prototype.spawn = function(inDirection, newType, newAlignmentMode)
{
    // Interpret the given direction and type for ease-of-use.
    inDirection = parsegraph_readNodeDirection(inDirection);
    newType = parsegraph_readNodeType(newType);

    // Spawn a node in the given direction.
    var created = this.node().spawnNode(inDirection, newType);

    // Use the given alignment mode.
    if(newAlignmentMode !== undefined) {
        newAlignmentMode = parsegraph_readNodeAlignment(newAlignmentMode);
        this.align(inDirection, newAlignmentMode);
        if(newAlignmentMode !== parsegraph_DO_NOT_ALIGN) {
            this.node().setNodeFit(parsegraph_NODE_FIT_EXACT);
        }
    }

    return created;
};

parsegraph_Caret.prototype.connect = function(inDirection, node)
{
    // Interpret the given direction for ease-of-use.
    inDirection = parsegraph_readNodeDirection(inDirection);

    this.node().connectNode(inDirection, node);

    return node;
};

parsegraph_Caret.prototype.disconnect = function(inDirection)
{
    if(arguments.length > 0) {
        // Interpret the given direction for ease-of-use.
        inDirection = parsegraph_readNodeDirection(inDirection);
        return this.node().disconnectNode(inDirection);
    }

    if(this.node().isRoot()) {
        throw new Error("A root node cannot be disconnected.");
    }

    return this.node().parentNode().disconnectNode(parsegraph_reverseNodeDirection(this.node().parentDirection()));
};

parsegraph_Caret.prototype.crease = function(inDirection)
{
    // Interpret the given direction for ease-of-use.
    inDirection = parsegraph_readNodeDirection(inDirection);

    var node;
    if(arguments.length === 0) {
        node = this.node();
    }
    else {
        node = this.node().nodeAt(inDirection);
    }

    // Create a new paint group for the connection.
    if(!node.localPaintGroup()) {
        node.setPaintGroup(new parsegraph_PaintGroup(node));
    }

    return node.localPaintGroup();
};

parsegraph_Caret.prototype.erase = function(inDirection)
{
    inDirection = parsegraph_readNodeDirection(inDirection);
    return this.node().eraseNode(inDirection);
};

parsegraph_Caret.prototype.onClick = function(clickListener, thisArg)
{
    this.node().setClickListener(clickListener, thisArg);
};

parsegraph_Caret.prototype.onChange = function(changeListener, thisArg)
{
    this.node().setChangeListener(changeListener, thisArg);
};

parsegraph_Caret.prototype.onKey = function(keyListener, thisArg)
{
    this.node().setKeyListener(keyListener, thisArg);
};

parsegraph_Caret_Tests.addTest("parsegraph_Caret.onKey", function() {
    var car = new parsegraph_Caret();
    car.onKey(function() {
        console.log("Key pressed");
    });
});

parsegraph_Caret.prototype.move = function(toDirection)
{
    toDirection = parsegraph_readNodeDirection(toDirection);
    var dest = this.node().nodeAt(toDirection);
    if(!dest) {
        throw parsegraph_createException(parsegraph_NO_NODE_FOUND);
    }
    this._nodes[this._nodes.length - 1] = dest;
};

parsegraph_Caret.prototype.push = function()
{
    this._nodes.push(this.node());
};

parsegraph_Caret.prototype.save = function(id)
{
    if(id === undefined) {
        id = parsegraph_generateID();
    }
    if(!this._savedNodes) {
        this._savedNodes = {};
    }
    this._savedNodes[id] = this.node();
    return id;
}

parsegraph_Caret.prototype.clearSave = function(id)
{
    if(!this._savedNodes) {
        return;
    }
    if(id === undefined) {
        id = "";
    }
    delete this._savedNodes[id];
}

parsegraph_Caret.prototype.restore = function(id)
{
    if(!this._savedNodes) {
        throw new Error("No saved nodes were found for the provided ID '" + id + "'");
    }
    var loadedNode = this._savedNodes[id];
    if(loadedNode == null) {
        throw new Error("No node found for the provided ID '" + id + "'");
    }
    this._nodes[this._nodes.length - 1] = loadedNode;
}
parsegraph_Caret.prototype.moveTo = parsegraph_Caret.prototype.restore;

parsegraph_Caret.prototype.moveToRoot = function()
{
    this._nodes[this._nodes.length - 1] = this._nodeRoot;
};

parsegraph_Caret.prototype.pop = function()
{
    if(this._nodes.length <= 1) {
        throw parsegraph_createException(parsegraph_NO_NODE_FOUND);
    }
    this._nodes.pop();
};

parsegraph_Caret.prototype.spawnMove = function(inDirection, newContent, newAlignmentMode)
{
    var created = this.spawn(inDirection, newContent, newAlignmentMode);
    this.move(inDirection);
    return created;
};

parsegraph_Caret.prototype.replace = function()
{
    // Retrieve the arguments.
    var node = this.node();
    var withContent = arguments[0];
    if(arguments.length > 1) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
        withContent = arguments[1];
    }

    // Set the node type.
    withContent = parsegraph_readNodeType(withContent);
    node.setType(withContent);
};

parsegraph_Caret.prototype.at = function(inDirection)
{
    inDirection = parsegraph_readNodeDirection(inDirection);
    if(this.node().hasNode(inDirection)) {
        return this.node().noteAt(inDirection).type();
    }
};

parsegraph_Caret.prototype.align = function(inDirection, newAlignmentMode)
{
    // Interpret the arguments.
    inDirection = parsegraph_readNodeDirection(inDirection);
    newAlignmentMode = parsegraph_readNodeAlignment(newAlignmentMode);

    this.node().setNodeAlignmentMode(inDirection, newAlignmentMode);
    if(newAlignmentMode != parsegraph_DO_NOT_ALIGN) {
        this.node().setNodeFit(parsegraph_NODE_FIT_EXACT);
    }
};

parsegraph_Caret.prototype.pull = function(given)
{
    given = parsegraph_readNodeDirection(given);
    if(this.node().isRoot() || this.node().parentDirection() === parsegraph_OUTWARD) {
        if(parsegraph_isVerticalNodeDirection(given)) {
            this.node().setLayoutPreference(parsegraph_PREFER_VERTICAL_AXIS);
        }
        else {
            this.node().setLayoutPreference(parsegraph_PREFER_HORIZONTAL_AXIS);
        }
        return;
    }
    if(
        parsegraph_getNodeDirectionAxis(given)
        == parsegraph_getNodeDirectionAxis(this.node().parentDirection())
    ) {
        this.node().setLayoutPreference(parsegraph_PREFER_PARENT_AXIS);
    }
    else {
        this.node().setLayoutPreference(parsegraph_PREFER_PERPENDICULAR_AXIS);
    }
};

parsegraph_Caret.prototype.shrink = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    if(node) {
        node.setScale(parsegraph_SHRINK_SCALE);
    }
};

parsegraph_Caret.prototype.grow = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    if(node) {
        node.setScale(1.0);
    }
};

parsegraph_Caret.prototype.fitExact = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    node.setNodeFit(parsegraph_NODE_FIT_EXACT);
};

parsegraph_Caret.prototype.fitLoose = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    node.setNodeFit(parsegraph_NODE_FIT_LOOSE);
};

parsegraph_Caret.prototype.label = function(/* ... */)
{
    var node, text, glyphAtlas;
    switch(arguments.length) {
    case 1:
        node = this.node();
        text = arguments[0];
        glyphAtlas = this.glyphAtlas();
        break;
    case 2:
        if(typeof arguments[1] === "object") {
            node = this.node();
            text = arguments[0];
            glyphAtlas = arguments[1];
        }
        else {
            node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
            text = arguments[1];
            glyphAtlas = this.glyphAtlas();
            //console.log(typeof arguments[0]);
            //console.log(typeof arguments[1]);
        }
        break;
    case 3:
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
        text = arguments[1];
        glyphAtlas = arguments[2];
        break;
    }
    node.setLabel(text, glyphAtlas);
};

parsegraph_Caret.prototype.select = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    node.setSelected(true);
};

parsegraph_Caret.prototype.selected = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    return node.isSelected();
};

parsegraph_Caret.prototype.deselect = function()
{
    var node = this.node();
    if(arguments.length > 0) {
        node = node.nodeAt(parsegraph_readNodeDirection(arguments[0]));
    }
    node.setSelected(false);
};

parsegraph_Caret.prototype.graph = function()
{
    return this.node().graph();
};

/**
 * Returns the initiall provided node.
 */
parsegraph_Caret.prototype.root = function()
{
    return this._nodeRoot;
};
parsegraph_NULL_LAYOUT_PREFERENCE = 0;
parsegraph_PREFER_PARENT_AXIS = 1;
parsegraph_PREFER_PERPENDICULAR_AXIS = 2;
parsegraph_PREFER_HORIZONTAL_AXIS = 3;
parsegraph_PREFER_VERTICAL_AXIS = 4;

function parsegraph_nameLayoutPreference(given)
{
    switch(given) {
        case parsegraph_NULL_LAYOUT_PREFERENCE:
            return "NULL_LAYOUT_PREFERENCE";
        case parsegraph_PREFER_PARENT_AXIS:
            return "PREFER_PARENT_AXIS";
        case parsegraph_PREFER_PERPENDICULAR_AXIS:
            return "PREFER_PERPENDICULAR_AXIS";
        case parsegraph_PREFER_HORIZONTAL_AXIS:
            return "PREFER_HORIZONTAL_AXIS";
        case parsegraph_PREFER_VERTICAL_AXIS:
            return "PREFER_VERTICAL_AXIS";
    };
    throw parsegraph_createException(parsegraph_BAD_LAYOUT_PREFERENCE, given);
}
parsegraph_NULL_LAYOUT_STATE = 0;
parsegraph_NEEDS_COMMIT = 1;
parsegraph_COMMITTED_LAYOUT = 2;
parsegraph_IN_COMMIT = 3;

function parsegraph_nameLayoutState(given)
{
    switch(given) {
    case parsegraph_NULL_LAYOUT_STATE:
        return "NULL_LAYOUT_STATE";
    case parsegraph_NEEDS_COMMIT:
        return "NEEDS_COMMIT";
    case parsegraph_COMMITTED_LAYOUT:
        return "COMMITTED_LAYOUT";
    case parsegraph_IN_COMMIT:
        return "IN_COMMIT";
    }
    throw parsegraph_createException(parsegraph_BAD_LAYOUT_STATE, given);
}
parsegraph_Node_COUNT = 0;
function parsegraph_Node(newType, fromNode, parentDirection)
{
    this._id = parsegraph_Node_COUNT++;

    this._paintGroup = null;
    this._keyListener = null;
    this._clickListener = null;
    this._clickListenerThisArg = null;
    this._changeListener = null;
    this._changeListenerThisArg = null;
    this._type = newType;
    this._style = parsegraph_style(this._type);
    this._label = null;
    this._labelX = null;
    this._labelY = null;
    this._rightToLeft = parsegraph_RIGHT_TO_LEFT;

    this._value = null;
    this._selected = false;
    this._ignoresMouse = false;

    this._prevTabNode = null;
    this._nextTabNode = null;

    this._scene = null;

    this._scale = 1.0;
    this._absoluteXPos = null;
    this._absoluteYPos = null;
    this._absoluteScale = null;

    this._paintGroupNext = this;
    this._paintGroupPrev = this;
    this._worldNext = this;
    this._worldPrev = this;

    // Check if a parent node was provided.
    this._layoutState = parsegraph_NEEDS_COMMIT;
    this._nodeFit = parsegraph_NODE_FIT_LOOSE;
    this._neighbors = [];
    for(var i = 0; i < parsegraph_NUM_DIRECTIONS; ++i) {
        this._neighbors.push({
            direction: i,
            extent: new parsegraph_Extent(),
            extentOffset: 0,
            alignmentMode: parsegraph_NULL_NODE_ALIGNMENT,
            alignmentOffset: 0,
            separation: 0,
            lineLength: 0,
            xPos: 0,
            yPos: 0,
            node: null
        });
    }

    // No parent was provided; this node is a root.
    this._layoutPreference = parsegraph_PREFER_HORIZONTAL_AXIS;
    this._parentDirection = parsegraph_NULL_NODE_DIRECTION;

    // A parent node was provided; this node is a child.
    if(fromNode != null) {
        this._layoutPreference = parsegraph_PREFER_PERPENDICULAR_AXIS;
        fromNode.connectNode(parentDirection, this);
    }
}

function parsegraph_chainTab(a, b, swappedOut)
{
    if(swappedOut) {
        swappedOut[0] = a ? a._nextTabNode : null;
        swappedOut[1] = b ? b._prevTabNode : null;
    }
    //console.log(a, b);
    if(a) {
        a._nextTabNode = b;
    }
    if(b) {
        b._prevTabNode = a;
    }
}

function parsegraph_chainAllTabs()
{
    if(arguments.length < 2) {
        return;
    }
    var firstNode = arguments[0];
    var lastNode = arguments[arguments.length - 1];

    for(var i = 0; i <= arguments.length - 2; ++i) {
        parsegraph_chainTab(
            arguments[i], arguments[i + 1]
        );
    }
    parsegraph_chainTab(lastNode, firstNode);
}

parsegraph_Node_Tests = new parsegraph_TestSuite("parsegraph_Node");

parsegraph_Node_Tests.AddTest("Right-to-left test", function() {
    var node = new parsegraph_Node(parsegraph_BUD);

    node.setRightToLeft(true);
});

parsegraph_Node.prototype.x = function()
{
    if(this.isRoot()) {
        return 0;
    }
    return this.nodeParent()._neighbors[parsegraph_reverseNodeDirection(this.parentDirection())].xPos;
};

parsegraph_Node.prototype.y = function()
{
    if(this.isRoot()) {
        return 0;
    }
    return this.nodeParent()._neighbors[parsegraph_reverseNodeDirection(this.parentDirection())].yPos;
};

parsegraph_Node.prototype.scale = function()
{
    return this._scale;
}

parsegraph_Node.prototype.setScale = function(scale)
{
    this._scale = scale;
    this.layoutWasChanged(parsegraph_INWARD);
}

parsegraph_Node.prototype.setRightToLeft = function(val)
{
    this._rightToLeft = !!val;
    this.layoutWasChanged(parsegraph_INWARD);
};

parsegraph_Node.prototype.rightToLeft = function()
{
    return this._rightToLeft;
};

parsegraph_Node.prototype.commitAbsolutePos = function()
{
    if(this._absoluteXPos !== null) {
        // No need for an update, so just return.
        return;
    }

    // Retrieve a stack of nodes to determine the absolute position.
    var node = this;
    var nodeList = [];
    var parentScale = 1.0;
    var scale = 1.0;
    while(true) {
        if(node.isRoot()) {
            this._absoluteXPos = 0;
            this._absoluteYPos = 0;
            break;
        }

        nodeList.push(parsegraph_reverseNodeDirection(node.parentDirection()));
        node = node.nodeParent();
    }

    // nodeList contains [directionToThis, directionToParent, ..., directionFromRoot];
    for(var i = nodeList.length - 1; i >= 0; --i) {
        var directionToChild = nodeList[i];

        this._absoluteXPos += node.x() * parentScale;
        this._absoluteYPos += node.y() * parentScale;

        parentScale = scale;
        scale *= node.scaleAt(directionToChild);
        node = node.nodeAt(directionToChild);
    }

    this._absoluteXPos += node.x() * parentScale;
    this._absoluteYPos += node.y() * parentScale;
    this._absoluteScale = scale;

    this.eachChild(function(node) {
        node.positionWasChanged();
    }, this);
};

parsegraph_Node.prototype.positionWasChanged = function()
{
    this._absoluteXPos = null;
    this._absoluteYPos = null;
};

parsegraph_Node.prototype.absoluteX = function()
{
    this.commitAbsolutePos();
    return this._absoluteXPos;
};

parsegraph_Node.prototype.absoluteY = function()
{
    this.commitAbsolutePos();
    return this._absoluteYPos;
};

parsegraph_Node.prototype.absoluteScale = function()
{
    this.commitAbsolutePos();
    return this._absoluteScale;
};

parsegraph_Node.prototype.setPosAt = function(inDirection, x, y)
{
    this._neighbors[inDirection].xPos = x;
    this._neighbors[inDirection].yPos = y;
};

parsegraph_Node.prototype.setPaintGroup = function(paintGroup)
{
    if(!this._paintGroup) {
        this._paintGroup = paintGroup;

        // Parent this paint group to this node, since it now has a paint group.
        if(paintGroup && !this.isRoot()) {
            var parentsPaintGroup = this.parentNode().findPaintGroup();
            if(parentsPaintGroup) {
                parentsPaintGroup._childPaintGroups.push(paintGroup);
                paintGroup.assignParent(parentsPaintGroup);
            }
        }

        // Find the child paint groups and add them to this paint group.
        parsegraph_findChildPaintGroups(this, function(childPaintGroup) {
            paintGroup._childPaintGroups.push(childPaintGroup);
            childPaintGroup.assignParent(paintGroup);
        });

        return;
    }

    // This node has an existing paint group.

    // Remove the paint group's entry in the parent.
    if(!this.isRoot()) {
        var parentsPaintGroup = this.parentNode().findPaintGroup();
        for(var i in parentsPaintGroup._childPaintGroups) {
            var childGroup = parentsPaintGroup._childPaintGroups[i];
            if(childGroup !== this._paintGroup) {
                // Some other child that's not us, so just continue.
                continue;
            }

            // This child is our current paint group, so replace it with the new.
            if(paintGroup) {
                parentsPaintGroup._childPaintGroups[i] = paintGroup;
            }
            else {
                // The new group is no group.
                parentsPaintGroup._childPaintGroups.splice(i, 1);
            }
        }
    }

    // Copy the current paint group's children, if present.
    if(paintGroup) {
        var childGroups = paintGroup._childPaintGroups;
        childGroups.push.apply(childGroups, this._paintGroup._childPaintGroups);
    }
    else {
        parsegraph_findChildPaintGroups(this, function(childPaintGroup) {
            paintGroup.addChild(childPaintGroup);
        });
    }

    this._paintGroup.clear();
    this._paintGroup = paintGroup;
}

parsegraph_Node.prototype.findPaintGroup = function()
{
    var node = this;
    while(!node.isRoot()) {
        if(node._paintGroup && node._paintGroup.isEnabled()) {
            return node._paintGroup;
        }
        node = node.parentNode();
    }

    return node._paintGroup;
};

parsegraph_Node.prototype.localPaintGroup = function()
{
    return this._paintGroup;
};

parsegraph_Node.prototype.graph = function()
{
    return this._graph;
};

parsegraph_Node.prototype.backdropColor = function()
{
    var node = this;
    if(node.isSelected()) {
        return node.blockStyle().backgroundColor;
    }
    return node.blockStyle().selectedBackgroundColor;
    while(true) {
        if(node.isRoot()) {
            return parsegraph_BACKGROUND_COLOR;
        }
        if(node.parentDirection() === parsegraph_OUTWARD) {
            if(node.isSelected()) {
                return node.parentNode().blockStyle().backgroundColor;
            }
            return node.parentNode().blockStyle().selectedBackgroundColor;
        }
        node = node.parentNode();
    }
};

parsegraph_Node.prototype.setClickListener = function(listener, thisArg)
{
    if(!listener) {
        this._clickListener = null;
        this._clickListenerThisArg = null;
    }
    else {
        if(!thisArg) {
            thisArg = this;
        }
        this._clickListener = listener;
        this._clickListenerThisArg = thisArg;
    }
};

parsegraph_Node.prototype.setChangeListener = function(listener, thisArg)
{
    if(!listener) {
        this._changeListener = null;
    }
    else {
        if(!thisArg) {
            thisArg = this;
        }
        this._changeListener = listener;
        this._changeListenerThisArg = thisArg;
    }
};

parsegraph_Node_Tests.addTest("parsegraph_Node.setClickListener", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    n.setClickListener(function() {
    });
});

parsegraph_Node.prototype.isClickable = function()
{
    var hasLabel = this._label && !Number.isNaN(this._labelX) && this._label.editable();
    return this.type() === parsegraph_SLIDER || (this.hasClickListener() || !this.ignoresMouse()) || hasLabel;
};

parsegraph_Node.prototype.setIgnoreMouse = function(value)
{
    this._ignoresMouse = value;
};

parsegraph_Node.prototype.ignoresMouse = function()
{
    return this._ignoresMouse;
};

/**
 */
parsegraph_Node.prototype.hasClickListener = function()
{
    return this._clickListener != null;
};

parsegraph_Node.prototype.hasChangeListener = function()
{
    return this._changeListener != null;
};

parsegraph_Node.prototype.valueChanged = function()
{
    // Invoke the listener.
    if(!this.hasChangeListener()) {
        return;
    }
    return this._changeListener.apply(this._changeListenerThisArg, arguments);
};

parsegraph_Node.prototype.click = function()
{
    // Invoke the click listener.
    if(!this.hasClickListener()) {
        return;
    }
    return this._clickListener.apply(this._clickListenerThisArg, arguments);
};

parsegraph_Node.prototype.setKeyListener = function(listener, thisArg)
{
    if(!listener) {
        this._keyListener = null;
    }
    else {
        if(!thisArg) {
            thisArg = this;
        }
        this._keyListener = [listener, thisArg];
    }
};

parsegraph_Node_Tests.addTest("parsegraph_Node.setKeyListener", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    n.setKeyListener(function() {
    });
});

parsegraph_Node.prototype.hasKeyListener = function()
{
    return this._keyListener != null;
};

parsegraph_Node.prototype.key = function()
{
    // Invoke the key listener.
    if(!this.hasKeyListener()) {
        return;
    }
    return this._keyListener[0].apply(this._keyListener[1], arguments);
};

parsegraph_Node.prototype.nodeFit = function()
{
    return this._nodeFit;
};

parsegraph_Node.prototype.setNodeFit = function(nodeFit)
{
    this._nodeFit = nodeFit;
    this.layoutWasChanged(parsegraph_INWARD);
};

parsegraph_Node.prototype.isRoot = function()
{
    return this._parentDirection === parsegraph_NULL_NODE_DIRECTION;
};

parsegraph_Node.prototype.parentDirection = function()
{
    if(this.isRoot()) {
        return parsegraph_NULL_NODE_DIRECTION;
    }
    return this._parentDirection;
};

parsegraph_Node.prototype.nodeParent = function()
{
    if(this.isRoot()) {
        throw parsegraph_createException(parsegraph_NODE_IS_ROOT);
    }
    return this._neighbors[this.parentDirection()].node;
};
parsegraph_Node.prototype.parentNode = parsegraph_Node.prototype.nodeParent;
parsegraph_Node.prototype.parent = parsegraph_Node.prototype.nodeParent;

parsegraph_Node.prototype.hasNode = function(atDirection)
{
    if(atDirection == parsegraph_NULL_NODE_DIRECTION) {
        return false;
    }
    return this._neighbors[atDirection].node;
};

parsegraph_Node.prototype.hasNodes = function(axis)
{
    if(axis === parsegraph_NULL_AXIS) {
        throw parsegraph_createException(parsegraph_BAD_AXIS, axis);
    }

    var result = [
        parsegraph_NULL_NODE_DIRECTION,
        parsegraph_NULL_NODE_DIRECTION
    ];

    if(this.hasNode(parsegraph_getNegativeNodeDirection(axis))) {
        result[0] = parsegraph_getNegativeNodeDirection(axis);
    }
    if(this.hasNode(parsegraph_getPositiveNodeDirection(axis))) {
        result[1] = parsegraph_getPositiveNodeDirection(axis);
    }

    return result;
};

parsegraph_Node.prototype.hasChildAt = function(direction)
{
    return this.hasNode(direction) && this.parentDirection() != direction;
};

parsegraph_Node.prototype.hasAnyNodes = function()
{
    return this.hasChildAt(parsegraph_DOWNWARD)
        || this.hasChildAt(parsegraph_UPWARD)
        || this.hasChildAt(parsegraph_FORWARD)
        || this.hasChildAt(parsegraph_BACKWARD);
};

parsegraph_Node.prototype.nodeAt = function(atDirection)
{
    return this._neighbors[atDirection].node;
};

parsegraph_Node.prototype.traverse = function(filterFunc, actionFunc, thisArg, timeout)
{
    // First, exit immediately if this node doesn't pass the given filter.
    if(!filterFunc.call(thisArg, this)) {
        return;
    }

    var ordering = [this];

    var addNode = function(node, direction) {
        // Do not add the parent.
        if(!node.isRoot() && node.parentDirection() == direction) {
            return;
        }
        // Add the node to the ordering if it exists and needs a layout.
        if(node.hasNode(direction)) {
            var child = node.nodeAt(direction);
            if(filterFunc.call(thisArg, child)) {
                ordering.push(child);
            }
        }
    };

    // Build the node list.
    for(var i = 0; i < ordering.length; ++i) {
        var node = ordering[i];
        addNode(node, parsegraph_INWARD);
        addNode(node, parsegraph_DOWNWARD);
        addNode(node, parsegraph_UPWARD);
        addNode(node, parsegraph_BACKWARD);
        addNode(node, parsegraph_FORWARD);
    }

    // Execute the action on allowed nodes.
    var i = ordering.length - 1;
    var loop = function() {
        var t = new Date().getTime();
        var pastTime = function() {
            return timeout !== undefined && (new Date().getTime() - t > timeout);
        };

        while(true) {
            if(i < 0) {
                // Indicate completion.
                return null;
            }
            actionFunc.call(thisArg, ordering[i]);
            --i;
            if(pastTime()) {
                return loop;
            }
        }
    }

    return loop();
};

parsegraph_Node.prototype.spawnNode = function(spawnDirection, newType)
{
    var created = this.connectNode(spawnDirection, new parsegraph_Node(newType));

    // Use the node fitting of the parent.
    created.setNodeFit(this.nodeFit());

    return created;
};

parsegraph_Node.prototype.connectNode = function(inDirection, node)
{
    // Ensure the node can be connected in the given direction.
    if(inDirection == parsegraph_OUTWARD) {
        throw new Error("By rule, nodes cannot be spawned in the outward direction.");
    }
    if(inDirection == parsegraph_NULL_NODE_DIRECTION) {
        throw new Error("Nodes cannot be spawned in the null node direction.");
    }
    if(inDirection == this.parentDirection()) {
        throw new Error("Cannot connect a node in the parent's direction (" + parsegraph_nameNodeDirection(inDirection));
    }
    if(this.hasNode(inDirection)) {
        throw new Error("Cannot connect a node in the already occupied " + parsegraph_nameNodeDirection(inDirection) + " direction.");
    }
    if(this.type() == parsegraph_SLIDER) {
        throw new Error("Sliders cannot have child nodes.");
    }
    if(this.type() == parsegraph_SCENE && inDirection == parsegraph_INWARD) {
        throw new Error("Scenes cannot have inward nodes.");
    }
    if(node.parentDirection() !== parsegraph_NULL_NODE_DIRECTION) {
        throw new Error("Node to connect must not have a parent.");
    }
    if(node.hasNode(parsegraph_reverseNodeDirection(inDirection))) {
        throw new Error("Node to connect must not have a node in the connecting direction.");
    }

    // Connect the node.
    var neighbor = this._neighbors[inDirection];
    neighbor.node = node;
    node.assignParent(this, parsegraph_reverseNodeDirection(inDirection));

    var prevSibling;
    for(var i = inDirection; i >= 0; --i) {
        if(i === inDirection) {
            continue;
        }
        if(i === this._parentDirection) {
            continue;
        }
        prevSibling = this._neighbors[i].node;
        if(prevSibling) {
            break;
        }
    }
    if(prevSibling) {
        var deeplyLinked = prevSibling;
        var foundOne;
        while(true) {
            foundOne = false;
            for(var i = parsegraph_NUM_DIRECTIONS - 1; i >= 0; --i) {
                if(deeplyLinked.nodeAt(i) && deeplyLinked.parentDirection() !== i) {
                    deeplyLinked = deeplyLinked.nodeAt(i);
                    foundOne = true;
                    break;
                }
            }
            if(foundOne) {
                continue;
            }
            else {
                break;
            }
        }
        prevSibling = deeplyLinked;
    }

    var nextSibling;
    for(var i = inDirection; i < parsegraph_NUM_DIRECTIONS; ++i) {
        if(i === inDirection) {
            continue;
        }
        if(i === this._parentDirection) {
            continue;
        }
        nextSibling = this._neighbors[i].node;
        if(nextSibling) {
            break;
        }
    }
    if(nextSibling) {
        deeplyLinked = nextSibling;
        var foundOne;
        while(true) {
            foundOne = false;
            for(var i = 0; i < parsegraph_NUM_DIRECTIONS; ++i) {
                if(deeplyLinked.nodeAt(i) && deeplyLinked.parentDirection() !== i) {
                    deeplyLinked = deeplyLinked.nodeAt(i);
                    foundOne = true;
                    break;
                }
            }
            if(foundOne) {
                continue;
            }
            else {
                break;
            }
        }
        nextSibling = deeplyLinked;
    }


    if(nextSibling && prevSibling) {
        //console.log("Adding " + parsegraph_nameNodeType(node.type()) + " child between node siblings");
        var lastOfNode = node._worldPrev;
        var prevExisting = nextSibling._worldPrev;
        prevExisting._worldNext = node;
        node._worldPrev = prevExisting;
        lastOfNode._worldNext = nextSibling;
        nextSibling._worldPrev = lastOfNode;
    }
    else if(nextSibling) {
        //console.log("Adding child with only next siblings");
        // No previous sibling.
        var oldNext = this._worldNext;
        this._worldNext = node;
        var lastOfNode = node._worldPrev;
        node._worldPrev = this;

        lastOfNode._worldNext = oldNext;
        oldNext._worldPrev = lastOfNode;
    }
    else if(prevSibling) {
        //console.log("Adding child " + parsegraph_nameNodeType(node.type()) + " with only previous siblings in " + parsegraph_nameNodeDirection(inDirection) + " direction.");
        var oldNext = prevSibling._worldNext;
        var lastOfNode = node._worldPrev;

        oldNext._worldPrev = lastOfNode;
        prevSibling._worldNext = node;

        lastOfNode._worldNext = oldNext;
        node._worldPrev = prevSibling;
    }
    else {
        //console.log("Connecting only child " + parsegraph_nameNodeType(node.type()) + " in " + parsegraph_nameNodeDirection(inDirection) + " direction.");
        // Connected node has no neighbors.
        var oldNext = this._worldNext;
        this._worldNext = node;

        var lastOfNode = node._worldPrev;
        lastOfNode._worldNext = oldNext;
        oldNext._worldPrev = lastOfNode;

        node._worldPrev = this;
    }

    // Allow alignments to be set before children are spawned.
    if(neighbor.alignmentMode == parsegraph_NULL_NODE_ALIGNMENT) {
        neighbor.alignmentMode = parsegraph_DO_NOT_ALIGN;
    }

    this.layoutWasChanged(inDirection);

    return node;
};

parsegraph_Node.prototype.eraseNode = function(givenDirection) {
    if(!this.hasNode(givenDirection)) {
        return;
    }
    if(!this.isRoot() && givenDirection == this.parentDirection()) {
        throw parsegraph_createException(parsegraph_CANNOT_AFFECT_PARENT);
    }
    return this.disconnectNode(givenDirection);
};

parsegraph_Node.prototype.disconnectNode = function(inDirection)
{
    if(arguments.length === 0) {
        if(this.isRoot()) {
            throw new Error("Cannot disconnect a root node.");
        }
        return this.parentNode().disconnectNode(
            parsegraph_reverseNodeDirection(this._parentDirection)
        );
    }
    if(!this.hasNode(inDirection)) {
        return;
    }
    // Connect the node.
    var neighbor = this._neighbors[inDirection];
    var disconnected = neighbor.node;
    neighbor.node = null;
    disconnected.assignParent(null);

    var prevSibling;
    for(var i = inDirection; i >= 0; --i) {
        if(i === inDirection) {
            continue;
        }
        if(i === this._parentDirection) {
            continue;
        }
        prevSibling = this._neighbors[i].node;
        if(prevSibling) {
            break;
        }
    }
    var nextSibling;
    for(var i = inDirection; i < parsegraph_NUM_DIRECTIONS; ++i) {
        if(i === inDirection) {
            continue;
        }
        if(i === this._parentDirection) {
            continue;
        }
        nextSibling = this._neighbors[i].node;
        if(nextSibling) {
            break;
        }
    }

    if(nextSibling && prevSibling) {
        var oldPrev = disconnected._worldPrev;
        var lastOfDisconnected = nextSibling._worldPrev;

        disconnected._worldPrev = lastOfDisconnected;
        lastOfDisconnected._worldNext = disconnected;

        nextSibling._worldPrev = oldPrev;
        oldPrev._worldNext = nextSibling;
    }
    else if(nextSibling) {
        var oldPrev = nextSibling._worldPrev;

        nextSibling._worldPrev = this;
        this._worldNext = nextSibling;

        oldPrev._worldNext = disconnected;
        disconnected._worldPrev = oldPrev;
    }
    else if(prevSibling) {
        var oldPrev = disconnected._worldPrev;
        var lastOfDisconnected = this._worldPrev;

        disconnected._worldPrev = lastOfDisconnected;
        lastOfDisconnected._worldNext = disconnected;

        oldPrev._worldNext = this;
        this._worldPrev = oldPrev;
    }
    else {
        var lastOfDisconnected = this._worldPrev;
        this._worldNext = this;
        this._worldPrev = this;

        disconnected._worldPrev = lastOfDisconnected;
        lastOfDisconnected._worldNext = disconnected;
    }

    this.layoutWasChanged(inDirection);
    return disconnected;
};

parsegraph_Node.prototype.eachChild = function(visitor, visitorThisArg)
{
    this._neighbors.forEach(function(neighbor, direction) {
            if(!neighbor.node || direction == this.parentDirection()) {
                return;
            }
            visitor.call(visitorThisArg, neighbor.node, direction);
        },
        this
    );
};

parsegraph_Node.prototype.scaleAt = function(direction)
{
    return this.nodeAt(direction).scale();
};

parsegraph_Node.prototype.lineLengthAt = function(direction)
{
    return this._neighbors[direction].lineLength;
};

parsegraph_Node.prototype.extentsAt = function(atDirection)
{
    return this._neighbors[atDirection].extent;
};

parsegraph_Node.prototype.extentOffsetAt = function(atDirection)
{
    return this._neighbors[atDirection].extentOffset;
};

parsegraph_Node.prototype.extentSize = function(outPos)
{
    if(!outPos) {
        outPos = new parsegraph_Size();
    }

    // We can just use the length to determine the full size.

    // The horizontal extents have length in the vertical direction.
    outPos.setHeight(
        this.extentsAt(parsegraph_FORWARD).boundingValues()[0]
    );

    // The vertical extents have length in the vertical direction.
    outPos.setWidth(
        this.extentsAt(parsegraph_DOWNWARD).boundingValues()[0]
    );

    return outPos;
};

parsegraph_Node.prototype.setLayoutPreference = function(given)
{
    this._layoutPreference = given;
    this.layoutWasChanged(parsegraph_INWARD);
};

parsegraph_Node.prototype.setNodeAlignmentMode = function(inDirection, newAlignmentMode)
{
    if(arguments.length === 1) {
        return this.parentNode().setNodeAlignmentMode(
            parsegraph_reverseNodeDirection(this._parentDirection),
            arguments[0]
        );
    }
    this._neighbors[inDirection].alignmentMode = newAlignmentMode;
    this.layoutWasChanged(inDirection);
};

parsegraph_Node.prototype.nodeAlignmentMode = function(inDirection)
{
    return this._neighbors[inDirection].alignmentMode;
};

parsegraph_Node.prototype.type = function()
{
    return this._type;
};

parsegraph_Node.prototype.setType = function(newType)
{
    this._type = newType;
    this._style = parsegraph_style(this._type);
    this.layoutWasChanged(parsegraph_INWARD);
};

parsegraph_Node.prototype.value = function()
{
    return this._value;
};

parsegraph_Node.prototype.setValue = function(newValue, report)
{
    if(this._value === newValue) {
        return;
    }
    this._value = newValue;
    if(arguments.length === 1 || report) {
        this.valueChanged();
    }
};

parsegraph_Node.prototype.scene = function()
{
    return this._scene;
};

parsegraph_Node.prototype.setScene = function(scene)
{
    this._scene = scene;
    this.layoutWasChanged(parsegraph_INWARD);
};

parsegraph_Node.prototype.typeAt = function(direction)
{
    return this.nodeAt(direction).type();
};

parsegraph_Node.prototype.label = function()
{
    if(!this._label) {
        return null;
    }
    return this._label.text();
};

parsegraph_Node.prototype.realLabel = function()
{
    if(!this._label) {
        return null;
    }
    return this._label;
};

parsegraph_Node.prototype.setLabel = function(text, glyphAtlas)
{
    if(!this._label) {
        this._label = new parsegraph_Label(glyphAtlas);
    }
    this._label.setText(text);
    this.layoutWasChanged();
};

parsegraph_Node_Tests.addTest("parsegraph_Node.setLabel", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    var atlas = parsegraph_buildGlyphAtlas();
    n.setLabel("No time", atlas);
});

parsegraph_Node_Tests.addTest("parsegraph_Node Morris world threading spawned", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    n.spawnNode(parsegraph_FORWARD, parsegraph_BLOCK);
});

parsegraph_Node_Tests.addTest("parsegraph_Node Morris world threading connected", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    if(n._worldPrev != n) {
        throw new Error("Previous sanity");
    }
    if(n._worldNext != n) {
        throw new Error("Next sanity");
    }

    var b = new parsegraph_Node(parsegraph_BLOCK);
    if(b._worldPrev != b) {
        throw new Error("Previous sanity");
    }
    if(b._worldNext != b) {
        throw new Error("Next sanity");
    }

    n.connectNode(parsegraph_FORWARD, b);
    if(n._worldNext != b) {
        throw new Error("Next connected sanity");
    }
    if(b._worldNext != n) {
        return false;
    }
    if(n._worldPrev != b) {
        return false;
    }
    if(b._worldPrev != n) {
        return false;
    }
});

parsegraph_Node_Tests.addTest("parsegraph_Node Morris world threading connected with multiple siblings", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    if(n._worldPrev != n) {
        throw new Error("Previous sanity");
    }
    if(n._worldNext != n) {
        throw new Error("Next sanity");
    }

    var b = new parsegraph_Node(parsegraph_BLOCK);
    if(b._worldPrev != b) {
        throw new Error("Previous sanity");
    }
    if(b._worldNext != b) {
        throw new Error("Next sanity");
    }

    n.connectNode(parsegraph_FORWARD, b);
    if(n._worldNext != b) {
        throw new Error("Next connected sanity");
    }
    if(b._worldNext != n) {
        throw new Error("Next connected sanity");
    }
    if(n._worldPrev != b) {
        throw new Error("Next connected sanity");
    }
    if(b._worldPrev != n) {
        throw new Error("Next connected sanity");
    }
    var c = new parsegraph_Node(parsegraph_BLOCK);
    n.connectNode(parsegraph_BACKWARD, c);

    if(n._worldNext != c) {
        throw new Error("N worldNext wasn't C");
    }
    if(c._worldNext != b) {
        throw new Error("C worldNext wasn't B");
    }
    if(b._worldNext != n) {
        throw new Error("B worldNext wasn't N");
    }
});

parsegraph_Node_Tests.addTest("parsegraph_Node Morris world threading connected with multiple siblings and disconnected", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    if(n._worldPrev != n) {
        throw new Error("Previous sanity");
    }
    if(n._worldNext != n) {
        throw new Error("Next sanity");
    }

    var b = new parsegraph_Node(parsegraph_BLOCK);
    if(b._worldPrev != b) {
        throw new Error("Previous sanity");
    }
    if(b._worldNext != b) {
        throw new Error("Next sanity");
    }

    var inner = b.spawnNode(parsegraph_INWARD, parsegraph_BLOCK);
    if(b._worldNext != inner) {
        return "B worldNext isn't inner";
    }
    if(inner._worldNext != b) {
        return "Inner worldNext isn't B";
    }

    n.connectNode(parsegraph_FORWARD, b);
    if(n._worldNext != b) {
        throw new Error("Next connected sanity");
    }
    if(b._worldNext != inner) {
        throw new Error("N worldNext wasn't B");
    }
    if(inner._worldNext != n) {
        throw new Error("N worldNext wasn't B");
    }
    if(n._worldPrev != inner) {
        throw new Error("N worldNext wasn't B");
    }
    if(inner._worldPrev != b) {
        throw new Error("N worldNext wasn't B");
    }
    if(b._worldPrev != n) {
        throw new Error("N worldNext wasn't B");
    }
    var c = new parsegraph_Node(parsegraph_BLOCK);
    n.connectNode(parsegraph_BACKWARD, c);

    if(n._worldNext != c) {
        throw new Error("N worldNext wasn't C");
    }
    if(c._worldNext != b) {
        throw new Error("C worldNext wasn't rb");
    }
    if(b._worldNext != inner) {
        throw new Error("b worldNext wasn't inner");
    }
    if(inner._worldNext != n) {
        throw new Error("inner worldNext wasn't N");
    }
    if(b !== n.disconnectNode(parsegraph_FORWARD)) {
        throw new Error("Not even working properly");
    }
    if(b._worldNext !== inner) {
        throw new Error("B worldNext wasn't inner");
    }
    if(b._worldPrev !== inner) {
        throw new Error("B worldPrev wasn't inner");
    }
});

parsegraph_Node_Tests.addTest("parsegraph_Node Morris world threading connected with multiple siblings and disconnected 2", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    if(n._worldPrev != n) {
        throw new Error("Previous sanity");
    }
    if(n._worldNext != n) {
        throw new Error("Next sanity");
    }

    var b = new parsegraph_Node(parsegraph_BLOCK);
    if(b._worldPrev != b) {
        throw new Error("Previous sanity");
    }
    if(b._worldNext != b) {
        throw new Error("Next sanity");
    }

    var inner = b.spawnNode(parsegraph_INWARD, parsegraph_BLOCK);
    if(b._worldNext != inner) {
        return "B worldNext isn't inner";
    }
    if(inner._worldNext != b) {
        return "Inner worldNext isn't B";
    }

    n.connectNode(parsegraph_FORWARD, b);
    if(n._worldNext != b) {
        throw new Error("Next connected sanity");
    }
    if(b._worldNext != inner) {
        throw new Error("B worldNext wasn't inner");
    }
    if(inner._worldNext != n) {
        throw new Error("inner worldNext wasn't B");
    }
    if(n._worldPrev != inner) {
        throw new Error("N worldNext wasn't inner");
    }
    if(inner._worldPrev != b) {
        throw new Error("inner worldPrev wasn't b");
    }
    if(b._worldPrev != n) {
        throw new Error("N worldNext wasn't B");
    }
    var c = new parsegraph_Node(parsegraph_BLOCK);
    n.connectNode(parsegraph_BACKWARD, c);

    if(n._worldNext != c) {
        throw new Error("N worldNext wasn't c");
    }
    if(c._worldNext != b) {
        throw new Error("c worldNext wasn't b");
    }
    if(b._worldNext != inner) {
        throw new Error("b worldNext wasn't inner");
    }
    if(inner._worldNext != n) {
        throw new Error("inner worldNext wasn't N");
    }
    if(c !== n.disconnectNode(parsegraph_BACKWARD)) {
        throw new Error("Not even working properly");
    }
    if(c._worldNext !== c) {
        throw new Error("C worldNext wasn't C");
    }
    if(c._worldPrev !== c) {
        throw new Error("C worldPrev wasn't C");
    }
});

parsegraph_Node_Tests.addTest("parsegraph_Node Morris world threading deeply connected", function() {
    var n = new parsegraph_Node(parsegraph_BLOCK);
    var b = n.spawnNode(parsegraph_FORWARD, parsegraph_BUD);
    var c = b.spawnNode(parsegraph_DOWNWARD, parsegraph_BLOCK);
    var d = b.spawnNode(parsegraph_FORWARD, parsegraph_BUD);

    if(n._worldPrev !== d) {
        throw new Error("Previous sanity");
    }
    if(d._worldPrev !== c) {
        throw new Error("Previous sanity");
    }
    if(c._worldPrev !== b) {
        throw new Error("Previous sanity");
    }
    if(b._worldPrev !== n) {
        throw new Error("Previous sanity");
    }
});

parsegraph_Node.prototype.blockStyle = function()
{
    return this._style;
};

parsegraph_Node.prototype.setBlockStyle = function(style)
{
    if(this._style == style) {
        // Ignore idempotent style changes.
        return;
    }
    this._style = style;
    this.layoutWasChanged(parsegraph_INWARD);
};

parsegraph_Node.prototype.isSelectedAt = function(direction)
{
    if(!this.hasNode(direction)) {
        return false;
    }
    return this.nodeAt(direction).isSelected();
};

parsegraph_Node.prototype.sizeIn = function(direction)
{
    var rv = this.size();
    if(parsegraph_isVerticalNodeDirection(direction)) {
        return rv.height() / 2;
    }
    else {
        return rv.width() / 2;
    }
};

parsegraph_Node.prototype.brightnessColor = function()
{
    return this._brightnessColor;
};

parsegraph_Node.prototype.setBrightnessColor = function(brightnessColor)
{
    this._brightnessColor = brightnessColor;
};

parsegraph_Node.prototype.borderThickness = function()
{
    return this.blockStyle().borderThickness;
};

parsegraph_Node.prototype.size = function(bodySize)
{
    bodySize = this.sizeWithoutPadding(bodySize);
    bodySize[0] += 2 * this.horizontalPadding() + 2 * this.borderThickness();
    bodySize[1] += 2 * this.verticalPadding() + 2 * this.borderThickness();
    return bodySize;
};

parsegraph_Node.prototype.absoluteSize = function(bodySize)
{
    return this.size(bodySize).scaled(this.absoluteScale());
};

parsegraph_Node.prototype.assignParent = function(fromNode, parentDirection)
{
    if(arguments.length === 0 || !fromNode) {
        // Clearing the parent.
        if(this._parentDirection !== parsegraph_NULL_NODE_DIRECTION) {
            this._neighbors[this._parentDirection].node = null;
            this._parentDirection = parsegraph_NULL_NODE_DIRECTION;
        }
        return;
    }
    this._neighbors[parentDirection].node = fromNode;
    this._parentDirection = parentDirection;
};

parsegraph_Node.prototype.isSelected = function()
{
    return this._selected;
};

parsegraph_Node.prototype.setSelected = function(selected)
{
    //console.log(new Error("Setsel"));
    this._selected = selected;
};

parsegraph_Node.prototype.horizontalPadding = function()
{
    return this.blockStyle().horizontalPadding;
};

parsegraph_Node.prototype.verticalPadding = function()
{
    return this.blockStyle().verticalPadding;
};

parsegraph_Node.prototype.verticalSeparation = function(direction)
{
    if(this.type() == parsegraph_BUD && this.typeAt(direction) == parsegraph_BUD) {
        return this.blockStyle().verticalSeparation + parsegraph_BUD_TO_BUD_VERTICAL_SEPARATION;
    }
    return this.blockStyle().verticalSeparation;
};

parsegraph_Node.prototype.horizontalSeparation = function(direction)
{
    var style = this.blockStyle();

    if(this.hasNode(direction) && this.nodeAt(direction).type() == parsegraph_BUD
        && !this.nodeAt(direction).hasAnyNodes()
    ) {
        return parsegraph_BUD_LEAF_SEPARATION * style.horizontalSeparation;
    }
    return style.horizontalSeparation;
};

parsegraph_Node.prototype.inNodeBody = function(x, y, userScale)
{
    var s = this.size();
    if(
        x < userScale * this.absoluteX()
            - userScale * this.absoluteScale() * s.width()/2
    ) {
        //console.log("Given coords are outside this node's body. (Horizontal minimum exceeds X-coord)");
        return false;
    }
    if(
        x > userScale * this.absoluteX()
            + userScale * this.absoluteScale() * s.width()/2
    ) {
        //console.log("Given coords are outside this node's body. (X-coord exceeds horizontal maximum)");
        return false;
    }
    if(
        y < userScale * this.absoluteY()
            - userScale * this.absoluteScale() * s.height()/2
    ) {
        //console.log("Given coords are outside this node's body. (Vertical minimum exceeds Y-coord)");
        return false;
    }
    if(
        y > userScale * this.absoluteY()
            + userScale * this.absoluteScale() * s.height()/2
    ) {
        //console.log("Given coords are outside this node's body. (Y-coord exceeds vertical maximum)");
        return false;
    }

    //console.log("Within node body" + this);
    return true;
};

parsegraph_Node.prototype.inNodeExtents = function(x, y, userScale)
{
    if(
        x < userScale * this.absoluteX() - userScale * this.absoluteScale() * this.extentOffsetAt(parsegraph_DOWNWARD)
    ) {
        return false;
    }
    if(
        x > userScale * this.absoluteX() - userScale * this.absoluteScale() * this.extentOffsetAt(parsegraph_DOWNWARD)
            + userScale * this.absoluteScale() * this.extentSize().width()
    ) {
        return false;
    }
    if(
        y < userScale * this.absoluteY() - userScale * this.absoluteScale() * this.extentOffsetAt(parsegraph_FORWARD)
    ) {
        return false;
    }
    if(
        y > userScale * this.absoluteY() - userScale * this.absoluteScale() * this.extentOffsetAt(parsegraph_FORWARD)
            + userScale * this.absoluteScale() * this.extentSize().height()
    ) {
        return false;
    }

    //console.log("Within node extent" + this);
    return true;
};

parsegraph_Node.prototype.nodeUnderCoords = function(x, y, userScale)
{
    //console.log("nodeUnderCoords: " + x + ", " + y)
    if(userScale === undefined) {
        userScale = 1;
    }

    var candidates = [this];

    var addCandidate = function(node, direction) {
        if(direction !== undefined) {
            if(!node.hasChildAt(direction)) {
                return;
            }
            node = node.nodeAt(direction);
        }
        if(node == null) {
            return;
        }
        candidates.push(node);
    };

    var FORCE_SELECT_PRIOR = {};
    while(candidates.length > 0) {
        var candidate = candidates[candidates.length - 1];

        if(candidate === FORCE_SELECT_PRIOR) {
            candidates.pop();
            return candidates.pop();
        }

        if(candidate.inNodeBody(x, y, userScale)) {
            //console.log("Click is in node body");
            if(
                candidate.hasNode(parsegraph_INWARD)
            ) {
                if(candidate.nodeAt(parsegraph_INWARD).inNodeExtents(x, y, userScale)) {
                    //console.log("Testing inward node");
                    candidates.push(FORCE_SELECT_PRIOR);
                    candidates.push(candidate.nodeAt(parsegraph_INWARD));
                    continue;
                }
                else {
                    //console.log("Click not in inward extents");
                }
            }

            // Found the node.
            //console.log("Found node.");
            return candidate;
        }
        // Not within this node, so remove it as a candidate.
        candidates.pop();

        // Test if the click is within any child.
        if(!candidate.inNodeExtents(x, y, userScale)) {
            // Nope, so continue the search.
            //console.log("Click is not in node extents.");
            continue;
        }
        //console.log("Click is in node extent");

        // It is potentially within some child, so search the children.
        if(Math.abs(y - userScale * candidate.absoluteY()) > Math.abs(x - userScale * candidate.absoluteX())) {
            // Y extent is greater than X extent.
            if(userScale * candidate.absoluteX() > x) {
                addCandidate(candidate, parsegraph_BACKWARD);
                addCandidate(candidate, parsegraph_FORWARD);
            }
            else {
                addCandidate(candidate, parsegraph_FORWARD);
                addCandidate(candidate, parsegraph_BACKWARD);
            }
            if(userScale * candidate.absoluteY() > y) {
                addCandidate(candidate, parsegraph_UPWARD);
                addCandidate(candidate, parsegraph_DOWNWARD);
            }
            else {
                addCandidate(candidate, parsegraph_DOWNWARD);
                addCandidate(candidate, parsegraph_UPWARD);
            }
        }
        else {
            // X extent is greater than Y extent.
            if(userScale * candidate.absoluteY() > y) {
                addCandidate(candidate, parsegraph_UPWARD);
                addCandidate(candidate, parsegraph_DOWNWARD);
            }
            else {
                addCandidate(candidate, parsegraph_DOWNWARD);
                addCandidate(candidate, parsegraph_UPWARD);
            }
            if(userScale * candidate.absoluteX() > x) {
                addCandidate(candidate, parsegraph_BACKWARD);
                addCandidate(candidate, parsegraph_FORWARD);
            }
            else {
                addCandidate(candidate, parsegraph_FORWARD);
                addCandidate(candidate, parsegraph_BACKWARD);
            }
        }
    }

    //console.log("Found nothing.");
    return null;
};

parsegraph_Node.prototype.sizeWithoutPadding = function(bodySize)
{
    // Find the size of this node's drawing area.
    var style = this.blockStyle();
    if(this._label && !this._label.isEmpty()) {
        if(!bodySize) {
            bodySize = new parsegraph_Size();
        }
        bodySize[0] = this._label.width() * (style.fontSize / this._label.glyphAtlas().fontSize());
        bodySize[1] = this._label.height() * (style.fontSize / this._label.glyphAtlas().fontSize());
        if(Number.isNaN(bodySize[0]) || Number.isNaN(bodySize[1])) {
            throw new Error("Label returned a NaN size.");
        }
    }
    else if(!bodySize) {
        bodySize = new parsegraph_Size(style.minWidth, style.minHeight);
    }
    else {
        bodySize[0] = style.minWidth;
        bodySize[1] = style.minHeight;
    }
    if(this.hasNode(parsegraph_INWARD)) {
        var nestedNode = this.nodeAt(parsegraph_INWARD);
        var nestedSize = nestedNode.extentSize();

        if(this.nodeAlignmentMode(parsegraph_INWARD) == parsegraph_ALIGN_VERTICAL) {
            // Align vertical.
            bodySize.setWidth(
                Math.max(bodySize.width(), nestedSize.width() * nestedNode.scale())
            );

            if(this.label()) {
                // Allow for the content's size.
                bodySize.setHeight(Math.max(style.minHeight,
                    bodySize.height()
                    + this.verticalPadding()
                    + nestedSize.height() * nestedNode.scale()
                ));
            }
            else {
                bodySize.setHeight(
                    Math.max(bodySize.height(),
                    nestedSize.height() * nestedNode.scale()
                    + 2 * this.verticalPadding()
                ));
            }
        }
        else {
            // Align horizontal.
            if(this.label()) {
                // Allow for the content's size.
                bodySize.setWidth(
                    bodySize.width()
                    + this.horizontalPadding()
                    + nestedNode.scale() * nestedSize.width()
                );
            }
            else {
                bodySize.setWidth(
                    Math.max(bodySize.width(), nestedNode.scale() * nestedSize.width())
                );
            }

            bodySize.setHeight(
                Math.max(
                    bodySize.height(),
                    nestedNode.scale() * nestedSize.height()
                    + 2 * this.verticalPadding()
                )
            );
        }
    }

    // Buds appear circular
    if(this.type() == parsegraph_BUD) {
        var aspect = bodySize.width() / bodySize.height();
        if(aspect < 2 && aspect > 1 / 2) {
            bodySize.setWidth(
                Math.max(bodySize.width(), bodySize.height())
            );
            bodySize.setHeight(bodySize.width());
        }
    }

    bodySize[0] = Math.max(style.minWidth, bodySize[0]);
    bodySize[1] = Math.max(style.minHeight, bodySize[1]);
    return bodySize;
};

parsegraph_Node.prototype.commitLayout = function(bodySize)
{
    // Do nothing if this node already has a layout committed.
    if(this._layoutState === parsegraph_COMMITTED_LAYOUT) {
        return false;
    }

    // Check for invalid layout states.
    if(this._layoutState === parsegraph_NULL_LAYOUT_STATE) {
        throw parsegraph_createException(parsegraph_BAD_LAYOUT_STATE);
    }

    // Do not allow overlapping layout commits.
    if(this._layoutState === parsegraph_IN_COMMIT) {
        throw parsegraph_createException(parsegraph_BAD_LAYOUT_STATE);
    }

    // Begin the layout.
    this._layoutState = parsegraph_IN_COMMIT;

    // Clear the absolute point values, to be safe.
    this._absoluteXPos = null;
    this._absoluteYPos = null;

    var initExtent = function(
        inDirection,
        length,
        size,
        offset)
    {
        this._neighbors[inDirection].extent.clear();
        this._neighbors[inDirection].extent.appendLS(length, size);
        this._neighbors[inDirection].extentOffset = offset;
        //console.log(new Error("OFFSET = " + offset));
    };

    bodySize = this.size(bodySize);

    // This node's horizontal bottom, used with downward nodes.
    initExtent.call(
        this,
        parsegraph_DOWNWARD,
        // Length:
        bodySize.width(),
        // Size:
        bodySize.height() / 2,
        // Offset to body center:
        bodySize.width() / 2
    );

    // This node's horizontal top, used with upward nodes.
    initExtent.call(
        this,
        parsegraph_UPWARD,
        // Length:
        bodySize.width(),
        // Size:
        bodySize.height() / 2,
        // Offset to body center:
        bodySize.width() / 2
    );

    // This node's vertical back, used with backward nodes.
    initExtent.call(
        this,
        parsegraph_BACKWARD,
        // Length:
        bodySize.height(),
        // Size:
        bodySize.width() / 2,
        // Offset to body center:
        bodySize.height() / 2
    );

    // This node's vertical front, used with forward nodes.
    initExtent.call(
        this,
        parsegraph_FORWARD,
        // Length:
        bodySize.height(),
        // Size:
        bodySize.width() / 2,
        // Offset to body center:
        bodySize.height() / 2
    );

    /**
     * Returns the offset of the child's center in the given direction from
     * this node's center.
     *
     * This offset is in a direction perpendicular to the given direction
     * and is positive to indicate a negative offset.
     *
     * The result is in this node's space.
     */
    var getAlignment = function(childDirection) {
        // Calculate the alignment adjustment for both nodes.
        var child = this.nodeAt(childDirection);
        var axis = parsegraph_getPerpendicularAxis(
            parsegraph_getNodeDirectionAxis(childDirection)
        );

        var rv;

        var alignmentMode = this._neighbors[childDirection].alignmentMode;
        switch(alignmentMode) {
        case parsegraph_NULL_NODE_ALIGNMENT:
            throw parsegraph_createException(parsegraph_BAD_NODE_ALIGNMENT);
        case parsegraph_DO_NOT_ALIGN:
            // Unaligned nodes have no alignment offset.
            rv = 0;
            break;
        case parsegraph_ALIGN_NEGATIVE:
            rv = parsegraph_findConsecutiveLength(
                child,
                parsegraph_getNegativeNodeDirection(axis)
            );
            break;
        case parsegraph_ALIGN_CENTER:
        {
            var negativeLength = parsegraph_findConsecutiveLength(
                child, parsegraph_getNegativeNodeDirection(axis)
            );

            var positiveLength = parsegraph_findConsecutiveLength(
                child, parsegraph_getPositiveNodeDirection(axis)
            );

            var halfLength = (negativeLength + positiveLength) / 2;

            if(negativeLength > positiveLength) {
                // The child's negative neighbors extend more than their positive neighbors.
                rv = negativeLength - halfLength;
            }
            else if(negativeLength < positiveLength) {
                rv = -(positiveLength - halfLength);
            }
            else {
                rv = 0;
            }
            break;
        }
        case parsegraph_ALIGN_POSITIVE:
            rv = -parsegraph_findConsecutiveLength(
                child, parsegraph_getPositiveNodeDirection(axis)
            );
            break;
        }
        //console.log("Found alignment of " + rv);
        return rv * this.scaleAt(childDirection);
    };

    /**
     * Positions a child.
     *
     * The alignment is positive in the positive direction.
     *
     * The separation is positive in the direction of the child.
     *
     * These values should in this node's space.
     *
     * The child's position is in this node's space.
     */
    var positionChild = function(childDirection, alignment, separation) {
        // Validate arguments.
        if(separation < 0) {
            throw new Error("separation must always be positive.");
        }
        if(!parsegraph_isCardinalDirection(childDirection)) {
            throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION);
        }
        var child = this.nodeAt(childDirection);
        var reversedDirection = parsegraph_reverseNodeDirection(childDirection)

        // Save alignment parameters.
        this._neighbors[childDirection].alignmentOffset = alignment;
        //console.log("Alignment = " + alignment);
        this._neighbors[childDirection].separation = separation;

        // Determine the line length.
        var lineLength;
        var extentSize;
        if(this.nodeAlignmentMode(childDirection) === parsegraph_DO_NOT_ALIGN) {
            if(parsegraph_isVerticalNodeDirection(childDirection)) {
                extentSize = child.size().height() / 2;
            }
            else {
                extentSize = child.size().width() / 2;
            }
        }
        else {
            extentSize = child.extentsAt(reversedDirection).sizeAt(
                this._neighbors[childDirection].node.extentOffsetAt(reversedDirection) -
                alignment / this.scaleAt(childDirection)
            );
        }
        lineLength = separation - this.scaleAt(childDirection) * extentSize;
        this._neighbors[childDirection].lineLength = lineLength;
        //console.log("Line length: " + lineLength + ", separation: " + separation + ", extentSize: " + extentSize);

        // Set the position.
        var dirSign = parsegraph_nodeDirectionSign(childDirection);
        if(parsegraph_isVerticalNodeDirection(childDirection)) {
            // The child is positioned vertically.
            this.setPosAt(childDirection, alignment, dirSign * separation);
        }
        else {
            this.setPosAt(childDirection, dirSign * separation, alignment);
        }
        /*console.log(
            parsegraph_nameNodeDirection(childDirection) + " " +
            parsegraph_nameNodeType(child.type()) + "'s position set to (" +
            this._neighbors[childDirection].xPos + ", " + this._neighbors[childDirection].yPos + ")"
        );*/
    };

    /**
     * Merge this node's extents in the given direction with the
     * child's extents.
     *
     * alignment is the offset of the child from this node.
     * Positive values indicate presence in the positive
     * direction. (i.e. forward or upward).
     *
     * separation is the distance from the center of this node to the center
     * of the node in the specified direction.
     */
    var combineExtents = function(
        childDirection,
        alignment,
        separation)
    {
        var child = this.nodeAt(childDirection);

        /**
         * Combine an extent.
         *
         * lengthAdjustment and sizeAdjustment are in this node's space.
         */
        var combineExtent = function(
            direction,
            lengthAdjustment,
            sizeAdjustment)
        {
            /*console.log(
                "combineExtent(" +
                parsegraph_nameNodeDirection(direction) + ", " +
                lengthAdjustment + ", " +
                sizeAdjustment + ")"
            );*/
            // Calculate the new offset to this node's center.
            var lengthOffset = this._neighbors[direction].extentOffset
                + lengthAdjustment
                - this.scaleAt(childDirection) * child.extentOffsetAt(direction);

            // Combine the two extents in the given direction.
            /*console.log("Combining " + parsegraph_nameNodeDirection(direction) + ", " );
            console.log("Child: " + parsegraph_nameLayoutState(child._layoutState));
            console.log("Length offset: " + lengthOffset);
            console.log("Size adjustment: " + sizeAdjustment);
            console.log("ExtentOffset : " + this._neighbors[direction].extentOffset);
            console.log("Scaled child ExtentOffset : " + (this.scaleAt(childDirection) * child.extentOffsetAt(direction)));*/
            if(this.nodeFit() == parsegraph_NODE_FIT_LOOSE) {
                var e = this._neighbors[direction].extent;
                var bv = child.extentsAt(direction).boundingValues();
                var scale = this.scaleAt(childDirection);
                if(lengthOffset === 0) {
                    //console.log("lengthOffset == 0");
                    e.setBoundLengthAt(0, Math.max(e.boundLengthAt(0), bv[0]*scale + lengthOffset));
                    e.setBoundSizeAt(0, Math.max(e.boundSizeAt(0), bv[2]*scale + sizeAdjustment));
                }
                else if(lengthOffset < 0) {
                    //console.log("lengthOffset < 0");
                    e.setBoundLengthAt(0, Math.max(
                        e.boundLengthAt(0) + Math.abs(lengthOffset),
                        bv[0]*scale
                    ));
                    e.setBoundSizeAt(0, Math.max(e.boundSizeAt(0), bv[2]*scale + sizeAdjustment));
                }
                else {
                    //console.log("lengthOffset > 0");
                    e.setBoundLengthAt(
                        0, Math.max(e.boundLengthAt(0), lengthOffset + bv[0]*scale)
                    );
                    e.setBoundSizeAt(
                        0, Math.max(e.boundSizeAt(0), bv[2]*scale + sizeAdjustment)
                    );
                }
                /*e.combineExtent(
                    child.extentsAt(direction),
                    lengthOffset,
                    sizeAdjustment,
                    this.scaleAt(childDirection)
                );
                e.simplify();*/
            }
            else {
                this._neighbors[direction].extent.combineExtent(
                    child.extentsAt(direction),
                    lengthOffset,
                    sizeAdjustment,
                    this.scaleAt(childDirection)
                );
            }

            // Adjust the length offset to remain positive.
            if(lengthOffset < 0) {
                //console.log("Adjusting negative extent offset.");
                this._neighbors[direction].extentOffset =
                    this._neighbors[direction].extentOffset + Math.abs(lengthOffset);
            }

            /*console.log(
                "New "
                + parsegraph_nameNodeDirection(direction)
                + " extent offset = "
                + this._neighbors[direction].extentOffset
            );
            this._neighbors[direction].extent.forEach(function(l, s, i) {
                console.log(i + ". length=" + l + ", size=" + s);
            });*/

            // Assert the extent offset is positive.
            if(this._neighbors[direction].extentOffset < 0) {
                throw new Error("Extent offset must not be negative.");
            }
        };

        switch(childDirection) {
        case parsegraph_DOWNWARD:
            // Downward child.
            combineExtent.call(this, parsegraph_DOWNWARD, alignment, separation);
            combineExtent.call(this, parsegraph_UPWARD, alignment, -separation);

            combineExtent.call(this, parsegraph_FORWARD, separation, alignment);
            combineExtent.call(this, parsegraph_BACKWARD, separation, -alignment);
            break;
        case parsegraph_UPWARD:
            // Upward child.
            combineExtent.call(this, parsegraph_DOWNWARD, alignment, -separation);
            combineExtent.call(this, parsegraph_UPWARD, alignment, separation);

            combineExtent.call(this, parsegraph_FORWARD, -separation, alignment);
            combineExtent.call(this, parsegraph_BACKWARD, -separation, -alignment);
            break;
        case parsegraph_FORWARD:
            // Forward child.
            combineExtent.call(this, parsegraph_DOWNWARD, separation, alignment);
            combineExtent.call(this, parsegraph_UPWARD, separation, -alignment);

            combineExtent.call(this, parsegraph_FORWARD, alignment, separation);
            combineExtent.call(this, parsegraph_BACKWARD, alignment, -separation);
            break;
        case parsegraph_BACKWARD:
            // Backward child.
            combineExtent.call(this, parsegraph_DOWNWARD, -separation, alignment);
            combineExtent.call(this, parsegraph_UPWARD, -separation, -alignment);

            combineExtent.call(this, parsegraph_FORWARD, alignment, -separation);
            combineExtent.call(this, parsegraph_BACKWARD, alignment, separation);
            break;
        default:
            throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION);
        }
    };

    /**
     * Layout a single node in the given direction.
     */
    var layoutSingle = function(
        direction,
        allowAxisOverlap)
    {
        if(!this.hasNode(direction)) {
            return;
        }

        /*console.log(
            "Laying out single " + parsegraph_nameNodeDirection(direction) + " child, "
            + (allowAxisOverlap ? "with " : "without ") + "axis overlap."
        );*/

        // Get the alignment for the children.
        var alignment = getAlignment.call(this, direction);
        //console.log("Calculated alignment of " + alignment + ".");

        var child = this.nodeAt(direction);
        var reversed = parsegraph_reverseNodeDirection(direction);
        var childExtent = child.extentsAt(reversed);

        if(child._layoutState !== parsegraph_COMMITTED_LAYOUT) {
            throw new Error(parsegraph_nameNodeDirection(direction) + " Child " + parsegraph_nameNodeType(child.type()) + " does not have a committed layout.", child);
        }

        // Separate the child from this node.
        var separationFromChild = this._neighbors[direction].extent.separation(
            childExtent,
            this._neighbors[direction].extentOffset
                + alignment
                - this.scaleAt(direction) * child.extentOffsetAt(reversed),
            allowAxisOverlap,
            this.scaleAt(direction),
            parsegraph_LINE_THICKNESS / 2
        );
        //console.log("Calculated unpadded separation of " + separationFromChild + ".");

        // Add padding and ensure the child is not separated less than
        // it would be if the node was not offset by alignment.
        if(
            parsegraph_getNodeDirectionAxis(direction) == parsegraph_VERTICAL_AXIS
        ) {
            separationFromChild = Math.max(
                separationFromChild,
                this.scaleAt(direction) * (child.size().height() / 2) + bodySize.height() / 2
            );
            separationFromChild
                += this.verticalSeparation(direction) * this.scaleAt(direction);
        }
        else {
            separationFromChild = Math.max(
                separationFromChild,
                this.scaleAt(direction) * (child.size().width() / 2) + bodySize.width() / 2
            );
            separationFromChild
                += this.horizontalSeparation(direction) * this.scaleAt(direction);
        }
        //console.log("Calculated padded separation of " + separationFromChild + ".");

        // Set the node's position.
        positionChild.call(
            this,
            direction,
            alignment,
            separationFromChild
        );

        // Combine the extents of the child and this node.
        combineExtents.call(
            this,
            direction,
            alignment,
            separationFromChild
        );
    };

    /**
     * Layout a pair of nodes in the given directions.
     */
    var layoutAxis = function(
        firstDirection,
        secondDirection,
        allowAxisOverlap)
    {
        // Change the node direction to null if there is no node in that
        // direction.
        if(!this.hasNode(firstDirection)) {
            firstDirection = parsegraph_NULL_NODE_DIRECTION;
        }
        if(!this.hasNode(secondDirection)) {
            secondDirection = parsegraph_NULL_NODE_DIRECTION;
        }

        // Return if there are no directions.
        if(
            firstDirection == parsegraph_NULL_NODE_DIRECTION
            && secondDirection == parsegraph_NULL_NODE_DIRECTION
        ) {
            return;
        }

        // Test if this node has a first-axis child in only one direction.
        if(
            firstDirection == parsegraph_NULL_NODE_DIRECTION
            || secondDirection == parsegraph_NULL_NODE_DIRECTION
        ) {
            // Find the direction of the only first-axis child.
            var firstAxisDirection;
            if(firstDirection != parsegraph_NULL_NODE_DIRECTION) {
                firstAxisDirection = firstDirection;
            }
            else {
                // It must be the second direction.
                firstAxisDirection = secondDirection;
            }

            // Layout that node.
            layoutSingle.call(this, firstAxisDirection, false);
            return;
        }

        /*console.log(
            "Laying out " +
            parsegraph_nameNodeDirection(firstDirection) + " and " +
            parsegraph_nameNodeDirection(secondDirection) + " children."
        );*/

        // This node has first-axis children in both directions.
        var firstNode = this.nodeAt(firstDirection);
        var secondNode = this.nodeAt(secondDirection);

        // Get the alignments for the children.
        var firstNodeAlignment = getAlignment.call(this, firstDirection);
        var secondNodeAlignment = getAlignment.call(this, secondDirection);
        //console.log("First alignment: " + firstNodeAlignment);
        //console.log("Second alignment: " + secondNodeAlignment);

        var separationBetweenChildren =
            firstNode.extentsAt(secondDirection).separation(
                secondNode.extentsAt(firstDirection),
                (this.scaleAt(secondDirection) / this.scaleAt(firstDirection))
                * (secondNodeAlignment - secondNode.extentOffsetAt(firstDirection))
                - (firstNodeAlignment - firstNode.extentOffsetAt(secondDirection)),
                true,
                this.scaleAt(secondDirection) / this.scaleAt(firstDirection)
            );
        separationBetweenChildren *= this.scaleAt(firstDirection);

        //console.log("Separation between children=" + separationBetweenChildren);

        var separationFromSecond = this._neighbors[secondDirection].extent;

        /*console.log(
            "This " +
            parsegraph_nameNodeDirection(firstDirection) +
            " extent (offset to center=" +
            this._neighbors[firstDirection].extentOffset +
            ")"
        );
        this._neighbors[firstDirection].extent.forEach(
            function(length, size, i) {
                console.log(i + ". l=" + length + ", s=" + size);
            }
        );

        console.log(
            parsegraph_nameNodeDirection(firstDirection) +
            " " + parsegraph_nameNodeType(this.nodeAt(firstDirection).type()) +
            "'s " + parsegraph_nameNodeDirection(secondDirection) +
            " extent (offset to center=" +
            this.nodeAt(firstDirection).extentOffsetAt(secondDirection) +
            ")"
        );
        this.nodeAt(firstDirection).extentsAt(secondDirection).forEach(
            function(length, size, i) {
                console.log(i + ". l=" + length + ", s=" + size);
            }
        );

        console.log(
            "FirstNodeAlignment=" + firstNodeAlignment
        );
        console.log(
            "this._neighbors[firstDirection].extentOffset=" +
                this._neighbors[firstDirection].extentOffset
        );
        console.log(
            "firstNode.extentOffsetAt(secondDirection)=" + firstNode.extentOffsetAt(secondDirection)
        );*/

        // Allow some overlap if we have both first-axis sides, but
        // nothing ahead on the second axis.
        var separationFromFirst = this._neighbors[firstDirection].extent
            .separation(
                firstNode.extentsAt(secondDirection),
                this._neighbors[firstDirection].extentOffset
                + firstNodeAlignment
                - this.scaleAt(firstDirection) * firstNode.extentOffsetAt(secondDirection),
                allowAxisOverlap,
                this.scaleAt(firstDirection),
                parsegraph_LINE_THICKNESS / 2
            );

        var separationFromSecond = this._neighbors[secondDirection].extent
            .separation(
                secondNode.extentsAt(firstDirection),
                this._neighbors[secondDirection].extentOffset
                + secondNodeAlignment
                - this.scaleAt(secondDirection) * secondNode.extentOffsetAt(firstDirection),
                allowAxisOverlap,
                this.scaleAt(secondDirection),
                parsegraph_LINE_THICKNESS / 2
            );

        /*console.log(
            "Separation from this " + parsegraph_nameNodeType(this.type()) + " to " +
            parsegraph_nameNodeDirection(firstDirection) + " " +
            parsegraph_nameNodeType(this.nodeAt(firstDirection).type()) + "=" +
            separationFromFirst
        );
        console.log(
            "Separation from this " + parsegraph_nameNodeType(this.type()) + " to " +
            parsegraph_nameNodeDirection(secondDirection) + " " +
            parsegraph_nameNodeType(this.nodeAt(secondDirection).type()) + "=" +
            separationFromSecond
        );*/

        // TODO Handle occlusion of the second axis if we have a parent or
        // if we have a second-axis child. Doesn't this code need to ensure
        // the second-axis child is not trapped inside too small a space?

        if(separationBetweenChildren
            >= separationFromFirst + separationFromSecond) {
            // The separation between the children is greater than the
            // separation between each child and this node.

            // Center them as much as possible.
            separationFromFirst = Math.max(
                separationFromFirst,
                separationBetweenChildren / 2
            );
            separationFromSecond = Math.max(
                separationFromSecond,
                separationBetweenChildren / 2
            );
        }
        else {
            //separationBetweenChildren
            //    < separationFromFirst + separationFromSecond

            // The separation between children is less than what this node
            // needs to separate each child from itself, so do nothing to
            // the separation values.
        }

        if(
            parsegraph_getNodeDirectionAxis(firstDirection)
            == parsegraph_VERTICAL_AXIS
        ) {
            separationFromFirst = Math.max(
                separationFromFirst,
                this.scaleAt(firstDirection) * (firstNode.size().height() / 2)
                + bodySize.height() / 2
            );
            separationFromFirst
                += this.verticalSeparation(firstDirection)
                * this.scaleAt(firstDirection);

            separationFromSecond = Math.max(
                separationFromSecond,
                this.scaleAt(secondDirection) * (secondNode.size().height() / 2)
                + bodySize.height() / 2
            );
            separationFromSecond
                += this.verticalSeparation(secondDirection)
                * this.scaleAt(secondDirection);
        }
        else {
            separationFromFirst = Math.max(
                separationFromFirst,
                this.scaleAt(firstDirection) * (firstNode.size().width() / 2)
                + bodySize.width() / 2
            );
            separationFromFirst
                += this.horizontalSeparation(firstDirection)
                * this.scaleAt(firstDirection);

            separationFromSecond = Math.max(
                separationFromSecond,
                this.scaleAt(secondDirection) * (secondNode.size().width() / 2)
                + bodySize.width() / 2
            );
            separationFromSecond
                += this.horizontalSeparation(secondDirection)
                * this.scaleAt(secondDirection);
        }

        // Set the positions of the nodes.
        positionChild.call(
            this,
            firstDirection,
            firstNodeAlignment,
            separationFromFirst
        );
        positionChild.call(
            this,
            secondDirection,
            secondNodeAlignment,
            separationFromSecond
        );

        // Combine their extents.
        combineExtents.call(
            this,
            firstDirection,
            firstNodeAlignment,
            separationFromFirst
        );
        combineExtents.call(
            this,
            secondDirection,
            secondNodeAlignment,
            separationFromSecond
        );
    };

    if(
        this.isRoot()
        || this.parentDirection() == parsegraph_INWARD
        || this.parentDirection() == parsegraph_OUTWARD
    ) {
        if(this._layoutPreference == parsegraph_PREFER_HORIZONTAL_AXIS) {
            // Root-like, so just lay out both axes.
            layoutAxis.call(this, parsegraph_BACKWARD, parsegraph_FORWARD,
                !this.hasNode(parsegraph_UPWARD) && !this.hasNode(parsegraph_DOWNWARD)
            );

            // This node is root-like, so it lays out the second-axis children in
            // the same method as the first axis.
            layoutAxis.call(this, parsegraph_UPWARD, parsegraph_DOWNWARD, true);
        }
        else {
            // Root-like, so just lay out both axes.
            layoutAxis.call(this, parsegraph_UPWARD, parsegraph_DOWNWARD,
                !this.hasNode(parsegraph_BACKWARD) && !this.hasNode(parsegraph_FORWARD)
            );

            // This node is root-like, so it lays out the second-axis children in
            // the same method as the first axis.
            layoutAxis.call(this, parsegraph_BACKWARD, parsegraph_FORWARD, true);
        }
    }
    else {
        // Layout based upon the axis preference.
        if(this.canonicalLayoutPreference() == parsegraph_PREFER_PERPENDICULAR_AXIS) {
            // firstDirection and secondDirection, if not NULL_NODE_DIRECTION,
            // indicate a neighboring node in at least that direction.
            var firstDirection
                = parsegraph_NULL_NODE_DIRECTION;
            var secondDirection
                = parsegraph_NULL_NODE_DIRECTION;

            // firstAxis indicates the first-axis.
            var firstAxis =
                parsegraph_getPerpendicularAxis(this.parentDirection());

            // Check for nodes perpendicular to parent's direction
            var hasFirstAxisNodes = this.hasNodes(
                firstAxis
            );
            var oppositeFromParent =
                parsegraph_reverseNodeDirection(this.parentDirection());
            layoutAxis.call(
                this,
                hasFirstAxisNodes[0],
                hasFirstAxisNodes[1],
                false
            );

            // Layout this node's second-axis child, if that child exists.
            if(this.hasNode(oppositeFromParent)) {
                // Layout the second-axis child.
                layoutSingle.call(this, oppositeFromParent, true);
            }
        }
        else {
            // Layout this node's second-axis child, if that child exists.
            var oppositeFromParent =
                parsegraph_reverseNodeDirection(this.parentDirection());

            // firstDirection and secondDirection, if not NULL_NODE_DIRECTION,
            // indicate a neighboring node in at least that direction.
            var firstDirection
                = parsegraph_NULL_NODE_DIRECTION;
            var secondDirection
                = parsegraph_NULL_NODE_DIRECTION;

            // Check for nodes perpendicular to parent's direction
            var perpendicularNodes = this.hasNodes(
                parsegraph_getPerpendicularAxis(this.parentDirection())
            );

            if(this.hasNode(oppositeFromParent)) {
                // Layout the second-axis child.
                layoutSingle.call(
                    this,
                    oppositeFromParent,
                    true //firstDirection != parsegraph_NULL_NODE_DIRECTION || secondDirection != parsegraph_NULL_NODE_DIRECTION
                );
            }

            layoutAxis.call(this, perpendicularNodes[0], perpendicularNodes[1], true);
        }
    }

    var addLineBounds = function(given)
    {
        if(!this.hasNode(given)) {
            return;
        }

        var perpAxis = parsegraph_getPerpendicularAxis(given);
        var dirSign = parsegraph_nodeDirectionSign(given);

        var positiveOffset = this._neighbors[
            parsegraph_getPositiveNodeDirection(perpAxis)
        ].extentOffset;

        var negativeOffset = this._neighbors[
            parsegraph_getNegativeNodeDirection(perpAxis)
        ].extentOffset;

        if(dirSign < 0) {
            positiveOffset -= this.sizeIn(given) + this.lineLengthAt(given);
            negativeOffset -= this.sizeIn(given) + this.lineLengthAt(given);
        }

        if(this.nodeFit() == parsegraph_NODE_FIT_EXACT) {
            // Append the line-shaped bound.
            this._neighbors[
                parsegraph_getPositiveNodeDirection(perpAxis)
            ].extent.combineBound(
                positiveOffset,
                this.lineLengthAt(given),
                this.scaleAt(given) * parsegraph_LINE_THICKNESS / 2
            );
            this._neighbors[
                parsegraph_getNegativeNodeDirection(perpAxis)
            ].extent.combineBound(
                negativeOffset,
                this.lineLengthAt(given),
                this.scaleAt(given) * parsegraph_LINE_THICKNESS / 2
            );
        }
    };

    // Set our extents, combined with non-point neighbors.
    parsegraph_forEachCardinalNodeDirection(addLineBounds, this);

    if(this.hasNode(parsegraph_INWARD)) {
        var nestedNode = this.nodeAt(parsegraph_INWARD);
        var nestedSize = nestedNode.extentSize();
        if(
            this.nodeAlignmentMode(parsegraph_INWARD) == parsegraph_ALIGN_VERTICAL
            && nestedNode.scale() * nestedSize.width() <
            bodySize.width() - 2 * (this.horizontalPadding() + this.borderThickness())
        ) {
            this.setPosAt(parsegraph_INWARD,
                nestedNode.scale() * (
                    nestedNode.extentOffsetAt(parsegraph_DOWNWARD)
                    - nestedSize.width() / 2
                ),
                bodySize.height() / 2
                - this.verticalPadding()
                - this.borderThickness()
                + nestedNode.scale() * (
                    - nestedSize.height()
                    + nestedNode.extentOffsetAt(parsegraph_FORWARD)
                )
            );
        }
        else if(
            this.nodeAlignmentMode(parsegraph_INWARD) == parsegraph_ALIGN_HORIZONTAL
            && nestedNode.scale() * nestedSize.height() <
            bodySize.height() - 2 * (this.verticalPadding() + this.borderThickness())
        ) {
            this.setPosAt(parsegraph_INWARD,
                bodySize.width() / 2
                - this.horizontalPadding()
                - this.borderThickness()
                + nestedNode.scale() * (
                    - nestedSize.width()
                    + nestedNode.extentOffsetAt(
                        parsegraph_DOWNWARD
                    )
                ),
                nestedNode.scale() * (
                    nestedNode.extentOffsetAt(parsegraph_FORWARD)
                    - nestedSize.height() / 2
                )
            );
        }
        else {
            this.setPosAt(parsegraph_INWARD,
                bodySize.width() / 2
                - this.horizontalPadding()
                - this.borderThickness()
                + nestedNode.scale() * (
                    - nestedSize.width()
                    + nestedNode.extentOffsetAt(
                        parsegraph_DOWNWARD
                    )
                ),
                bodySize.height() / 2
                - this.verticalPadding()
                - this.borderThickness()
                + nestedNode.scale() * (
                    - nestedSize.height()
                    + nestedNode.extentOffsetAt(
                        parsegraph_FORWARD
                    )
                )
            );
        }
    }

    this._layoutState = parsegraph_COMMITTED_LAYOUT;

    // Needed a commit, so return true.
    return true;
}

var parsegraph_findConsecutiveLength = function(node, inDirection)
{
    // Exclude some directions that cannot be calculated.
    if(!parsegraph_isCardinalDirection(inDirection)) {
        throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION);
    }

    var directionAxis = parsegraph_getNodeDirectionAxis(inDirection);
    if(directionAxis == parsegraph_NULL_AXIS) {
        // This should be impossible.
        throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION);
    }

    // Calculate the length, starting from the center of this node.
    var total = 0;
    var scale = 1.0;

    // Iterate in the given direction.
    if(node.hasNode(inDirection)) {
        total += node.separationAt(inDirection);

        scale *= node.scaleAt(inDirection);
        var thisNode = node.nodeAt(inDirection);
        var nextNode = thisNode.nodeAt(inDirection);
        while(nextNode != null) {
            total += thisNode.separationAt(inDirection) * scale;
            scale *= thisNode.scaleAt(inDirection);

            thisNode = nextNode;
            nextNode = nextNode.nodeAt(inDirection);
        }
    }

    return total;
};

parsegraph_Node.prototype.commitLayoutIteratively = function(timeout)
{
    // Avoid needless work if possible.
    if(this._layoutState === parsegraph_COMMITTED_LAYOUT) {
        return;
    }

    var root = this;
    var node = root;
    var bodySize = new parsegraph_Size();

    // Traverse the graph depth-first, committing each node's layout in turn.
    var loop = function() {
        var t;
        if(timeout !== undefined) {
            t = new Date().getTime();
        }
        while(true) {
            node = node._worldPrev;
            if(node._layoutState === parsegraph_NEEDS_COMMIT) {
                node.commitLayout(bodySize);
            }
            if(timeout !== undefined && (new Date().getTime() - t > timeout)) {
                return loop;
            }
            if(node === root) {
                // Terminal condition reached.
                return null;
            }
        }
    };

    return loop();
};

parsegraph_Node.prototype.separationAt = function(inDirection) {
    // Exclude some directions that cannot be calculated.
    if(!parsegraph_isCardinalDirection(inDirection)) {
        throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION);
    }

    // If the given direction is the parent's direction, use
    // their measurement instead.
    if(!this.isRoot() && inDirection == this.parentDirection()) {
        return this.nodeParent().separationAt(
            parsegraph_reverseNodeDirection(inDirection)
        );
    }

    if(!this.hasNode(inDirection)) {
        throw parsegraph_createException(parsegraph_NO_NODE_FOUND);
    }

    return this._neighbors[inDirection].separation;
};

parsegraph_Node.prototype.layoutWasChanged = function(changeDirection)
{
    // Disallow null change directions.
    if(changeDirection == parsegraph_NULL_NODE_DIRECTION) {
        throw parsegraph_createException(parsegraph_BAD_NODE_DIRECTION);
    }

    // Notifies children that may need to move due to this layout change.
    var notifyChild = function(direction) {
        // Don't recurse into the parent direction.
        if(!this.isRoot() && direction == this.parentDirection()) {
            return;
        }

        // Ignore empty node directions.
        if(!this.hasNode(direction)) {
            return;
        }

        // Recurse the layout change to the affected node.
        this.nodeAt(direction).positionWasChanged(
            parsegraph_reverseNodeDirection(direction)
        );
    };

    var node = this;
    while(node !== null) {
        var oldLayoutState = node._layoutState;

        // Set the needs layout flag.
        node._layoutState = parsegraph_NEEDS_COMMIT;

        if(node.findPaintGroup()) {
            node.findPaintGroup().markDirty();
        }

        // Recurse for the children of this node.
        notifyChild.call(node, parsegraph_DOWNWARD);
        notifyChild.call(node, parsegraph_UPWARD);
        notifyChild.call(node, parsegraph_BACKWARD);
        notifyChild.call(node, parsegraph_FORWARD);
        notifyChild.call(node, parsegraph_INWARD);

        if(node.isRoot()) {
            break;
        }
        else if(oldLayoutState == parsegraph_COMMITTED_LAYOUT) {
            // Notify our parent, if we were previously committed.
            node = node.nodeParent();
            changeDirection = parsegraph_reverseNodeDirection(
                node.parentDirection()
            );
        }
        else {
            // Completed.
            break;
        }
    }
};

parsegraph_Node.prototype.canonicalLayoutPreference = function()
{
    // Root nodes do not have a canonical layout preference.
    if(this.isRoot()) {
        throw parsegraph_createException(parsegraph_NODE_IS_ROOT);
    }

    // Convert the layout preference to either preferring the parent or
    // the perpendicular axis.
    var canonicalPref = this._layoutPreference;
    switch(this._layoutPreference) {
    case parsegraph_PREFER_HORIZONTAL_AXIS:
    {
        if(
            parsegraph_getNodeDirectionAxis(this.parentDirection()) ==
            parsegraph_HORIZONTAL_AXIS
        ) {
            canonicalPref = parsegraph_PREFER_PARENT_AXIS;
        }
        else {
            canonicalPref = parsegraph_PREFER_PERPENDICULAR_AXIS;
        }
        break;
    }
    case parsegraph_PREFER_VERTICAL_AXIS:
    {
        if(
            parsegraph_getNodeDirectionAxis(this.parentDirection()) ==
            parsegraph_VERTICAL_AXIS
        ) {
            canonicalPref = parsegraph_PREFER_PARENT_AXIS;
        }
        else {
            canonicalPref = parsegraph_PREFER_PERPENDICULAR_AXIS;
        }
        break;
    }
    case parsegraph_PREFER_PERPENDICULAR_AXIS:
    case parsegraph_PREFER_PARENT_AXIS:
        canonicalPref = this._layoutPreference;
        break;
    case parsegraph_NULL_LAYOUT_PREFERENCE:
        throw parsegraph_createException(parsegraph_BAD_LAYOUT_PREFERENCE);
    }
    return canonicalPref;
};

parsegraph_Node.prototype.destroy = function()
{
    this._neighbors.forEach(function(neighbor, direction) {
        // Clear all children.
        if(this._parentDirection !== direction) {
            neighbor.node = null;
        }
    }, this);
    this._layoutState = parsegraph_NULL_LAYOUT_STATE;
    this._parentDirection = parsegraph_NULL_NODE_DIRECTION;
    this._scale = 1.0;
};

parsegraph_Node.prototype.dumpExtentBoundingRect = function()
{
    // extent.boundingValues() returns [totalLength, minSize, maxSize]
    var backwardOffset = this.extentOffsetAt(parsegraph_BACKWARD);
    var backwardValues = this.extentsAt(parsegraph_BACKWARD).boundingValues();
    this.extentsAt(parsegraph_BACKWARD).dump(
        "Backward extent (center at " + backwardOffset + ")"
    );

    var forwardOffset = this.extentOffsetAt(parsegraph_FORWARD);
    var forwardValues = this.extentsAt(parsegraph_FORWARD).boundingValues();
    this.extentsAt(parsegraph_FORWARD).dump(
        "Forward extent (center at " + forwardOffset + ")"
    );

    var downwardOffset = this.extentOffsetAt(parsegraph_DOWNWARD);
    var downwardValues = this.extentsAt(parsegraph_DOWNWARD).boundingValues();
    this.extentsAt(parsegraph_DOWNWARD).dump(
        "Downward extent (center at " + downwardOffset + ")"
    );

    var upwardOffset = this.extentOffsetAt(parsegraph_UPWARD);
    var upwardValues = this.extentsAt(parsegraph_UPWARD).boundingValues();
    this.extentsAt(parsegraph_UPWARD).dump(
        "Upward extent (center at " + upwardOffset + ")"
    );

    /*parsegraph_log("Backward values: " + backwardValues);
    parsegraph_log("Forward values: " + forwardValues);
    parsegraph_log("Upward values: " + upwardValues);
    parsegraph_log("Downward values: " + downwardValues);*/
};

function parsegraph_labeledBud(label, glyphAtlas)
{
    var node = new parsegraph_Node(parsegraph_BUD);
    node.setLabel(label, glyphAtlas);
    return node;
};

function parsegraph_labeledSlot(label, glyphAtlas)
{
    var node = new parsegraph_Node(parsegraph_SLOT);
    node.setLabel(label, glyphAtlas);
    return node;
};

function parsegraph_labeledBlock(label, glyphAtlas)
{
    var node = new parsegraph_Node(parsegraph_BLOCK);
    node.setLabel(label, glyphAtlas);
    return node;
};
function parsegraph_Surface()
{
    this._backgroundColor = parsegraph_BACKGROUND_COLOR;

    this._container = document.createElement("div");
    this._container.className = "parsegraph_Surface";

    // The canvas that will be drawn to.
    this._canvas = document.createElement("canvas");
    this._canvas.style.display = "block";
    this._canvas.setAttribute("tabIndex", 0);

    // GL content, not created until used.
    this._gl = null;

    this._container.appendChild(this._canvas);

    // The identifier used to cancel a pending Render.
    this._pendingRender = null;
    this._needsRepaint = true;

    this._painters = [];
    this._renderers = [];
};

parsegraph_Surface.prototype.canvas = function()
{
    return this._canvas;
};

parsegraph_Surface.prototype.gl = function()
{
    if(!this._gl) {
        this._gl = this._canvas.getContext("experimental-webgl");
        if(this._gl == null) {
            this._gl = this._canvas.getContext("webgl");
            if(this._gl == null) {
                throw new Error("GL context is not supported");
            }
        }
    }
    return this._gl;
};

parsegraph_Surface.prototype.setGL = function(gl)
{
    this._gl = gl;
};

parsegraph_Surface.prototype.setAudio = function(audio)
{
    this._audio = audio;
};

parsegraph_Surface.prototype.audio = function()
{
    if(!this._audio) {
        try {
            this._audio = new AudioContext();
        }
        catch(ex) {
            console.log(ex);
        }
        if(this._audio == null) {
            throw new Error("AudioContext is not supported");
        }
    }
    return this._audio;
};

parsegraph_Surface.prototype.resize = function(w, h)
{
    this.container().style.width = typeof w === "number" ? (w + "px") : w;
    if(arguments.length === 1) {
        h = w;
    }
    this.container().style.height = typeof h === "number" ? (h + "px") : h;
};

/**
 * Returns the container that holds the canvas for this graph.
 */
parsegraph_Surface.prototype.container = function()
{
    return this._container;
};

parsegraph_Surface.prototype.addPainter = function(painter, thisArg)
{
    this._painters.push([painter, thisArg]);
};

parsegraph_Surface.prototype.addRenderer = function(renderer, thisArg)
{
    this._renderers.push([renderer, thisArg]);
};

parsegraph_Surface.prototype.paint = function()
{
    //console.log("Painting surface");
    var args = arguments;
    this._painters.forEach(function(painter) {
        painter[0].apply(painter[1], args);
    }, this);
};

parsegraph_Surface.prototype.setBackground = function(color)
{
    if(arguments.length > 1) {
        return this.setBackground(
            parsegraph_createColor.apply(this, arguments)
        );
    }
    this._backgroundColor = color;
};

/**
 * Retrieves the current background color.
 */
parsegraph_Surface.prototype.backgroundColor = function()
{
    return this._backgroundColor;
};

/**
 * Returns whether the surface has a nonzero client width and height.
 */
parsegraph_Surface.prototype.canProject = function()
{
    var displayWidth = this.container().clientWidth;
    var displayHeight = this.container().clientHeight;

    return displayWidth != 0 && displayHeight != 0;
};

/**
 * Invokes all renderers.
 *
 * Throws if canProject() returns false.
 */
parsegraph_Surface.prototype.render = function()
{
    //console.log("Rendering surface");
    if(!this.canProject()) {
        throw new Error(
            "Refusing to render to an unprojectable surface. Use canProject() to handle, and parent this surface's container to fix."
        );
    }
    this._container.style.backgroundColor = this._backgroundColor.asRGB();

    var gl = this.gl();
    gl.clearColor(
        this._backgroundColor._r,
        this._backgroundColor._g,
        this._backgroundColor._b,
        this._backgroundColor._a
    );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this._renderers.forEach(function(renderer) {
        renderer[0].call(renderer[1]);
    }, this);
};
function parsegraph_CameraBoxPainter(gl, glyphAtlas, shaders)
{
    this._blockPainter = new parsegraph_BlockPainter(gl, shaders);
    this._glyphPainter = new parsegraph_GlyphPainter(gl, glyphAtlas, shaders);

    this._glyphAtlas = glyphAtlas;
    this._borderColor = new parsegraph_Color(1, 1, 1, 0.1);
    this._backgroundColor = new parsegraph_Color(1, 1, 1, 0.1);
    this._textColor = new parsegraph_Color(1, 1, 1, 1);
    this._fontSize = 24;
}

parsegraph_CameraBoxPainter.prototype.clear = function()
{
    this._glyphPainter.clear();
    this._blockPainter.clear();
};

parsegraph_CameraBoxPainter.prototype.drawBox = function(name, rect, scale)
{
    var painter = this._blockPainter;
    painter.setBorderColor(this._borderColor);
    painter.setBackgroundColor(this._backgroundColor);
    painter.drawBlock(
        rect.x(),
        rect.y(),
        rect.width(),
        rect.height(),
        0.01,
        .1,
        scale
    );

    var label = new parsegraph_Label(this._glyphAtlas);
    label.setText(name);
    var lw = label.width()*(this._fontSize/this._glyphAtlas.fontSize())/scale;

    label.paint(this._glyphPainter,
        rect.x() - lw/2,
        rect.y() - rect.height()/2,
        (this._fontSize/this._glyphAtlas.fontSize())/scale
    );
};

parsegraph_CameraBoxPainter.prototype.render = function(world) {
    this._blockPainter.render(world);
    this._glyphPainter.render(world);
};
// Maths VERSION: 1.8.130828

// usage:

// Vectors:
// vector[0], vector[1], vector[2], vector.length == 3
// vector.Normalize() // normalizes the vector passed and returns it
// vector.Magnitude() or Length()
// Vector.DotProduct( vector , othervector) or ScalarProduct or InnerProduct
// Vector.AngleBetween( vector, othervector )

// Quaternions:

// Matrices:

alpha_FUZZINESS = 1e-10;

function alpha_random(min, max)
{
    return min + Math.round(Math.random() * (max - min));
};

var alpha_startTime = new Date();
function alpha_GetTime()
{
    return (new Date().getTime() - alpha_startTime.getTime()) / 1000;
};

function alpha_toRadians(inDegrees)
{
    return inDegrees * Math.PI / 180;
}
alpha_ToRadians = alpha_toRadians;

function alpha_toDegrees(inRadians)
{
    return inRadians * 180 / Math.PI;
}
alpha_ToDegrees = alpha_toDegrees;

//----------------------------------------------
//----------------------------------------------
//-----------      VECTORS     -----------------
//----------------------------------------------
//----------------------------------------------

function alpha_Vector()
{
    this[0] = 0;
    this[1] = 0;
    this[2] = 0;
    this.length = 3;

    if(arguments.length > 0) {
        this.Set.apply(this, arguments);
    }
}

alpha_Vector.prototype.toJSON = function()
{
    return [this[0], this[1], this[2]];
};

alpha_Vector.prototype.restore = function(json)
{
    if(Array.isArray(json)) {
        this.Set.apply(this, json);
    }
    else {
        this[0] = json.x;
        this[1] = json.y;
        this[2] = json.z;
    }
};

alpha_Vector_Tests = new parsegraph_TestSuite("alpha_Vector");

alpha_Vector_Tests.addTest("alpha_Vector.<constructor>", function() {
    var v = new alpha_Vector(1, 2, 3);
    if(v[0] != 1 || v[1] != 2 || v[2] != 3) {
        return "Constructor must accept arguments.";
    }
});

alpha_Vector.prototype.Add = function()
{
    if(arguments.length > 1) {
        this[0] += arguments[0];
        this[1] += arguments[1];
        this[2] += arguments[2];
    }
    else {
        this[0] += arguments[0][0];
        this[1] += arguments[0][1];
        this[2] += arguments[0][2];
    }
    return this;
}

alpha_Vector_Tests.addTest("alpha_Vector.Add", function() {
    var a = new alpha_Vector(3, 4, 0);

    a.Add(new alpha_Vector(1, 2, 3));
    if(!a.Equals(4, 6, 3)) {
        return "Add must add component-wise";
    }
});

alpha_Vector.prototype.Added = function()
{
    var rv = this.Clone();
    return rv.Add.apply(rv, arguments);
}

alpha_Vector.prototype.Clone = function()
{
    return new alpha_Vector(this);
}

alpha_Vector.prototype.Multiply = function()
{
    if(arguments.length > 1) {
        this[0] *= arguments[0];
        this[1] *= arguments[1];
        this[2] *= arguments[2];
    }
    else if(typeof arguments[0] == "number") {
        this[0] *= arguments[0];
        this[1] *= arguments[0];
        this[2] *= arguments[0];
    }
    else {
        this[0] *= arguments[0][0];
        this[1] *= arguments[0][1];
        this[2] *= arguments[0][2];
    }
    return this;
}

alpha_Vector.prototype.Multiplied = function()
{
    var rv = this.Clone();
    return rv.Multiply.apply(rv, arguments);
}

alpha_Vector.prototype.Divide = function()
{
    if(arguments.length > 1) {
        this[0] /= arguments[0];
        this[1] /= arguments[1];
        this[2] /= arguments[2];
    }
    else if(typeof arguments[0] == "number") {
        this[0] /= arguments[0];
        this[1] /= arguments[0];
        this[2] /= arguments[0];
    }
    else {
        this[0] /= arguments[0][0];
        this[1] /= arguments[0][1];
        this[2] /= arguments[0][2];
    }
    return this;
}

alpha_Vector.prototype.Divided = function()
{
    var rv = this.Clone();
    return rv.Divide.apply(rv, arguments);
}

alpha_Vector_Tests.addTest("alpha_Vector.Divide", function() {
    var a = new alpha_Vector(3, 4, 0);

    var b = new alpha_Vector(2, 2, 2);

    if(!a.Divided(b).Equals(3/2, 4/2, 0)) {
        return a.Divided(b).toString();
    }

    if(!a.Equals(3, 4, 0)) {
        return a.toString();
    }
    if(a.Equals(3, 4, 5)) {
        return a.toString();
    }
    if(a.Equals(4, 4, 0)) {
        return a.toString();
    }
    if(a.Equals(3, 3, 0)) {
        return a.toString();
    }

    if(!a.Divided(2, 2, 2).Equals(3/2, 4/2, 0)) {
        return a.Divided(b).toString();
    }

    if(!a.Divided(new alpha_Vector(2, 3, 4)).Equals(3/2, 4/3, 0)) {
        return a.Divided(b).toString();
    }
});

alpha_Vector.prototype.Equals = function()
{
    if(arguments.length > 1) {
        // .Equals(x, y, z)
        for(var i = 0; i < this.length; ++i) {
            if(Math.abs(this[i] - arguments[i]) > alpha_FUZZINESS) {
                // Found a significant difference.
                return false;
            }
        }
    }
    else {
        // .Equals(new alpha_Vector(x, y, z));
        for(var i = 0; i < this.length; ++i) {
            if(Math.abs(this[i] - arguments[0][i]) > alpha_FUZZINESS) {
                // Found a significant difference.
                return false;
            }
        }
    }

    // Equals.
    return true;
}

alpha_Vector_Tests.addTest("alpha_Vector.Equals", function() {
    var a = new alpha_Vector(3, 4, 0);
    if(!a.Equals(3, 4, 0)) {
        return a.toString();
    }
    if(a.Equals(3, 4, 5)) {
        return a.toString();
    }
    if(a.Equals(4, 4, 0)) {
        return a.toString();
    }
    if(a.Equals(3, 3, 0)) {
        return a.toString();
    }
});

alpha_Vector.prototype.Set = function()
{
    if(arguments.length > 1) {
        for(var i = 0; i < this.length; ++i) {
            this[i] = arguments[i];
        }
    }
    else {
        for(var i = 0; i < this.length; ++i) {
            this[i] = arguments[0][i];
        }
    }
    if(typeof this[0] != "number") {
        throw new Error("All components must be numbers");
    }
    if(typeof this[1] != "number") {
        throw new Error("All components must be numbers");
    }
    if(typeof this[2] != "number") {
        throw new Error("All components must be numbers");
    }
    return this;
}

alpha_Vector.prototype.Normalize = function()
{
    var magnitude = this.Magnitude();
    if(magnitude != 0) {
        this.Divide(magnitude);
    }

    return this;
}

alpha_Vector_Tests.addTest("alpha_Vector.Normalize", function() {
    var a = new alpha_Vector(3, 4, 0);
    a.Normalize();
    if(a.Length() != 1) {
        return "Normalize must create a vector of length one.";
    }

    if(!a.Equals(3/5, 4/5, 0)) {
        return a.toString();
    }
});

alpha_Vector.prototype.Normalized = function()
{
    return this.Clone().Normalize();
}

alpha_Vector.prototype.Magnitude = function()
{
    return Math.sqrt(this.DotProduct(this));
}
alpha_Vector.prototype.Length = alpha_Vector.prototype.Magnitude;

alpha_Vector_Tests.addTest("alpha_Vector.Magnitude", function() {
    var v = new alpha_Vector();
    if(v.Magnitude() != 0) {
        return "Empty vector must have zero magnitude.";
    }

    v = new alpha_Vector(1, 0, 0);
    if(v.Magnitude() != 1) {
        return "Vector magnitude does not match.";
    }

    v = new alpha_Vector(3, 4, 0);
    if(v.Magnitude() != 5) {
        return "Vector magnitude does not match.";
    }
});

alpha_Vector.prototype.DotProduct = function(other)
{
    return this[0] * other[0] + this[1] * other[1] + this[2] * other[2];
}
alpha_Vector.prototype.InnerProduct = alpha_Vector.prototype.DotProduct;
alpha_Vector.prototype.ScalarProduct = alpha_Vector.prototype.DotProduct;

alpha_Vector_Tests.addTest("alpha_Vector.DotProduct", function() {
    var a = new alpha_Vector(1, 0, 0);
    var b = new alpha_Vector(0, 1, 0);
    if(a.DotProduct(b)) {
        return "Orthogonal vectors must have zero dot product";
    }
});

alpha_Vector.prototype.AngleBetween = function(other)
{
    var dot = this.DotProduct(other);
    return Math.acos(dot / (this.Magnitude() * other.Magnitude()));
}

alpha_Vector.prototype.toString = function()
{
    if(typeof this[0] != "number") {
        throw new Error("All components must be numbers");
    }
    if(typeof this[1] != "number") {
        throw new Error("All components must be numbers");
    }
    if(typeof this[2] != "number") {
        throw new Error("All components must be numbers");
    }
    return "[" + this[0] + ", " + this[1] + ", " + this[2] + "]";
};

//----------------------------------------------
//----------------------------------------------
//-----------     QUATERNIONS  -----------------
//----------------------------------------------
//----------------------------------------------

function alpha_Quaternion()
{
    this[0] = 0;
    this[1] = 0;
    this[2] = 0;
    this[3] = 1;
    this.length = 4;

    if(arguments.length > 0) {
        this.Set.apply(this, arguments);
    }
}

alpha_Quaternion.prototype.toJSON = function()
{
    return [this[0], this[1], this[2], this[3]];
};

alpha_Quaternion.prototype.restore = function(json)
{
    if(Array.isArray(json)) {
        this.Set.apply(this, json);
    }
    else {
        this[0] = json.x;
        this[1] = json.y;
        this[2] = json.z;
        this[3] = json.w;
    }
};

alpha_Quaternion_Tests = new parsegraph_TestSuite("alpha_Quaternion");

alpha_Quaternion_Tests.addTest("Does quaternion rotation really even work?", function(resultDom) {
    var m = new alpha_RMatrix4();
    var rotq = 90;
    m.Rotate(alpha_QuaternionFromAxisAndAngle(
        0, 1, 1, rotq
    ));
    m.Rotate(alpha_QuaternionFromAxisAndAngle(
        1, 0, 0, rotq
    ));
    m.Rotate(alpha_QuaternionFromAxisAndAngle(
        1, 0, 1, rotq
    ));
    var v = m.Transform(10, 0, 0);
    // TODO What is the expected value?
    //return v.toString();
});

alpha_Quaternion.prototype.Clone = function()
{
    return new alpha_Quaternion(this);
}

alpha_Quaternion.prototype.Multiply = function()
{
    if(arguments.length == 1 && typeof arguments[0] === "number") {
        this[0] *= arguments[0];
        this[1] *= arguments[0];
        this[2] *= arguments[0];
        this[3] *= arguments[0];
        return;
    }
    // q = a * b
    var aw = this[3];
    var ax = this[0];
    var ay = this[1];
    var az = this[2];

    var bw, bx, by, bz;
    if(arguments.length > 1) {
        bw = arguments[3];
        bx = arguments[0];
        by = arguments[1];
        bz = arguments[2];
    }
    else {
        bw = arguments[0][3];
        bx = arguments[0][0];
        by = arguments[0][1];
        bz = arguments[0][2];
    }

    this[0] = (aw * bx + ax * bw + ay * bz - az * by);
    this[1] = (aw * by - ax * bz + ay * bw + az * bx);
    this[2] = (aw * bz + ax * by - ay * bx + az * bw);
    this[3] = (aw * bw - ax * bx - ay * by - az * bz);

    return this;
}

alpha_Quaternion.prototype.Multiplied = function()
{
    var rv = this.Clone();
    return rv.Multiply.apply(rv, arguments);
}

// really this could use a few tweaks
// negatives can be the same rotation
// (different paths)
alpha_Quaternion.prototype.Equals = function(other)
{
    if(arguments.length > 1) {
        for(var i = 0; i < this.length; ++i) {
            if(Math.abs(this[i] - arguments[i]) > alpha_FUZZINESS) {
                // Found a significant difference.
                return false;
            }
        }
    }
    else {
        for(var i = 0; i < this.length; ++i) {
            if(Math.abs(this[i] - arguments[0][i]) > alpha_FUZZINESS) {
                // Found a significant difference.
                return false;
            }
        }
    }

    // Equals.
    return true;
}

alpha_Quaternion.prototype.Magnitude = function()
{
    var w = this[3];
    var x = this[0];
    var y = this[1];
    var z = this[2];
    return Math.sqrt(w*w + x*x + y*y + z*z);
}
alpha_Quaternion.prototype.Length = alpha_Quaternion.prototype.Magnitude;
alpha_Quaternion.prototype.Norm = alpha_Quaternion.prototype.Magnitude;

alpha_Quaternion.prototype.Normalize = function()
{
    var magnitude = this.Magnitude();
    if(magnitude != 0) {
        this.Multiply(1 / magnitude);
    }
    return this;
}

alpha_Quaternion_Tests.addTest("alpha_Quaternion.Normalize", function(resultDom) {
    var q = new alpha_Quaternion();
    q.Normalize();
    if(!q.Equals(new alpha_Quaternion())) {
        console.log(q.toString());
        return q;
    }
});

alpha_Quaternion.prototype.Set = function()
{
    var w = this[3];

    if(arguments.length > 1) {
        for(var i = 0; i < this.length; ++i) {
            this[i] = arguments[i];
        }
    }
    else {
        for(var i = 0; i < this.length; ++i) {
            this[i] = arguments[0][i];
        }
    }

    if(this[3] === undefined) {
        this[3] = w;
    }
    return this;
};

/**
 * Returns a new quaternion that represents the conjugate of this quaternion.
 */
alpha_Quaternion.prototype.Conjugate = function()
{
    return new alpha_Quaternion(
        -this[0],
        -this[1],
        -this[2],
        this[3]
    );
};

alpha_Quaternion.prototype.Inverse = function()
{
    // actual inverse is q.Conjugate() / Math.pow(Math.abs(q.Magnitude()), 2)
    // but as we only deal with unit quaternions we can just force a normalization
    // q.Conjugate() / 1 == q.Conjugate();

    this.Normalize();
    return this.Conjugate();
};

alpha_Quaternion.prototype.ToAxisAndAngle = function()
{
    if(w > 1) {
        this.Normalize();
    }
    var w = this[3];
    var x = this[0];
    var y = this[1];
    var z = this[2];

    var angle = 2 * Math.acos(w);
    var s = Math.sqrt(1 - w*w);

    if(s > .001) {
        x = x / s;
        y = x / s;
        z = x / s;
    }
    return [new alpha_Vector(x, y, z), angle];
};

function alpha_QuaternionFromAxisAndAngle()
{
    var quat = new alpha_Quaternion(0, 0, 0, 1);
    return quat.FromAxisAndAngle.apply(quat, arguments);
}

alpha_Quaternion.prototype.FromAxisAndAngle = function()
{
    var x, y, z, angle;
    var axis = new alpha_Vector();
    if(arguments.length == 2) {
        // passed as ({vector}, angle)
        // creates or copies the vector or Vector
        axis.Set(arguments[0][0], arguments[0][1], arguments[0][2]);
        angle = arguments[1];
    }
    else  {
        // passed as ( x, y, z, angle) -- (rough check)
        axis.Set(arguments[0], arguments[1], arguments[2]);
        angle = arguments[3];
    }

    axis.Normalize();
    angle = angle / 2;
    var sinangle = Math.sin(angle);
    // accessing an vector by [X] will not be correct
    this[0] = ( axis[0] * sinangle );
    this[1] = ( axis[1] * sinangle );
    this[2] = ( axis[2] * sinangle );
    this[3] = ( Math.cos(angle) );

    return this;
}

alpha_Quaternion_Tests.addTest("FromAxisAndAngle", function(resultDom) {
    var q = new alpha_Quaternion();
    var angle = Math.PI / 2;

    q.FromAxisAndAngle(0, 1, 0, angle);
    if(!q.Equals(
        0, Math.sin(angle / 2), 0, Math.cos(angle / 2)
    )) {
        return q.toString();
    }

    q.FromAxisAndAngle(0, 0, 1, angle);
    if(!q.Equals(
        0, 0, Math.sin(angle / 2), Math.cos(angle / 2)
    )) {
        return q.toString();
    }

    q.FromAxisAndAngle(1, 0, 0, angle);
    if(!q.Equals(
        Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)
    )) {
        return q.toString();
    }

    q.FromAxisAndAngle(0, 0, 0, angle);
    if(!q.Equals(
        0, 0, 0, Math.cos(angle / 2)
    )) {
        return q.toString();
    }
});

alpha_Quaternion.prototype.DotProduct = function(other)
{
    var rv = 0;
    for(var i = 0; i < this.length; ++i) {
        rv += this[i] * other[i];
    }
    return rv;
};
alpha_Quaternion.prototype.ScalarProduct = alpha_Quaternion.prototype.DotProduct;
alpha_Quaternion.prototype.InnerProduct = alpha_Quaternion.prototype.DotProduct;

// v' = qr * v * qr-1
// vector3 = (q * quaternion( vector, 0 ) * q:conjugate() ).Vector();
// this is one of the most heavily used and slowest functions
// so its been optimized to hell and back
// a more normal, and decently optimized version is found next
// this version is about 2x faster than RotatedVector2
alpha_Quaternion.prototype.RotatedVector = function()
{
    var x, y, z;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    }

    // vector to quat
    var a = new alpha_Quaternion(x, y, z, 0);
    var b = this.Conjugate();

    // var r = this * v * conjugate;
    // var q = v * c;
    var aw = 0;
    var ax = a[0];
    var ay = a[1]
    var az = a[2];

    var bw = b[3];
    var bx = b[0];
    var by = b[1];
    var bz = b[2];
    // removed all the mults by aw, which would result in 0;

    var q = new alpha_Quaternion(
        ax * bw + ay * bz - az * by,
        -ax * bz + ay * bw + az * bx,
        ax * by - ay * bx + az * bw,
        -ax * bx - ay * by - az * bz
    );
    /*
    var q = [
        (aw * bx + ax * bw + ay * bz - az * by),
        (aw * by - ax * bz + ay * bw + az * bx),
        (aw * bz + ax * by - ay * bx + az * bw),
        (aw * bw - ax * bx - ay * by - az * bz)
    ];
    */

    // var r = this.Multiplied(q);

    var a = this;
    var b = q;
    aw = a[3];
    ax = a[0];
    ay = a[1];
    az = a[2];

    bw = b[3];
    bx = b[0];
    by = b[1];
    bz = b[2];

    // and we strip the w component from this
    // which makes it a vector
    return new alpha_Vector(
        (aw * bx + ax * bw + ay * bz - az * by),
        (aw * by - ax * bz + ay * bw + az * bx),
        (aw * bz + ax * by - ay * bx + az * bw)
    );
};

// this is a decently optimized version; about twice as slow as version 1
alpha_Quaternion.prototype.RotatedVector2 = function()
{
    var x, y, z;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    }
    var conjugate = this.Conjugate();
    var v = new alpha_Quaternion(x, y, z, 0);
    var r = this.Multiplied(v).Multiply(conjugate);
    return new alpha_Vector(r[0], r[1], r[2]);
};

alpha_Quaternion.prototype.toString = function()
{
    return "{x: " + this[0] + "\ny: " + this[1] + "\nz: " + this[2] + "\nw: " + this[3] + "}";
};

alpha_Quaternion.prototype.AngleBetween = function(other)
{
    this.Normalize();
    other.Normalize();
    var dot = this.DotProduct(other);
    return 2 * Math.acos(dot / (this.Magnitude() * other.Magnitude()));
}

//----------------------------------------------
//----------------------------------------------
//-----------      MATRICES    -----------------
//----------------------------------------------
//----------------------------------------------

/**
 * Constructs a Matrix.
 *
    // using quaternions for a Vector4
    var r1 = new alpha_Quaternion(this[0], this[1], this[2], this[3]);
    var r2 = new alpha_Quaternion(this[4], this[5], this[6], this[7]);
    var r3 = new alpha_Quaternion(this[8], this[9], this[10], this[11]);
    var r4 = new alpha_Quaternion(this[12], this[13], this[14], this[15]);
*/
function alpha_RMatrix4()
{
    this.length = 16;
    if(arguments.length == 0) {
        this.Set(
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        );
    }
    else {
        this.Set.apply(this, arguments);
    }
};

alpha_RMatrix4.prototype.restore = function(json)
{
    this.Set.apply(this, json);
};

alpha_RMatrix4.prototype.toJSON = function()
{
    return this.toArray();
};

alpha_RMatrix4_Tests = new parsegraph_TestSuite("alpha_RMatrix4");

alpha_RMatrix4.prototype.toDom = function(reference)
{
    var tableDom = document.createElement("table");

    for(var i = 0; i < 4; ++i) {
        var rowDom = document.createElement("tr");
        tableDom.appendChild(rowDom);
        for(var j = 0; j < 4; ++j) {
            var cellDom = document.createElement("td");
            cellDom.style.padding = "3px";
            cellDom.style.textAlign = "center";

            if(reference) {
                var refValue = reference[4 * i + j];
                var givenValue = this[4 * i + j];

                if(Math.abs(givenValue - refValue) > alpha_FUZZINESS) {
                    cellDom.style.color = "black";
                    cellDom.style.backgroundColor = "red";
                    cellDom.appendChild(document.createTextNode(givenValue + " (not " + refValue + ")"));
                }
                else {
                    cellDom.style.backgroundColor = "green";
                    cellDom.style.color = "white";
                    cellDom.appendChild(document.createTextNode(this[4 * i + j]));
                }
            }
            else {
                cellDom.appendChild(document.createTextNode(this[4 * i + j]));
            }
            rowDom.appendChild(cellDom);
        }
    }

    return tableDom;
};

alpha_RMatrix4.prototype.Set = function()
{
    if(arguments.length == 1) {
        // All components passed in a single argument.
        for(var i = 0; i < this.length; ++i) {
            this[i] = arguments[0][i];
        }
    }
    else {
        // Each component passed individually.
        for(var i = 0; i < this.length; ++i) {
            this[i] = arguments[i];
        }
    }

    return this;
};

alpha_RMatrix4.prototype.Equals = function()
{
    if(arguments.length > 1) {
        for(var i = 0; i < this.length; ++i) {
            if(Math.abs(this[i] - arguments[i]) > alpha_FUZZINESS) {
                // Found a significant difference.
                return false;
            }
        }
    }
    else {
        for(var i = 0; i < this.length; ++i) {
            if(Math.abs(this[i] - arguments[0][i]) > alpha_FUZZINESS) {
                // Found a significant difference.
                return false;
            }
        }
    }

    // Equals.
    return true;
};

alpha_RMatrix4.prototype.Clone = function()
{
    return new alpha_RMatrix4(this);
};

{
    var r1 = new alpha_Quaternion();
    var r2 = new alpha_Quaternion();
    var r3 = new alpha_Quaternion();
    var r4 = new alpha_Quaternion();
    var c1 = new alpha_Quaternion();
    var c2 = new alpha_Quaternion();
    var c3 = new alpha_Quaternion();
    var c4 = new alpha_Quaternion();
    alpha_RMatrix4.prototype.Multiply = function(other)
    {
        if(typeof other == "number") {
            // Multiply by the scalar value.
            return this.Set(
                s*this[0], s*this[1], s*this[2], s*this[3],
                s*this[4], s*this[5], s*this[6], s*this[7],
                s*this[8], s*this[9], s*this[10], s*this[11],
                s*this[12], s*this[13], s*this[14], s*this[15]
            );
        }

        // using quaternions for a Vector4
        r1.Set(this[0], this[1], this[2], this[3]);
        r2.Set(this[4], this[5], this[6], this[7]);
        r3.Set(this[8], this[9], this[10], this[11]);
        r4.Set(this[12], this[13], this[14], this[15]);
        c1.Set(other[0], other[4], other[8], other[12]);
        c2.Set(other[1], other[5], other[9], other[13]);
        c3.Set(other[2], other[6], other[10], other[14]);
        c4.Set(other[3], other[7], other[11], other[15]);

        var dot = alpha_Quaternion.DotProduct;
        return this.Set(
            r1.DotProduct(c1), r1.DotProduct(c2), r1.DotProduct(c3), r1.DotProduct(c4),
            r2.DotProduct(c1), r2.DotProduct(c2), r2.DotProduct(c3), r2.DotProduct(c4),
            r3.DotProduct(c1), r3.DotProduct(c2), r3.DotProduct(c3), r3.DotProduct(c4),
            r4.DotProduct(c1), r4.DotProduct(c2), r4.DotProduct(c3), r4.DotProduct(c4)
        );
    }
}

alpha_RMatrix4_Tests.addTest("alpha_RMatrix4.Multiply", function(resultDom) {
    var m = new alpha_RMatrix4(
        2, 3, 4, 5,
        6, 7, 8, 9,
        10, 11, 12, 13,
        14, 15, 16, 17
    );
    m.Multiply(new alpha_RMatrix4(
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        39, 41, 43, 47
    ));

    var result = new alpha_RMatrix4(
        2*2 + 3*11 + 4*23 + 5*39,
        2*3 + 3*13 + 4*29 + 5*41,
        2*5 + 3*17 + 4*31 + 5*43,
        2*7 + 3*19 + 4*37 + 5*47,

        6*2 + 7*11 + 8*23 + 9*39,
        6*3 + 7*13 + 8*29 + 9*41,
        6*5 + 7*17 + 8*31 + 9*43,
        6*7 + 7*19 + 8*37 + 9*47,

        10*2 + 11*11 + 12*23 + 13*39,
        10*3 + 11*13 + 12*29 + 13*41,
        10*5 + 11*17 + 12*31 + 13*43,
        10*7 + 11*19 + 12*37 + 13*47,

        14*2 + 15*11 + 16*23 + 17*39,
        14*3 + 15*13 + 16*29 + 17*41,
        14*5 + 15*17 + 16*31 + 17*43,
        14*7 + 15*19 + 16*37 + 17*47
    );

    if(!m.Equals(result)) {
        resultDom.appendChild(m.toDom(result));
        return "Multiply did not produce correct values";
    }
});

alpha_RMatrix4.prototype.Transform = function()
{
    var x, y, z, w;
    if(arguments.length == 1) {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
        w = arguments[0][3];
    }
    else if(arguments.length === 2) {
        // Vector, w
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
        w = arguments[1];
    }
    else {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
        w = arguments[3];
        if(w === undefined) {
            w = 1.0;
        }
    }
    if(w === undefined) {
        return new alpha_Vector(
            this[0] * x + this[1] * y + this[2] * z + this[3],
            this[4] * x + this[5] * y + this[6] * z + this[7],
            this[8] * x + this[9] * y + this[10] * z + this[11]
        );
    }

    return new alpha_Quaternion(
        this[0] * x + this[1] * y + this[2] * z + this[3] * w,
        this[4] * x + this[5] * y + this[6] * z + this[7] * w,
        this[8] * x + this[9] * y + this[10] * z + this[11] * w,
        this[12] * x + this[13] * y + this[14] * z + this[15] * w
    );
};

alpha_RMatrix4_Tests.addTest("alpha_RMatrix4.Transform", function(resultDom) {
    var m = new alpha_RMatrix4();
    m.Scale(2, 2, 2);

    var value = m.Transform(3, 4, 5);
    if(!value.Equals(6, 8, 10)) {
        return value.toString();
    }

    var value = m.Transform(3, 4, 5, 1);
    if(!value.Equals(6, 8, 10, 1)) {
        return value.toString();
    }
});

alpha_RMatrix4.prototype.Multiplied = function()
{
    var rv = this.Clone();
    return rv.Multiply.apply(rv, arguments);
};

alpha_RMatrix4.prototype.Identity = function()
{
    return this.Set(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    );
};

alpha_RMatrix4.prototype.Scale = function()
{
    // Retrieve arguments.
    var x, y, z;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    }

    // Create the matrix.
    var m = new alpha_RMatrix4();
    m[0] = x;
    m[5] = y;
    m[10] = z;

    // Multiply in this order.
    m.Multiply(this);
    this.Set(m);

    return this;
};

alpha_RMatrix4_Tests.addTest("alpha_RMatrix4.Scale", function(resultDom) {
    var m = new alpha_RMatrix4();

    //console.log(m.toString());
    m.Scale(2, 3, 4);

    if(!m.Equals(new alpha_RMatrix4(
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1
    ))) {
        return m.toString();
    }
});

alpha_RMatrix4.prototype.Translate = function()
{
    // Retrieve arguments.
    var x, y, z;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    }

    // Create the matrix.
    var m = new alpha_RMatrix4();
    m[12] = x;
    m[13] = y;
    m[14] = z;

    m.Multiply(this);
    this.Set(m);

    return this;
};

alpha_RMatrix4_Tests.addTest("alpha_RMatrix4.Translate", function(resultDom) {
    var m = new alpha_RMatrix4();

    //console.log(m.toString());
    m.Translate(2, 3, 4);

    if(!m.Equals(new alpha_RMatrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, 3, 4, 1
    ))) {
        return m.toString();
    }

    m.Translate(2, 3, 4);
    if(!m.Equals(new alpha_RMatrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        4, 6, 8, 1
    ))) {
        return m.toString();
    }
});

alpha_RMatrix4_Tests.addTest("alpha_RMatrix4.Rotate", function(resultDom) {
    var m = new alpha_RMatrix4();

    //console.log(m.toString());
    m.Rotate(1, 0, 0, 1);

    if(!m.Equals(new alpha_RMatrix4(
        1, 0, 0, 0,
        0, -1, 2, 0,
        0, -2, -1, 0,
        0, 0, 0, 1
    ))) {
        //console.log("Rotated matrix: " + m.toString());
        return m.toString();
    }
});

alpha_RMatrix4_scratch = null;

function alpha_getScratchMatrix()
{
    if(!alpha_RMatrix4_scratch) {
        alpha_RMatrix4_scratch = new alpha_RMatrix4();
    }
    else {
        alpha_RMatrix4_scratch.Identity();
    }
    return alpha_RMatrix4_scratch;
}

alpha_RMatrix4.prototype.Rotate = function()
{
    // Retrieve arguments.
    var x, y, z, w;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
        w = arguments[3];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
        w = arguments[0][3];
    }
    if(!w) {
        w = 0;
    }

    // Create the matrix.
    var r = alpha_getScratchMatrix();
    var x2 = x * x;
    var y2 = y * y;
    var z2 = z * z;
    var xy = x * y;
    var xz = x * z;
    var yz = y * z;
    var wx = w * x;
    var wy = w * y;
    var wz = w * z;
    r[0]  =  1 - 2 * (y2 + z2);
    r[1]  =  2 * (xy + wz);
    r[2]  =  2 * (xz - wy);
    r[4]  =  2 * (xy - wz);
    r[5]  =  1 - 2 * (x2 + z2);
    r[6]  =  2 * (yz + wx);
    r[8]  =  2 * (xz + wy);
    r[9] =  2 * (yz - wx);
    r[10] =  1 - 2 * (x2 + y2);

    // Multiply in this order.
    r.Multiply(this);
    this.Set(r);

    return this;
};

alpha_RMatrix4.prototype.Transpose = function()
{
    return this.Set(
        this[0], this[4], this[8], this[12],
        this[1], this[5], this[9], this[13],
        this[2], this[6], this[10], this[14],
        this[3], this[7], this[11], this[15]
    );
};

alpha_RMatrix4.prototype.toString = function()
{
    var line = function(a, b, c, d) {
        return [a, b, c, d].join(", ");
    };

    return "[" + [
        line(this[0], this[1], this[2], this[3]),
        line(this[4], this[5], this[6], this[7]),
        line(this[8], this[9], this[10], this[11]),
        line(this[12], this[13], this[14], this[15])
    ].join(",\n") + "]";
};

function alpha_RMatrix4FromEuler()
{
    var m = new alpha_RMatrix4();
    return m.FromEuler.apply(m, arguments);
};

alpha_RMatrix4.prototype.FromEuler = function()
{
    // Retrieve arguments.
    var x, y, z;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    }

    var sx = Math.sin(x);
    var cx = Math.cos(x);
    var sy = Math.sin(y);
    var sy = Math.cos(y);
    var sz = Math.sin(z);
    var cz = Math.cos(z);

    this.Set(
        sy * cx, sx, -sy * cx, 0,
        -sy*sx*cz + sy*sz, cx*cz, sy*sx*cz + sy*sz, 0,
        sy*sx*sz + sy*cz, -cx*sz, -sy*sx*sz + sy*cz, 0,
        0, 0, 0, 1
    );

    return this;
};

function alpha_RMatrix4FromQuaternion()
{
    var m = new alpha_RMatrix4();
    return m.FromQuaternion.apply(m, arguments);
};

alpha_RMatrix4.prototype.FromQuaternion = function()
{
    // Retrieve arguments.
    var x, y, z, w;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
        w = arguments[3];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
        w = arguments[0][3];
    }
    if(!w) {
        w = 0;
    }

    var x2 = x * x;
    var y2 = y * y;
    var z2 = z * z;
    var xy = x * y;
    var xz = x * z;
    var yz = y * z;
    var wx = w * x;
    var wy = w * y;
    var wz = w * z;

    return this.Set(
        1 - 2 * (y2 + z2), 2 * (xy + wz), 2 * (xz - wy), 0,
        2 * (xy - wz), 1 - 2 * (x2 + z2), 2 * (yz + wx), 0,
        2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (x2 + y2), 0,
        0, 0, 0, 1
    );
};

function alpha_RMatrix4FromQuaternionAtVector()
{
    var m = new alpha_RMatrix4();
    return m.FromQuaternionAtVector.apply(m, arguments);
};

// equivalent to rotationMatrix * translationMatrix;
alpha_RMatrix4.prototype.FromQuaternionAtVector = function(vector, quat)
{
    this.FromQuaternion(quat);
    this[12] = vector[0];
    this[13] = vector[1];
    this[14] = vector[2];

    return this;
};

function alpha_RMatrix4FromVectorAroundQuaternion()
{
    var m = new alpha_RMatrix4();
    return m.FromVectorAroundQuaternion.apply(m, arguments);
};

// equivalent to
// translationMatrix * rotationMatrix
// the 4th value in this matrix multplication always end up as 0
alpha_RMatrix4.prototype.FromVectorAroundQuaternion = function(vector, quat)
{
    // set our 3x3 rotation matrix
    this.FromQuaternion(quat);

    // set our critical rows and columns
    var r4 = new alpha_Quaternion(vector[0], vector[1], vector[2], 1);
    var c1 = new alpha_Quaternion(this[0], this[4], this[8]);
    var c2 = new alpha_Quaternion(this[1], this[5], this[9]);
    var c3 = new alpha_Quaternion(this[2], this[6], this[10]);

    this[12] = r4.DotProduct(c1);
    this[13] = r4.DotProduct(c2);
    this[14] = r4.DotProduct(c3);

    return this;
};

function alpha_RMatrix4FromVectorAroundQuaternionAtVector()
{
    var m = new alpha_RMatrix4();
    return m.FromVectorAroundQuaternionAtVector.apply(m, arguments);
};

alpha_RMatrix4.prototype.FromVectorAroundQuaternionAtVector = function(vec1, quat, vec2)
{
    // rotation * translation;
    this.FromQuaternionAtVector(vec2, quat);

    // set our critical rows and columns
    var r4 = new alpha_Quaternion(vec1[0], vec1[1], vec1[2], 1);
    var c1 = new alpha_Quaternion(this[0], this[4], this[8], this[12]);
    var c2 = new alpha_Quaternion(this[1], this[5], this[9], this[13]);
    var c3 = new alpha_Quaternion(this[2], this[6], this[10], this[14]);

    this[12] = r4.DotProduct(c1);
    this[13] = r4.DotProduct(c2);
    this[14] = r4.DotProduct(c3);

    return this;
};

alpha_RMatrix4.prototype.Inverse = function()
{
    var inv = this.Inversed();
    return this.Set(inv);
};

alpha_RMatrix4.prototype.Inversed = function()
{
  var inv = new alpha_RMatrix4();

  // code was lifted from MESA 3D
  inv[0] = this[5] * this[10] * this[15] -
            this[5]  * this[11] * this[14] -
            this[9]  * this[6]  * this[15] +
            this[9]  * this[7]  * this[14] +
            this[13] * this[6]  * this[11] -
            this[13] * this[7]  * this[10];

  inv[4] = -this[4] * this[10] * this[15] +
           this[4] * this[11] * this[14] +
           this[8] * this[6] * this[15] -
           this[8] * this[7] * this[14] -
           this[12] * this[6] * this[11] +
           this[12] * this[7] * this[10];

  inv[8] = this[4] * this[9] * this[15] -
          this[4] * this[11] * this[13] -
          this[8] * this[5] * this[15] +
          this[8] * this[7] * this[13] +
          this[12] * this[5] * this[11] -
          this[12] * this[7] * this[9];

  inv[12] = -this[4] * this[9] * this[14] +
            this[4] * this[10] * this[13] +
            this[8] * this[5] * this[14] -
            this[8] * this[6] * this[13] -
            this[12] * this[5] * this[10] +
            this[12] * this[6] * this[9];

  inv[1] = -this[1] * this[10] * this[15] +
           this[1] * this[11] * this[14] +
           this[9] * this[2] * this[15] -
           this[9]  * this[3] * this[14] -
           this[13] * this[2] * this[11] +
           this[13] * this[3] * this[10];

  inv[5] = this[0] * this[10] * this[15] -
          this[0] * this[11] * this[14] -
          this[8] * this[2] * this[15] +
          this[8] * this[3] * this[14] +
          this[12] * this[2] * this[11] -
          this[12] * this[3] * this[10];

  inv[9] = -this[0] * this[9] * this[15] +
           this[0] * this[11] * this[13] +
           this[8] * this[1] * this[15] -
           this[8] * this[3] * this[13] -
           this[12] * this[1] * this[11] +
           this[12] * this[3] * this[9];

  inv[13] = this[0] * this[9] * this[14] -
           this[0] * this[10] * this[13] -
           this[8] * this[1] * this[14] +
           this[8] * this[2] * this[13] +
           this[12] * this[1] * this[10] -
           this[12] * this[2] * this[9];

  inv[2] = this[1] * this[6] * this[15] -
          this[1] * this[7] * this[14] -
          this[5] * this[2] * this[15] +
          this[5] * this[3] * this[14] +
          this[13] * this[2] * this[7] -
          this[13] * this[3] * this[6];

  inv[6] = -this[0] * this[6] * this[15] +
           this[0] * this[7] * this[14] +
           this[4] * this[2] * this[15] -
           this[4] * this[3] * this[14] -
           this[12] * this[2] * this[7] +
           this[12] * this[3] * this[6];

  inv[10] = this[0] * this[5] * this[15] -
           this[0] * this[7] * this[13] -
           this[4] * this[1] * this[15] +
           this[4] * this[3] * this[13] +
           this[12] * this[1] * this[7] -
           this[12] * this[3] * this[5];

  inv[14] = -this[0] * this[5] * this[14] +
            this[0] * this[6] * this[13] +
            this[4] * this[1] * this[14] -
            this[4] * this[2] * this[13] -
            this[12] * this[1] * this[6] +
            this[12] * this[2] * this[5];

  inv[3] = -this[1] * this[6] * this[11] +
           this[1] * this[7] * this[10] +
           this[5] * this[2] * this[11] -
           this[5] * this[3] * this[10] -
           this[9] * this[2] * this[7] +
           this[9] * this[3] * this[6];

  inv[7] = this[0] * this[6] * this[11] -
          this[0] * this[7] * this[10] -
          this[4] * this[2] * this[11] +
          this[4] * this[3] * this[10] +
          this[8] * this[2] * this[7] -
          this[8] * this[3] * this[6];

  inv[11] = -this[0] * this[5] * this[11] +
            this[0] * this[7] * this[9] +
            this[4] * this[1] * this[11] -
            this[4] * this[3] * this[9] -
            this[8] * this[1] * this[7] +
            this[8] * this[3] * this[5];

  inv[15] = this[0] * this[5] * this[10] -
           this[0] * this[6] * this[9] -
           this[4] * this[1] * this[10] +
           this[4] * this[2] * this[9] +
           this[8] * this[1] * this[6] -
           this[8] * this[2] * this[5];

    var det = this[0] * inv[0] + this[1] * inv[4] + this[2] * inv[8] + this[3] * inv[12];

    if(det == 0) {
      throw new Error("Determinate in Matrix.Inverse cannot be 0");
    }
    det = 1.0 / det;

    for(var i = 0; i < inv.length; ++i) {
        inv[i] = inv[i] * det;
    }

    return inv;
}

alpha_RMatrix4_Tests.addTest("Does alpha_RMatrix4.Inverse even work for simple things?", function(resultDom) {
    var m = new alpha_RMatrix4(
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 2
    );
    var expected = new alpha_RMatrix4(
        0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0, 0, 0, 0.5
    );
    if(!m.Inverse().Equals(expected)) {
        resultDom.appendChild(m.Inverse());
        return "It doesn't even work for 2!";
    }
});

alpha_RMatrix4_Tests.addTest("Does alpha_RMatrix4.Inverse work for zero-determinants?", function(resultDom) {
    var m = new alpha_RMatrix4(
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 0
    );
    try {
        m.Inverse();
        return "Inverse shouldn't succeed.";
    }
    catch(ex) {
    }
});

alpha_RMatrix4.prototype.toArray = function()
{
    return [
        this[0], this[1], this[2], this[3],
        this[4], this[5], this[6], this[7],
        this[8], this[9], this[10], this[11],
        this[12], this[13], this[14], this[15]
    ];
};

alpha_RMatrix4_Tests.addTest("Does the RMatrix4 actually return rows for rows?", function(resultDom) {
    var m = new alpha_RMatrix4(
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        39, 41, 43, 47
    );

    if(m[0] !== 2 || m[1] !== 3 || m[2] !== 5 || m[3] !== 7) {
        return "";
    }

    if(m[4] !== 11 || m[5] !== 13 || m[6] !== 17 || m[7] !== 19) {
        return "";
    }

    if(m[8] !== 23 || m[9] !== 29 || m[10] !== 31 || m[11] !== 37) {
        return "";
    }

    if(m[12] !== 39 || m[13] !== 41 || m[14] !== 43 || m[15] !== 47) {
        return "";
    }
});

alpha_RMatrix4_Tests.addTest("Does the perspective matrix work with alpha_RMatrix4?", function(resultDom) {
    var width = 800;
    var height = 600;
    var m = new alpha_RMatrix4(makePerspective(
        Math.PI / 3,
        width / height,
        .1,
        150
    ));
    m.Transpose();

    var v = new alpha_Vector(1, 2, 3);
    var rv = m.Transform(v);

    // TODO Skipped.
    if(!rv.Equals(0, 1, 0)) {
        //return rv.toString();
    }
});
// Physical version 1.4.130828
// physical is an orientation and a position
// as well as rotation and movement


// TODO change the rotation movement speeds from x,y,z to forward, backward,left,right, etc
// // really front/back up/down lateral(surely we don't want crippled things )
// // // this also requires rethinking the movement; because moveforward/backward won't cancel anymore
// TODO: scaling
// TODO: tilt
// TODO: Children
// TODO: acceleration


//-----------------------------------
//------------ USAGE ----------------
//-----------------------------------

// local p = Physical();

// p:SetPosition(x,y,z);
// p:ChangePosition(x,y,z); // adds to current global position
// p:Rotate( angle, x, y, z ) // rotates at its current position, using p's x,y,z axes

// glMultMatrix( p() ) // applying the above


//-----------------------------------
//--------- BETTER USAGE ------------
//-----------------------------------
// speeds only apply to functions taking an elapsed parameter

// p:SetRotationSpeeds( x, y, z ) // radians / second per second per axis
// SetRotationSpeed( speed ) // sets all axes the same
// p:SetSpeeds(x,y,z) // ( movement speeds ) units / second per axis

// p:YawLeft( elapsed ) // p:YawRight( elapsed )
// p:PitchUp( elapsed ) // p:PitchDown( elapsed )
// p:RollLeft( elapsed ) // p:RollRight( elapsed )

// instantly update your global position when you call these
// p:WarpForward( distance ) // p:WarpBackward( distance )
// p:WarpLeft( distance ) // p:WarpRight( distance )
// p:WarpUp( distance ) // p:WarpDown( distance )

// velocity is applied whenever you call p:ApplyVelocity() or p:GetMatrix()
// velocity will adjust your current position by the velocity;
// p:SetVelocity(x,y,z);

// a simpler way to use velocity is to use these:
// it will be automatically calculated using our set speeds;

// p:MoveForward( elapsed ) // p:MoveBackward( elapsed )
// p:MoveLeft( elapsed ) // p:MoveRight( elapsed )
// p:MoveUp( elapsed ) // p:MoveDown( elapsed )

// XXX: for some reason I have to inverse quaterions for physical
// not for the camera. I do not understand why.

alpha_PHYSICAL_TRANSLATE_ROTATE_SCALE = 1;
alpha_PHYSICAL_SCALE_ROTATE_TRANSLATE = 2;
alpha_PHYSICAL_ROTATE_TRANSLATE_SCALE = 3;

function alpha_Physical(parent)
{
    this.modelMode = alpha_PHYSICAL_TRANSLATE_ROTATE_SCALE;
    this.orientation = new alpha_Quaternion();
    this.position = new alpha_Vector();
    this.modelMatrix = new alpha_RMatrix4();
    this.viewMatrix = new alpha_RMatrix4();
    this.modelDirty = false; // whether or not the matrix needs to be updated;
    this.velocity = new alpha_Vector();
    this.rotationSpeed = new alpha_Vector(1, 1, 1);
    this.speed = new alpha_Vector(5, 5, 5);
    this.scale = new alpha_Vector(1, 1, 1);
    this.SetParent(parent);
}

alpha_Physical.prototype.toJSON = function()
{
    return {
        position:this.position.toJSON(),
        orientation:this.orientation.toJSON(),
    };
};

// Register the test suite.
alpha_Physical_Tests = new parsegraph_TestSuite("alpha_Physical");

alpha_Physical_Tests.addTest("alpha_Physical", function(resultDom) {
    var surface = new alpha_GLWidget();
    var cam = new alpha_Camera(surface);
    var p = new alpha_Physical(cam);
});

//-----------------------------------
//---------- Rotation ---------------
//-----------------------------------

alpha_Physical.prototype.SetOrientation = function()
{
    this.orientation.Set.apply(this.orientation, arguments);
    this.modelDirty = true;
};

/**
 * returns as Quaternion
 */
alpha_Physical.prototype.GetOrientation = function()
{
    return this.orientation;
};

/**
 * in radians / second
 */
alpha_Physical.prototype.SetRotationSpeeds = function()
{
    this.rotationSpeed.Set.apply(this.rotationSpeed, arguments);
};
alpha_Physical.prototype.SetRotationSpeed = alpha_Physical.prototype.SetRotationSpeeds;

alpha_Physical.prototype.GetRotationSpeeds = function()
{
    return this.rotationSpeed;
}

alpha_Physical.prototype.Rotate = function(angle, x, y, z)
{
    // if you aren't rotating about an angle, then you aren't rotating
    if(angle == 0) {
        return;
    }
    var q = alpha_QuaternionFromAxisAndAngle(x, y, z, angle)
    this.orientation.Multiply(q);
    this.modelDirty = true;
};

alpha_Physical.prototype.RotateGlobal = function(angle, x, y, z)
{
    // if you aren't rotating about an angle, then you aren't rotating
    if(angle == 0) {
        return;
    }
    var q = alpha_QuaternionFromAxisAndAngle(x, y, z, angle);
    this.orientation.Set(q.Multiply(this.orientation));
    this.modelDirty = true;
};

/**
 * these rotations take place at the speeds set by rotationSpeed
 */
alpha_Physical.prototype.YawLeft = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[1];
    this.Rotate(angle, 0, 1, 0);
};

alpha_Physical.prototype.YawRight = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[1];
    this.Rotate(-angle, 0, 1, 0);
};

alpha_Physical.prototype.PitchUp = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[0];
    this.Rotate(angle, 1, 0, 0);
};

alpha_Physical.prototype.PitchDown = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[0];
    this.Rotate(-angle, 1, 0, 0);
};

alpha_Physical.prototype.RollLeft = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[2];
    this.Rotate(angle, 0, 0, 1);
};

alpha_Physical.prototype.RollRight = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[2];
    this.Rotate(-angle, 0, 0, 1);
};

//-------------------------------------
//------------ POSITION ---------------
//-------------------------------------

/**
 * send as x,y,z
 */
alpha_Physical.prototype.SetPosition = function()
{
    if(Number.isNaN(this.position[0])) {
        throw new Error("Position became NaN.");
    }
    this.position.Set.apply(this.position, arguments);
    this.modelDirty = true;
};

/**
 * return as Vector
 */
alpha_Physical.prototype.GetPosition = function()
{
    return this.position;
};

alpha_Physical.prototype.ChangePosition = function()
{
    if(Number.isNaN(this.position[0])) {
        throw new Error("Position became NaN!");
    }
    this.position.Add.apply(this.position, arguments);
    this.modelDirty = true;
};

//------------------------------------------
//-----------  MOVEMENT --------------------
//------------------------------------------
// movement is relative to the physical

/**
 * convertes the local x,y,z vector to the global position vector
 */
alpha_Physical.prototype.Warp = function()
{
    var x, y, z;
    if(arguments.length > 1) {
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
    }
    else {
        x = arguments[0][0];
        y = arguments[0][1];
        z = arguments[0][2];
    }
    if(x == 0 && y == 0 && z == 0) {
        return;
    }

    // Quaternions don't work correctly if they aren't normalized
    this.orientation.Normalize();

    // get our new position; if we started at 0,0,0
    var d = this.orientation.RotatedVector(x, y, z);

    // add it to our current position to get our new position
    //console.log("Warping vec" + d);
    this.ChangePosition(d);
};

// these movement commands MOVE the physical
// the physical's position is updated in the call
// use the Move commands for player-commanded movement
alpha_Physical.prototype.WarpForward = function(distance)
{
    this.Warp(0, 0, -distance);
};

alpha_Physical.prototype.WarpBackward = function(distance)
{
    this.Warp(0, 0, distance);
}

alpha_Physical.prototype.WarpLeft = function(distance)
{
    this.Warp(-distance, 0, 0);
};

alpha_Physical.prototype.WarpRight = function(distance)
{
    this.Warp(distance, 0, 0);
};

alpha_Physical.prototype.WarpUp = function(distance)
{
    this.Warp(0, distance, 0);
};

alpha_Physical.prototype.WarpDown = function(distance)
{
    this.Warp(0, -distance, 0);
};

//------------------------------------------
//-----------  VELOCITY --------------------
//------------------------------------------

// speed is in units per second
alpha_Physical.prototype.SetSpeeds = function()
{
    this.speed.Set.apply(this.speed, arguments);

}

alpha_Physical.prototype.GetSpeeds = function()
{
    return this.speed;
};

alpha_Physical.prototype.SetSpeed = function(speed)
{
    return this.SetSpeeds(speed, speed, speed);
};

alpha_Physical.prototype.SetVelocity = function()
{
    this.velocity.Set.apply(this.velocity, arguments);
};

alpha_Physical.prototype.GetVelocity = function()
{
    return this.velocity;
};

alpha_Physical.prototype.AddVelocity = function()
{
    this.velocity.Add.apply(this.velocity, arguments);
    this.modelDirty = true;
};

// Move commands adjust the velocity
// using the set speed
alpha_Physical.prototype.MoveForward = function(elapsed)
{
    var distance = elapsed * this.speed[2];
    this.AddVelocity(0, 0, -distance);
};

alpha_Physical.prototype.MoveBackward = function(elapsed)
{
    var distance = elapsed * this.speed[2];
    this.AddVelocity(0, 0, distance);
};

alpha_Physical.prototype.MoveLeft = function(elapsed)
{
    var distance = elapsed * this.speed[0];
    this.AddVelocity(-distance, 0,  0);
};

alpha_Physical.prototype.MoveRight = function(elapsed)
{
    var distance = elapsed * this.speed[0];
    this.AddVelocity(distance, 0, 0);
};

alpha_Physical.prototype.MoveUp = function(elapsed)
{
    var distance = elapsed * this.speed[1];
    this.AddVelocity(0, distance,  0);
};

alpha_Physical.prototype.MoveDown = function(elapsed)
{
    var distance = elapsed * this.speed[1];
    this.AddVelocity(0, -distance, 0);
};

// calculates our new position using our current velocity
// and then resets the velocity
alpha_Physical.prototype.ApplyVelocity = function()
{
    this.Warp(this.velocity);
    this.velocity.Set(0, 0, 0);
};

//------------------------------------------
//--------------  PARENTING ----------------
//------------------------------------------

// in order to be a good lineage:
// a camera must be reached
// // therefore it must not infinitely loop
alpha_Physical.prototype.IsGoodLineageFor = function(prospectiveChild)
{
    var parent = this.GetParent();

    // no parent = no lineage
    if(!parent) {
        return false;
    }
    else if(parent == prospectiveChild) {
        // the initator already has this physical as an ancestor
        // setting this as a parent would make an infinite loop
        return false;
        // note that we don't check self == prospectiveChild
        // that would throw an error if you tried to reparent to the same parent
        // it's assumed that if its a parent now, its still a good parent;
    }

    return parent.IsGoodLineageFor(prospectiveChild);
};

alpha_Physical.prototype.SetParent = function(parent)
{
    if(!parent) {
        throw new Error("A Physical must have a parent. Set it to the camera for a default");
    }

    if(!parent.IsGoodLineageFor(this)) {
        throw new Error("Setting this is a parent would result in a lineage that never reaches the camera" );
    }
    this.parent = parent;
};

alpha_Physical.prototype.GetParent = function()
{
    return this.parent;
};

//------------------------------------------
//-----------  MODELVIEW MATRIX ------------
//------------------------------------------

alpha_Physical.prototype.SetScale = function()
{
    this.scale.Set.apply(this.scale, arguments);
    this.modelDirty = true;
};

alpha_Physical.prototype.GetScale = function()
{
    return this.scale;
};

// combine our position and orientation into a matrix;
alpha_Physical.prototype.GetModelMatrix = function()
{
    var x, y, z;
    x = this.velocity[0];
    y = this.velocity[1];
    z = this.velocity[2];
    if(x != 0 || y != 0 || z != 0) {
        this.ApplyVelocity();
    }

    // if w == 1 then a 4d vector is a position
    // if w == 0 then a 4d vector is a direction
    if(this.modelDirty) {
        // this.modelMatrix = rotation * translation;
        // this.modelMatrix.FromQuaternionAtVector(self.orientation, self.position);
        var m = this.modelMatrix;
        // this.modelMatrix = rotate * translate * identity
        m.Identity();

        switch(this.modelMode) {
        case alpha_PHYSICAL_TRANSLATE_ROTATE_SCALE:
            m.Translate(this.position);
            m.Rotate(this.orientation);
            m.Scale(this.scale);
            break;
        case alpha_PHYSICAL_SCALE_ROTATE_TRANSLATE:
            m.Scale(this.scale);
            m.Rotate(this.orientation);
            m.Translate(this.position);
            break;
        case alpha_PHYSICAL_ROTATE_TRANSLATE_SCALE:
            m.Rotate(this.orientation);
            m.Translate(this.position);
            m.Scale(this.scale);
            break;
        }

        this.modelDirty = false;

    }

    return this.modelMatrix;
}

// when fully returned it looks like this
// A -> B -> CAM -> A -> B
// Mults as A * B * (CAM * A * B):Inverse()

// in order for this to work properly make sure that the camera's
// GetViewMatrix() is called before any physicals
// otherwise the physical's will be outdated
// this is to prevent having to retrace the camera's lineage more than once

// this would be a good thing to do for any matrix that has many descendants
// say a ship with lots of npcs / players on it

// but this would require a proper ordering of physicals
// which isn't feasible atm
// physicals would need to know who is the child of who.
// something like:
/*
	camera:CalculateViewMatrix();
	while SomePhysicalsNotCalculated do
		for all physicalsNotCalculated do
			if parentPhysicalCalculated then
				physical:CalculateViewMatrix()
			end
		end
	end	
*/

// a more feasible method would be to
// to have a bunch of children known by the physical
// then we simply chain down the list starting at the camera;
// this is a far better solution.
/*
	function CalculateViewMatrices()
		self:CalculateViewMatrix(); -- for myself
		for each child in children do
			child:CalculateViewMatrices() -- for my children
		end
	end
*/
// it starts with a simple camera:CalculateViewMatrices();
// I will return to this.

alpha_Physical.prototype.GetViewMatrix = function()
{
    // if this was just called then we need to set who sent it
    var requestor;
    if(arguments.length == 0) {
        requestor = this;
    }
    else {
        requestor = arguments[0];
    }

    if(this.parent && this.parent != requestor) {
        this.viewMatrix = this.GetModelMatrix().Multiplied(this.parent.GetViewMatrix(requestor));
        return this.viewMatrix;
    }
    else {
        return this.GetModelMatrix().Inverse();
    }
};

alpha_Physical.prototype.GetWorldPositionByViewMatrix = function()
{
    return new alpha_RMatrix4([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        this.position[0], this.position[1], this.position[2], 1
    ]).Multiply(this.GetViewMatrix().Inverse());
};

// legacy code; left in case I try this again
// it does not work correctly, in all cases
alpha_Physical.prototype.GetWorldPosition = function(requestor)
{
    var parent = this.parent;
    if(parent && parent != requestor) {
        var rot = parent.GetWorldOrientation(requestor);
        var pos = rot.RotatedVector(this.position);
        return pos.Add(parent.GetWorldPosition(requestor));
    };
    return this.position;
};

// legacy code; left in case I try this again
// it DOES work
alpha_Physical.prototype.GetWorldOrientation = function(requestor)
{
    var parent = this.parent;
    if(parent && parent != requestor) {
        return parent.GetWorldOrientation(requestor).Multiplied(this.orientation);
    }
    return self.orientation;
};

// Input Version 1.2.130825
// usage:
// local input = Input:New(glwidget)
// input:SetMouseSensitivityX( .05 ) // defaults to .05
// input:SetMouseSensitivityY( .05 ) // defaults to .05

// inside of a timing.every function
// Camera:MoveForward( input:W() * elapsed );
// Camera:YawLeft( input:LeftMouseButton() * input:MouseLeft() )
// some non-obvious buttons are:
// LeftMouseButton, RightMouseButton, MiddleMouseButton, SPACE, RETURN, SHIFT
// MouseUp, MouseDown, MouseLeft, MouseRight

// for a simple if statement do:
//	if input:Q() > 0 then
		// do stuff because Q is down
//	end

// MouseWheelUp() // returns 1 or more if you have scrolled up recently
// MouseWheelDegreesUp() // returns the number of degrees the wheel has scrolled recently

// add this to your code to make a command only work once per button push
/*
	if elapsed == 0 then
		done = false;
		return
	
	end
	if done then return end;
	done = true;
*/


function alpha_Input(surface, camera)
{
    this.SetMouseSensitivityX(.005);
    this.SetMouseSensitivityY(.005);

    this.surface = surface;
    this.camera = camera;
    this.startX = 0;
    this.endX = 0;
    this.startY = 0;
    this.endY = 0;
    this.mouseWheelUp = 0;
    this.mouseWheelDown = 0;
    this.grabbed = null;

    parsegraph_addEventMethod(document, "keydown", function(event) {
        if(this.onKeyDown(event.key)) {
            return;
        }
        if(event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        this[event.key.toLowerCase()] = 1;
    }, this);
    parsegraph_addEventMethod(document, "keyup", function(event) {
        this[event.key.toLowerCase()] = null;
    }, this);
    parsegraph_addEventMethod(surface.canvas(), "mousedown", function(event) {
        var button, x, y;
        button = event.button;
        x = event.clientX;
        y = event.clientY;
        this[button] = 1;

        // reset for a new drag
        this.startX = x;
        this.startY = y;
        this.endX = x;
        this.endY = y;
    }, this);

    parsegraph_addEventMethod(surface.canvas(), "mouseup", function(event) {
        var button, x, y;
        button = event.button;
        x = event.clientX;
        y = event.clientY;
        this[button] = null;

        // new end point;
        this.endX = x;
        this.endY = y;
    }, this);

    parsegraph_addEventMethod(surface.canvas(), "mousemove", function(event) {
        var x, y;
        x = event.clientX;
        y = event.clientY;
        this.endX = x;
        this.endY = y;
    }, this);

    var onWheel = function(event) {
        event.preventDefault();
        var wheel = normalizeWheel(event);

        if(wheel > 0) {
            this.mouseWheelUp = this.mouseWheelUp + wheel;
        }
        else if(wheel < 0) {
            // keeping it positive!
            this.mouseWheelDown = this.mouseWheelDown - wheel;
        }
        else {
            // I have no idea how I got here
        }
    };
    parsegraph_addEventListener(surface.canvas(), "DOMMouseScroll", onWheel, false);
    parsegraph_addEventListener(surface.canvas(), "mousewheel", onWheel, false);
};

alpha_Input.prototype.onKeyDown = function()
{
    if(this._keyDownListener) {
        return this._keyDownListener.apply(this._keyDownThisObject, arguments);
    }
    return false;
};

alpha_Input.prototype.SetOnKeyDown = function(listener, thisObject)
{
    this._keyDownListener = listener;
    this._keyDownThisObject = thisObject;
};

alpha_Input.prototype.Get = function(key)
{
    return this[key] ? 1 : 0;
};

alpha_Input.prototype.SetMouseSensitivityX = function(sensitivity)
{
    this.mouseSensitivityX = sensitivity;
};

alpha_Input.prototype.GetMouseSensitivityX = function()
{
    return this.mouseSensitivityX;
};

alpha_Input.prototype.SetMouseSensitivityY = function(sensitivity)
{
    this.mouseSensitivityY = sensitivity;
};

alpha_Input.prototype.GetMouseSensitivityY = function()
{
    return this.mouseSensitivityY;
};

// quick set both of them
alpha_Input.prototype.SetMouseSensitivity = function(sensitivity)
{
    this.SetMouseSensitivityX(sensitivity);
    this.SetMouseSensitivityY(sensitivity);
};

alpha_Input.prototype.MouseLeft = function()
{
    if(this.endX < this.startX) {
        var change = this.startX - this.endX;
        //console.log("mouse has moved right " + change);
        return change * this.GetMouseSensitivityX();
    }

    return 0;
};

alpha_Input.prototype.MouseRight = function()
{
    if(this.endX > this.startX) {
        var change = this.endX - this.startX;
        //console.log("mouse has moved left " + change);
        return change * this.GetMouseSensitivityX();
    }

    return 0;
};

alpha_Input.prototype.MouseUp = function()
{
    if(this.endY > this.startY) {
        var change = this.endY - this.startY;
        //console.log("mouse has moved down " + change);
        return change * this.GetMouseSensitivityY();
    }

    return 0;
};

alpha_Input.prototype.MouseDown = function()
{
    if(this.endY < this.startY) {
        var change = this.endY - this.startY;
        //console.log("mouse has moved up " + change);
        return change * this.GetMouseSensitivityY();
    }

    return 0;
};

// mouse wheel data is stored in 1/8 of a degree
// this returns how many ticks of a mousewheel of standard resolution
// has been seen before an Input:Update()
alpha_Input.prototype.MouseWheelUp = function()
{
    return this.mouseWheelUp / 120;
};

alpha_Input.prototype.MouseWheelDown = function()
{
    return this.mouseWheelDown / 120;
};

alpha_Input.prototype.MouseWheelDegreesUp = function()
{
    return this.mouseWheelUp / 8;
};

alpha_Input.prototype.MouseWheelDegreesDown = function()
{
    return this.mouseWheelDown / 8;
};

/**
 * Sets the start to the end, and clears mousewheel totals.
 */
alpha_Input.prototype.Update = function(elapsed)
{
    //console.log("Updating with elapsed: " + elapsed);
    if(this.Get("Shift") > 0) {
        elapsed = elapsed * 10;
    }

    if(this.Get("Shift") > 0) {
        elapsed = elapsed / 10;
    }

    //console.log("LeftMouseButton: " + this.Get("LeftMouseButton"));
    //console.log("MouseLeft: " + this.MouseLeft() * elapsed);
    //console.log("MouseLeft: " + (this.Get("LeftMouseButton") * this.MouseLeft() * elapsed));
    //console.log("LeftMouse: " + this.Get("LeftMouseButton"));
    //console.log("TurnLeft: " + this.MouseLeft() * elapsed);
    this.camera.TurnLeft(
        this.Get("LeftMouseButton") * this.MouseLeft() * elapsed
    );
    this.camera.TurnRight(
        this.Get("LeftMouseButton") * this.MouseRight() * elapsed
    );
    this.camera.PitchUp(
        this.Get("LeftMouseButton") * this.MouseUp() * elapsed
    );
    this.camera.PitchDown(
        this.Get("LeftMouseButton") * this.MouseDown() * elapsed
    );
    this.camera.MoveForward(this.MouseWheelDegreesUp() * elapsed);
    this.camera.MoveBackward(this.MouseWheelDegreesDown() * elapsed);
    //this.camera.ZoomIn(this.Get("y"), elapsed);
    //this.camera.ZoomOut(this.Get("h"), elapsed);

    this.camera.GetParent().MoveForward( 100*this.Get("t") * elapsed );
    this.camera.GetParent().MoveBackward( 100*this.Get("g") * elapsed );
    this.camera.GetParent().MoveLeft( 100*this.Get("f") * elapsed );
    this.camera.GetParent().MoveRight( 100*this.Get("h") * elapsed );


    this.camera.GetParent().MoveForward( this.Get("w") * elapsed );
    this.camera.GetParent().MoveBackward( this.Get("s") * elapsed );
    this.camera.GetParent().MoveLeft( this.Get("a") * elapsed );
    this.camera.GetParent().MoveRight( this.Get("d") * elapsed );
    this.camera.GetParent().MoveUp( this.Get(" ") * elapsed );
    this.camera.GetParent().MoveDown( this.Get("Shift") * elapsed );


    this.camera.GetParent().YawLeft( this.Get("j") * elapsed );
    this.camera.GetParent().YawRight( this.Get("l") * elapsed );
    this.camera.GetParent().PitchUp( this.Get("k") * elapsed );
    this.camera.GetParent().PitchDown( this.Get("i") * elapsed );
    this.camera.GetParent().RollLeft( this.Get("u") * elapsed );
    this.camera.GetParent().RollRight(this.Get("o") * elapsed );


    if(this.Get("RightMouseButton") > 0) {
        if(!this._done) {
            this.camera.AlignParentToMy(false, true);
            this._done = true;
        }
    }
    else {
        this._done = false;
    }
    this.startX = this.endX;
    this.startY = this.endY;
    this.mouseWheelUp = 0;
    this.mouseWheelDown = 0;
};
// -- Camera Version 2.1.130827
// -- TODO: learn more about projectionMatrix;
// -- TODO: disengage properly -- disable engage ( requires reparent )
// -- raytracing
// -- TODO: figure out aiming for third person

// ----------------------------------------------
// ------------------- CAMERA  ------------------
// ----------------------------------------------
// -- camera is a special case of physical
// -- so special that I've opted to not "descend it"
// -- it is always following a physical
// -- and it passes information to and from physicals

// the function returned by Camera();
function alpha_Camera(surface)
{
    this.fovX = alpha_toRadians(60.1);
    this.fovY = 0;

    // zoomFactor = zoomSpeed ^ elapsed -- strange but yields a nice zoom
    this.zoomSpeed = 1;
    this.zoomFactor = 1;
    this.farDistance = 2500;
    this.nearDistance = 1; // with collision detection I may be able to increase this
    this.surface = surface;
    if(!this.surface) {
        throw new Error("surface must not be null");
    }

    // Dimensions of the surface's size.
    this.width = null;
    this.height = null;

    this.projectionDirty = true; // dirty until you call UpdateProjection();
    this.projectionMatrix = new alpha_RMatrix4();
    this.modelDirty = true;
    this.modelMatrix = new alpha_RMatrix4();
    this.viewMatrix = new alpha_RMatrix4();

    this.pitch = 0; // a check value
    this.rotationSpeed = [1, 1];
    this.maxRange = 50;
    this.speed = 5; // speed the camera changes range at
    this.orientation = new alpha_Quaternion();
    this.position = new alpha_Vector();
    this.offset = new alpha_Vector();
    this.reengage = null; // here for completeness sake, setting it to null does null

    // not using disengage because we are not engaged
    this.SetParent(this.GetInvisiblePhysical(this));
}

alpha_Camera.prototype.toJSON = function()
{
    return {
        position: this.position.toJSON(),
        orientation: this.orientation.toJSON()
    };
};

alpha_Camera.prototype.restore = function(json)
{
    this.position.restore(json.position);
    this.orientation.restore(json.orientation);
    console.log(this.toJSON());
};

alpha_Camera_Tests = new parsegraph_TestSuite("alpha_Camera");

alpha_Camera_Tests.addTest("alpha_Camera", function(resultDom) {
    var surface = new parsegraph_Surface();
    var widget = new alpha_GLWidget(surface);
    var cam = new alpha_Camera(surface);

    //console.log(cam.GetModelMatrix().toString());
    cam.GetViewMatrix();
});

// ----------------------------------------------
// ------------ PROJECTION MATRIX ---------------
// ----------------------------------------------

// -- we set FOV in degrees
// -- we get in radians;
alpha_Camera.prototype.SetFovX = function(fovX)
{
    this.fovX = alpha_toRadians(fovX);
    this.projectionDirty = true;
}

alpha_Camera.prototype.SetFovY = function(fovY)
{
    this.fovY = alpha_toRadians(fovY);
    this.projectionDirty = true;
}

alpha_Camera.prototype.GetFovX = function()
{
    // autoadjust if fovX == 0
    var fovX = this.fovX;
    if(!fovX || fovX == 0) {
        var aspect = this.width / this.height;
        fovX = this.fovY * aspect;
    }

    return fovX;
}

alpha_Camera.prototype.GetFovY = function()
{
    var fovY = this.fovY;
    // autoadjust if fovY == 0
    if(!fovY || fovY == 0) {
        var aspect = this.width / this.height;
        fovY = this.fovX / aspect;
    }
    return fovY;
    // if you set them both to zero, you won't see anything. Working as expected.
}

// sets the fov
// unless you have a huge screen and sit very close I do not recommend
// width = width of the viewport
// distance = distance of eyes from viewport
// use the same units for both;
alpha_Camera.prototype.SetProperFOV = function(vpWidth, eyeDistance)
{
    var fovx = Math.atan((vpWidth * 0.5) / eyeDistance) * 2;
    this.SetFovY(0); // set this to autoadjust;
    this.SetFovX(alpha_toDegrees(fovx)); // and set this to the proper fov;
}

alpha_Camera.prototype.SetZoom = function(factor)
{
    if(factor < 1) {
        return false; // assholes
    }

    this.zoomFactor = factor;
    this.projectionDirty = true;
    return this.zoomFactor;
}

alpha_Camera.prototype.GetZoom = function()
{
    return this.zoomFactor;
}

alpha_Camera.prototype.SetZoomSpeed = function(speed)
{
    this.zoomSpeed = speed;
    return this.zoomSpeed;
}

alpha_Camera.prototype.ZoomIn = function(bind, elapsed)
{
    if(!bind || bind <= 0) {
        return false;
    }
    else if(bind > 1) {
        bind = 1;
    }

    var zoom = this.zoomFactor + Math.pow(this.zoomSpeed, bind * elapsed);
    if(zoom < 1) {
        zoom = 1;
    }
    return this.SetZoom(zoom);
}

alpha_Camera.prototype.ZoomOut = function(bind, elapsed)
{
    if(!bind || !elapsed) {
        return false;
    }

    if(bind <= 0) {
        return false;
    }
    else if(bind > 1) {
        bind = 1;
    }

    var zoom = this.zoomFactor - Math.pow(this.zoomSpeed, bind * elapsed);
    if(zoom < 1) {
        zoom = 1;
    }
    return this.SetZoom(zoom);
}

alpha_Camera.prototype.CancelZoom = function()
{
    return this.SetZoom(1);
}

// continues to zoom until the zoom is reached;
// broken until I am less tired
alpha_Camera.prototype.ZoomUntil = function(zoom, bind, elapsed)
{
    if(!zoom || !bind || !elapsed) {
        return false;
    }
    if(bind <= 0) {
        return false;
    }

    var factor = this.zoomFactor;
    if(zoom > factor) {
        // need to increase zoom;
        if(this.ZoomIn(1, elapsed) > factor) {
            // oops we overshot
            this.SetZoom(factor);
        }
    }
    if(zoom < factor) {
        // XXX
    }
}

// anything further than this is clipped
alpha_Camera.prototype.SetFarDistance = function(distance)
{
    this.farDistance = distance;
    this.projectionDirty = true;
}

alpha_Camera.prototype.GetFarDistance = function()
{
    return this.farDistance;
}

// anything nearer than this is clipped
alpha_Camera.prototype.SetNearDistance = function(distance)
{
    this.nearDistance = distance;
    this.projectionDirty = true;
}

alpha_Camera.prototype.GetNearDistance = function()
{
    return this.nearDistance;
}

alpha_Camera.prototype.UpdateProjection = function()
{
    if(arguments.length === 0) {
        // http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
        // Lookup the size the browser is displaying the canvas.
        var displayWidth = this.surface.container().clientWidth;
        var displayHeight = this.surface.container().clientHeight;

        if(displayWidth == 0 || displayHeight == 0) {
            //console.log("No projection available.");
            return;
        }

        // Check if the canvas is not the same size.
        if(
            this.surface.canvas().width != displayWidth
            || this.surface.canvas().height != displayHeight
        ) {
            // Make the canvas the same size
            this.surface.canvas().width = displayWidth;
            this.surface.canvas().height = displayHeight;

            // Set the viewport to match
            this.surface.gl().viewport(
                0, 0, this.surface.canvas().width, this.surface.canvas().height
            );
        }

        this.width = this.surface.canvas().width;
        this.height = this.surface.canvas().height;
    }
    else {
        this.width = arguments[0];
        this.height = arguments[1];
        this.surface.gl().viewport(
            0, 0, this.width, this.height
        );
    }

    this.projectionMatrix.Set(makePerspective(
        this.GetFovX() / this.zoomFactor,
        this.width / this.height,
        this.nearDistance,
        this.farDistance
    ));
    this.projectionDirty = false;
    return this.projectionMatrix;
};

// -------------------------------------
// ------------ Rotation ---------------
// -------------------------------------

alpha_Camera.prototype.SetOrientation = function()
{
    this.orientation.Set.apply(this.orientation, arguments);
    this.modelDirty = true;
}

// returns as Quaternion
alpha_Camera.prototype.GetOrientation = function()
{
    return this.orientation;
}

// in radians / second
alpha_Camera.prototype.SetRotationSpeeds = function(x, y)
{
    var rSpeed = this.rotationSpeed;
    rSpeed[0] = x;
    rSpeed[1] = y;
}

alpha_Camera.prototype.GetRotationSpeeds = function()
{
    var rSpeed = this.rotationSpeed;
    return rSpeed;
}

alpha_Camera.prototype.SetRotationSpeed = function(speed)
{
    var rSpeed = this.rotationSpeed;
    rSpeed[0] = speed;
    rSpeed[1] = speed;
}

alpha_Camera.prototype.Pitch = function(angle)
{
    // if you aren't rotating about an angle, then you aren't rotating
    if(angle == 0) {
        return;
    }

    // preventing tons of tiny adjustments
    var pi_2 = Math.PI / 2;
    if(this.pitch >= pi_2 && angle > 0) {
        return false;
    }
    if(this.pitch <= -pi_2 && angle < 0) {
        return false;
    }

    var pitch = this.pitch + angle;

    if(pitch < -pi_2) {
        // reduce the angle so that it makes pitch == -pi;
        angle = -pi_2 - this.pitch;
        pitch = -pi_2;
    }

    if(pitch > pi_2) {
        // reduce the angle so that it makes pitch == pi;
        angle = pi_2 - this.pitch;
        pitch = pi_2;
    }

    this.pitch = pitch;
    // now rotate by that angle about the x axis;
    var q = new alpha_Quaternion();
    q.FromAxisAndAngle(1, 0, 0, angle);
    this.SetOrientation(this.orientation.Multiplied(q));
}

alpha_Camera.prototype.Turn = function(angle)
{
    // if you aren't rotating about an angle, then you aren't rotating
    if(angle == 0) {
        return;
    }

    var q = new alpha_Quaternion();
    q.FromAxisAndAngle(0, 1, 0, angle);
    this.SetOrientation(q.Multiply(this.GetOrientation()));
}

// these rotations take place at the speeds set by rotationSpeed
alpha_Camera.prototype.TurnLeft = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[1];
    this.Turn(angle);
}

alpha_Camera.prototype.TurnRight = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[1];
    this.Turn(-angle);
}

alpha_Camera.prototype.PitchUp = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[0];
    this.Pitch(angle);
}

alpha_Camera.prototype.PitchDown = function(elapsed)
{
    var angle = elapsed * this.rotationSpeed[0];
    this.Pitch(-angle);
}

// set which axis you want to align to
alpha_Camera.prototype.AlignParentToMy = function(x, y)
{
    var q = new alpha_Quaternion();
    if(x == 0) {
        x = false;
    }
    if(y == 0) {
        y = false;
    }
    var pitch = this.pitch;
    // no matter what, when we leave here there will be no pitch;
    this.pitch = 0;

    var parent = this.GetParent();
    // if we want to match yaw only
    if(y && !x) {
        // find the quaternion of our pitch; inverted.
        q.FromAxisAndAngle(1, 0, 0, -pitch);
        // our yaw in player space
        q = parent.GetOrientation().Multiplied(this.GetOrientation()).Multiplied(q);
        // set the parent to the new quaternion
        parent.SetOrientation(q);
        // set the camera to default identity
        // these makes the camera not move
        this.SetOrientation(0, 0, 0, 1);
        // set our pitch back to where it was
        this.Pitch(pitch);
    }
    // if we want to match pitch only
    // no idea why you would want to do this
    else if(x && !y) {
        // the quaternion of our pitch
        q.FromAxisAndAngle(1, 0, 0, pitch);
        // our pitch in parent space;
        q = parent.GetOrientation().Multiplied(q);
        parent.SetOrientation(q);
        this.SetOrientation(0, 0, 0, 1);

        // not bothering to set our yaw back to where it was because
        // this option shouldn't be used
        // it's bizarre

        // match pitch and yaw with the camera
    }
    else {
        // camera's orientation in parent space
        q = parent.GetOrientation().Multiplied(this.GetOrientation());
        parent.SetOrientation(q);
        this.SetOrientation(0, 0, 0, 1);
    }
}

// -------------------------------------
// ------------ POSITION ---------------
// -------------------------------------

// send as x,y,z or vector
alpha_Camera.prototype.SetPosition = function(x, y, z)
{
    //console.log(new Error("Setting position to " + x + " " + y + " " + z));
    if(y == undefined) {
        y = x[1];
        z = x[2];
        x = x[0];
    }
    this.position.Set(x, y, z);
    this.modelDirty = true;
    return this.position;
}

alpha_Camera.prototype.SetRange = function(range)
{
    return this.SetPosition(0, 0, range);
}

// return as Vector
alpha_Camera.prototype.GetPosition = function()
{
    return this.position;
}

alpha_Camera.prototype.ChangePosition = function(x, y, z)
{
    if(y === undefined) {
        y = x[1];
        z = x[2];
        x = x[0];
    }
    this.SetPosition(this.position.Added(x, y, z));
}

// offset from the physical
alpha_Camera.prototype.SetOffset = function(x, y, z)
{
    if(y == undefined) {
        y = x[1];
        z = x[2];
        x = x[0];
    }
    this.offset.Set(x, y, z);
    this.modelDirty = true;
}

// return as Vector
alpha_Camera.prototype.GetOffset = function()
{
    return this.offset;
}

alpha_Camera.prototype.ChangeOffset = function(x, y, z)
{
    if(y == undefined) {
        y = x[1];
        z = x[2];
        x = x[0];
    }
    this.SetOffset(this.offset.Added(x, y, z));
}

// ------------------------------------------
// -----------  MOVEMENT --------------------
// ------------------------------------------

alpha_Camera.prototype.SetMaxRange = function(maxRange)
{
    this.maxRange = maxRange;
    return this.maxRange;
}

alpha_Camera.prototype.GetMaxRange = function()
{
    return this.maxRange;
}

// camera movement is easy; it can only move in and out
alpha_Camera.prototype.Warp = function(distance)
{
    var z = this.position[2];

    // preventing tons of tiny adjustments
    if(z <= 0 && distance < 0) {
        return;
    }
    if(z >= this.maxRange && distance > 0) {
        return;
    }

    // add it to our current position to get our new position
    /*var cz = z + distance;
    if(cz < 0) {
        distance = -z;
    }
    if(cz > this.maxRange) {
        distance = this.maxRange - z;
    }*/

    this.ChangePosition(0, 0, distance);
}

alpha_Camera.prototype.WarpIn = function(distance)
{
    this.Warp(-distance);
}

alpha_Camera.prototype.WarpOut = function(distance)
{
	this.Warp(distance);
}
// alias for end-user use

// ------------------------------------------
// --------------- VELOCITY -----------------
// ------------------------------------------

// -- since we can only move in one direction
// -- there isn't any velocity
// -- these are the commands needed for expected movement
alpha_Camera.prototype.SetSpeed = function(speed)
{
    this.speed = speed;
}

alpha_Camera.prototype.GetSpeed = function()
{
    return this.speed;
}

alpha_Camera.prototype.MoveForward = function(elapsed)
{
    var distance = elapsed * this.speed;
    this.Warp(-distance);
}

alpha_Camera.prototype.MoveBackward = function(elapsed)
{
    var distance = elapsed * this.speed;
    this.Warp(distance);
}

// ------------------------------------------
// --------------  PARENTING ----------------
// ------------------------------------------

// CAMERAS MAKE THE BEST PARENTS
alpha_Camera.prototype.IsGoodLineageFor = function(prospectiveChild)
{
    return true;
}

alpha_Camera.prototype.GetInvisiblePhysical = function(parent)
{
    var position;
    var orientation;

    if(this.parent) {
        var currentParent = this.GetParent();
        position = currentParent.GetPosition();
        orientation = currentParent.GetOrientation();
    }
    else {
        // this shouldn't happen outside of construction;
        position = this.position;
        orientation = this.orientation;
    }

    var p = new alpha_Physical(this);
    p.SetPosition(position);
    p.SetOrientation(orientation);
    if(this.parent) {
        p.SetParent(this.parent);
    }
    return p;
}

// enables free floating
alpha_Camera.prototype.Disengage = function()
{
    if(!this.freefloating) {
        this.reengage = this.parent;
        this.SetParent(this.GetInvisiblePhysical(this));
        this.freefloating = true;
    }
}

// sends it back to its previous physical
alpha_Camera.prototype.Engage = function()
{
    if(this.freefloating) {
        //this.parent.Destroy(); // get rid of the invisible fucker
        // if called from setparent reengage is already updated
        // just set this bool so we don't go in an infinite loop
        // been there, it sucks  -- GOD
        this.freefloating = false;
        this.SetParent(this.reengage);
        this.reengage = this.parent;
    }
}

alpha_Camera.prototype.SetParent = function(parent)
{
    // setting the camera to itself sets it to an invisble physical
    if(this == parent) {
        this.Disengage();
        return;
    }

    // drunken me says this works
    // lets see if he is as stupid as I suspect;
    if(this.freefloating) {
        this.reengage = parent;
        this.Engage();
        return;
    }
    else {
        this.reengage = this.parent; // who we reengage to;
    }

    this.parent = parent;
}

alpha_Camera.prototype.GetParent = function()
{
    return this.parent;
}

// ----------------------------------------------
// ------------- MODELVIEW MATRIX ---------------
// ----------------------------------------------

// -- combine position, offset and orientation into a matrix;
alpha_Camera.prototype.GetModelMatrix = function()
{
    if(this.modelDirty) {
        var p = this.position;
        var o = this.offset;
        var r = this.orientation;
        //console.log("position=", p.toString());
        //console.log("offset=", o.toString());
        //console.log("orientation=", r.toString());
        this.modelMatrix.FromVectorAroundQuaternionAtVector(p, r, o); // oh yea;
        //console.log("modelMat=", this.modelMatrix.toString());
        this.modelDirty = false;
    }
    return this.modelMatrix;
}

// it chains backwards until it finds a parent of itself;
// sees as
// C -> A -> B -> C
// Stops:----^
// Mults as (C * A * B):Inverse()
alpha_Camera.prototype.GetViewMatrix = function(requestor)
{
    var parent = this.parent;
    if(requestor) {
        // the camera is always loaded first(properly)
        // therefore if something other than the camera asks for camera info
        // simply give it to them.
        return this.viewMatrix;
    }
    else {
        requestor = this;
    }

    //console.log("this.modelMatrix:\n" + this.GetModelMatrix());
    if(parent && parent != requestor) {
        var ancestors = parent.GetViewMatrix(requestor);
        //console.log("this.modelMatrix:\n" + this.GetModelMatrix());
        //console.log("parent.viewMatrix:\n" + ancestors.toString());
        //console.log("modelMatrix * ancestors:\n" + this.GetModelMatrix().Multiplied(ancestors));
        this.viewMatrix = this.GetModelMatrix().Multiplied(ancestors);
        //console.log("this.viewMatrix:\n" + this.viewMatrix.toString());
        return this.viewMatrix;
    }
    else {
        // you could also do a dummy identity matrix as the ancestor
        // but why do extra math?
        return this.GetModelMatrix().Inversed();
    }
};
// Version 1.5

/*
			[Vector]    [Color]
			  |         |
			 [Face]     [Skin]
			  |         |
			 [Shape] ---BlockType
			            |
			            ID -- just a number in a table with the BlockType as its value
			            |
		[alpha_Block(id, x, y, z, orientation)]
			            |
		    [alpha_Cluster(blockTypes)]

some of the above classes are really basic
really nothing but tables
they exist to make it easier to piece things together
hopefully
*/

//--------------------------------------------
//--------------------------------------------
//---------------  Colors  -------------------
//--------------------------------------------
//--------------------------------------------
// a simple class to make it easier to create colors;
// usage:
// local brown = Color( {.5,.25,1} ) or Color( .5,.25,1)
// local tan = Color( 203, 133, 63);
// local darkbrown = Color( "#3b2921")

function alpha_Color()
{
    this[0] = 0;
    this[1] = 0;
    this[2] = 0;
    this.length = 3;

    if(arguments.length > 0) {
        this.Set.apply(this, arguments);
    }
};

alpha_Color.prototype.asRGB = function() {
    return "rgb(" +
        Math.round(this[0] * 255) + ", " +
        Math.round(this[1] * 255) + ", " +
        Math.round(this[2] * 255) + ")"
};

alpha_Color_Tests = new parsegraph_TestSuite("alpha_Color");

alpha_Color_Tests.addTest("alpha_Color.<constructor>", function(resultDom) {
    var v = new alpha_Color(.1, .2, .3);
    if(v[0] != .1 || v[1] != .2 || v[2] != .3) {
        resultDom.appendChild(document.createTextNode(v));
        return "Constructor must accept arguments.";
    }

    v = new alpha_Color();
    if(v[0] != 0 || v[1] != 0 || v[2] != 0) {
        resultDom.appendChild(document.createTextNode(v));
        return "Constructor must allow zero-arguments.";
    }
});

alpha_Color.prototype.Set = function()
{
    var r, g, b;
    if(arguments.length > 1) {
        r = arguments[0];
        g = arguments[1];
        b = arguments[2];
    }
    else if(typeof arguments[0] === "number") {
        r = arguments[0];
        g = arguments[0];
        b = arguments[0];
    }
    else if(typeof arguments[0] === "string") {
        // passed a hex color (hopefully)
        var start = 0;
        if(arguments[0].charAt(0) === '#') {
            // strip the # from it
            start = 1;
        }
        r = Number.parseInt(arguments[0].substring(start, start + 2), 16);
        g = Number.parseInt(arguments[0].substring(start + 2, start + 4), 16);
        b = Number.parseInt(arguments[0].substring(start + 4, start + 6), 16);
    }
    else {
        r = arguments[0][0];
        g = arguments[0][1];
        b = arguments[0][2];
    }

    if(r > 1) {
        r = r / 255;
    }
    if(g > 1) {
        g = g / 255;
    }
    if(b > 1) {
        b = b / 255;
    }

    this[0] = r;
    this[1] = g;
    this[2] = b;
};

alpha_Color_Tests.addTest("alpha_Color.Set", function() {
    var v = new alpha_Color(1);
    v.Set(.2);
    if(!v.Equals(new alpha_Color(.2, .2, .2))) {
        console.log(v);
        return "Set must allow single arguments.";
    }

    v.Set(.2, .3, .4);
    if(!v.Equals(new alpha_Color(.2, .3, .4))) {
        console.log(v);
        return "Set must allow multiple arguments."
    }

    v.Set(new alpha_Color(.2, .3, .4));
    if(!v.Equals(new alpha_Color(.2, .3, .4))) {
        console.log(v);
        return "Set must allow alpha_Colors as arguments."
    }
});

alpha_Color.prototype.Equals = function()
{
    if(arguments.length > 1) {
        for(var i = 0; i < this.length; ++i) {
            if(this[i] != arguments[i]) {
                return false;
            }
        }
    }
    else if(typeof arguments[0] === "number") {
        for(var i = 0; i < this.length; ++i) {
            if(this[i] != arguments[0]) {
                return false;
            }
        }
    }
    else {
        for(var i = 0; i < this.length; ++i) {
            if(this[i] != arguments[0][i]) {
                return false;
            }
        }
    }
    return true;
};

alpha_Color_Tests.addTest("alpha_Color.Equals", function() {
    var v = new alpha_Color(1);
    v.Set(.2);
    if(!v.Equals(.2)) {
        console.log(v);
        return "Equals must accept a single numeric argument."
    }

    v.Set(.2, .3, .4);
    if(!v.Equals(.2, .3, .4)) {
        console.log(v);
        return "Equals must accept mulitple arguments.";
    }

    v.Set(new alpha_Color(.2, .3, .4));
    if(!v.Equals(new alpha_Color(.2, .3, .4))) {
        console.log(v);
        return "Equals accepts single alpha_Color arguments."
    }
});

alpha_Color.prototype.toString = function()
{
    return "{" + this[0] + ", " + this[1] + ", " + this[2] + "}";
};

//--------------------------------------------
//--------------------------------------------
//---------------  Skin  ---------------------
//--------------------------------------------
//--------------------------------------------
// the skin object is simply an ordered list of colors
// one for each vertex of each face of a shape.
// a skin can only be applied to a shape with
// the same number of vertices
// you create a skin by passing it a nested table of colors
// skins aren't designed to be edited once created
// Skin( {
// 	{ green, green, green, green }, -- face 1 has 4 vertices
// 	{ brown, brown, brown, brown }, -- face 2
// 	{ brown, brown, brown, brown }, -- face 3
// 		--and so on until you have the full skin
// })
function alpha_Skin()
{
    if(arguments.length > 1) {
        // Passed faces directly.
        this.length = arguments.length;
        for(var i = 0; i < arguments.length; ++i) {
            var face = arguments[i];
            this[i] = [];
            for(var j = 0; j < face.length; ++j) {
                this[i].push(new alpha_Color(face[j]));
                var c = face[j];
            }
        }
    }
    else if(arguments.length > 0) {
        // Passed a single array of faces.
        this.length = arguments[0].length;
        for(var i = 0; i < arguments[0].length; ++i) {
            var face = arguments[0][i];
            this[i] = [];
            for(var j = 0; j < face.length; ++j) {
                this[i].push(new alpha_Color(face[j]));
                var c = face[j];
            }
        }
    }
    else {
        // An empty skin?
        this.length = 0;
    }
};

alpha_Skin_Tests = new parsegraph_TestSuite("alpha_Skin");

alpha_Skin_Tests.addTest("alpha_Skin.<constructor>", function(resultDom) {
    var green = new alpha_Color(0, 1, 0);
    var brown = new alpha_Color(.5, .5, 0);
    var skin = new alpha_Skin([
        [green, green, green, green], // face 1 has 4 vertices
        [brown, brown, brown, brown], // face 2
        [brown, brown, brown, brown] // face 3
    ]);
});

alpha_Skin.prototype.forEach = function(callback, thisArg)
{
    thisArg = thisArg || this;
    for(var i = 0; i < this.length; ++i) {
        callback.call(thisArg, this[i], i, this);
    }
};

alpha_Skin_Tests.addTest("alpha_Skin.forEach", function(resultDom) {
    var green = new alpha_Color(0, 1, 0);
    var brown = new alpha_Color(.5, .5, 0);
    var skin = new alpha_Skin([
        [green, green, green, green], // face 1 has 4 vertices
        [brown, brown, brown, brown], // face 2
        [brown, brown, brown, brown] // face 3
    ]);

    var maxRow = 0;
    skin.forEach(function(face, i) {
        maxRow = Math.max(maxRow, i);
        switch(i) {
            case 0:
                if(!face[0].Equals(green) || !face[1].Equals(green) || !face[2].Equals(green) || !face[3].Equals(green)) {
                    console.log(face);
                    throw new Error("Face 0 does not match");
                };
                break;
            case 1:
                if(!face[0].Equals(brown) || !face[1].Equals(brown) || !face[2].Equals(brown) || !face[3].Equals(brown)) {
                    console.log(face);
                    throw new Error("Face 1 does not match");
                };
                break;
            case 2:
                if(!face[0].Equals(brown) || !face[1].Equals(brown) || !face[2].Equals(brown) || !face[3].Equals(brown)) {
                    console.log(face);
                    throw new Error("Face 2 does not match");
                };
                break;
        }
    });

    if(maxRow != 2) {
        return "Unexpected number of rows iterated: " + maxRow;
    }
});

alpha_TRIANGLES = 0;
alpha_QUADS = 1;

//--------------------------------------------
//--------------------------------------------
//---------------  Face  ---------------------
//--------------------------------------------
//--------------------------------------------
// face is a simple grouping of vertices
// designed to be rendered by 1 call of GL_QUADS
// or its ilk
// local cubeTop = new alpha_Face(alpha_QUADS, vector, vector, vector, vector);
//
// Face does not copy the vectors.
// because its a temporary construction
// Once it is passed to a shape the shape will copy it
// DO NOT REUSE ( until after the face is applied to a shape )
function alpha_Face()
{
    this.drawType = arguments[0];

    if(arguments.length > 2) {
        this.length = (arguments.length - 1);
        for(var i = 1; i < arguments.length; ++i) {
            this[i - 1] = arguments[i];
        }
    }
    else {
        this.length = arguments[1].length;
        for(var i = 0; i < arguments[1].length; ++i) {
            this[i] = arguments[1][i];
        }
    }
};

alpha_Face.prototype.Clone = function()
{
    var values = [];
    for(var i = 0; i < this.length; ++i) {
        values.push(this[i].Clone());
    }
    return new alpha_Face(this.drawType, values);
};

alpha_Face.prototype.toString = function()
{
    var rv = "";
    for(var i = 0; i < this.length; ++i) {
        if(i > 0) {
            rv += ", ";
        }
        rv += this[i].toString();
    }
    return rv;
};

//--------------------------------------------
//--------------------------------------------
//--------------  Shape  ---------------------
//--------------------------------------------
//--------------------------------------------
// shape is a list of faces
// tha when all drawn will make some sort of ...
// SHAPE -- SURPISE!
// initialize it with a list of faces;
// var CUBE = new alpha_Shape(
    // cubeTop,
    // cubeBottom,
    // cubeLeft,
    // cubeRight,
    // cubeFront,
    // cubeBack
// )
function alpha_Shape()
{
    this.length = arguments.length;
    for(var i = 0; i < arguments.length; ++i) {
        this[i] = arguments[i].Clone();
    }
}

//--------------------------------------------
//--------------------------------------------
//----------- BlockTypes  --------------------
//--------------------------------------------
//--------------------------------------------
// Blocktype is where you combine a Shape(pos vec) with A Skin(color vec)
// var stone = new alpha_BlockType("stone", "cube", Stone, graySkin)
// BlockType automatically loads created BlockTypes into the BlockIDs table
// it is some sort of hybrid object / masterlist

function alpha_BlockTypes()
{
    this.blockIDs = [];
    this.descriptions = [];
}

alpha_BlockTypes.prototype.Load = function(descSkin, descShape, skin, shape)
{
    return this.Create(descSkin, descShape, skin, shape);
};

/**
 * creates a blocktype and returns the id.
 */
alpha_BlockTypes.prototype.Create = function(descSkin, descShape, skin, shape)
{
    for(var i = 0 ; i < shape.length; ++i) {
        var face = shape[i];
        for(var j = 0; j < face.length; ++j) {
            if(!skin[i] || !skin[i][j]) {
                throw new Error("Skin is too damn small");
                // however I will let you wear it if its a little large!
            }
        }
    }
    if(!this.descriptions[descSkin]) {
        // these descriptions aren't already in use
        this.descriptions[descSkin] = {};
        this.descriptions[descSkin][descShape] = {};
    }
    else if(this.descriptions[descSkin][descShape]) {
        throw new Error("This Shape and Skin description combo is already in use");
    }
    else {
        this.descriptions[descSkin][descShape] = {};
    }

    var blockType = [shape, skin];
    this.blockIDs.push(blockType);
    this.descriptions[descSkin][descShape] = (this.blockIDs.length - 1);
    return this.descriptions[descSkin][descShape];
};

alpha_BlockTypes.prototype.Get = function()
{
    if(arguments.length == 1) {
        var id = arguments[0];
        return this.blockIDs[id];
    }
    var descSkin, descShape;
    descSkin = arguments[0];
    descShape = arguments[1];
    if(this.descriptions[descSkin] == undefined) {
        console.log(this.descriptions);
        throw new Error("No such skin description exists for '" + (descSkin || "") + "'");
    }
    else if(this.descriptions[descSkin][descShape] == undefined) {
        throw new Error("No such shape description exists for '" + (descShape || "") + "'");
    }
    return this.descriptions[descSkin][descShape];
};

alpha_BlockTypes_Tests = new parsegraph_TestSuite("alpha_BlockTypes");

alpha_BlockTypes_Tests.addTest("alpha_BlockTypes", function(resultDom) {
    var types = new alpha_BlockTypes();

    var white = new alpha_Color(1, 1, 1);
    var dbrown = new alpha_Color("#3b2921");
    var lbrown = new alpha_Color("#604b42");
    var ggreen = new alpha_Color("#0b9615");
    var gray = new alpha_Color("#5e5a5e");
    var lgray = new alpha_Color("#726f72");

    var stone = new alpha_Skin(
        [lgray, gray, lgray, gray], // top
        [lgray, gray, lgray, gray], // front
        [lgray, gray, lgray, gray], // left
        [lgray, gray, lgray, gray], // back
        [lgray, gray, lgray, gray], // right
        [lgray, gray, lgray, gray], // bottom
        [lgray, gray, lgray, gray], // misc
        [lgray, gray, lgray, gray], // misc
        [lgray, gray, lgray, gray], // misc
        [lgray, gray, lgray, gray] // misc
    );

    // vertices!
    var cubeStructure = [
        new alpha_Vector(-0.5, 0.5, 0.5), // 1
        new alpha_Vector(0.5, 0.5, 0.5), // 2
        new alpha_Vector(0.5, 0.5, -0.5), // 3
        new alpha_Vector(-0.5, 0.5, -0.5), // 4
        new alpha_Vector(0.5, -0.5, 0.5), // 5
        new alpha_Vector(-0.5, -0.5, 0.5), // 6
        new alpha_Vector(-0.5, -0.5, -0.5), // 7
        new alpha_Vector(0.5, -0.5, -0.5) // 8
    ];
    var v = cubeStructure;

    // cube faces;
    var Top    = new alpha_Face(v[2], v[3], v[0], v[1]);
    var Front  = new alpha_Face(v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(v[6], v[7], v[4], v[5]);

    // turn the faces into shapes

    // top to bottom
    // counter-clockwise
    // front to back
    var CUBE = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );

    types.Create("stone", "cube", stone, CUBE);
    if(types.Get("stone", "cube") != types.Get("stone", "cube")) {
        return "Types do not match.";
    }
});

//--------------------------------------------
//--------------------------------------------
//--------------  Blocks ---------------------
//--------------------------------------------
//--------------------------------------------

function alpha_Block()
{
    var id, x, y, z, orientation;
    if(arguments.length > 3) {
        id = arguments[0];
        x = arguments[1];
        y = arguments[2];
        z = arguments[3];
        orientation = arguments[4];
    }
    else if(arguments.length === 3) {
        id = arguments[0];
        x = arguments[1][0];
        y = arguments[1][1];
        z = arguments[1][2];
        orientation = arguments[2];
    }
    else {
        throw new Error("Unexpected number of arguments: " + arguments.length);
    }

    this.id = id || 0;
    this.orientation = orientation || 0;
    if(this.orientation >= 24 || this.orientation < 0) {
        throw new Error("Orientation cannot be out of bounds: " + this.orientation);
    }

    this[0] = x;
    this[1] = y;
    this[2] = z;

    if(typeof this[0] !== "number" || typeof this[1] !== "number" || typeof this[2] !== "number") {
        throw new Error("All block components must be numeric.");
    }
}

function alpha_createBlock()
{
    if(arguments.length > 3) {
        return new alpha_Block(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
    }
    else if(arguments.length == 3) {
        return new alpha_Block(arguments[0], arguments[1], arguments[2]);
    }
    throw new Error("Unexpected number of arguments: " + arguments.length);
};

alpha_Block.prototype.Equals = function(other)
{
    var fuzziness = 1e-10;
    for(var i = 0; i < this.length; ++i) {
        if(Math.abs(this[n] - other[n]) > fuzziness) {
            // Found a significant difference.
            return false;
        }
    }

    // Equal.
    return true;
};

alpha_Block.prototype.GetAngleAxis = function()
{
    return alpha_BlockOrientations[this.orientation].ToAxisAndAngle();
};

// naively calling this function results in a quaternion that you can
// manipulate but not  destroy the Block.Orienations
// passing something to actual lets you avoid the overhead of making a new
// quaternion; and returns the same quaternion for the same rotation
// for better comparing
// in C these values would be const static
alpha_Block.prototype.GetQuaternion = function(actual)
{
    if(actual) {
        return alpha_BlockOrientations[this.orientation];
    }
    return new alpha_Quaternion(alpha_BlockOrientations[this.orientation])
};

var s45 = Math.sin(Math.PI/4) // Math.sqrt(2) / 2 or Math.sin(45)

alpha_BlockOrientations = [
    // BOTTOM
    // X( 0 )  Y( 0 )  Z( 0 )
    new alpha_Quaternion(0, 0, 0, 1), // 0
    // X( 0 )  Y( 90 )  Z( 0 )
    new alpha_Quaternion(0, s45, 0, s45), // 1
    // X( 0 )  Y( 180 )  Z( 0 )
    new alpha_Quaternion(0, 1, 0, 0), // 2
    // X( 0 )  Y( 270 )  Z( 0 )
    new alpha_Quaternion(0, s45, 0, -s45), // 3

    // FRONT
    // X( 90 )  Y( 0 )  Z( 0 )
    new alpha_Quaternion( -s45 ,    0 ,    0 , -s45 ), // 4
    // X( 90 )  Y( 90 )  Z( 0 )
    new alpha_Quaternion( -0.5 , -0.5 , -0.5 , -0.5 ), // 5
    // X( 90 )  Y( 180 )  Z( 0 )
    new alpha_Quaternion(    0 , -s45 , -s45 ,    0 ), // 6
    // X( 90 )  Y( 270 )  Z( 0 )
    new alpha_Quaternion(  0.5 , -0.5 , -0.5 ,  0.5 ), // 7

    // LEFT
    // X( 0 )  Y( 0 )  Z( 270 )
    new alpha_Quaternion(    0 ,  0   , -s45 ,  s45 ), // 8
    // X( 0 )  Y( 90 )  Z( 270 )
    new alpha_Quaternion(  0.5 ,  0.5 , -0.5 ,  0.5 ), // 9
    // X( 0 )  Y( 180 )  Z( 270 )
    new alpha_Quaternion(  s45 ,  s45 ,    0 ,    0 ), // 10
    // X( 0 )  Y( 270 )  Z( 270 )
    new alpha_Quaternion(  0.5 ,  0.5 ,  0.5 , -0.5 ), // 11

    // BACK
    // X( 270 )  Y( 0 )  Z( 0 )
    new alpha_Quaternion( -s45 ,    0 ,    0 ,  s45 ), // 12
    // X( 270 )  Y( 90 )  Z( 0 )
    new alpha_Quaternion( -0.5 ,  0.5 , -0.5 ,  0.5 ), // 13
    // X( 270 )  Y( 180 )  Z( 0 )
    new alpha_Quaternion(    0 ,  s45 , -s45 ,    0 ), // 14
    // X( 270 )  Y( 270 )  Z( 0 )
    new alpha_Quaternion(  0.5 ,  0.5 , -0.5 , -0.5 ), // 15

    // RIGHT
    // X( 0 )  Y( 0 )  Z( 90 )
    new alpha_Quaternion(    0 ,    0 , -s45 , -s45 ), // 16
    // X( 0 )  Y( 90 )  Z( 90 )
    new alpha_Quaternion(  0.5 , -0.5 , -0.5 , -0.5 ), // 17
    // X( 0 )  Y( 180 )  Z( 90 )
    new alpha_Quaternion(  s45 , -s45 ,    0 ,    0 ), // 18
    // X( 0 )  Y( 270 )  Z( 90 )
    new alpha_Quaternion(  0.5 , -0.5 ,  0.5 ,  0.5 ), // 19

    // TOP
    // X( 180 )  Y( 0 )  Z( 0 )
    new alpha_Quaternion(    1 ,    0 ,    0 ,    0 ), // 20
    // X( 180 )  Y( 90 )  Z( 0 )
    new alpha_Quaternion(  s45 ,    0 ,  s45 ,    0 ), // 21
    // X( 180 )  Y( 180 )  Z( 0 )
    new alpha_Quaternion(    0 ,    0 ,    1 ,    0 ), // 22
    // X( 180 )  Y( 270 )  Z( 0 )
    new alpha_Quaternion( -s45 ,    0 ,  s45 ,    0 ) // 23
];
alpha_FacePainter_VertexShader =
"uniform mat4 u_world;\n" +
"\n" +
"attribute vec3 a_position;\n" +
"attribute vec4 a_color;\n" +
"\n" +
"varying highp vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = u_world * vec4(a_position, 1.0);" +
    "contentColor = a_color;" +
"}";

alpha_FacePainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "gl_FragColor = contentColor;" +
"}";

/**
 * Draws 3d faces in a solid color.
 */
function alpha_FacePainter(gl)
{
    this.gl = gl;
    if(!this.gl || !this.gl.createProgram) {
        throw new Error("FacePainter must be given a GL interface");
    }

    this.faceProgram = this.gl.createProgram();

    this.gl.attachShader(
        this.faceProgram,
        compileShader(
            this.gl,
            alpha_FacePainter_VertexShader,
            this.gl.VERTEX_SHADER
        )
    );

    this.gl.attachShader(
        this.faceProgram,
        compileShader(
            this.gl,
            alpha_FacePainter_FragmentShader,
            this.gl.FRAGMENT_SHADER
        )
    );

    this.gl.linkProgram(this.faceProgram);
    if(!this.gl.getProgramParameter(
        this.faceProgram, this.gl.LINK_STATUS
    )) {
        throw new Error("FacePainter program failed to link.");
    }

    // Prepare attribute buffers.
    this.faceBuffer = parsegraph_createPagingBuffer(
        this.gl, this.faceProgram
    );
    this.a_position = this.faceBuffer.defineAttrib("a_position", 3);
    this.a_color = this.faceBuffer.defineAttrib("a_color", 4);

    // Cache program locations.
    this.u_world = this.gl.getUniformLocation(
        this.faceProgram, "u_world"
    );

    this.faceBuffer.addPage();
};

alpha_FacePainter_Tests = new parsegraph_TestSuite("alpha_FacePainter");

alpha_FacePainter_Tests.addTest("alpha_FacePainter", function(resultDom) {
    var widget = new alpha_GLWidget();
    var painter = new alpha_FacePainter(widget.gl());
});

alpha_FacePainter.prototype.Clear = function()
{
    this.faceBuffer.clear();
    this.faceBuffer.addPage();
};

alpha_FacePainter.prototype.Quad = function(v1, v2, v3, v4, c1, c2, c3, c4)
{
    this.Triangle(v1, v2, v3, c1, c2, c3);
    this.Triangle(v1, v3, v4, c1, c3, c4);
};

/**
 * painter.Triangle(v1, v2, v3, c1, c2, c3);
 *
 *
 */
alpha_FacePainter.prototype.Triangle = function(v1, v2, v3, c1, c2, c3)
{
    if(!c2) {
        c2 = c1;
    }
    if(!c3) {
        c3 = c1;
    }

    this.faceBuffer.appendData(
        this.a_position,
        v1[0], v1[1], v1[2],
        v2[0], v2[1], v2[2],
        v3[0], v3[1], v3[2]
    );
    if(c1.length == 3) {
        this.faceBuffer.appendData(
            this.a_color,
            c1[0], c1[1], c1[2], 1.0,
            c2[0], c2[1], c2[2], 1.0,
            c3[0], c3[1], c3[2], 1.0
        );
    } else {
        this.faceBuffer.appendData(
            this.a_color,
            c1[0], c1[1], c1[2], c1[3],
            c2[0], c2[1], c2[2], c2[3],
            c3[0], c3[1], c3[2], c3[3]
        );
    }
};

alpha_FacePainter.prototype.Draw = function(viewMatrix)
{
    if(!viewMatrix) {
        throw new Error("A viewMatrix must be provided");
    }
    // Render faces.
    this.gl.useProgram(
        this.faceProgram
    );
    this.gl.uniformMatrix4fv(
        this.u_world,
        false,
        viewMatrix.toArray()
    );
    this.faceBuffer.renderPages();
};
//--------------------------------------------
//--------------------------------------------
//-------------- Cluster  --------------------
//--------------------------------------------
//--------------------------------------------

/**
 * Cluster is where the information from blocks, blocktype, color and face
 * actually gets put to use it figures out how to draw the blocks that have
 * been added to it so that they can be drawn inside of 1 Matrix Push/Pop it
 * would probably not be efficient to put a lot of moving objects inside of a
 * single cluster as the cluster would have to be continuously updating
 * everytime a block was edited
 */
function alpha_Cluster(widget)
{
    if(!widget) {
        throw new Error("Cluster must be given a non-null alpha_GLWidget");
    }
    this.widget = widget;

    this.blocks = [];

    // Declare GL Painters; create them only when needed to delay GL context's creation.
    this.facePainter = null;
};

alpha_Cluster_Tests = new parsegraph_TestSuite("alpha_Cluster");

alpha_Cluster_Tests.addTest("alpha_Cluster", function(resultDom) {
    var widget = new alpha_GLWidget();

    // test version 1.0
    var cubeman = widget.BlockTypes.Get("blank", "cubeman");

    var testCluster = new alpha_Cluster(widget);
    testCluster.AddBlock(cubeman, 0,5,0,1);
    testCluster.CalculateVertices();
});

alpha_Cluster.prototype.HasBlock = function(block)
{
    for(var i = 0; i < this.blocks.length; ++i) {
        if(this.blocks[i] == block) {
            return i;
        }
    }
    return null;
};

alpha_Cluster.prototype.AddBlock = function()
{
    if(arguments.length > 1) {
        // Create a new block.
        this.blocks.push(alpha_createBlock.apply(null, arguments));
        return;
    }
    var block = arguments[0];
    if(!this.HasBlock(block)) {
        this.blocks.push(block);
    }
    return block;
};

alpha_Cluster.prototype.RemoveBlock = function(block)
{
    var i = this.HasBlock(block);
    if(i != null) {
        return this.blocks.splice(i, 1)[0];
    }
};

/**
 * pass a table of blocks and it will add the ones that are new
 */
alpha_Cluster.prototype.AddBlocks = function()
{
    if(arguments.length > 1) {
        for(var i = 0; i < arguments.length; ++i) {
            this.AddBlock(arguments[i]);
        }
    }
    else {
        for(var i = 0; i < arguments[0].length; ++i) {
            this.AddBlock(arguments[0][i]);
        }
    }
};

alpha_Cluster.prototype.ClearBlocks = function()
{
    this.blocks.splice(0, this.blocks.length);
};

alpha_Cluster.prototype.CalculateVertices = function()
{
    if(!this.facePainter) {
        this.facePainter = new alpha_FacePainter(this.widget.gl());
    }
    else {
        // delete what we had;
        this.facePainter.Clear();
    }

    this.blocks.forEach(function(block) {
        var quat = block.GetQuaternion( true );
        if(!quat) {
            //console.log(block);
            throw new Error("Block must not return a null quaternion");
        }

        // get the faces from the blocktype
        var bType = this.widget.BlockTypes.Get(block.id);
        if(!bType) {
            return;
        }
        var shape = bType[0];
        var skin = bType[1];

        for(var i = 0; i < shape.length; ++i) { // vertices is face!
            var face = shape[i];
            if(!face) {
                throw new Error("Shape must not contain any null faces");
            }
            var colors = skin[i];
            if(!colors) {
                throw new Error("Shape must not contain any null colors");
            }

            // every face has its own drawType;
            if(face.drawType == alpha_TRIANGLES) {
                // Process every vertex of the face.
                for(var j = 0; j < face.length; ++j) {
                    var vertex = face[j];
                    if(!vertex) {
                        throw new Error("Face must not contain any null vertices");
                    }
                    // get the color for this vertex;
                    var color = colors[j];
                    if(!color) {
                        throw new Error("Colors must not contain any null color values");
                    }

                    // rotate it; if it's not the default
                    if(block.orientation > 0) {
                        vertex = quat.RotatedVector(vertex);
                    }
                    // now translate it
                    vertex = vertex.Added(new alpha_Vector(block[0], block[1], block[2]));

                    // vector and cluster use the same indexes
                    this.facePainter.Triangle(
                        vertex[0],
                        vertex[1],
                        vertex[2],
                        color[0],
                        color[1],
                        color[2]
                    );
                }
            } else if(face.drawType == alpha_QUADS) {
                // Process every vertex of the face.
                for(var j = 0; j < face.length; j += 4) {
                    var v1 = face[j];
                    if(!v1) {
                        throw new Error("Face must not contain any null vertices (v1)");
                    }
                    var v2 = face[j + 1];
                    if(!v2) {
                        throw new Error("Face must not contain any null vertices (v2)");
                    }
                    var v3 = face[j + 2];
                    if(!v3) {
                        throw new Error("Face must not contain any null vertices (v3)");
                    }
                    var v4 = face[j + 3];
                    if(!v4) {
                        throw new Error("Face must not contain any null vertices (v4)");
                    }

                    // get the color for this vertex;
                    var c1 = colors[j];
                    if(!c1 ) {
                        throw new Error("Colors must not contain any null color values (c1)");
                    }
                    var c2 = colors[j + 1];
                    if(!c2 ) {
                        throw new Error("Colors must not contain any null color values (c2)");
                    }
                    var c3 = colors[j + 2];
                    if(!c3 ) {
                        throw new Error("Colors must not contain any null color values (c3)");
                    }
                    var c4 = colors[j + 3];
                    if(!c4 ) {
                        throw new Error("Colors must not contain any null color values (c4)");
                    }

                    // rotate it; if it's not the default
                    if(block.orientation > 0) {
                        v1 = quat.RotatedVector(v1);
                        v2 = quat.RotatedVector(v2);
                        v3 = quat.RotatedVector(v3);
                        v4 = quat.RotatedVector(v4);
                    }
                    // now translate it
                    if(typeof block[0] !== "number" || typeof block[1] !== "number" || typeof block[2] !== "number") {
                        //console.log(block);
                        throw new Error("Block must contain numeric components.");
                    }
                    v1 = v1.Added(new alpha_Vector(block[0], block[1], block[2]));
                    v2 = v2.Added(new alpha_Vector(block[0], block[1], block[2]));
                    v3 = v3.Added(new alpha_Vector(block[0], block[1], block[2]));
                    v4 = v4.Added(new alpha_Vector(block[0], block[1], block[2]));

                    // Translate quads to triangles
                    this.facePainter.Quad(v1, v2, v3, v4, c1, c2, c3, c4);
                }
            } else {
                throw new Error("Face must have a valid drawType property to read of either alpha_QUADS or alpha_TRIANGLES. (Given " + face.drawType + ")");
            }
        }
    }, this);
};

alpha_Cluster.prototype.Draw = function(viewMatrix)
{
    if(!this.facePainter) {
        this.CalculateVertices();
    }
    this.facePainter.Draw(viewMatrix);
};
// Version 1.3

// vertices!
function alpha_BuildCubeStructure()
{
    return [
        new alpha_Vector(-0.5, 0.5, 0.5), // 0
        new alpha_Vector(0.5, 0.5, 0.5), // 1
        new alpha_Vector(0.5, 0.5, -0.5), // 2
        new alpha_Vector(-0.5, 0.5, -0.5), // 3
        new alpha_Vector(0.5, -0.5, 0.5), // 4
        new alpha_Vector(-0.5, -0.5, 0.5), // 5
        new alpha_Vector(-0.5, -0.5, -0.5), // 6
        new alpha_Vector(0.5, -0.5, -0.5) // 7
    ];
};

function alpha_BuildSlabStructure()
{
    var slabStructure = alpha_BuildCubeStructure();
    for(var i = 0; i <= 3; ++i) {
        slabStructure[i].Add(0, -0.5, 0);
    }
    return slabStructure;
}

function alpha_standardBlockTypes(BlockTypes) {
    if(!BlockTypes) {
        throw new Error("BlockTypes must not be null");
    }

    // skins
    var white = new alpha_Color(1, 1, 1);
    var dbrown = new alpha_Color("#3b2921");
    var lbrown = new alpha_Color("#604b42");
    var ggreen = new alpha_Color("#0b9615");
    var gray = new alpha_Color("#5e5a5e");
    var lgray = new alpha_Color("#726f72");

    //top to bottom
    // counter-clockwise
    // front to back
    var dirt = new alpha_Skin(
        [lbrown, lbrown, lbrown, lbrown], // top
        [lbrown, lbrown, dbrown, dbrown], // front
        [lbrown, lbrown, dbrown, dbrown], // left
        [lbrown, lbrown, dbrown, dbrown], // back
        [lbrown, lbrown, dbrown, dbrown], // right
        [dbrown, dbrown, dbrown, dbrown] // bottom
    );

    var grass = new alpha_Skin(
        [ggreen, ggreen, ggreen, ggreen], // top
        [lbrown, lbrown, dbrown, dbrown], // front
        [lbrown, lbrown, dbrown, dbrown], // left
        [lbrown, lbrown, dbrown, dbrown], // back
        [lbrown, lbrown, dbrown, dbrown], // right
        [dbrown, dbrown, dbrown, dbrown] //bottom
    );

    var stone = new alpha_Skin(
        [lgray, gray, lgray, gray], // top
        [lgray, gray, lgray, gray], // front
        [lgray, gray, lgray, gray], // left
        [lgray, gray, lgray, gray], // back
        [lgray, gray, lgray, gray], // right
        [lgray, gray, lgray, gray], // bottom
        [lgray, gray, lgray, gray], // misc
        [lgray, gray, lgray, gray], // misc
        [lgray, gray, lgray, gray], // misc
        [lgray, gray, lgray, gray] // misc
    );

    // draw everthing in a face:
    // top to bottom
    // counter-clockwise ( facing the face )
    // front to back

    // with that priority;

    //        v4___________ v3
    //        |\ FRONT   |\   TOP
    //        | \v1______|_\  v2
    // LEFT   |__|_______|  |
    //        \v7|     v8\  | RIGHT
    //         \ | BOTTOM \ |
    //          \|_________\| v5
    //          v6  BACK

    //the relative directions are pretty messy

    // right now our cubes are centered on their position
    // later we may offset them so a cubes vertices are always an int;
    // of course that means for each rotation we will have to translate by .5
    // rotate, then translate back

    // cube faces;
    var v = alpha_BuildCubeStructure();
    var Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    // turn the faces into shapes

    // top to bottom
    // counter-clockwise
    // front to back
    var CUBE = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );

    BlockTypes.Create( "stone", "cube", stone, CUBE );
    BlockTypes.Create("dirt", "cube", dirt, CUBE);
    BlockTypes.Create("grass", "cube", grass, CUBE);

    // a slope lowers vertices 1 and 2 to 6 and 5;
    var slopeStructure = alpha_BuildCubeStructure();
    v = slopeStructure;
    for(var i = 0; i <= 1; ++i) {
        v[i].Add(0, -1, 0);
    }

    // this causes left and right to become triangles
    Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    Left   = new alpha_Face(alpha_TRIANGLES, v[3], v[6], v[5]);
    Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[1], v[7]);
    Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var SLOPE = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load("stone", "slope", stone, SLOPE);

    // there are 4 simple sloped corners for a fullsized cube;
    // split the top face into two triangles
    // with the triangle split top vs slant
    // ( better names to come in time)
    // a beveled corner  (1 top, 3 bottom -- actually 2 )
    // an inverted beveled corner ( 3 top, 1 bottom )

    // with the top split along the path downwards
    // a pyramid corner (1 top, 3 bottom)
    // an inverted pyramid corner ( 3 top, 1 bottom )

    // the beveled corner slope
    // lower 1, 2, and 3 to the bottom;
    var bcslopeStructure = alpha_BuildCubeStructure();
    v = bcslopeStructure;
    for(var i = 0; i <= 2; ++i) {
        v[i].Add(0, -1, 0);
    }

    // now top, right
    var Top    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[2]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_TRIANGLES, v[3], v[6], v[5]);
    var Bottom = new alpha_Face(alpha_TRIANGLES, v[6], v[7], v[5]);

    var CORNER_SLOPE = new alpha_Shape(
        Top,
        Front,
        Left,
        Bottom
    );
    BlockTypes.Load("stone", "corner_slope", stone, CORNER_SLOPE);

    var ibcslopeStructure = alpha_BuildCubeStructure();
    v = ibcslopeStructure;
    // 3 top, 1 bottom;
    v[1].Add(0, -1, 0);

    var Top    = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[0]);
    var Slope  = new alpha_Face(alpha_TRIANGLES, v[2], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var INVERTED_CORNER_SLOPE = new alpha_Shape(
        Top,
        Slope,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load("stone", "inverted_corner_slope", stone, INVERTED_CORNER_SLOPE);

    // pyramid corner ( 1 top, 3 bottom )
    var pcorner = alpha_BuildCubeStructure();
    var v = pcorner;
    for(var i = 0; i <= 2; ++i) {
        v[i].Add(0, -1, 0);
    }

    // now top, right
    var TopLeft    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[1]);
    var TopRight   = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_TRIANGLES, v[3], v[6], v[5]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);
    var PYRAMID_CORNER = new alpha_Shape(
        TopLeft,
        TopRight,
        Front,
        Left,
        Bottom
    );
    BlockTypes.Load("stone", "pyramid_corner", stone, PYRAMID_CORNER);

    // inverted pyramid corner ( 3 top, 1 bottom )
    var ipcorner = alpha_BuildCubeStructure();
    var v = ipcorner;
    v[1].Add(0, -1, 0);

    // now top, right
    var TopLeft    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[1]);
    var TopRight   = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var INVERTED_PYRAMID_CORNER = new alpha_Shape(
        TopLeft,
        TopRight,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "inverted_pyramid_corner", stone, INVERTED_PYRAMID_CORNER );

    var v = alpha_BuildSlabStructure();
    var Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);
    var SLAB = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );

    BlockTypes.Load("stone", "slab", stone, SLAB);

    // a slope lowers vertices 1 and 2 to 6 and 5;
    var slopeStructure = alpha_BuildCubeStructure();
    var v = slopeStructure;
    for(var i = 0; i <= 1; ++i) {
        v[i].Add(0, -0.5, 0);
    }
    // this causes left and right to become triangles
    var Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_TRIANGLES, v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[1], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var SLAB_SLOPE = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "slab_slope", stone, SLAB_SLOPE);


    var bcslopeStructure = alpha_BuildCubeStructure();
    var v = bcslopeStructure;
    for(var i = 0; i <= 2; ++i) {
        v[i].Add(0, -0.5, 0);
    }
    // now top, right
    var Top    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[2]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_TRIANGLES, v[3], v[6], v[5]);
    var Bottom = new alpha_Face(alpha_TRIANGLES, v[6], v[7], v[5]);

    var SLAB_CORNER = new alpha_Shape(
        Top,
        Front,
        Left,
        Bottom
    );
    BlockTypes.Load( "stone", "slab_corner", stone, SLAB_CORNER );

    var ibcslopeStructure = alpha_BuildCubeStructure();
    var v = ibcslopeStructure;
    // 3 top, 1 bottom;
    v[1].Add(0, -0.5, 0);
    var Top    = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[0]);
    var Slope  = new alpha_Face(alpha_TRIANGLES, v[2], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var SLAB_INVERTED_CORNER = new alpha_Shape(
        Top,
        Slope,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load("stone", "slab_inverted_corner", stone, SLAB_INVERTED_CORNER);

    // pyramid corner ( 1 top, 3 bottom )
    var pcorner = alpha_BuildCubeStructure();
    var v = pcorner;
    for(var i = 0; i <= 2; ++i) {
        v[i].Add(0, -0.5, 0);
    }
    // now top, right
    var TopLeft    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[1]);
    var TopRight   = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_TRIANGLES, v[3], v[6], v[5]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);
    var SLAB_PYRAMID_CORNER = new alpha_Shape(
        TopLeft,
        TopRight,
        Front,
        Left,
        Bottom
    );
    BlockTypes.Load( "stone", "slab_pyramid_corner", stone, SLAB_PYRAMID_CORNER );

    // inverted pyramid corner ( 3 top, 1 bottom )
    var ipcorner = alpha_BuildSlabStructure();
    var v = ipcorner;
    v[2].Add(0, -0.5, 0);
    // now top, right
    var TopLeft    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[1]);
    var TopRight   = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);


    var SLAB_INVERTED_PYRAMID_CORNER = new alpha_Shape(
        TopLeft,
        TopRight,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "slab_inverted_pyramid_corner", stone, SLAB_INVERTED_PYRAMID_CORNER );




    // a slope lowers vertices 1 and 2 to 6 and 5;
    var v = alpha_BuildCubeStructure();
    for(var i = 0; i <= 1; ++i) {
        v[i].Add(0, -0.5, 0);
    }
    // this causes left and right to become triangles
    var Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var SHALLOW_SLOPE = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "shallow_slope", stone, SHALLOW_SLOPE);

    // there are 4 simple sloped corners for a fullsized cube;
    // split the top face into two triangles
    // with the triangle split top vs slant
    // ( better names to come in time)
    // a beveled corner  (1 top, 3 bottom -- actually 2 )
    // an inverted beveled corner ( 3 top, 1 bottom )

    // with the top split along the path downwards
    // a pyramid corner (1 top, 3 bottom)
    // an inverted pyramid corner ( 3 top, 1 bottom )

    // the beveled corner slope
    // lower 1, 2, and 3 to the bottom;
    var bcslopeStructure = alpha_BuildCubeStructure();
    var v = bcslopeStructure;
    for(var i = 0; i <= 2; ++i) {
        v[i].Add(0, -0.5, 0);
    }
    // now top, right
    var Top    = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[0]);
    var Slope  = new alpha_Face(alpha_TRIANGLES, v[2], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[2], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var SHALLOW_CORNER = new alpha_Shape(
        Top,
        Slope,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "shallow_corner", stone, SHALLOW_CORNER );

    var v = alpha_BuildCubeStructure();
    // 3 top, 1 bottom;
    v[2].Add(0, -0.5, 0);
    var Top    = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[0]);
    var Slope  = new alpha_Face(alpha_TRIANGLES, v[2], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var SHALLOW_INVERTED_CORNER = new alpha_Shape(
        Top,
        Slope,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load("stone", "shallow_inverted_corner", stone, SHALLOW_INVERTED_CORNER);

    // pyramid corner ( 1 top, 3 bottom )
    var pcorner = alpha_BuildCubeStructure();
    var v = pcorner;
    for(var i = 0; i <= 2; ++i) {
        v[i].Add(0, -0.5, 0);
    }
    // now top, right
    var TopLeft    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[1]);
    var TopRight   = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);
    var SHALLOW_PYRAMID_CORNER = new alpha_Shape(
        TopLeft,
        TopRight,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "shallow_pyramid_corner", stone, SHALLOW_PYRAMID_CORNER );

    // inverted pyramid corner ( 3 top, 1 bottom )
    var ipcorner = alpha_BuildCubeStructure();
    var v = ipcorner;
    v[1].Add(0, -0.5, 0);
    // now top, right
    var TopLeft    = new alpha_Face(alpha_TRIANGLES, v[3], v[0], v[1]);
    var TopRight   = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);


    var SHALLOW_INVERTED_PYRAMID_CORNER = new alpha_Shape(
        TopLeft,
        TopRight,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "shallow_inverted_pyramid_corner", stone, SHALLOW_INVERTED_PYRAMID_CORNER );


    // an angled slab is a half slab cut in a right triangle
    var v = alpha_BuildSlabStructure();
    v[1].Add(0, 0, -1);
    v[4].Add(0, 0, -1);
    var Top    = new alpha_Face(alpha_TRIANGLES, v[2], v[3], v[0]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Bottom = new alpha_Face(alpha_TRIANGLES, v[6], v[7], v[5]);
    var ANGLED_SLAB = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Bottom
    );

    BlockTypes.Load("stone", "angled_slab", stone, ANGLED_SLAB);

    // half-slab
    var v = alpha_BuildSlabStructure();
    v[0].Add(0, 0, -0.5);
    v[1].Add(0, 0, -0.5);
    v[4].Add(0, 0, -0.5);
    v[5].Add(0, 0, -0.5);

    var Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    var Back   = new alpha_Face(alpha_QUADS, v[1], v[0], v[5], v[4]);
    var Right  = new alpha_Face(alpha_QUADS, v[2], v[1], v[4], v[7]);
    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);
    var HALF_SLAB = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );

    BlockTypes.Load("stone", "half_slab", stone, HALF_SLAB);


    // stairs
    var stairStructure = [
        new alpha_Vector( -0.5 , 0.5, 0 ), // 0 -- top
        new alpha_Vector( 0.5 , 0.5, 0 ), // 1 -- top
        new alpha_Vector( 0.5 , 0.5, -0.5 ), // 2 -- top
        new alpha_Vector( -0.5 , 0.5, -0.5 ), // 3 -- top
        new alpha_Vector( 0.5 , -0.5, 0.5 ), // 4 -- bottom
        new alpha_Vector( -0.5 , -0.5, 0.5 ), // 5 -- bottom
        new alpha_Vector( -0.5 , -0.5, -0.5 ), // 6 -- bottom
        new alpha_Vector( 0.5 , -0.5, -0.5 ), // 7 -- bottom
        new alpha_Vector( -0.5 , 0, 0 ), // 8 -- mid
        new alpha_Vector( 0.5 , 0, 0 ), // 9 -- mid
        new alpha_Vector( -0.5 , 0, 0.5 ), // 10 -- mid
        new alpha_Vector( 0.5 , 0, 0.5 ) // 11 -- mid
    ];
    var v = stairStructure;
    var Flight1Top = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    var Flight1Front = new alpha_Face(alpha_QUADS, v[1], v[0], v[8], v[9]);
    var Flight2Top = new alpha_Face(alpha_QUADS, v[9], v[8], v[10], v[11]);
    var Flight2Front = new alpha_Face(alpha_QUADS, v[11], v[10], v[5], v[4]);
    var Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    var LeftTop   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[8]);
    var LeftBot   = new alpha_Face(alpha_QUADS, v[8], v[6], v[5], v[10]);

    var RightTop  = new alpha_Face(alpha_QUADS, v[2], v[1], v[9], v[7]);
    var RightBot  = new alpha_Face(alpha_QUADS, v[9], v[11], v[4], v[7]);

    var Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);


    var STAIRS = new alpha_Shape(
        Flight1Top,
        Flight1Front,
        Flight2Top,
        Flight2Front,
        Front,
        LeftTop,
        LeftBot,

        RightTop,
        RightBot,
        Bottom
    );

    BlockTypes.Load("stone", "stairs", stone, STAIRS);


    // medium corner; lowers 1 and 3 to mid range
    // and 2 to bottom
    var v = alpha_BuildCubeStructure();
    v[0].Add(0, -0.5, 0);
    v[2].Add(0, -0.5, 0);
    v[1].Add(0, -1, 0);
    // this causes left and right to become triangles
    Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var MED_CORNER = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "med_corner", stone, MED_CORNER);

    // medium corner; lowers 1 to midrange
    // and 2 to bottom
    var v = alpha_BuildCubeStructure();
    v[0].Add(0, -0.5, 0);
    v[1].Add(0, -1, 0);
    // this causes left and right to become triangles
    Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var MED_CORNER2 = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "med_corner2", stone, MED_CORNER2);


    // medium corner; lowers 1 and 3 to mid range
    // and 2 to bottom
    var v = alpha_BuildCubeStructure();
    v[2].Add(0, -0.5, 0);
    v[1].Add(0, -1, 0);
    // this causes left and right to become triangles
    Top    = new alpha_Face(alpha_QUADS, v[2], v[3], v[0], v[1]);
    Front  = new alpha_Face(alpha_QUADS, v[3], v[2], v[7], v[6]);
    Left   = new alpha_Face(alpha_QUADS, v[0], v[3], v[6], v[5]);
    Back   = new alpha_Face(alpha_TRIANGLES, v[0], v[5], v[4]);
    Right  = new alpha_Face(alpha_TRIANGLES, v[2], v[4], v[7]);
    Bottom = new alpha_Face(alpha_QUADS, v[6], v[7], v[4], v[5]);

    var MED_CORNER3 = new alpha_Shape(
        Top,
        Front,
        Left,
        Back,
        Right,
        Bottom
    );
    BlockTypes.Load( "stone", "med_corner3", stone, MED_CORNER3);
};
// CubeMan version 1.0
function alpha_CubeMan(BlockTypes)
{
    var v = [
            new alpha_Vector( -0.102166, -0.246654, 0.102166 ),
            new alpha_Vector( -0.102166, -0.246654, -0.102166 ),
            new alpha_Vector( 0.102166, -0.246654, -0.102166 ),
            new alpha_Vector( 0.102166, -0.246654, 0.102166 ),
            new alpha_Vector( -0.102166, -0.040906, 0.102166 ),
            new alpha_Vector( -0.102166, -0.040906, -0.102166 ),
            new alpha_Vector( 0.102166, -0.040906, -0.102166 ),
            new alpha_Vector( 0.102166, -0.040906, 0.102166 ),
            new alpha_Vector( -0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( -0.157418, -0.962703, -0.107114 ),
            new alpha_Vector( -0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( 0.157418, -0.962703, -0.107114 ),
            new alpha_Vector( 0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( -0.250627, -0.385758, -0.107114 ),
            new alpha_Vector( -0.250627, -0.385758, 0.107114 ),
            new alpha_Vector( 0.250627, -0.385758, -0.107114 ),
            new alpha_Vector( 0.250627, -0.385758, 0.107114 ),
            new alpha_Vector( -0.219117, -0.512434, -0.107114 ),
            new alpha_Vector( 0.219117, -0.512434, -0.107114 ),
            new alpha_Vector( 0.219117, -0.512434, 0.107114 ),
            new alpha_Vector( -0.219117, -0.512434, 0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( 0.250627, -0.385758, -0.107114 ),
            new alpha_Vector( 0.250627, -0.385758, 0.107114 ),
            new alpha_Vector( 0.219117, -0.512434, -0.107114 ),
            new alpha_Vector( 0.219117, -0.512434, 0.107114 ),
            new alpha_Vector( 0.478240, -0.752908, -0.079144 ),
            new alpha_Vector( 0.478240, -0.752908, 0.079144 ),
            new alpha_Vector( 0.406667, -0.817066, -0.079144 ),
            new alpha_Vector( 0.406667, -0.817066, 0.079144 ),
            new alpha_Vector( 0.478240, -0.752908, -0.079144 ),
            new alpha_Vector( 0.478240, -0.752908, 0.079144 ),
            new alpha_Vector( 0.406667, -0.817066, -0.079144 ),
            new alpha_Vector( 0.406667, -0.817066, 0.079144 ),
            new alpha_Vector( 0.478240, -0.752908, -0.079144 ),
            new alpha_Vector( 0.478240, -0.752908, 0.079144 ),
            new alpha_Vector( 0.406667, -0.817066, 0.079144 ),
            new alpha_Vector( 0.478240, -1.111776, -0.079144 ),
            new alpha_Vector( 0.478240, -1.111776, 0.079144 ),
            new alpha_Vector( 0.406667, -1.148580, -0.079144 ),
            new alpha_Vector( 0.406667, -1.175934, 0.079144 ),
            new alpha_Vector( 0.442454, -1.143855, 0.079144 ),
            new alpha_Vector( -0.157418, -0.962703, -0.107114 ),
            new alpha_Vector( -0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( 0.157418, -0.962703, -0.107114 ),
            new alpha_Vector( 0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( -0.258540, -1.307287, -0.083569 ),
            new alpha_Vector( -0.258540, -1.307287, 0.083569 ),
            new alpha_Vector( -0.136320, -1.333494, -0.083569 ),
            new alpha_Vector( -0.136320, -1.333494, 0.083569 ),
            new alpha_Vector( -0.292975, -1.917316, -0.107114 ),
            new alpha_Vector( -0.292975, -1.917316, 0.107114 ),
            new alpha_Vector( -0.136320, -1.950906, -0.107114 ),
            new alpha_Vector( -0.136320, -1.950906, 0.107114 ),
            new alpha_Vector( 0.102166, -0.040906, 0.102166 ),
            new alpha_Vector( 0.102166, -0.040906, -0.102166 ),
            new alpha_Vector( -0.102166, -0.040906, -0.102166 ),
            new alpha_Vector( -0.102166, -0.040906, 0.102166 ),
            new alpha_Vector( 0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( 0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, -0.072350 ),
            new alpha_Vector( -0.072350, -0.281348, 0.072350 ),
            new alpha_Vector( 0.157418, -0.962703, -0.107114 ),
            new alpha_Vector( 0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( -0.157418, -0.962703, -0.107114 ),
            new alpha_Vector( -0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( 0.250627, -0.385758, 0.107114 ),
            new alpha_Vector( -0.250627, -0.385758, -0.107114 ),
            new alpha_Vector( -0.250627, -0.385758, 0.107114 ),
            new alpha_Vector( 0.219117, -0.512434, -0.107114 ),
            new alpha_Vector( -0.219117, -0.512434, -0.107114 ),
            new alpha_Vector( -0.219117, -0.512434, 0.107114 ),
            new alpha_Vector( 0.219117, -0.512434, 0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( -0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( -0.250627, -0.385758, -0.107114 ),
            new alpha_Vector( -0.250627, -0.385758, 0.107114 ),
            new alpha_Vector( -0.219117, -0.512434, -0.107114 ),
            new alpha_Vector( -0.219117, -0.512434, 0.107114 ),
            new alpha_Vector( -0.478240, -0.752908, -0.079144 ),
            new alpha_Vector( -0.478240, -0.752908, 0.079144 ),
            new alpha_Vector( -0.406667, -0.817066, -0.079144 ),
            new alpha_Vector( -0.406667, -0.817066, 0.079144 ),
            new alpha_Vector( -0.478240, -0.752908, -0.079144 ),
            new alpha_Vector( -0.478240, -0.752908, 0.079144 ),
            new alpha_Vector( -0.406667, -0.817066, -0.079144 ),
            new alpha_Vector( -0.406667, -0.817066, 0.079144 ),
            new alpha_Vector( -0.478240, -0.752908, -0.079144 ),
            new alpha_Vector( -0.478240, -0.752908, 0.079144 ),
            new alpha_Vector( -0.406667, -0.817066, 0.079144 ),
            new alpha_Vector( -0.478240, -1.111776, -0.079144 ),
            new alpha_Vector( -0.478240, -1.111776, 0.079144 ),
            new alpha_Vector( -0.406667, -1.148580, -0.079144 ),
            new alpha_Vector( -0.406667, -1.175934, 0.079144 ),
            new alpha_Vector( 0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( -0.157418, -0.962703, 0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, -0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, 0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, -0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, 0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, -0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, 0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, -0.107114 ),
            new alpha_Vector( 0.156655, -0.795676, 0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, -0.107114 ),
            new alpha_Vector( 0.000000, -0.829266, 0.107114 ),
            new alpha_Vector( 0.258540, -1.307287, -0.083569 ),
            new alpha_Vector( 0.258540, -1.307287, 0.083569 ),
            new alpha_Vector( 0.136320, -1.333494, -0.083569 ),
            new alpha_Vector( 0.136320, -1.333494, 0.083569 ),
            new alpha_Vector( 0.292975, -1.917316, -0.107114 ),
            new alpha_Vector( 0.292975, -1.917316, 0.107114 ),
            new alpha_Vector( 0.136320, -1.950906, -0.107114 ),
            new alpha_Vector( 0.136320, -1.950906, 0.107114 ),
            new alpha_Vector( 0.000000, -0.385758, 0.107114 ),
            new alpha_Vector( 0.000000, -0.385758, -0.107114 )
    ];

    shape = new alpha_Shape(
        new alpha_Face(alpha_QUADS, v[4], v[5], v[1], v[0]),
        new alpha_Face(alpha_QUADS, v[5], v[6], v[2], v[1]),
        new alpha_Face(alpha_QUADS, v[6], v[7], v[3], v[2]),
        new alpha_Face(alpha_QUADS, v[7], v[4], v[0], v[3]),
        new alpha_Face(alpha_QUADS, v[8], v[10], v[14], v[12]),
        new alpha_Face(alpha_QUADS, v[8], v[9], v[0], v[1]),
        new alpha_Face(alpha_QUADS, v[10], v[8], v[1], v[2]),
        new alpha_Face(alpha_QUADS, v[11], v[10], v[2], v[3]),
        new alpha_Face(alpha_QUADS, v[9], v[11], v[3], v[0]),
        new alpha_Face(alpha_QUADS, v[10], v[11], v[15], v[14]),
        new alpha_Face(alpha_QUADS, v[11], v[9], v[13], v[15]),
        new alpha_Face(alpha_QUADS, v[9], v[8], v[12], v[13]),
        new alpha_Face(alpha_QUADS, v[13], v[12], v[20], v[21]),
        new alpha_Face(alpha_QUADS, v[14], v[15], v[23], v[22]),
        new alpha_Face(alpha_QUADS, v[25], v[22], v[32], v[34]),
        new alpha_Face(alpha_QUADS, v[27], v[24], v[28], v[31]),
        new alpha_Face(alpha_QUADS, v[35], v[34], v[38], v[39]),
        new alpha_Face(alpha_QUADS, v[22], v[23], v[33], v[32]),
        new alpha_Face(alpha_QUADS, v[23], v[26], v[35], v[33]),
        new alpha_Face(alpha_QUADS, v[26], v[25], v[34], v[35]),
        new alpha_Face(alpha_QUADS, v[39], v[38], v[42], v[43]),
        new alpha_Face(alpha_QUADS, v[32], v[33], v[37], v[36]),
        new alpha_Face(alpha_QUADS, v[34], v[32], v[36], v[38]),
        new alpha_Face(alpha_QUADS, v[33], v[35], v[39], v[37]),
        new alpha_Face(alpha_QUADS, v[41], v[43], v[46], v[45]),
        new alpha_Face(alpha_QUADS, v[36], v[37], v[41], v[40]),
        new alpha_Face(alpha_QUADS, v[38], v[36], v[40], v[42]),
        new alpha_Face(alpha_QUADS, v[37], v[39], v[43], v[41]),
        new alpha_Face(alpha_QUADS, v[42], v[44], v[47], v[49]),
        new alpha_Face(alpha_QUADS, v[40], v[41], v[45], v[44]),
        new alpha_Face(alpha_QUADS, v[46], v[50], v[48], v[45]),
        new alpha_Face(alpha_QUADS, v[98], v[95], v[131], v[140]),
        new alpha_Face(alpha_QUADS, v[118], v[29], v[30], v[119]),
        new alpha_Face(alpha_QUADS, v[56], v[122], v[126], v[58]),
        new alpha_Face(alpha_QUADS, v[119], v[31], v[57], v[123]),
        new alpha_Face(alpha_QUADS, v[31], v[28], v[56], v[57]),
        new alpha_Face(alpha_QUADS, v[28], v[118], v[122], v[56]),
        new alpha_Face(alpha_QUADS, v[58], v[126], v[130], v[60]),
        new alpha_Face(alpha_QUADS, v[123], v[57], v[59], v[127]),
        new alpha_Face(alpha_QUADS, v[57], v[56], v[58], v[59]),
        new alpha_Face(alpha_QUADS, v[61], v[60], v[62], v[63]),
        new alpha_Face(alpha_QUADS, v[127], v[59], v[61], v[131]),
        new alpha_Face(alpha_QUADS, v[59], v[58], v[60], v[61]),
        new alpha_Face(alpha_QUADS, v[64], v[65], v[69], v[68]),
        new alpha_Face(alpha_QUADS, v[60], v[130], v[64], v[62]),
        new alpha_Face(alpha_QUADS, v[131], v[61], v[63], v[65]),
        new alpha_Face(alpha_QUADS, v[130], v[131], v[65], v[64]),
        new alpha_Face(alpha_QUADS, v[66], v[68], v[69], v[67]),
        new alpha_Face(alpha_QUADS, v[63], v[62], v[66], v[67]),
        new alpha_Face(alpha_QUADS, v[62], v[64], v[68], v[66]),
        new alpha_Face(alpha_QUADS, v[65], v[63], v[67], v[69]),
        new alpha_Face(alpha_QUADS, v[74], v[78], v[80], v[76]),
        new alpha_Face(alpha_QUADS, v[76], v[80], v[81], v[77]),
        new alpha_Face(alpha_QUADS, v[77], v[81], v[79], v[75]),
        new alpha_Face(alpha_QUADS, v[75], v[79], v[78], v[74]),
        new alpha_Face(alpha_QUADS, v[118], v[122], v[123], v[119]),
        new alpha_Face(alpha_QUADS, v[90], v[99], v[97], v[87]),
        new alpha_Face(alpha_QUADS, v[92], v[96], v[93], v[89]),
        new alpha_Face(alpha_QUADS, v[100], v[104], v[103], v[99]),
        new alpha_Face(alpha_QUADS, v[87], v[97], v[98], v[88]),
        new alpha_Face(alpha_QUADS, v[88], v[98], v[100], v[91]),
        new alpha_Face(alpha_QUADS, v[91], v[100], v[99], v[90]),
        new alpha_Face(alpha_QUADS, v[104], v[108], v[107], v[103]),
        new alpha_Face(alpha_QUADS, v[97], v[101], v[102], v[98]),
        new alpha_Face(alpha_QUADS, v[99], v[103], v[101], v[97]),
        new alpha_Face(alpha_QUADS, v[98], v[102], v[104], v[100]),
        new alpha_Face(alpha_QUADS, v[106], v[110], v[111], v[108]),
        new alpha_Face(alpha_QUADS, v[101], v[105], v[106], v[102]),
        new alpha_Face(alpha_QUADS, v[103], v[107], v[105], v[101]),
        new alpha_Face(alpha_QUADS, v[102], v[106], v[108], v[104]),
        new alpha_Face(alpha_QUADS, v[45], v[48], v[47], v[44]),
        new alpha_Face(alpha_QUADS, v[105], v[109], v[110], v[106]),
        new alpha_Face(alpha_QUADS, v[113], v[110], v[109], v[112]),
        new alpha_Face(alpha_QUADS, v[115], v[111], v[110], v[113]),
        new alpha_Face(alpha_QUADS, v[49], v[47], v[48], v[50]),
        new alpha_Face(alpha_QUADS, v[42], v[49], v[50], v[46]),
        new alpha_Face(alpha_QUADS, v[129], v[86], v[140], v[131]),
        new alpha_Face(alpha_QUADS, v[70], v[71], v[72], v[73]),
        new alpha_Face(alpha_QUADS, v[118], v[119], v[95], v[94]),
        new alpha_Face(alpha_QUADS, v[120], v[124], v[126], v[122]),
        new alpha_Face(alpha_QUADS, v[119], v[123], v[121], v[96]),
        new alpha_Face(alpha_QUADS, v[96], v[121], v[120], v[93]),
        new alpha_Face(alpha_QUADS, v[93], v[120], v[122], v[118]),
        new alpha_Face(alpha_QUADS, v[124], v[128], v[130], v[126]),
        new alpha_Face(alpha_QUADS, v[123], v[127], v[125], v[121]),
        new alpha_Face(alpha_QUADS, v[122], v[126], v[127], v[123]),
        new alpha_Face(alpha_QUADS, v[121], v[125], v[124], v[120]),
        new alpha_Face(alpha_QUADS, v[129], v[133], v[132], v[128]),
        new alpha_Face(alpha_QUADS, v[127], v[131], v[129], v[125]),
        new alpha_Face(alpha_QUADS, v[126], v[130], v[131], v[127]),
        new alpha_Face(alpha_QUADS, v[125], v[129], v[128], v[124]),
        new alpha_Face(alpha_QUADS, v[134], v[138], v[139], v[135]),
        new alpha_Face(alpha_QUADS, v[128], v[132], v[134], v[130]),
        new alpha_Face(alpha_QUADS, v[131], v[135], v[133], v[129]),
        new alpha_Face(alpha_QUADS, v[130], v[134], v[135], v[131]),
        new alpha_Face(alpha_QUADS, v[136], v[137], v[139], v[138]),
        new alpha_Face(alpha_QUADS, v[133], v[137], v[136], v[132]),
        new alpha_Face(alpha_QUADS, v[132], v[136], v[138], v[134]),
        new alpha_Face(alpha_QUADS, v[135], v[139], v[137], v[133]),
        new alpha_Face(alpha_QUADS, v[109], v[107], v[114], v[112]),
        new alpha_Face(alpha_QUADS, v[112], v[114], v[115], v[113]),
        new alpha_Face(alpha_QUADS, v[107], v[111], v[115], v[114]),
        new alpha_Face(alpha_QUADS, v[97], v[80], v[78], v[32]),
        new alpha_Face(alpha_QUADS, v[141], v[130], v[94], v[97]),
        new alpha_Face(alpha_QUADS, v[128], v[32], v[141], v[130]),
        new alpha_Face(alpha_QUADS, v[86], v[79], v[81], v[98])
    );

    var white = new alpha_Color(1,1,1);
    var gray = new alpha_Color(.5,.5,.5);
    var dgray = new alpha_Color( .25, .25, .25);
    var owhite = new alpha_Color(.9,.9,.9);
    var black = new alpha_Color(0,0,0);
    var blank = []
    for(var i = 0; i < 150; ++i) {
        blank[i] = [gray, owhite, owhite, gray];
    }
    blank = new alpha_Skin(blank);

    BlockTypes.Load( "blank", "cubeman", blank, shape);
};
// TODO Blocks in foreground are rendered improperly relative to the projection matrix.

// TODO Mouse input appears to be... strangely interpreted.

// test version 1.0
function alpha_GLWidget()
{
    // Allow surface to be created implicitly.
    var surface;
    if(arguments.length == 0) {
        surface = new parsegraph_Surface();
        surface.addPainter(this.paint, this);
        surface.addRenderer(this.render, this);
    }
    else {
        surface = arguments[0];
    }
    if(!surface) {
        throw new Error("Surface must be given");
    }
    this._surface = surface;

    this._canvas = surface._canvas;
    this._container = surface._container;

    this._backgroundColor = new alpha_Color(0, 47/255, 57/255);

    this.camera = new alpha_Camera(this);

    // Set the field of view.
    this.camera.SetFovX(60);
    // this.camera.SetProperFOV(2,2);

    // Set the camera's near and far distance.
    this.camera.SetFarDistance(150);
    this.camera.SetNearDistance(1);

    this.paintingDirty = true;

//this.camera.PitchDown(40 * Math.PI / 180);

    this.input = new alpha_Input(this, this.camera);
    this.input.SetMouseSensitivity(.4);

    this._done = false;

    this.BlockTypes = new alpha_BlockTypes();
    alpha_standardBlockTypes(this.BlockTypes);
    alpha_CubeMan(this.BlockTypes);

    var cubeman = this.BlockTypes.Get("blank", "cubeman");

    this.testCluster = new alpha_Cluster(this);
    this.testCluster.AddBlock(cubeman, 0,5,0,0);

    var stone = this.BlockTypes.Get("stone", "cube");
    var grass = this.BlockTypes.Get("grass", "cube");
    var dirt = this.BlockTypes.Get("dirt", "cube");

    this.originCluster = new alpha_Cluster(this);
    //this.originCluster.AddBlock(stone,0,0,-50,0);

    this.platformCluster = new alpha_Cluster(this);
    this.worldCluster = new alpha_Cluster(this);

    this.playerCluster = new alpha_Cluster(this);

    for(var i = 0; i <= 2; ++i) {
        this.playerCluster.AddBlock(grass,0,i,0,0);
    }

    this.playerCluster.AddBlock(grass,-1,3,0,16); // left

    this.playerCluster.AddBlock(grass, 0,4,0, 12); // head

    this.playerCluster.AddBlock(grass, 1, 3, 0,8); // right

    var WORLD_SIZE = 30;
    for(var i = -WORLD_SIZE; i <= WORLD_SIZE; ++i) {
        for(var j = 1; j <= WORLD_SIZE * 2; ++j) {
            var r = alpha_random(0, 23);
            this.worldCluster.AddBlock([grass, stone][alpha_random(0, 1)], i,-1,-j,r);
        }
    }

    for(var i = -WORLD_SIZE; i <= WORLD_SIZE; ++i) {
        for(var j = 0; j <= WORLD_SIZE * 2; ++j) {
            var r = alpha_random(0, 23);
            this.worldCluster.AddBlock(stone, i,-1,-30,r);
        }
    }

    // build a platform

    for(var i = -3; i <= 3; ++i) {
        for(var j = -4; j <= 4; ++j) {
            this.platformCluster.AddBlock(grass,j,0,-i,0);
        }
    }


    this.evPlatformCluster = new alpha_Cluster(this);
    for(var i = -2; i <= 2; ++i) {
        for(var j = 3; j <= 4; ++j) {
            this.evPlatformCluster.AddBlock(dirt, j, 1, i, 0);
        }
    }




    this.orbit = new alpha_Physical(this.camera);
    this.orbit.SetPosition(0,0, 0);
    var elevator = new alpha_Physical(this.camera);
    elevator.SetPosition(0,5,0);


    this.camera.SetParent(this.camera);
    this.playerAPhysical = new alpha_Physical( this.camera );
    this.playerBPhysical = new alpha_Physical( this.camera );
    this.offsetPlatformPhysical = new alpha_Physical( this.camera );



    this.offsetPlatformPhysical.SetParent( this.camera );
    this.playerAPhysical.SetParent( this.offsetPlatformPhysical );
    this.playerBPhysical.SetParent( this.camera );

    this.camera.SetParent( this.playerBPhysical );

    this.playerAPhysical.SetPosition(10,1,0);



    this.playerBPhysical.SetPosition(0,0,-3);

    this.offsetPlatformPhysical.SetPosition(0,0,-25);
    this.offsetPlatformPhysical.YawLeft(0);
    this.offsetPlatformPhysical.RollRight(0);


    this.spherePhysical = new alpha_Physical(this.camera);
    this.spherePhysical.SetPosition(45,0,0);

    var radius = 8;
    this.sphereCluster = new alpha_Cluster(this);

    // first circle about the x-axis
    var rot = 0;
    for(var i=0; i < 24; ++i) {
        var q = alpha_QuaternionFromAxisAndAngle(1,0,0,rot * Math.PI / 180);
        rot += 15;
        var p = q.RotatedVector(0,0,-radius);
        this.sphereCluster.AddBlock(stone, p, 0);
    }

    rot = 0;
    for(var i=0; i < 24; ++i) {
        var q = alpha_QuaternionFromAxisAndAngle(0,1,0,rot * Math.PI / 180);
        rot += 15;

        var p = q.RotatedVector(0,0,-radius);
        this.sphereCluster.AddBlock(stone, p, 0);
    }



    var spot = new alpha_Vector(0,15,35);
    this.swarm = [];
    for(var i = 0; i < 100; ++i) {
        this.swarm.push(new alpha_Physical(this.camera));
        var x = alpha_random(1, 30);
        var y = alpha_random(1, 30);
        var z = alpha_random(1, 30);
        this.swarm[i].SetPosition(spot.Added(x, y, z));

        var x = alpha_random(-100,100)/100;
        var y = alpha_random(-100,100)/100;
        var z = alpha_random(-100,100)/100;
        var w = alpha_random(-100,100)/100;
        var q = new alpha_Quaternion(x,y,z,w);
        q.Normalize();
        this.swarm[i].SetOrientation(q);
    }

    this.time = 0;
}; // alpha_GLWidget

alpha_GLWidget.prototype.paint = function()
{
    if(!this.paintingDirty) {
        return;
    }
    this.evPlatformCluster.CalculateVertices();
    this.testCluster.CalculateVertices();
    this.originCluster.CalculateVertices();
    this.playerCluster.CalculateVertices();
    this.worldCluster.CalculateVertices();
    this.platformCluster.CalculateVertices();
    this.sphereCluster.CalculateVertices();
    this.paintingDirty = false;
};

alpha_GLWidget.prototype.Tick = function(elapsed)
{
    this.time += elapsed;
    this.input.Update(elapsed);

    var ymin;
    for(var i = 0; i < this.swarm.length; ++i) {
        var v = this.swarm[i];
        if(this.time < 6) {
            v.MoveForward(elapsed);
            v.YawRight(2 * Math.PI / 180);
        }
        else {
            v.PitchDown(1 * Math.PI / 180);
            v.YawRight(2 * Math.PI / 180);
            var y = v.GetPosition()[1];
            v.ChangePosition(0, -.2 ,0);
        }
    }

    this.orbit.Rotate(-.01, 0, 1, 0);
    //console.log(this.offsetPlatformPhysical.position.toString());
    this.offsetPlatformPhysical.MoveLeft( elapsed );
    this.offsetPlatformPhysical.YawLeft(.1 * Math.PI / 180);
    //console.log(this.offsetPlatformPhysical.position.toString());

    //console.log("Cam: " + this.camera.GetOrientation());
};

alpha_GLWidget.prototype.setBackground = function()
{
    if(arguments.length > 1) {
        var c = new alpha_Color();
        c.Set.apply(c, arguments);
        return this.setBackground(c);
    }
    this._backgroundColor = arguments[0];

    // Make it simple to change the background color; do not require a
    // separate call to scheduleRepaint.
    this.scheduleRepaint();
};

/**
 * Marks this GLWidget as dirty and schedules a surface repaint.
 */
alpha_GLWidget.prototype.scheduleRepaint = function()
{
    this.paintingDirty = true;
    this._surface.scheduleRepaint();
};

/**
 * Retrieves the current background color.
 */
alpha_GLWidget.prototype.backgroundColor = function()
{
    return this._backgroundColor;
};

alpha_GLWidget.prototype.Camera = function()
{
    return this.camera;
};

alpha_GLWidget.prototype.canvas = function()
{
    return this.surface().canvas();
};

alpha_GLWidget.prototype.gl = function()
{
    return this.surface().gl();
};

alpha_GLWidget.prototype.surface = function()
{
    return this._surface;
};

/**
 * Returns the container for this scene.
 */
alpha_GLWidget.prototype.container = function()
{
    return this._container;
};

/**
 * Render painted memory buffers.
 */
alpha_GLWidget.prototype.render = function()
{
    var projection;
    if(arguments.length > 0) {
        projection = this.camera.UpdateProjection(arguments[0], arguments[1]);
    }
    else {
        projection = this.camera.UpdateProjection();
    }

    // local fullcam = boat:Inverse() * player:Inverse() * Bplayer:Inverse() * cam:Inverse()

    var gl = this.gl();
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    this.playerCluster.Draw(this.playerAPhysical.GetViewMatrix().Multiplied(projection));

    //console.log("this.camera.GetViewMatrix() * projection:\n" + viewMatrix.toString());
    //console.log(this.camera.GetViewMatrix().toString());
    var viewMatrix = this.camera.GetViewMatrix().Multiplied(projection);
    this.worldCluster.Draw(viewMatrix);


    for(var i = 0; i < this.swarm.length; ++i) {
        var v = this.swarm[i];
        this.testCluster.Draw(v.GetViewMatrix().Multiplied(projection));
        //this.worldCluster.Draw(v.GetViewMatrix().Multiplied(projection));
    }


    //console.log(projection.toString());
    //console.log(this.offsetPlatformPhysical.GetViewMatrix().toString());
    var platformMatrix = this.offsetPlatformPhysical.GetViewMatrix().Multiplied(projection);
    this.platformCluster.Draw(platformMatrix);
    this.evPlatformCluster.Draw(platformMatrix);


    this.playerCluster.Draw(this.playerAPhysical.GetViewMatrix().Multiplied(projection));


    this.testCluster.Draw(this.playerBPhysical.GetViewMatrix().Multiplied(projection));

    this.sphereCluster.Draw(this.spherePhysical.GetViewMatrix().Multiplied(projection));
};
alpha_WeetPainter_VertexShader =
"uniform mat4 u_world;\n" +
"\n" +
"attribute vec4 a_position;\n" +
"attribute vec4 a_color;\n" +
"\n" +
"varying vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = u_world * a_position;" +
    "contentColor = a_color;" +
"}";

alpha_WeetPainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "gl_FragColor = contentColor;" +
"}";

/**
 * Draws 3d faces in a solid color.
 */
function alpha_WeetPainter(gl)
{
    this.gl = gl;
    this._numCubes = null;
    if(!this.gl || !this.gl.createProgram) {
        throw new Error("FacePainter must be given a GL interface");
    }

    this.faceProgram = this.gl.createProgram();

    this.gl.attachShader(
        this.faceProgram,
        compileShader(
            this.gl,
            alpha_WeetPainter_VertexShader,
            this.gl.VERTEX_SHADER
        )
    );

    this.gl.attachShader(
        this.faceProgram,
        compileShader(
            this.gl,
            alpha_WeetPainter_FragmentShader,
            this.gl.FRAGMENT_SHADER
        )
    );

    this.gl.linkProgram(this.faceProgram);
    if(!this.gl.getProgramParameter(
        this.faceProgram, this.gl.LINK_STATUS
    )) {
        throw new Error("FacePainter program failed to link.");
    }

    // Prepare attribute buffers.
    this.a_position = this.gl.getAttribLocation(this.faceProgram, "a_position");
    this.a_color = this.gl.getAttribLocation(this.faceProgram, "a_color");

    // Cache program locations.
    this.u_world = this.gl.getUniformLocation(
        this.faceProgram, "u_world"
    );
};

{
    var cubeSize = 1;
    var width = cubeSize;
    var length = cubeSize;
    var height = cubeSize;
    var cv = [
        // Front
        [-width, length, height], // v0
        [ width, length, height], // v1
        [ width, length,-height], // v2
        [-width, length,-height], // v3

        // Back
        [ width,-length, height], // v4
        [-width,-length, height], // v5
        [-width,-length,-height], // v6
        [ width,-length,-height], // v7

        // Left
        [width, length, height], // v1
        [width,-length, height], // v4
        [width,-length,-height], // v7
        [width, length,-height], // v2

        // Right
        [-width,-length, height], // v5
        [-width, length, height], // v0
        [-width, length,-height], // v3
        [-width,-length,-height], // v6

        // Top
        [ width, length, height], // v1
        [-width, length, height], // v0
        [-width,-length, height], // v5
        [ width,-length, height], // v4

        // Bottom
        [ width,-length,-height], // v7
        [-width,-length,-height], // v6
        [-width, length,-height], // v3
        [ width, length,-height] //v2
    ];
    alpha_CUBE_VERTICES = cv;

    alpha_CUBE_COLORS = [
        new alpha_Color(1, 1, 0), // 0
        new alpha_Color(0, 1, 1), // 5
        new alpha_Color(1, 0, 1), // 1
        new alpha_Color(0, 0, 1), // 2
        new alpha_Color(1, 0, 0), // 3
        new alpha_Color(0, 1, 0) // 4
    ];
}

alpha_WeetPainter.prototype.Init = function(numCubes)
{
    if(!this._posBuffer) {
        this._posBuffer = this.gl.createBuffer();
    }
    this._data = new Float32Array(numCubes * 6 * 6 * 4);
    //console.log("Data is " + this._data.length + " floats large");
    this._dataX = 0;

    if(!this._colorBuffer) {
        this._colorBuffer = this.gl.createBuffer();
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._colorBuffer);
    var colorData = this._data;
    var x = 0;
    for(var i = 0; i < numCubes; ++i) {
        // Cube
        for(var j = 0; j < 6; ++j) {
            // Face
            var col = alpha_CUBE_COLORS[j];
            for(var k = 0; k < 6; ++k) {
                // Vertex
                colorData[x++] = col[0];
                colorData[x++] = col[1];
                colorData[x++] = col[2];
                colorData[x++] = 1.0;
            }
        }
    }
    //console.log("color floats rendered = " + 4*x);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colorData, this.gl.STATIC_DRAW);
    this._numCubes = numCubes;
}

alpha_WeetPainter.prototype.Cube = function(m)
{
    if(!this._data) {
        throw new Error("Init must be called first");
    }
    var drawFace = function(c1, c2, c3, c4, color) {
        var drawVert = function(v) {
            var x = (m[0] * v[0] + m[1] * v[1] + m[2] * v[2]) + m[12];
            var y = (m[4] * v[0] + m[5] * v[1] + m[6] * v[2]) + m[13];
            var z = (m[8] * v[0] + m[9] * v[1] + m[10] * v[2]) + m[14];
            this._data[this._dataX++] = x;
            this._data[this._dataX++] = y;
            this._data[this._dataX++] = z;
            this._data[this._dataX++] = 1.0;
            //console.log("(" + x + ", " + y + ", " + z+ ")");
        };

        drawVert.call(this, c1);
        drawVert.call(this, c2);
        drawVert.call(this, c3);
        drawVert.call(this, c1);
        drawVert.call(this, c3);
        drawVert.call(this, c4);
    };

    var cv = alpha_CUBE_VERTICES;
    var cc = alpha_CUBE_COLORS;
    // Front, COLOR
    drawFace.call(this, cv[0], cv[1], cv[2], cv[3], cc[0]);
    // Back
    drawFace.call(this, cv[4], cv[5], cv[6], cv[7], cc[5]);
    // Left
    drawFace.call(this, cv[8], cv[9], cv[10], cv[11], cc[1]);
    // Right
    drawFace.call(this, cv[12], cv[13], cv[14], cv[15], cc[2]);
    // Top
    drawFace.call(this, cv[16], cv[17], cv[18], cv[19], cc[3]);
    // Bottom
    drawFace.call(this, cv[20], cv[21], cv[22], cv[23], cc[4]);
};

alpha_WeetPainter.prototype.Clear = function()
{
    if(!this._data) {
        return;
    }
    this._dataX = 0;
};

alpha_WeetPainter.prototype.Draw = function(viewMatrix)
{
    if(!viewMatrix) {
        throw new Error("A viewMatrix must be provided");
    }

    // Render faces.
    var gl = this.gl;
    //gl.disable(gl.CULL_FACE);
    gl.useProgram(
        this.faceProgram
    );
    gl.uniformMatrix4fv(
        this.u_world,
        false,
        viewMatrix.toArray()
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuffer);
    //console.log("dataX * sizeof(float = " + 4*this._dataX);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        this._data,
        gl.STREAM_DRAW
    );
    gl.vertexAttribPointer(this.a_position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_position);

    gl.enableVertexAttribArray(this.a_color);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    gl.vertexAttribPointer(this.a_color, 4, gl.FLOAT, false, 0, 0);

    //console.log("num rendered = " + (this._dataX / 4));
    gl.drawArrays(gl.TRIANGLES, 0, this._dataX/4);

    gl.disableVertexAttribArray(this.a_position);
    gl.disableVertexAttribArray(this.a_color);
};
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt
function getWholeChar(str, i) {
  var code = str.charCodeAt(i);

  if (Number.isNaN(code)) {
    return ''; // Position not found
  }
  if (code < 0xD800 || code > 0xDFFF) {
    return str.charAt(i);
  }

  // High surrogate (could change last hex to 0xDB7F to treat high private
  // surrogates as single characters)
  if (0xD800 <= code && code <= 0xDBFF) {
    if (str.length <= (i + 1)) {
      throw 'High surrogate without following low surrogate';
    }
    var next = str.charCodeAt(i + 1);
      if (0xDC00 > next || next > 0xDFFF) {
        throw 'High surrogate without following low surrogate';
      }
      return str.charAt(i) + str.charAt(i + 1);
  }
  // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
  if (i === 0) {
    throw 'Low surrogate without preceding high surrogate';
  }
  var prev = str.charCodeAt(i - 1);

  // (could change last hex to 0xDB7F to treat high private
  // surrogates as single characters)
  if (0xD800 > prev || prev > 0xDBFF) {
    throw 'Low surrogate without preceding high surrogate';
  }
  // We can pass over low surrogates now as the second component
  // in a pair which we have already processed
  return false;
}

function parsegraph_Token()
{
    this._type = arguments[0];
    if(arguments.length > 1) {
        this._text = arguments[1];
    }
    else {
        this._text = null;
    }
}

parsegraph_Token.prototype.type = function()
{
    return this._type;
};

parsegraph_Token.prototype.text = function()
{
    return this._text;
};

parsegraph_EOF = 1;
parsegraph_NAME = 2;
parsegraph_COMMA = 3;
parsegraph_LBRACK = 4;
parsegraph_RBRACK = 5;
parsegraph_DIVIDE = 6;
parsegraph_SINGLE_QUOTE = 7;
parsegraph_DOUBLE_QUOTE = 8;
parsegraph_BACK_QUOTE = 9;
parsegraph_DOT = 10;
parsegraph_ASSIGNMENT = 11;
parsegraph_EQUALS = 12;
parsegraph_IDENTITY = 13;
parsegraph_NOT = 14;
parsegraph_NOT_EQUALS = 15;
parsegraph_NOT_IDENTICAL = 16;
parsegraph_LPAREN = 17;
parsegraph_RPAREN = 18;
parsegraph_INTEGER = 19;

function parsegraph_nameTokenType(tokenType)
{
    switch(tokenType) {
    case parsegraph_EOF:
        return "EOF";
    case parsegraph_NAME:
        return "NAME";
    case parsegraph_COMMA:
        return "COMMA";
    case parsegraph_LBRACK:
        return "LBRACK";
    case parsegraph_RBRACK:
        return "RBRACK";
    case parsegraph_LPAREN:
        return "LPAREN";
    case parsegraph_RPAREN:
        return "RPAREN";
    case parsegraph_DIVIDE:
        return "DIVIDE";
    case parsegraph_SINGLE_QUOTE:
        return "SINGLE_QUOTE";
    case parsegraph_DOUBLE_QUOTE:
        return "DOUBLE_QUOTE";
    case parsegraph_BACK_QUOTE:
        return "BACKQUOTE";
    case parsegraph_DOT:
        return "DOT";
    case parsegraph_ASSIGNMENT:
        return "ASSIGNMENT";
    case parsegraph_EQUALS:
        return "EQUALS";
    case parsegraph_IDENTITY:
        return "IDENTITY";
    case parsegraph_NOT:
        return "NOT";
    case parsegraph_NOT_EQUALS:
        return "NOT_EQUALS";
    case parsegraph_NOT_IDENTICAL:
        return "NOT_IDENTICAL";
    case parsegraph_INTEGER:
        return "INTEGER";
    }
    throw new Error("Unknown type " + tokenType);
};

parsegraph_Token.prototype.equals = function(other)
{
    if(this === other) {
        return true;
    }
    if(!other) {
        return false;
    }
    if(typeof other.type !== "function") {
        return false;
    }
    if(typeof other.text !== "function") {
        return false;
    }
    return this.type() == other.type() && this.text() == other.text();
};

parsegraph_Token.prototype.toString = function()
{
    var rv = parsegraph_nameTokenType(this.type());
    if(this.text() !== null) {
        rv += "=\"" + this.text() + "\"";
    }
    return rv;
};

// Based on 'Language Implementation Patterns' by Terence Parr
function parsegraph_Lexer(input)
{
    this._input = input;
    this._index = 0;

    // Prime the lookahead.
    this._char = getWholeChar(this._input, this._index);
    this._charCode = this._char.charCodeAt(0);
}

parsegraph_Lexer.prototype.consume = function()
{
    // Increment to the next index.
    this._index += this._char.length;

    // Check if there's no more characters.
    if(this._index >= this._input.length) {
        this._char = null;
        this._charCode = null;
        return false;
    }

    this._char = getWholeChar(this._input, this._index);
    this._charCode = this._char.charCodeAt(0);
    return true;
};

parsegraph_Lexer.prototype.c = function()
{
    return this._char;
};

parsegraph_Lexer.prototype.cc = function()
{
    return this._charCode;
};

parsegraph_Lexer.prototype.match = function(candidate)
{
    if(this._char == candidate) {
        this.consume();
    }
    else {
        throw new Error("Expected " + candidate + ", but found " + this._char);
    }
};

function parsegraph_parse(str, callback, thisArg)
{
    var lexer = new parsegraph_Lexer(str);
    lexer.NAME = function() {
        var rv = "";
        do {
            rv += this.c();
            this.consume();
        }
        while(this.isLETTER());

        return new parsegraph_Token(parsegraph_NAME, rv);
    };

    lexer.isWS = function() {
        return this.c() != null && this.c().match(/\s/);
    };

    lexer.WS = function() {
        while(this.isWS()) {
            this.consume();
        }
    };

    lexer.isLETTER = function() {
        return this.c() != null && this.c().match(/[a-zA-Z]/);
    };

    lexer.isDIGIT = function() {
        return this.c() != null && this.c().match(/\d/);
    };

    lexer.NUMBER = function() {
        var num = "";
        while(this.isDIGIT()) {
            num += this.c();
            if(!this.consume()) {
                break;
            }
        }
        return new parsegraph_Token(parsegraph_INTEGER, num);
    };

    lexer.nextToken = function() {
        while(this.c() != null) {
            switch(this.c()) {
            case '/':
                this.consume();
                if(this.c() == '/') {
                    // Comment.
                    this.consume();
                    while(this.c() != '\n') {
                        if(!this.consume()) {
                            // EOF.
                            break;
                        }
                    }

                    continue;
                }
                else if(this.c() == '*') {
                    // Multi-line comment.
                    this.consume();
                    while(true) {
                        while(this.c() != '*') {
                            this.consume();
                        }
                        this.consume();
                        if(this.c() == '/') {
                            // Comment ended.
                            break;
                        }

                        // Still in the multi-line comment.
                    }

                    continue;
                }
                return new parsegraph_Token(parsegraph_DIVIDE, "/");
            case '\'':
            case '"':
            case '`':
                var quote = this.c();
                if(!this.consume()) {
                    throw new Error("Unexpected start of string");
                }
                var str = "";
                while(true) {
                    if(this.c() == quote) {
                        this.consume();
                        switch(quote) {
                        case '\'':
                            return new parsegraph_Token(parsegraph_SINGLE_QUOTE, str);
                        case '"':
                            return new parsegraph_Token(parsegraph_DOUBLE_QUOTE, str);
                        case '`':
                            return new parsegraph_Token(parsegraph_BACK_QUOTE, str);
                        default:
                            throw new Error("Unrecognized quote symbol: " + quote);
                        }
                    }

                    str += this.c();
                    if(!this.consume()) {
                        throw new Error("Unterminated string");
                    }
                }
                continue;
            case ' ':
            case '\t':
            case '\n':
            case '\r':
                this.WS();
                continue;
            case ',':
                this.consume();
                return new parsegraph_Token(parsegraph_COMMA);
            case '.':
                this.consume();
                return new parsegraph_Token(parsegraph_DOT);
            case '(':
                this.consume();
                return new parsegraph_Token(parsegraph_LPAREN);
            case ')':
                this.consume();
                return new parsegraph_Token(parsegraph_RPAREN);
            case '!':
                this.consume();
                if(this.c() == '=') {
                    this.consume();
                    if(this.c() == '=') {
                        // Identity
                        return new parsegraph_Token(parsegraph_NOT_IDENTICAL);
                    }
                    // Equality
                    return new parsegraph_Token(parsegraph_NOT_EQUALS);
                }
                // Assignment
                return new parsegraph_Token(parsegraph_NOT);
            case '=':
                this.consume();
                if(this.c() == '=') {
                    this.consume();
                    if(this.c() == '=') {
                        // Identity
                        return new parsegraph_Token(parsegraph_IDENTITY);
                    }
                    // Equality
                    return new parsegraph_Token(parsegraph_EQUALS);
                }
                // Assignment
                return new parsegraph_Token(parsegraph_ASSIGNMENT);
            case '[':
                this.consume();
                return new parsegraph_Token(parsegraph_LBRACK);
            case ']':
                this.consume();
                return new parsegraph_Token(parsegraph_RBRACK);
            default:
                if(this.c() == '-' || this.isDIGIT()) {
                    return this.NUMBER();
                }
                if(this.isLETTER()) {
                    return this.NAME();
                }
                throw new Error("Invalid character: " + this.c());
            }
        }

        return new parsegraph_Token(parsegraph_EOF, "<EOF>");
    };

    if(callback == undefined) {
        var results = [];
        for(var t = lexer.nextToken(); t.type() != parsegraph_EOF; t = lexer.nextToken()) {
            results.push(t);
        }
        return results;
    }

    for(var t = lexer.nextToken(); t.type() != parsegraph_EOF; t = lexer.nextToken()) {
        callback.call(thisArg, t);
    }
}

parsegraph_Parser_Tests = new parsegraph_TestSuite("parsegraph_Parser");

parsegraph_Parser_Tests.addTest("parsegraph_Parser", function(resultDom) {
    var assertEquals = function(given, expected) {
        if(expected.length === 0) {
            if(given.length !== 0) {
                throw new Error("Expected no tokens, but received " + given.length + ".");
            }
            return;
        }
        if(given.length === 0) {
            throw new Error("Given tokens must not be empty");
        }
        for(var i = 0; i < expected.length; ++i) {
            if(i >= given.length) {
                var remTokens = expected.length - given.length;
                if(remTokens > 1) {
                    throw new Error("Expected " + remTokens + " more tokens");
                }
                throw new Error("Expected " + expected[i].toString() + ", but parsed nothing.");
            }
            if(!given[i].equals(expected[i])) {
                throw new Error("Expected " + expected[i].toString() + ", but parsed " + given[i].toString());
            }
        }
    };

    assertEquals(parsegraph_parse("[AB]"), [
        new parsegraph_Token(parsegraph_LBRACK),
        new parsegraph_Token(parsegraph_NAME, "AB"),
        new parsegraph_Token(parsegraph_RBRACK)
    ]);

    assertEquals(parsegraph_parse("[AB, CD]"), [
        new parsegraph_Token(parsegraph_LBRACK),
        new parsegraph_Token(parsegraph_NAME, "AB"),
        new parsegraph_Token(parsegraph_COMMA),
        new parsegraph_Token(parsegraph_NAME, "CD"),
        new parsegraph_Token(parsegraph_RBRACK)
    ]);
});
function parsegraph_addUserCommands(client)
{
    // Start a new login.
    client.beginUserLogin = function(username, password, callback, callbackThisArg) {
        return client.sendAnonymousCommand(
            "Begin user login.",
            "username=" + username + "&password=" + password,
            "",
            callback,
            callbackThisArg
        );
    };

    // Request a change of password.
    client.changeUserPassword = function(username, password, callback, callbackThisArg) {
        return client.sendCommand(
            "Change user password.",
            "username=" + username + "&password=" + password,
            "",
            callback,
            callbackThisArg
        );
    };

    // Create a new user.
    client.createUser = function(username, password, callback, callbackThisArg) {
        return client.sendAnonymousCommand(
            "Create user.",
            "username=" + username + "&password=" + password,
            "",
            callback,
            callbackThisArg
        );
    };

    // Request an end to the specified user login.
    client.endUserLogin = function(selector, token, callback, callbackThisArg) {
        return client.sendCommand(
            "End user login.",
            "selector=" + selector + "&token=" + token,
            "",
            callback,
            callbackThisArg
        );
    };

    // Renew a user login, extending its lifetime.
    client.renewUserLogin = function(selector, token, callback, callbackThisArg) {
        return client.sendCommand(
            "Renew user login.",
            "selector=" + selector + "&token=" + token,
            "",
            callback,
            callbackThisArg
        );
    };

    client.getUserProfile = function(username, callback, callbackThisArg) {
        return client.sendCommand(
            "Get user profile.",
            "username=" + username,
            "",
            callback,
            callbackThisArg
        );
    };

    client.updateUserProfile = function(username, profile, callback, callbackThisArg) {
        return client.sendCommand(
            "Update user profile.",
            "username=" + username,
            JSON.stringify(profile),
            callback,
            callbackThisArg
        );
    };
}
parsegraph_CLICK_DELAY_MILLIS = 500;

function parsegraph_Camera(surface)
{
    if(!surface) {
        throw new Error("A surface must be provided");
    }
    this._surface = surface;

    this._cameraX = 0;
    this._cameraY = 0;
    this._scale = 1;

    this._aspectRatio = 1;
};

parsegraph_Camera_Tests = new parsegraph_TestSuite("parsegraph_Camera");

function parsegraph_containsAll(viewportX, viewportY, viewWidth, viewHeight, cx, cy, width, height)
{
    var viewHalfWidth = viewWidth / 2;
    var viewHalfHeight = viewHeight / 2;
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    if(cx + halfWidth > viewportX + viewHalfWidth) {
        return false;
    }
    if(cx - halfWidth < viewportX - viewHalfWidth) {
        return false;
    }
    if(cy + halfHeight > viewportY + viewHalfHeight) {
        return false;
    }
    if(cy - halfHeight < viewportY - viewHalfHeight) {
        return false;
    }
    return true;
}

parsegraph_Camera_Tests.addTest("containsAll", function() {
    if(!parsegraph_containsAll(
        0, 0, 800, 600,
        0, 0, 400, 200
    )) {
        return "Small box in viewport";
    }

    if(parsegraph_containsAll(
        0, 0, 800, 600,
        0, 0, 900, 200
    )) {
        return "Taller box in viewport";
    }

    if(parsegraph_containsAll(
        0, 0, 800, 600,
        0, 0, 400, 1000
    )) {
        return "Wider box in viewport";
    }

    if(parsegraph_containsAll(
        0, 0, 800, 600,
        0, 0, 1000, 1000
    )) {
        return "Larger box in viewport";
    }

    if(parsegraph_containsAll(
        0, 0, 800, 600,
        600, 0, 400, 200
    )) {
        return "Small box on edge of viewport";
    }
});

function parsegraph_containsAny(viewportX, viewportY, viewWidth, viewHeight, cx, cy, width, height)
{
    var viewHalfWidth = viewWidth / 2;
    var viewHalfHeight = viewHeight / 2;
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    function dump() {
        console.log("viewportX=" + viewportX);
        console.log("viewportY=" + viewportY);
        console.log("viewWidth=" + viewWidth);
        console.log("viewHeight=" + viewHeight);
        console.log("cx=" + cx);
        console.log("cy=" + cy);
        console.log("width=" + width);
        console.log("height=" + height);
    };

    if(cx - halfWidth > viewportX + viewHalfWidth) {
        //console.log(1);
        //dump();
        return false;
    }
    if(cx + halfWidth < viewportX - viewHalfWidth) {
        //console.log(2);
        //dump();
        return false;
    }
    if(cy - halfHeight > viewportY + viewHalfHeight) {
        //console.log("Viewport min is greater than given's max");
        //dump();
        return false;
    }
    if(cy + halfHeight < viewportY - viewHalfHeight) {
        //console.log("Viewport does not contain any: given vmax is less than viewport's vmin");
        //dump();
        return false;
    }
    return true;
}

parsegraph_Camera_Tests.addTest("containsAny", function() {
    if(!parsegraph_containsAny(
        0, 0, 800, 600,
        0, 0, 400, 200
    )) {
        return "Small box in viewport";
    }

    if(!parsegraph_containsAny(
        0, 0, 800, 600,
        0, 0, 900, 200
    )) {
        return "Taller box in viewport";
    }

    if(!parsegraph_containsAny(
        0, 0, 800, 600,
        0, 0, 400, 1000
    )) {
        return "Wider box in viewport";
    }

    if(!parsegraph_containsAny(
        0, 0, 800, 600,
        0, 0, 1000, 1000
    )) {
        return "Larger box in viewport";
    }

    if(!parsegraph_containsAny(
        0, 0, 800, 600,
        600, 0, 400, 200
    )) {
        return "Small box on edge of viewport";
    }
});

parsegraph_Camera.prototype.zoomToPoint = function(scaleFactor, x, y)
{
    // Get the current mouse position, in world space.
    var mouseInWorld = matrixTransform2D(
        makeInverse3x3(this.worldMatrix()),
        x, y
    );
    //console.log("mouseInWorld=" + mouseInWorld[0] + ", " + mouseInWorld[1]);

    // Adjust the scale.
    this.setScale(this.scale() * scaleFactor);

    // Get the new mouse position, in world space.
    var mouseAdjustment = matrixTransform2D(
        makeInverse3x3(this.worldMatrix()),
        x, y
    );
    //console.log("mouseAdjustment=" + mouseAdjustment[0] + ", " + mouseAdjustment[1]);

    // Adjust the origin by the movement of the fixed point.
    this.adjustOrigin(
        mouseAdjustment[0] - mouseInWorld[0],
        mouseAdjustment[1] - mouseInWorld[1]
    );
};

parsegraph_Camera.prototype.setOrigin = function(x, y)
{
    this._cameraX = x;
    this._cameraY = y;
}

parsegraph_Camera.prototype.toJSON = function()
{
    return {
        "cameraX":this._cameraX,
        "cameraY":this._cameraY,
        "scale":this._scale,
        "width":this._width,
        "height":this._height
    };
};

parsegraph_Camera.prototype.restore = function(json)
{
    this.setOrigin(json.cameraX, json.cameraY);
    this.setScale(json.scale);
};

parsegraph_Camera.prototype.surface = function()
{
    return this._surface;
};
parsegraph_Camera.prototype.graph = parsegraph_Camera.prototype.surface;

parsegraph_Camera.prototype.scale = function()
{
    return this._scale;
};

parsegraph_Camera.prototype.x = function()
{
    return this._cameraX;
};

parsegraph_Camera.prototype.y = function()
{
    return this._cameraY;
};

parsegraph_Camera.prototype.setScale = function(scale)
{
    this._scale = scale;
};

parsegraph_Camera.prototype.toString = function()
{
    return "(" + this._cameraX + ", " + this._cameraY + ", " + this._scale + ")";
};

parsegraph_Camera.prototype.adjustOrigin = function(x, y)
{
    if(Number.isNaN(x) || Number.isNaN(y)) {
        throw new Error("Adjusted origin must not be null. (Given " + x + ", " + y + ")");
    }
    this._cameraX += x;
    this._cameraY += y;
}

parsegraph_Camera.prototype.worldMatrix = function()
{
    return matrixMultiply3x3(
        makeTranslation3x3(this.x(), this.y()),
        makeScale3x3(this.scale(), this.scale())
    );
};

parsegraph_Camera.prototype.aspectRatio = function()
{
    return this._aspectRatio;
};

parsegraph_Camera.prototype.width = function()
{
    return this._width;
};

parsegraph_Camera.prototype.height = function()
{
    return this._height;
};

parsegraph_Camera.prototype.canProject = function()
{
    var displayWidth = this.surface().container().clientWidth;
    var displayHeight = this.surface().container().clientHeight;

    return displayWidth != 0 && displayHeight != 0;
};

parsegraph_Camera.prototype.project = function()
{
    if(!this.canProject()) {
        throw new Error(
            "Camera cannot create a projection matrix because the " +
            "target canvas has no size. Use canProject() to handle."
        );
    }

    // http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = this.surface().container().clientWidth;
    var displayHeight = this.surface().container().clientHeight;

    // Check if the canvas is not the same size.
    if(
        this.surface().canvas().width != displayWidth
        || this.surface().canvas().height != displayHeight
    ) {
        // Make the canvas the same size
        this.surface().canvas().width = displayWidth;
        this.surface().canvas().height = displayHeight;
    }
    // Set the viewport to match
    this.surface().gl().viewport(
        0, 0, this.surface().canvas().width, this.surface().canvas().height
        );

    this._aspectRatio = this.surface().canvas().width / this.surface().canvas().height;
    this._width = this.surface().canvas().width;
    this._height = this.surface().canvas().height;

    return matrixMultiply3x3(
        this.worldMatrix(),
        make2DProjection(
            this.surface().gl().drawingBufferWidth,
            this.surface().gl().drawingBufferHeight
        )
    );
};
function parsegraph_HTimeline()
{
    this._container = document.createElement("div");
    this._container.className = "parsegraph_HTimeline";

    // The canvas that will be drawn to.
    this._canvas = document.createElement("canvas");
    this._canvas.style.display = "block";
    this._container.tabIndex = 0;
    this._gl = this._canvas.getContext("experimental-webgl");

    this._container.appendChild(this._canvas);

    // The identifier used to cancel a pending Render.
    this._pendingRender = null;
    this._needsRepaint = true;

    this._sunrisePainter = new parsegraph_HSunrisePainter(this._gl);
    this._sunrisePainter.setColor(this._backgroundColor);

    this._slicePainter = new parsegraph_HSlicePainter(this._gl);

    this._gridPainter = new parsegraph_HSlicePainter(this._gl);
    this._hourlyGridPainter = new parsegraph_HSlicePainter(this._gl);
    this._minuteGridPainter = new parsegraph_HSlicePainter(this._gl);
    this._selfSlicePainter = new parsegraph_HSlicePainter(this._gl);

    this._glyphPainter = parsegraph_createGlyphPainter(this._gl);

    this._glyphPainter._glyphAtlas.setAfterUpdate(this.scheduleRender, this);
    this._renderText = true;

    this._camera = new parsegraph_Camera(this);

    this._sunrisePainter.setGeographicalPos(
        -360*new Date().getTimezoneOffset()/60/24,
        45
    );
    this.scheduleRepaint();

    this.setBackground(new parsegraph_Color(.2, .2, 1, 1));
};

parsegraph_HTimeline.prototype.focusDate = function(d)
{
    //console.log("Setting time: " + d.getTime()/1000/60);
    this._sunrisePainter.setTime(d);
    this._camera.setOrigin(
        -d.getTime()/1000/60, 0
    );
};

parsegraph_HTimeline.prototype.mouseDown = function(x, y)
{
    // TODO
    return false;
};

parsegraph_HTimeline.prototype.setBackground = function(color)
{
    if(arguments.length > 1) {
        return this.setBackground(parsegraph_createColor.apply(this, arguments));
    }

    if(color == null) {
        throw new Error("color must not be null");
    }

    this._backgroundColor = color;
    this._container.style.backgroundColor = this._backgroundColor.asRGB();

    this._oldBackgroundColor = this._backgroundColor;
    this._backgroundColor = color;
    this._sunrisePainter.setColor(color);
    this.scheduleRepaint();
}

parsegraph_HTimeline.prototype.backgroundColor = function()
{
    return this._backgroundColor;
};

/**
 * Paints the scene; this rebuilds the scene graph.
 */
parsegraph_HTimeline.prototype.paint = function()
{
	//console.log("Painting");

    this._glyphPainter.clear();

    var DAYS_RENDERED = 365;

    this._sunrisePainter.paint(DAYS_RENDERED);

    this._gridPainter.clear();
    this._hourlyGridPainter.clear();
    this._minuteGridPainter.clear();
    this._slicePainter.clear();
    var time = this._sunrisePainter.time();
    if(!time) {
        return;
    }

    var sliceColor = new parsegraph_Color(1, 0, 0, 1);

    var drawSliceFromDates = function(startTime, endTime, i) {
        this._slicePainter.drawSlice(
            startTime.getTime()/1000/60,
            (endTime.getTime() - startTime.getTime())/1000/60,
            new parsegraph_Color(0, 0, 1, 1)
        );
    };

    var drawWorkingDay = function(d) {
        var startTime = new Date(d.getTime());
        var endTime = new Date(d.getTime());
        startTime.setHours(9, 0, 0, 0);
        endTime.setHours(17, 0, 0, 0);
        drawSliceFromDates.call(this, startTime, endTime, i);
    };

    // Render midnights and noons.
    var markTime = new Date(time.getTime());
    markTime.setHours(0, 0, 0, 0);
    for(var i = 0; i < DAYS_RENDERED; ++i) {
        if(markTime.getDay() >= 1 && markTime.getDay() < 6) {
            drawWorkingDay.call(this, markTime);
        }
        for(var j = 0; j < 24; ++j) {
            markTime.setHours(j, 0, 0, 0);
            //console.log("Line slice: ", markTime.getTime()/1000/60);
            var thickness = 2;
            if(j == 0) {
                thickness *= 8;
                this._gridPainter.drawSlice(
                    markTime.getTime()/1000/60,
                    thickness,
                    new parsegraph_Color(1, 1, 1, .6)
                );
            }
            else if(j % 12 == 0) {
                thickness *= 4;
            }
            else if(j % 6 == 0) {
                thickness *= 2;
            }
            this._hourlyGridPainter.drawSlice(
                markTime.getTime()/1000/60,
                thickness,
                new parsegraph_Color(1, 1, 1, (j % 3 == 0 ? .6 : .2))
            );

            for(var k = 15; k < 60; k += 15) {
                this._minuteGridPainter.drawSlice(
                    markTime.getTime()/1000/60 + k,
                    (k == 0 && j == 0) ? 4 : 1,
                    new parsegraph_Color(1, 1, 1, (k == 0 && j == 0) ? .6 : .2)
                );
            }
        }
        markTime = parsegraph_nextDay(markTime);
    }
};

/**
 * Renders the painted scene graph.
 */
parsegraph_HTimeline.prototype.render = function()
{
	//console.log("Rendering");
    if(
        this._container.style.backgroundColor != this._backgroundColor.asRGB()
    ) {
        // The container's background color has changed to something unexpected;
        // this is probably from the user playing with the background in the
        // browser.
        console.log(
            "User changed the background color (" +
            this._container.style.backgroundColor + " != " +
            this._backgroundColor.asRGB()
        );
        this.setBackground(parsegraph_fromRGB(this._container.style.backgroundColor));
    }

    var world = this.camera().project();
    this._gl.clearColor(
        0, 0, 0, 0
    );
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA
    );

    //console.log(new parsegraph_Size(1, this.camera().height()));
    this._sunrisePainter.render(world, this.camera());
    this._slicePainter.render(world);

    var viewableMins = this.camera().width() / this.camera().scale();

    // Minutes don't work well at these large values.
    if(viewableMins <= 60 * 7) {
        this._minuteGridPainter.render(world);
    }
    if(viewableMins <= 60 * 24 * 5) {
        this._hourlyGridPainter.render(world);
    }
    else if(viewableMins <= 60 * 24 * 14) {
        this._gridPainter.render(world);
    }

    // Render the present slice.
    this._selfSlicePainter.clear();
    this._selfSlicePainter.drawSlice(
        new Date().getTime()/1000/60,
        2,
        new parsegraph_Color(0, 0, 0, 1)
    );
    //console.log("Rendering self slice: " + new Date().getTime()/1000/60);
    this._selfSlicePainter.render(world);

    //console.log(viewableMins);
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.DST_ALPHA
    );

    if(this._renderText) {
        this._glyphPainter.render(world, this.camera().scale());
    }
};

/**
 * Returns the container that holds the canvas for this graph.
 */
parsegraph_HTimeline.prototype.container = function()
{
    return this._container;
};

/**
 * Returns the camera that determines the perspective for this graph.
 */
parsegraph_HTimeline.prototype.camera = function()
{
    return this._camera;
};

parsegraph_HTimeline.prototype.gl = function()
{
    return this._gl;
};

parsegraph_HTimeline.prototype.canvas = function()
{
    return this._canvas;
};

/**
 * Schedules a repaint. Painting causes the scene
 * graph to be rebuilt.
 */
parsegraph_HTimeline.prototype.scheduleRepaint = function()
{
    this.scheduleRender();
    this._needsRepaint = true;
};

/**
 * Schedules a render. Rendering draws the scene graph.
 *
 * Rendering will cause repainting if needed.
 */
parsegraph_HTimeline.prototype.scheduleRender = function()
{
    if(this._pendingRender != null) {
        return;
    }
    var graph = this;
    this._pendingRender = requestAnimationFrame(function() {
        graph._pendingRender = null;
        if(graph._needsRepaint) {
            graph.paint();
            graph._needsRepaint = false;
        }

        graph.render();
    });
};

parsegraph_HTimeline.prototype.cancelRepaint = function()
{
    this._needsRepaint = false;
};

parsegraph_HTimeline.prototype.cancelRender = function()
{
    if(this._pendingRender != null) {
        cancelAnimationFrame(this._pendingRender);
        this._pendingRender = null;
    }
};
function parsegraph_VTimeline()
{
    this._container = document.createElement("div");
    this._container.className = "parsegraph_VTimeline";

    // The canvas that will be drawn to.
    this._canvas = document.createElement("canvas");
    this._canvas.style.display = "block";
    this._container.tabIndex = 0;
    this._gl = this._canvas.getContext("experimental-webgl");

    this._container.appendChild(this._canvas);

    // The identifier used to cancel a pending Render.
    this._pendingRender = null;
    this._needsRepaint = true;

    this._sunrisePainter = new parsegraph_VSunrisePainter(this._gl);
    this._sunrisePainter.setColor(this._backgroundColor);

    this._slicePainter = new parsegraph_VSlicePainter(this._gl);

    this._gridPainter = new parsegraph_VSlicePainter(this._gl);
    this._hourlyGridPainter = new parsegraph_VSlicePainter(this._gl);
    this._minuteGridPainter = new parsegraph_VSlicePainter(this._gl);
    this._selfSlicePainter = new parsegraph_VSlicePainter(this._gl);

    this._glyphPainter = parsegraph_createGlyphPainter(this._gl);

    this._glyphPainter._glyphAtlas.setAfterUpdate(this.scheduleRender, this);
    this._renderText = true;

    this._camera = new parsegraph_Camera(this);

    this._sunrisePainter.setGeographicalPos(
        -360*new Date().getTimezoneOffset()/60/24,
        45
    );
    this.scheduleRepaint();

    this.setBackground(new parsegraph_Color(.2, .2, 1, 1));
};

parsegraph_VTimeline.prototype.focusDate = function(d)
{
    //console.log("Setting time: " + d.getTime()/1000/60);
    this._sunrisePainter.setTime(d);
    this._camera.setOrigin(
        0, -d.getTime()/1000/60
    );
};

parsegraph_VTimeline.prototype.mouseDown = function(x, y)
{
    // TODO
    return false;
};

parsegraph_VTimeline.prototype.setBackground = function(color)
{
    if(arguments.length > 1) {
        return this.setBackground(parsegraph_createColor.apply(this, arguments));
    }

    if(color == null) {
        throw new Error("color must not be null");
    }

    this._backgroundColor = color;
    this._container.style.backgroundColor = this._backgroundColor.asRGB();

    this._oldBackgroundColor = this._backgroundColor;
    this._backgroundColor = color;
    this._sunrisePainter.setColor(color);
    this.scheduleRepaint();
}

parsegraph_VTimeline.prototype.backgroundColor = function()
{
    return this._backgroundColor;
};

/**
 * Paints the scene; this rebuilds the scene graph.
 */
parsegraph_VTimeline.prototype.paint = function()
{
	//console.log("Painting");

    this._glyphPainter.clear();

    var DAYS_RENDERED = 365;

    this._sunrisePainter.paint(DAYS_RENDERED);

    this._gridPainter.clear();
    this._hourlyGridPainter.clear();
    this._minuteGridPainter.clear();
    this._slicePainter.clear();
    var time = this._sunrisePainter.time();
    if(!time) {
        return;
    }

    var sliceColor = new parsegraph_Color(1, 0, 0, 1);

    var drawSliceFromDates = function(startTime, endTime, i) {
        this._slicePainter.drawSlice(
            startTime.getTime()/1000/60,
            (endTime.getTime() - startTime.getTime())/1000/60,
            new parsegraph_Color(0, 0, 1, 1)
        );
    };

    var drawWorkingDay = function(d) {
        var startTime = new Date(d.getTime());
        var endTime = new Date(d.getTime());
        startTime.setHours(9, 0, 0, 0);
        endTime.setHours(17, 0, 0, 0);
        drawSliceFromDates.call(this, startTime, endTime, i);
    };

    // Render midnights and noons.
    var markTime = new Date(time.getTime());
    markTime.setHours(0, 0, 0, 0);
    for(var i = 0; i < DAYS_RENDERED; ++i) {
        if(markTime.getDay() >= 1 && markTime.getDay() < 6) {
            drawWorkingDay.call(this, markTime);
        }
        for(var j = 0; j < 24; ++j) {
            markTime.setHours(j, 0, 0, 0);
            //console.log("Line slice: ", markTime.getTime()/1000/60);
            var thickness = 2;
            if(j == 0) {
                thickness *= 8;
                this._gridPainter.drawSlice(
                    markTime.getTime()/1000/60,
                    thickness,
                    new parsegraph_Color(1, 1, 1, .6)
                );
            }
            else if(j % 12 == 0) {
                thickness *= 4;
            }
            else if(j % 6 == 0) {
                thickness *= 2;
            }
            this._hourlyGridPainter.drawSlice(
                markTime.getTime()/1000/60,
                thickness,
                new parsegraph_Color(1, 1, 1, (j % 3 == 0 ? .6 : .2))
            );

            for(var k = 15; k < 60; k += 15) {
                this._minuteGridPainter.drawSlice(
                    markTime.getTime()/1000/60 + k,
                    (k == 0 && j == 0) ? 4 : 1,
                    new parsegraph_Color(1, 1, 1, (k == 0 && j == 0) ? .6 : .2)
                );
            }
        }
        markTime = parsegraph_nextDay(markTime);
    }
};

/**
 * Renders the painted scene graph.
 */
parsegraph_VTimeline.prototype.render = function()
{
	//console.log("Rendering");
    if(
        this._container.style.backgroundColor != this._backgroundColor.asRGB()
    ) {
        // The container's background color has changed to something unexpected;
        // this is probably from the user playing with the background in the
        // browser.
        console.log(
            "User changed the background color (" +
            this._container.style.backgroundColor + " != " +
            this._backgroundColor.asRGB()
        );
        this.setBackground(parsegraph_fromRGB(this._container.style.backgroundColor));
    }

    var world = this.camera().project();
    this._gl.clearColor(
        0, 0, 0, 0
    );
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA
    );

    //console.log(new parsegraph_Size(1, this.camera().height()));
    this._sunrisePainter.render(world, this.camera());
    this._slicePainter.render(world);

    var viewableMins = this.camera().height() / this.camera().scale();

    // Minutes don't work well at these large values.
    if(viewableMins <= 60 * 7) {
        this._minuteGridPainter.render(world);
    }
    if(viewableMins <= 60 * 24 * 5) {
        this._hourlyGridPainter.render(world);
    }
    else if(viewableMins <= 60 * 24 * 14) {
        this._gridPainter.render(world);
    }

    // Render the present slice.
    this._selfSlicePainter.clear();
    this._selfSlicePainter.drawSlice(
        new Date().getTime()/1000/60,
        2,
        new parsegraph_Color(0, 0, 0, 1)
    );
    //console.log("Rendering self slice: " + new Date().getTime()/1000/60);
    this._selfSlicePainter.render(world);

    //console.log(viewableMins);
    this._gl.blendFunc(
        this._gl.SRC_ALPHA, this._gl.DST_ALPHA
    );

    if(this._renderText) {
        this._glyphPainter.render(world, this.camera().scale());
    }
};

/**
 * Returns the container that holds the canvas for this graph.
 */
parsegraph_VTimeline.prototype.container = function()
{
    return this._container;
};

/**
 * Returns the camera that determines the perspective for this graph.
 */
parsegraph_VTimeline.prototype.camera = function()
{
    return this._camera;
};

parsegraph_VTimeline.prototype.gl = function()
{
    return this._gl;
};

parsegraph_VTimeline.prototype.canvas = function()
{
    return this._canvas;
};

/**
 * Schedules a repaint. Painting causes the scene
 * graph to be rebuilt.
 */
parsegraph_VTimeline.prototype.scheduleRepaint = function()
{
    this.scheduleRender();
    this._needsRepaint = true;
};

/**
 * Schedules a render. Rendering draws the scene graph.
 *
 * Rendering will cause repainting if needed.
 */
parsegraph_VTimeline.prototype.scheduleRender = function()
{
    if(this._pendingRender != null) {
        return;
    }
    var graph = this;
    this._pendingRender = requestAnimationFrame(function() {
        graph._pendingRender = null;
        if(graph._needsRepaint) {
            graph.paint();
            graph._needsRepaint = false;
        }

        graph.render();
    });
};

parsegraph_VTimeline.prototype.cancelRepaint = function()
{
    this._needsRepaint = false;
};

parsegraph_VTimeline.prototype.cancelRender = function()
{
    if(this._pendingRender != null) {
        cancelAnimationFrame(this._pendingRender);
        this._pendingRender = null;
    }
};
parsegraph_HSlicePainter_VertexShader =
"uniform mat3 u_world;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec2 a_texCoord;\n" +
"attribute vec4 a_color;\n" +
"\n" +
"varying highp float offset;\n" +
"varying highp vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = vec4((u_world * vec3(a_position.x, 0, 1.0)).x, a_position.y, 0.0, 1.0);" +
    "contentColor = a_color;" +
    "offset = a_texCoord.x;" +
"}";

parsegraph_HSlicePainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp float offset;\n" +
"\n" +
"void main() {\n" +
    //"highp float brightness = sin(offset * 3.14159);" +
    "gl_FragColor = contentColor;" +
"}";

function parsegraph_HSlicePainter(gl)
{
    this._gl = gl;

    // Compile the shader program.
    this._blockProgram = this._gl.createProgram();

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_HSlicePainter_VertexShader,
            this._gl.VERTEX_SHADER
        )
    );

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_HSlicePainter_FragmentShader,
            this._gl.FRAGMENT_SHADER
        )
    );

    this._gl.linkProgram(this._blockProgram);
    if(!this._gl.getProgramParameter(
        this._blockProgram, this._gl.LINK_STATUS
    )) {
        throw new Error("HSlicePainter program failed to link.");
    }

    // Prepare attribute buffers.
    this._blockBuffer = parsegraph_createPagingBuffer(
        this._gl, this._blockProgram
    );
    this.a_position = this._blockBuffer.defineAttrib("a_position", 2);
    this.a_texCoord = this._blockBuffer.defineAttrib("a_texCoord", 2);
    this.a_color = this._blockBuffer.defineAttrib("a_color", 4);

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this._blockProgram, "u_world"
    );
};

parsegraph_HSlicePainter.prototype.drawSlice = function(start, size, color)
{
    //console.log("Drawing slice: " + start + ", " + size);
    if(color === undefined) {
        color = new parsegraph_Color(1, 1, 1, 1);
    }

    // Append position data.
    this._blockBuffer.appendData(
        this.a_position,
        start, -1,
        start + size, -1,
        start + size, 1,
        start, -1,
        start + size, 1,
        start, 1
    );

    // Append texture coordinate data.
    this._blockBuffer.appendData(
        this.a_texCoord,
        parsegraph_generateRectangleTexcoords()
    );

    // Append color data.
    for(var k = 0; k < 3 * 2; ++k) {
        this._blockBuffer.appendData(
            this.a_color,
            color.r(),
            color.g(),
            color.b(),
            color.a()
        );
    }
};

parsegraph_HSlicePainter.prototype.clear = function()
{
    this._blockBuffer.clear();
};

parsegraph_HSlicePainter.prototype.render = function(world)
{
    // Render blocks.
    this._gl.useProgram(
        this._blockProgram
    );
    this._gl.uniformMatrix3fv(
        this.u_world,
        false,
        world
    );
    this._blockBuffer.renderPages();
};
parsegraph_VSlicePainter_VertexShader =
"uniform mat3 u_world;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec2 a_texCoord;\n" +
"attribute vec4 a_color;\n" +
"\n" +
"varying highp float offset;\n" +
"varying highp vec4 contentColor;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = vec4(a_position.x, (u_world * vec3(0, a_position.y, 1.0)).y, 0.0, 1.0);" +
    "contentColor = a_color;" +
    "offset = a_texCoord.x;" +
"}";

parsegraph_VSlicePainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp vec4 contentColor;\n" +
"varying highp float offset;\n" +
"\n" +
"void main() {\n" +
    //"highp float brightness = sin(offset * 3.14159);" +
    "gl_FragColor = contentColor;" +
"}";

function parsegraph_VSlicePainter(gl)
{
    this._gl = gl;

    // Compile the shader program.
    this._blockProgram = this._gl.createProgram();

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_VSlicePainter_VertexShader,
            this._gl.VERTEX_SHADER
        )
    );

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_VSlicePainter_FragmentShader,
            this._gl.FRAGMENT_SHADER
        )
    );

    this._gl.linkProgram(this._blockProgram);
    if(!this._gl.getProgramParameter(
        this._blockProgram, this._gl.LINK_STATUS
    )) {
        throw new Error("VSlicePainter program failed to link.");
    }

    // Prepare attribute buffers.
    this._blockBuffer = parsegraph_createPagingBuffer(
        this._gl, this._blockProgram
    );
    this.a_position = this._blockBuffer.defineAttrib("a_position", 2);
    this.a_texCoord = this._blockBuffer.defineAttrib("a_texCoord", 2);
    this.a_color = this._blockBuffer.defineAttrib("a_color", 4);

    // Cache program locations.
    this.u_world = this._gl.getUniformLocation(
        this._blockProgram, "u_world"
    );
};

parsegraph_VSlicePainter.prototype.drawSlice = function(start, size, color)
{
    //console.log("Drawing slice: " + start + ", " + size);
    if(color === undefined) {
        color = new parsegraph_Color(1, 1, 1, 1);
    }

    // Append position data.
    this._blockBuffer.appendData(
        this.a_position,
        -1, start,
        -1, start + size,
        1, start + size,
        -1, start,
        1, start + size,
        1, start
    );

    // Append texture coordinate data.
    this._blockBuffer.appendData(
        this.a_texCoord,
        parsegraph_generateRectangleTexcoords()
    );

    // Append color data.
    for(var k = 0; k < 3 * 2; ++k) {
        this._blockBuffer.appendData(
            this.a_color,
            color.r(),
            color.g(),
            color.b(),
            color.a()
        );
    }
};

parsegraph_VSlicePainter.prototype.clear = function()
{
    this._blockBuffer.clear();
};

parsegraph_VSlicePainter.prototype.render = function(world)
{
    // Render blocks.
    this._gl.useProgram(
        this._blockProgram
    );
    this._gl.uniformMatrix3fv(
        this.u_world,
        false,
        world
    );
    this._blockBuffer.renderPages();
};
////////////////////////////////////////////////////////////////////////////////////
//  MAIN COMPUTE FUNCTION
////////////////////////////////////////////////////////////////////////////////////

parsegraph_HSunrisePainter_VertexShader =
"uniform mat3 u_world;\n" +
"uniform vec4 u_color;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec2 a_texCoord;\n" +
"\n" +
"varying highp float offset;\n" +
"varying vec4 color;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = vec4((u_world * vec3(a_position.x, 0, 1.0)).x, a_position.y, 0.0, 1.0);" +
    "offset = a_texCoord.x;" +
    "color = u_color;" +
"}";

parsegraph_HSunrisePainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp float offset;\n" +
"varying vec4 color;\n" +
"" +
"void main() {\n" +
    "highp float brightness = .3 * sin(offset * 3.14159);" +
    "gl_FragColor = color * vec4(" +
        "1, 1, 1, brightness" +
    ");" +
"}";

function parsegraph_HSunrisePainter(gl)
{
    this._gl = gl;

    // Compile the shader program.
    this._blockProgram = this._gl.createProgram();

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_HSunrisePainter_VertexShader,
            this._gl.VERTEX_SHADER
        )
    );

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_HSunrisePainter_FragmentShader,
            this._gl.FRAGMENT_SHADER
        )
    );

    this._gl.linkProgram(this._blockProgram);
    if(!this._gl.getProgramParameter(
        this._blockProgram, this._gl.LINK_STATUS
    )) {
        throw new Error("SunrisePainter program failed to link.");
    }

    // Prepare attribute buffers.
    this._blockBuffer = parsegraph_createPagingBuffer(
        this._gl, this._blockProgram
    );
    this.a_texCoord = this._blockBuffer.defineAttrib("a_texCoord", 2);
    this.a_position = this._blockBuffer.defineAttrib("a_position", 2);

    this.u_world = this._gl.getUniformLocation(
        this._blockProgram, "u_world"
    );
    this.u_color = this._gl.getUniformLocation(
        this._blockProgram, "u_color"
    );

    this._time = null;
    this._geographicalPos = null;
    this._color = new parsegraph_Color(1, 1, 1, 1);
};

parsegraph_HSunrisePainter.prototype.color = function()
{
    return this._color;
};

parsegraph_HSunrisePainter.prototype.setColor = function(color)
{
    this._color = color;
};

parsegraph_HSunrisePainter.prototype.geographicalPos = function()
{
    return this._geographicalPos;
};

parsegraph_HSunrisePainter.prototype.setGeographicalPos = function(x, y)
{
    this._geographicalPos = [x, y];
};

/**
 * Sets the time to seconds since the epoch.
 */
parsegraph_HSunrisePainter.prototype.setTime = function(time)
{
    this._time = new Date(time.getTime());
};

/**
 * Returns the time in seconds since the epoch.
 */
parsegraph_HSunrisePainter.prototype.time = function()
{
    return this._time;
};

parsegraph_HSunrisePainter.prototype.paint = function(daysRendered)
{
    if(this.time() == null || this._geographicalPos == null) {
        return;
    }

    this._blockBuffer.clear();

    var d = new Date(this.time().getTime());
    d.setHours(0, 0, 0, 0);
    var offsetMins = d.getTime()/1000/60;
    d.setHours(12, 0, 0, 0);
    for(var i = 0; i < daysRendered; ++i) {
        var sunTimes = getSunriseAndSunset(
            d,
            this.geographicalPos()[0],
            this.geographicalPos()[1]
        );

        // Day length in minutes.
        var dayLength = sunTimes[1] - sunTimes[0];

        // Append position data.
        this._blockBuffer.appendData(
            this.a_position,
            parsegraph_generateRectangleVertices(
                offsetMins + sunTimes[0] + dayLength / 2, 0,
                dayLength, 2
            )
        );
        //console.log("Offset: " + offsetMins + ", dayLength=" + dayLength);

        this._blockBuffer.appendData(
            this.a_texCoord,
            parsegraph_generateRectangleTexcoords()
        );

        d = parsegraph_nextDay(d);
        offsetMins += 24 * 60;
    }
};

parsegraph_HSunrisePainter.prototype.render = function(world, camera)
{
    // Render blocks.
    this._gl.useProgram(this._blockProgram);
    this._gl.uniformMatrix3fv(this.u_world, false, world);
    this._gl.uniform4f(
        this.u_color,
        this.color().r(),
        this.color().g(),
        this.color().b(),
        this.color().a()
    );
    this._blockBuffer.renderPages();
    //console.log("Rendering (" + camera.x() + ", " + camera.y() + ")");
};
////////////////////////////////////////////////////////////////////////////////////
//  MAIN COMPUTE FUNCTION
////////////////////////////////////////////////////////////////////////////////////

parsegraph_VSunrisePainter_VertexShader =
"uniform mat3 u_world;\n" +
"uniform vec4 u_color;\n" +
"\n" +
"attribute vec2 a_position;\n" +
"attribute vec2 a_texCoord;\n" +
"\n" +
"varying highp float offset;\n" +
"varying vec4 color;\n" +
"\n" +
"void main() {\n" +
    "gl_Position = vec4(a_position.x, (u_world * vec3(0, a_position.y, 1.0)).y, 0.0, 1.0);" +
    "offset = a_texCoord.y;" +
    "color = u_color;" +
"}";

parsegraph_VSunrisePainter_FragmentShader =
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"" +
"varying highp float offset;\n" +
"varying vec4 color;\n" +
"" +
"void main() {\n" +
    "highp float brightness = .3 * sin(offset * 3.14159);" +
    "gl_FragColor = color * vec4(" +
        "1, 1, 1, brightness" +
    ");" +
"}";

function parsegraph_VSunrisePainter(gl)
{
    this._gl = gl;

    // Compile the shader program.
    this._blockProgram = this._gl.createProgram();

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_VSunrisePainter_VertexShader,
            this._gl.VERTEX_SHADER
        )
    );

    this._gl.attachShader(
        this._blockProgram,
        compileShader(
            this._gl,
            parsegraph_VSunrisePainter_FragmentShader,
            this._gl.FRAGMENT_SHADER
        )
    );

    this._gl.linkProgram(this._blockProgram);
    if(!this._gl.getProgramParameter(
        this._blockProgram, this._gl.LINK_STATUS
    )) {
        throw new Error("SunrisePainter program failed to link.");
    }

    // Prepare attribute buffers.
    this._blockBuffer = parsegraph_createPagingBuffer(
        this._gl, this._blockProgram
    );
    this.a_texCoord = this._blockBuffer.defineAttrib("a_texCoord", 2);
    this.a_position = this._blockBuffer.defineAttrib("a_position", 2);

    this.u_world = this._gl.getUniformLocation(
        this._blockProgram, "u_world"
    );
    this.u_color = this._gl.getUniformLocation(
        this._blockProgram, "u_color"
    );

    this._time = null;
    this._geographicalPos = null;
    this._color = new parsegraph_Color(1, 1, 1, 1);
};

parsegraph_VSunrisePainter.prototype.color = function()
{
    return this._color;
};

parsegraph_VSunrisePainter.prototype.setColor = function(color)
{
    this._color = color;
};

parsegraph_VSunrisePainter.prototype.geographicalPos = function()
{
    return this._geographicalPos;
};

parsegraph_VSunrisePainter.prototype.setGeographicalPos = function(x, y)
{
    this._geographicalPos = [x, y];
};

/**
 * Sets the time to seconds since the epoch.
 */
parsegraph_VSunrisePainter.prototype.setTime = function(time)
{
    this._time = new Date(time.getTime());
};

/**
 * Returns the time in seconds since the epoch.
 */
parsegraph_VSunrisePainter.prototype.time = function()
{
    return this._time;
};

parsegraph_VSunrisePainter.prototype.paint = function(daysRendered)
{
    if(this.time() == null || this._geographicalPos == null) {
        return;
    }

    this._blockBuffer.clear();

    var d = new Date(this.time().getTime());
    d.setHours(0, 0, 0, 0);
    var offsetMins = d.getTime()/1000/60;
    d.setHours(12, 0, 0, 0);
    for(var i = 0; i < daysRendered; ++i) {
        var sunTimes = getSunriseAndSunset(
            d,
            this.geographicalPos()[0],
            this.geographicalPos()[1]
        );

        // Day length in minutes.
        var dayLength = sunTimes[1] - sunTimes[0];

        // Append position data.
        this._blockBuffer.appendData(
            this.a_position,
            parsegraph_generateRectangleVertices(
                0, offsetMins + sunTimes[0] + dayLength / 2,
                2, dayLength
            )
        );
        //console.log("Offset: " + offsetMins + ", dayLength=" + dayLength);

        this._blockBuffer.appendData(
            this.a_texCoord,
            parsegraph_generateRectangleTexcoords()
        );

        d = parsegraph_nextDay(d);
        offsetMins += 24 * 60;
    }
};

parsegraph_VSunrisePainter.prototype.render = function(world, camera)
{
    // Render blocks.
    this._gl.useProgram(this._blockProgram);
    this._gl.uniformMatrix3fv(this.u_world, false, world);
    this._gl.uniform4f(
        this.u_color,
        this.color().r(),
        this.color().g(),
        this.color().b(),
        this.color().a()
    );
    this._blockBuffer.renderPages();
    //console.log("Rendering (" + camera.x() + ", " + camera.y() + ")");
};

/* Generated Tue Aug  1 18:24:43 CDT 2017 */
