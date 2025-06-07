carScale = 0.3;

var darkMode = false;

var singleCarMode = false;
var ccar;
var carArray = [];
var numberOfCars = 10;
var gasFillup = 900;

var WinningCars = [];
var topWinners = 50;

var circleTrack;

var wall_grid = [];
var road_grid = [];

var gridSize = 40;

var stepsPerRound = 10000;
var currentStep = 0;

var scoreBoard;
scoreBoardVisible = false;
var scoreCount = 0;


const SIM_WIDTH = 1024;
const SIM_HEIGHT = 1024;

var debugBrain = false;

let STEPS_PER_FRAME = 1;

let mutation_amount = 30;

let fitnessRange = [0, 0];


let colorLow;
let colorHigh;

// let time = 0;

function testPoint(gridx, gridy) {
    let isGood = false;
    if (gridLookup(gridx, gridy) == false) {
        fill(0)
        isGood = false;
    } else {
        fill(200, 70, 70)
        isGood = true;
    }
    // ellipse(gridx, gridy, 10, 10)
    return isGood;
}


var brainView; // graphics view of a brain

var brainViewShow = true;

let winnerDiv;

// A dict of grids, each representing a grid of data.
// Instantiated on setup().
// const grids = {};

function setup() {

    angleMode(RADIANS);

    createCanvas(1000, 1000);

    colorLow = color(218, 100, 100);
    colorHigh = color(30, 200, 120);

    // a button to repopulate the cars
    let repopulateButton = createButton('repopulate');
    repopulateButton.position(width + 10, 10);
    repopulateButton.mousePressed(repopulate);

    // a slider to control the number of cars
    let carSlider = createSlider(1, 500, numberOfCars);
    carSlider.position(width + 10, 40);
    let carSliderValue = createP('Number of Cars : ' + numberOfCars).position(width + 10, 45);


    carSlider.input(function () {
        numberOfCars = carSlider.value();
        // set the value of the text box to the slider value
        carSliderValue.html('Number of Cars : ' + numberOfCars);

    });

    // a toggle to show the brain of the selected car
    let brainToggle = createCheckbox('Show Brain', false);
    brainToggle.position(width + 10, 90);
    brainToggle.changed(function () {
        brainViewShow = brainToggle.checked();
    });

    // a slider to control the number of steps per frame
    let stepSlider = createSlider(1, 100, STEPS_PER_FRAME);
    stepSlider.position(width + 10, 120);
    let stepsFrameValue = createP('Steps per Frame : ' + STEPS_PER_FRAME).position(width + 10, 125);
    stepSlider.input(function () {
        STEPS_PER_FRAME = stepSlider.value();
        stepsFrameValue.html('Steps per Frame : ' + STEPS_PER_FRAME);
    });

    // a slider to control the mutation amount
    let mutationSlider = createSlider(1, 100, mutation_amount);
    mutationSlider.position(width + 10, 170);
    let mutationValue = createP('Mutation Amount : ' + mutation_amount).position(width + 10, 175);
    mutationSlider.input(function () {
        mutation_amount = mutationSlider.value();
        mutationValue.html('Mutation Amount : ' + mutation_amount);

    });

    // a toggle to show the score board
    let scoreToggle = createCheckbox('Show Score Board', true);
    scoreToggle.position(width + 10, 220);
    scoreToggle.changed(function () {
        scoreBoardVisible = scoreToggle.checked();
    });


    // a button to save the current winners as json
    let saveButton = createButton('save winners');
    saveButton.position(width + 10, 250);
    saveButton.mousePressed(saveWinners);

    // a button to load the current winners as json
    let loadButton = createButton('load winners');
    loadButton.position(width + 10, 280);
    loadButton.mousePressed(loadWinners);


    // a toggle switch for dark mode
    let darkModeToggle = createCheckbox('Dark Mode', false);
    darkModeToggle.position(width + 10, 310);
    darkModeToggle.changed(function () {
        darkMode = darkModeToggle.checked();
        if (darkMode) {
            background(0);
        }
    });


    // all ui goes into a div
    let uiDiv = createDiv();
    // uiDiv.position(width+10, 10);
    uiDiv.child(repopulateButton);
    uiDiv.child(carSlider);
    uiDiv.child(carSliderValue);
    uiDiv.child(brainToggle);
    uiDiv.child(stepSlider);
    uiDiv.child(stepsFrameValue);
    uiDiv.child(mutationSlider);
    uiDiv.child(mutationValue);
    uiDiv.child(scoreToggle);
    uiDiv.child(saveButton);
    uiDiv.child(loadButton);
    uiDiv.child(darkModeToggle);


    // a div to hold the winningCars
    winnerDiv = createDiv();
    winnerDiv.position(width + 10, 350);
    winnerDiv.style('width', '200px');
    winnerDiv.style('height', '500px');
    winnerDiv.style('overflow', 'scroll');
    winnerDiv.style('background-color', 'white');
    winnerDiv.style('border', '1px solid black');
    winnerDiv.style('padding', '10px');
    winnerDiv.style('margin', '10px');
    winnerDiv.style('font-family', 'monospace');

    var winnerListString = '';
    for (var i = 0; i < WinningCars; i++) {
        winnerListString += i + ' : ' + WinningCars[i].score + '<br>';
    }

    winnerDiv.html(winnerListString);


    // div to create a new car using an input box for the genome sequence
    let newCarDiv = createDiv();
    newCarDiv.position(width + 10, 870);
    newCarDiv.style('width', '200px');
    newCarDiv.style('height', '100px');
    newCarDiv.style('background-color', 'white');
    newCarDiv.style('border', '1px solid black');

    let newCarInput = createInput();
    newCarInput.position(width + 10, 880);
    newCarInput.style('width', '200px');
    newCarInput.style('height', '20px');

    let newCarButton = createButton('create car');
    newCarButton.position(width + 10, 910);
    newCarButton.mousePressed(function () {
        let genome = newCarInput.value();
        let newCar = new Car(genome);
        cars.push(newCar);
    });





    if (debugBrain) {
        frameRate(3);
    }

    pixelDensity(1);
    noSmooth();

    brainView = createGraphics(width, 200);
    scoreBoard = createGraphics(width, 200);
    brainView.background(200);
    scoreBoard.background(0);
    circleTrack = new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);

    // pwinners = [
    //     ['486D3B31', 'BCF85158', '99043D48', '6269905A', '90B95E4A', '196A4258', '997564EE', '5D2F50BC', '0C672EAF', '4A9318EC', '8A36B2D7', '17669E3C', 'DCD18A0A', '28F62692', 'E07E4C2C', '0E90295F', '4DAD9D4A', '89E622CC', 'EFEE7B75', 'F1295F9A', '05C3DDBF', '0A352858', 'AE1A0C96', '15EAF25C', '8B421A7A', '8FA83B16', 'DE28A8CA', 'E61E7ED4', '473D1BD5', '0480D2A1', '5EA0AC1E', '08B02C93', 'F74E401A', '0F2A2D9B', '83BE37AC', '0CB07B0A', '7370C2E8', '0F243928', '02CBBB92', '1DAA9A18', 'BFFBEF0C', 'CA87BF78', '00719057', 'D314465E', '7A067C49', 'CA4FF36D'],
    //     ['03E8D70C', '04A32053', '7196183D', '79A9F7FB', '07B94CB2', '01503523', '03958A77', 'D1187EBA', 'CC28CB0D', '0E55108C', '09D74BB4', 'B7CB3523', '9792B69C', '69C107BC', 'BB7110BC', '231AC5B6', '2256040C', 'EB0643D8', '178825B8', '7E99D605', '03DCD22C', 'F9A753CE', 'DEFF504E', 'FF580634', '0A5B225E', '18BC3BB6', 'E0E6794B', '30B0130D', 'C13A9C5C', 'AFF132BA', '01C45235', '8E461CFE', '62C473EC', '8DF8F608', '064EC599', '80493D18', '077F2931', 'D3F31D5E'],
    //     ['03E8D70C', '04A32053', '7196183D', 'E45C64D1', '07B94CB2', 'DD2CDE8A', '03958A77', 'D1187EBA', 'A4E9AE8A', '0E55108C', '09D74BB4', 'B7CB3523', '9792B69C', '69C107BC', 'BB7110BC', '231AC5B6', 'F324BD34', 'CAA3CCD4', '178825B8', '7E99D605', '03DCD22C', 'F9A753CE', 'DEFF504E', 'FF580634', '0A5B225E', '18BC3BB6', 'E0E6794B', '30B0130D', 'C13A9C5C', 'AFF132BA', '20B123E8', '8E461CFE', '62C473EC', '6436F1EC', '064EC599', '80493D18', '077F2931', 'D3F31D5E'],
    //     ['B5BE5ED1', 'A7447DB4', '59FAA032', 'FCF4F501', '0E4FD1B6', '6EC6E1AA', '64BD7146', '00D3A0AE', '9D23AE29', '59EF82C8', '7E9187BE', '0BC24819', '09C1F538', '10BEF7CC', '6ABAD118', '7BFB1334', 'B04AFBA8', '95F71AB5', '220CED02', '0C85301B', 'C8CDA3BD', '6830648C', 'A82A87CA', '1194FB43', '695F186A', '68C0C313', 'BA1B0B87'],
    //     ['9AC2036E', 'A7447DB4', '59FAA032', 'FCF4F501', '0E4FD1B6', '6EC6E1AA', '64BD7146', '00D3A0AE', '9D23AE29', '59EF82C8', '7E9187BE', '0BC24819', '09C1F538', '10BEF7CC', '39822268', '7BFB1334', 'B04AFBA8', '95F71AB5', '220CED02', '0C85301B', 'C8CDA3BD', '6830648C', 'A82A87CA', '77F14AEE', '695F186A', '68C0C313', 'BA1B0B87'],
    //     ['486D3B31', '395EC364', '99043D48', '6269905A', '90B95E4A', '196A4258', '997564EE', '5D2F50BC', '0C672EAF', '4A9318EC', '8A36B2D7', '17669E3C', 'DCD18A0A', '28F62692', '8A5AD67C', '0E90295F', '4DAD9D4A', '525CA50E', 'EFEE7B75', 'F1295F9A', 'F2BB3E0A', '0A352858', 'AE1A0C96', '3DBD4058', '997A2648', '8FA83B16', 'DE28A8CA', 'E61E7ED4', '2267FFB4', '414C672E', '5EA0AC1E', '08B02C93', 'F74E401A', 'EE63EFC8', '83BE37AC', '0CB07B0A', '7370C2E8', 'A0DC758E', '2943DD48', '1DAA9A18', '99550548', '877D1EF4', '00719057', 'D314465E', 'FFC1193E', 'CA4FF36D'],
    //     ['27C10B88', 'BCF85158', '99043D48', 'EA4A33BC', '90B95E4A', 'F56A45B8', '997564EE', '5D2F50BC', 'E6191ECE', 'CF9A7B28', '62D167F2', 'C3101264', 'DCD18A0A', '06F96E85', '92D0E61E', '0250C5D8', '4DAD9D4A', '5CACA068', '1F4AAF15', 'F1295F9A', '8D0C8378', '4DD35C64', 'AE1A0C96', 'DEF8CA36', '3326CA78', '8D0BFEF8', 'DE28A8CA', 'C424744E', '20D2D4B5', '613B97AA', '5EA0AC1E', '08B02C93', 'EDE9A60A', 'AF067BAC', '83BE37AC', '71C396B2', '3942AE62', '0F243928', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '38DFEFC4', 'D314465E', 'D0BA9038', '739BEE08'],
    //     ['27C10B88', '0C245B5B', '99043D48', 'EA4A33BC', '90B95E4A', 'F56A45B8', '997564EE', '5D2F50BC', 'E6191ECE', 'CF9A7B28', '62D167F2', 'C3101264', 'DCD18A0A', '06F96E85', '92D0E61E', '0250C5D8', '4DAD9D4A', '5CACA068', '1F4AAF15', 'F1295F9A', '8D0C8378', '4DD35C64', 'AE1A0C96', 'DEF8CA36', '3326CA78', '8D0BFEF8', 'DE28A8CA', 'C424744E', '20D2D4B5', '613B97AA', '5EA0AC1E', '08B02C93', 'EDE9A60A', 'AF067BAC', '83BE37AC', '71C396B2', '3942AE62', '0F243928', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '38DFEFC4', 'D314465E', 'D0BA9038', '739BEE08'],
    //     ['2D3CF1FA', 'BCF85158', 'D139B567', 'E8301B83', '90B95E4A', '2F1FD314', '997564EE', '5D2F50BC', '0C672EAF', 'CF9A7B28', '62D167F2', '17669E3C', 'B1884CA9', 'BC39CB84', '92D0E61E', '0250C5D8', '4DAD9D4A', '5CACA068', '1F4AAF15', 'F1295F9A', 'F969E208', '4DD35C64', 'AE1A0C96', '9B441436', '8B421A7A', '4D4FCA22', 'DE28A8CA', '10009A64', '9F9F12E4', '613B97AA', '5EA0AC1E', '08B02C93', '389811DE', 'AF067BAC', '83BE37AC', '71C396B2', '3942AE62', '54DADE88', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '38DFEFC4', 'D314465E', '7A067C49', '739BEE08'],
    //     ['486D3B31', '395EC364', '99043D48', '6269905A', '90B95E4A', 'A15F6354', '997564EE', '5D2F50BC', '0C672EAF', '4A9318EC', '8A36B2D7', '33CE3E68', 'DCD18A0A', '0F69EF08', '010BA6F9', '0E90295F', '1DCACD9C', '525CA50E', 'EFEE7B75', 'F1295F9A', 'F2BB3E0A', '0A352858', 'AE1A0C96', '5C79A274', '8B421A7A', '8FA83B16', 'DE28A8CA', '79316D96', '2267FFB4', '414C672E', '5EA0AC1E', '08B02C93', 'F74E401A', '0F2A2D9B', '83BE37AC', '0CB07B0A', '7370C2E8', 'B2AB7F54', '2943DD48', '1DAA9A18', '0E425A94', '877D1EF4', '00719057', 'D314465E', '6BF58C7D', 'CA4FF36D'],
    //     ['870863CC', '04A32053', '0D3F9F13', '5D53ACC2', '07B94CB2', '17176872', 'BEF74916', 'D1187EBA', '3FF7A626', '0E55108C', '09D74BB4', '586EB836', '9792B69C', '6B5C572F', '40A6A089', '766D8DFA', 'B8E48F58', 'EB0643D8', 'CE995EFE', '0360753A', '03DCD22C', 'F9A753CE', '5BA6BFAC', '89524632', '65D081BC', '5920D642', '88F02DCE', '10E77444', 'E19B4908', '95D7CD08', '3113285D', '7C0815AE', 'C1C6E098', 'B9371168', '8B71B01E', 'CC8A8A9C', '01813E1E', '054734A8'],
    //     ['093E213C', 'A7447DB4', '59FAA032', 'FCF4F501', '1184874C', '6EC6E1AA', '64BD7146', '00D3A0AE', '9D23AE29', '59EF82C8', '7E9187BE', '0BC24819', '09C1F538', '10BEF7CC', '6ABAD118', '7BFB1334', 'B04AFBA8', '95F71AB5', '220CED02', '0C85301B', 'C8CDA3BD', '6830648C', 'A82A87CA', '1194FB43', '695F186A', '68C0C313', 'BA1B0B87'],
    //     ['2D3CF1FA', 'BCF85158', 'D139B567', 'E8301B83', '90B95E4A', '2F1FD314', '3F859A7C', '5D2F50BC', 'DDFE349C', 'CF9A7B28', '62D167F2', '17669E3C', '74CABC48', 'BC39CB84', '0A1D6FE8', '1586FEB8', '4DAD9D4A', '5C644A7C', '1F4AAF15', '06AD9471', '50DFBB04', '4DD35C64', 'AE1A0C96', '9B441436', '8B421A7A', '4D4FCA22', 'DE28A8CA', 'B58F92AA', '6B059AAE', '598E930A', '95B381FC', 'D84CEF08', '33A17DB4', '80C19444', '83BE37AC', '71C396B2', '3942AE62', '54DADE88', '3B7C8FCE', '1DAA9A18', '457B4F76', 'A4352B94', '38DFEFC4', 'D314465E', '04D1A2A5', '739BEE08'],
    //     ['486D3B31', '395EC364', '99043D48', '6269905A', '90B95E4A', '196A4258', '997564EE', '5D2F50BC', '0C672EAF', '4A9318EC', '8A36B2D7', '17669E3C', 'DCD18A0A', '28F62692', 'E07E4C2C', '0E90295F', '4DAD9D4A', '525CA50E', 'EFEE7B75', 'F1295F9A', 'F2BB3E0A', '0A352858', 'AE1A0C96', '3FEB1862', '8B421A7A', '8FA83B16', 'DE28A8CA', 'E61E7ED4', '2267FFB4', '414C672E', '5EA0AC1E', '08B02C93', 'F74E401A', '0F2A2D9B', '83BE37AC', '0CB07B0A', '7370C2E8', 'A0DC758E', '2943DD48', '1DAA9A18', '99550548', '877D1EF4', '00719057', 'D314465E', 'FFC1193E', 'CA4FF36D'],
    //     ['27C10B88', '0C245B5B', '99043D48', 'EA4A33BC', '90B95E4A', 'F56A45B8', '997564EE', '27976B9E', 'E6191ECE', 'CF9A7B28', '4B61A716', 'C3101264', 'D73F52AB', '06F96E85', 'F0653B2D', '0250C5D8', '3C8E6E4F', '5CACA068', '1F4AAF15', 'BC9C8F81', '8D0C8378', '4DD35C64', '08977CE8', 'DEF8CA36', '3326CA78', '0D9E4E0A', 'DE28A8CA', 'D48D2824', 'AB6E8F8E', '7EDCD9E3', '5EA0AC1E', '08B02C93', 'EDE9A60A', 'AF067BAC', '83BE37AC', '71C396B2', '3942AE62', '0F243928', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '38DFEFC4', 'D314465E', 'D0BA9038', '739BEE08'],
    //     ['27C10B88', '0C245B5B', '99043D48', 'EA4A33BC', '90B95E4A', 'F56A45B8', '997564EE', '27976B9E', 'E6191ECE', 'CF9A7B28', '4B61A716', 'C3101264', 'D73F52AB', '06F96E85', 'F0653B2D', '0250C5D8', '3C8E6E4F', '5CACA068', '1F4AAF15', 'BC9C8F81', '8D0C8378', '4DD35C64', '08977CE8', 'DEF8CA36', '3326CA78', '0D9E4E0A', 'DE28A8CA', 'D48D2824', 'AB6E8F8E', '7EDCD9E3', '5EA0AC1E', '703B818C', 'EDE9A60A', 'AF067BAC', '83BE37AC', '71C396B2', '3942AE62', '0F243928', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '38DFEFC4', 'D314465E', 'D0BA9038', '739BEE08'],
    //     ['8A495DC2', '395EC364', '99043D48', '6269905A', '90B95E4A', 'A15F6354', '997564EE', '5D2F50BC', '0C672EAF', '4A9318EC', '8A36B2D7', '33CE3E68', 'DCD18A0A', '0F69EF08', '010BA6F9', '0E90295F', '1DCACD9C', 'B41B4A9E', 'A2BF8BB6', 'F1295F9A', 'F2BB3E0A', '0A352858', 'AE1A0C96', '5C79A274', '8B421A7A', '8FA83B16', 'DE28A8CA', '79316D96', '2267FFB4', '414C672E', '5EA0AC1E', '08B02C93', 'F74E401A', '0F2A2D9B', '83BE37AC', '0CB07B0A', '7370C2E8', 'B2AB7F54', '2943DD48', '1DAA9A18', '0E425A94', '877D1EF4', '00719057', 'D314465E', '6BF58C7D', 'CA4FF36D'],
    //     ['2D3CF1FA', 'BCF85158', 'D139B567', 'E8301B83', '050D0CF6', '089C98B8', '997564EE', '5D2F50BC', '7151FD14', 'CF9A7B28', '911BD365', '17669E3C', 'B1884CA9', 'BC39CB84', '92D0E61E', '0250C5D8', '4DAD9D4A', '5CACA068', '1F4AAF15', 'F1295F9A', 'F969E208', '55CFCA36', 'AE1A0C96', '9B441436', '8B421A7A', '4D4FCA22', 'DE28A8CA', '10009A64', '9F9F12E4', '613B97AA', '5EA0AC1E', '08B02C93', '389811DE', 'AF067BAC', '83BE37AC', '71C396B2', '3942AE62', '07D05395', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '38DFEFC4', 'D314465E', '7A067C49', '2E6724B1'],
    //     ['309A1EB2', 'B7F3119C', '5ECE5D42', '52DFC7AC', 'F86F7C24', 'F56A45B8', '5C40B3B2', '27976B9E', 'E6191ECE', 'A0124C96', 'D01CC456', 'C3101264', 'D73F52AB', 'FFDFE708', 'EFF93DDC', '6C34B90C', '223947FC', '50665D18', '818D2066', 'BC9C8F81', '8D0C8378', 'F1A6FE88', '08977CE8', 'F6DD54D9', '24B85465', '0FCB8DAA', 'DE28A8CA', 'FB539E94', 'AB6E8F8E', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'EDE9A60A', 'AF067BAC', '83BE37AC', '71C396B2', '0609A4D9', '6D32F6BC', '02CBBB92', '1DAA9A18', 'D62157A8', '072C2819', '38DFEFC4', 'D314465E', 'D9B153EA', '739BEE08'],
    //     ['27C10B88', '0C245B5B', '99043D48', '1F4B433A', '90B95E4A', 'F56A45B8', '538F2B8A', '27976B9E', 'AB21BCF2', 'CF9A7B28', '4B61A716', 'C3101264', 'D73F52AB', 'AE1EA7CC', 'F0653B2D', '0250C5D8', '4870826C', '07B7B6E3', '1F4AAF15', '4DE7BA62', '8D0C8378', '4DD35C64', '08977CE8', 'D984D1D4', '3326CA78', '0D9E4E0A', 'DE28A8CA', 'D48D2824', 'C80134EA', '7EDCD9E3', '5EA0AC1E', 'F7553BCA', 'EDE9A60A', '68DF7008', '83BE37AC', '71C396B2', '3942AE62', '0F243928', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '3AE00232', '92FAA4D6', '0B3852A8', '739BEE08'],
    //     ['B17A7928', '3B7AFA36', '66CE4326', '52DFC7AC', 'F86F7C24', '6444015C', '5C40B3B2', 'E973835C', 'E6191ECE', '3508A10A', 'E545A262', '6CD56E04', 'D73F52AB', 'FFDFE708', '2E55BAB4', 'CDF3D06C', '6BCC0B58', 'AAD2D098', '818D2066', '16336B2C', '8D0C8378', '6677DE2E', '08977CE8', '7D8D0D5A', '649CB15C', '8711986B', 'DE28A8CA', 'B64B84B2', '3AB0625C', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'EDE9A60A', '928DE3CD', '83BE37AC', '71C396B2', 'F0976011', '43711854', '09D4F4BD', '1DAA9A18', 'CAA66EF2', '850B17C4', '38DFEFC4', 'D314465E', 'D9B153EA', '739BEE08'],
    //     ['309A1EB2', '8D66CA64', '2FCC38DA', '52DFC7AC', 'F86F7C24', 'F56A45B8', '5C40B3B2', '27976B9E', 'E6191ECE', 'A0124C96', 'D6C7CBB3', 'C3101264', 'D73F52AB', 'FFDFE708', 'EFF93DDC', '6C34B90C', 'D00B7DD8', 'D7EB7106', '818D2066', 'BC9C8F81', '8D0C8378', 'F1A6FE88', '08977CE8', 'F6DD54D9', '24B85465', '0FCB8DAA', 'DE28A8CA', 'F25E3EE2', '85854444', '7EDCD9E3', '5EA0AC1E', '09DCE152', '484ED44C', 'AF067BAC', '83BE37AC', '71C396B2', '0609A4D9', '6D32F6BC', '02CBBB92', '1DAA9A18', 'D62157A8', '0BC47176', '38DFEFC4', 'D314465E', 'D9B153EA', '739BEE08'],
    //     ['8D66EDF3', 'B7F3119C', '981F1378', '52DFC7AC', 'F86F7C24', 'B2A29D74', '09478D2A', '27976B9E', 'E6191ECE', '6E8595A2', 'E545A262', 'C3101264', '0FE9C8AC', '8DE243F9', '2E55BAB4', '26B8D2CE', '6BCC0B58', '0391AA43', '4287842B', 'BC9C8F81', '8D0C8378', 'E1AE2CEA', '08977CE8', '03AF4389', '649CB15C', '8711986B', 'DE28A8CA', 'B64B84B2', 'AB6E8F8E', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'EDE9A60A', 'AF067BAC', '83BE37AC', '7CFED576', '0609A4D9', '0264074C', 'A94BD952', '1DAA9A18', 'B7FFC3E4', 'D777E7FE', '38DFEFC4', '1D1A2CE2', '1BACBDCE', '4752B558'],
    //     ['27C10B88', 'A3537448', '99043D48', '1F4B433A', '90B95E4A', 'F56A45B8', '538F2B8A', '27976B9E', 'E6191ECE', 'CF9A7B28', '4B61A716', 'C3101264', 'D533971C', '38DAF4A8', 'F0653B2D', '94401006', '4870826C', '5CACA068', '1F4AAF15', '4DE7BA62', '8D0C8378', '563AA978', '08977CE8', 'B713BB4C', '3326CA78', '0D9E4E0A', '4117D5E4', '1FCE6BB8', 'F8992E6E', '7EDCD9E3', '5EA0AC1E', 'F7553BCA', 'EDE9A60A', '5280050C', '83BE37AC', '71C396B2', '789D4A54', '8151374E', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '3AE00232', 'D314465E', '805594D7', '739BEE08'],
    //     ['B17A7928', '3B7AFA36', '0F777BB2', '52DFC7AC', 'F86F7C24', '6444015C', '5C40B3B2', 'E973835C', 'E6191ECE', '3508A10A', 'E545A262', '6CD56E04', 'D73F52AB', 'FFDFE708', '2E55BAB4', 'CDF3D06C', '6BCC0B58', 'AAD2D098', '818D2066', '16336B2C', '8D0C8378', '6677DE2E', '08977CE8', '7D8D0D5A', '649CB15C', '8711986B', 'DE28A8CA', 'B64B84B2', '3AB0625C', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'EDE9A60A', '928DE3CD', '83BE37AC', '71C396B2', 'F0976011', '43711854', 'DDA1F4EE', '1DAA9A18', 'CAA66EF2', '850B17C4', '38DFEFC4', 'D314465E', 'D9B153EA', '739BEE08'],
    //     ['8D66EDF3', 'B7F3119C', '981F1378', '52DFC7AC', 'F86F7C24', 'B2A29D74', '09478D2A', '27976B9E', 'E6191ECE', '6E8595A2', 'E545A262', 'C3101264', '0FE9C8AC', '8DE243F9', '2E55BAB4', '26B8D2CE', '6BCC0B58', '0391AA43', '4287842B', 'BC9C8F81', '8D0C8378', 'E1AE2CEA', '08977CE8', '03AF4389', '649CB15C', '8711986B', 'DE28A8CA', 'B64B84B2', 'AB6E8F8E', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'EDE9A60A', 'AF067BAC', '83BE37AC', '7CFED576', '0609A4D9', '0264074C', 'A94BD952', '1DAA9A18', 'B7FFC3E4', 'D777E7FE', '38DFEFC4', '1D1A2CE2', '1BACBDCE', '4752B558'],
    //     ['27C10B88', 'A3537448', '99043D48', '1F4B433A', '90B95E4A', 'F56A45B8', '538F2B8A', '27976B9E', 'E6191ECE', 'CF9A7B28', '4B61A716', 'C3101264', 'D533971C', '38DAF4A8', 'F0653B2D', '94401006', '4870826C', '5CACA068', '1F4AAF15', '4DE7BA62', '8D0C8378', '563AA978', '08977CE8', 'B713BB4C', '3326CA78', '0D9E4E0A', '4117D5E4', '1FCE6BB8', 'F8992E6E', '7EDCD9E3', '5EA0AC1E', 'F7553BCA', 'EDE9A60A', '5280050C', '83BE37AC', '71C396B2', '789D4A54', '8151374E', '02CBBB92', '1DAA9A18', '2E817CCC', 'FF2A6A84', '3AE00232', 'D314465E', '805594D7', '739BEE08'],
    //     ['B17A7928', '3B7AFA36', '0F777BB2', '52DFC7AC', 'F86F7C24', '6444015C', '5C40B3B2', 'E973835C', 'E6191ECE', '3508A10A', 'E545A262', '6CD56E04', 'D73F52AB', 'FFDFE708', '2E55BAB4', 'CDF3D06C', '6BCC0B58', 'AAD2D098', '818D2066', '16336B2C', '8D0C8378', '6677DE2E', '08977CE8', '7D8D0D5A', '649CB15C', '8711986B', 'DE28A8CA', 'B64B84B2', '3AB0625C', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'EDE9A60A', '928DE3CD', '83BE37AC', '71C396B2', 'F0976011', '43711854', 'DDA1F4EE', '1DAA9A18', 'CAA66EF2', '850B17C4', '38DFEFC4', 'D314465E', 'D9B153EA', '739BEE08'],
    //     ['8D66EDF3', '9CF5DC18', '981F1378', '52DFC7AC', 'F86F7C24', 'B2A29D74', 'BCFFFC1B', '27976B9E', '27FB9E53', '6E8595A2', 'E545A262', 'EFB6313A', '0FE9C8AC', '8DE243F9', '2E55BAB4', 'A11C6728', '6BCC0B58', '0391AA43', '0C649F6A', '523C9BB4', '8D0C8378', 'E1AE2CEA', '08977CE8', '03AF4389', 'F2DF291E', '94C62BEB', 'DE28A8CA', 'B64B84B2', 'C03B09E7', '7EDCD9E3', '5EA0AC1E', '51B867F2', '4BD599F9', 'AF067BAC', '83BE37AC', '7CFED576', '0609A4D9', '0264074C', 'A94BD952', '1DAA9A18', 'B7FFC3E4', 'D777E7FE', '38DFEFC4', '1D1A2CE2', '8C806E48', '4752B558'],
    //     ['3559A337', 'D1FA3728', '27B791C8', '59E61636', 'F86F7C24', '19149778', '09478D2A', '27976B9E', 'E6191ECE', '8C352944', 'E545A262', 'C3101264', 'D1C6B375', '8DE243F9', '2E55BAB4', '26B8D2CE', '2268536C', '0391AA43', '4287842B', '53BCFA5E', '8D0C8378', 'E1AE2CEA', '08977CE8', '03AF4389', '649CB15C', '8711986B', 'DE28A8CA', 'B64B84B2', 'E0796216', '0F0D5774', '5EA0AC1E', '09DCE152', 'AE47E459', 'AF067BAC', '83BE37AC', 'A17AAE4E', '0609A4D9', '4276E02C', '0D395C0A', '1DAA9A18', 'B7FFC3E4', 'D777E7FE', '38DFEFC4', '1D1A2CE2', '1BACBDCE', '4752B558'],
    //     ['70E9C708', '75D3C3EE', '217BBAD6', 'DD88EDB6', '18D8A1B2', '834AEB38', 'AF0B09BE', '0F239078', '582301AE', '4B0B59B8', '9D329024', 'E2080B7A', 'D46DA648', '09DC8AA8', '8A1E64D7', '9F99491E', 'DED2437E', 'CAEB8918', '871B4748', 'F0E2E028', 'C6FF2656', 'CEC18288', 'FFABCBC8', '304A1E44', '09A6AFD8', '09A0E2DB', '77268A7A', '6508019E', '1B910F78', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'BF2EC128', 'AF067BAC', '0BE0E7DF', '803EFCC8', '38943142', '03B48EC2', 'A94BD952', '71044076', 'B7FFC3E4', 'D777E7FE', '390278D1', '9E0F0D29', 'B53CEB42', 'C8565D9A'],
    //     ['70E9C708', '75D3C3EE', 'DCC9C3BB', 'DD88EDB6', '18D8A1B2', '834AEB38', 'AF0B09BE', '0F239078', '582301AE', '4B0B59B8', '9D329024', 'E2080B7A', 'D46DA648', '09DC8AA8', '8A1E64D7', '9F99491E', 'DED2437E', 'CAEB8918', '871B4748', 'F0E2E028', 'C6FF2656', 'CEC18288', 'FFABCBC8', '304A1E44', '09A6AFD8', '09A0E2DB', '77268A7A', '6508019E', '1B910F78', '7EDCD9E3', '5EA0AC1E', '09DCE152', 'BF2EC128', 'AF067BAC', '0BE0E7DF', '803EFCC8', '38943142', '03B48EC2', 'A94BD952', '71044076', 'B7FFC3E4', 'D777E7FE', '390278D1', '9E0F0D29', 'B53CEB42', 'C8565D9A'],
    //     ['4B27CA5C', '1FF04D2E', '5C9F82CE', '2BA39BE2', '06706DDC', 'EAD74E48', '6FD43D08', '3DCD8D3C', '3DA0B04A', 'EB39406C', 'DE22B1B5', 'F8CD380D', '508F6184', '57CD1AB4', '401AD814', 'F5640DDC', '8455D686', '0391AA43', '6E977FB4', '0C18AE5E', 'EF470FC8', 'D4C67484', 'FFABCBC8', '37E6BC6E', '03D258E8', '5621C3B1', '807A1465', '50BF985B', 'BFB8A8CA', '7EDCD9E3', '029302B7', '83964D9D', '06B252CE', 'B48D9833', '82382EB4', '2387DA04', 'FB81634E', 'CFE70878', '90085706', '0BB66D3C', '02F32334', 'D175AB9F', 'E13DF52C', '65DA6D66', 'CD31D13E', 'A4F691E2']
    // ]

    if (singleCarMode == false) {
        // single car mode is off so we need to populate the car array with random cars.
        let GSEQ = makeRandomGeneSequence();
        // ccar = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir , GSEQ);

        // for (let index = 0; index < pwinners.length; index++) {
        //     const gseqP = pwinners[index];
        //     // console.log(gseqP)
        //     let pCar = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, gseqP);
        //     carArray.push(pCar);

        // }


        while (carArray.length < numberOfCars) {
            let GSEQ = makeRandomGeneSequence();
            let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
            carArray.push(carN);
        }
    } else {
        // single car mode is on so we just add one single car.
        let GSEQ = makeRandomGeneSequence();
        ccar = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
        ccar.Selected = true;
    }



    // grids.road = new ValueGrid(SIM_WIDTH, SIM_HEIGHT, 0);


    // for (gx = 0; gx < width / gridSize; gx++) {
    //     for (gy = 0; gy < height / gridSize; gy++) {
    //         if (gy == 0) {
    //             if (road_grid[gx] == undefined) {
    //                 road_grid[gx] = []
    //             }

    //             if (wall_grid[gx] == undefined) {
    //                 wall_grid[gx] = [];
    //             }

    //         }
    //         wall_grid[gx][gy] = 0;
    //         road_grid[gx][gy] = 0;
    //     }
    // }

    background(50);
}

// function drawWalls() {
//     fill(20);
//     for (gx = 0; gx < width / gridSize; gx += 1) {
//         for (gy = 0; gy < height / gridSize; gy += 1) {
//             if (wall_grid[gx][gy] == 1) {
//                 rect(gridSize * gx, gridSize * gy, gridSize, gridSize);
//             }
//         }
//     }
// }

// function gridLookup(px, py) { /// look at the grid and return if wall. 

//     let gx = int(px / gridSize)
//     let gy = int(py / gridSize)

//     if (gx >= wall_grid.length) {
//         return false;
//     }
//     if (gy >= wall_grid[gx].length) {
//         return false;
//     }
//     return (wall_grid[gx][gy] == 1)
// }

// a fuction to save the current winning cars to a file.
function saveWinners() {
    let data = JSON.stringify(WinningCars);
    let filename = 'winners.json';
    saveJSON(data, filename);
}

function loadWinners() {
    loadJSON('winners.json', function (data) {

        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            pwinners.push(element);
        }
        console.log(pwinners);
    });
}


function repopulate() {
    console.log("AUTO REPOPULATE")

    gasFillup -= 1;

    carArray = [];
    circleTrack = new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);

    let cnt = 0
    while (carArray.length < WinningCars.length) {
        let GSEQ = WinningCars[cnt]['GSEQ'];
        cnt += 1;
        let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
        carArray.push(carN)
    }

    WinningCars = [];




    // circleTrack = new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);

    // let topFitness = 0;
    // let winners = [];

    // for (let cidx = 0; cidx < carArray.length; cidx++) {
    //     let carN = carArray[cidx];
    //     if (carN.lastCheckpoint > topFitness) {
    //         topFitness = carN.lastCheckpoint;
    //     }
    // }

    // // above just finds the top most checkpoint reached

    // for (let cidx = 0; cidx < carArray.length; cidx++) {
    //     let carN = carArray[cidx];
    //     if (carN.lastCheckpoint == topFitness) {
    //         console.log(carN.GSequence)
    //         winners.push(carN.GSequence)
    //     }
    //     /// avove adds all cars who made it to this top checkpoint to an array
    // }

    // carArray = []; 


    // if (winners.length > 0) {
    //     for (let index = 0; index < numberOfCars * .75; index++) {
    //         let GSEQ = winners[index % winners.length];
    //         if (random() > .3) {
    //             GSEQ = mutateGeneSequence(GSEQ)
    //         }
    //         let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
    //         carArray.push(carN)
    //     }
    // }




    // while (carArray.length < numberOfCars) {
    //     let GSEQ = makeRandomGeneSequence();
    //     let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
    //     carArray.push(carN);
    // }




}


function mousePressed() {
    // console.log('clicked')
    // let isclicked = ccar.checkClick(mouseX, mouseY);
    // ccar.Selected = isclicked;

    for (let cidx = 0; cidx < carArray.length; cidx++) {
        let carN = carArray[cidx];
        carN.Selected = false;
        let isclicked = carN.checkClick(mouseX, mouseY);
        if (isclicked) {
            carN.Selected = isclicked;
            return
        }
    }

}

function keyPressed() {
    if (key == 'r') {
        repopulate();

    }
}

function draw() {



    if (darkMode) {

    } else {
        background(240);

        circleTrack.drawRoad() // circleTrack.drawRoad();

    }

    if (scoreBoardVisible) {
        image(scoreBoard, 0, 0);
    }

    var winnerListString = '';
    for (var i = 0; i < WinningCars; i++) {
        winnerListString += i + ' : ' + WinningCars[i].score + '<br>';
    }

    winnerDiv.html(winnerListString);

    // let MheadingVec = createVector(mouseX -circleTrack.Checkpoints[0].x, mouseY-circleTrack.Checkpoints[0].y);

    // circleTrack.startDir = MheadingVec.heading()

    // var stepsPerRound = 1000;


    // fill(200, 0, 0);
    // rect(0, 0, (currentStep / stepsPerRound) * width, 30)


    // drawWalls();




    // renderGrid(circleTrack, (index, value) => {
    //     switch (value) {
    //       case RoadType.None:
    //         return color(100, 100, 100);
    //       case RoadType.Gravel:
    //         // Color soil differently depending on moisture.
    //        return color(120, 83, 67);
    //       case RoadType.Road:
    //         return color(56, 56, 561);
    //     //   default:
    //     //     return color(255, 255, 0);
    //     }
    //   });



    // Draw the center of rotation
    // circle(corX,corY, 10)
    // fill(200, 100, 100);
    //circle(tcorX,tcorY,10)


    if (singleCarMode) {
        if (keyIsDown(UP_ARROW)) {
            ccar.accelerate(1);
        }

        if (keyIsDown(DOWN_ARROW)) {
            ccar.reverse(1);
        }
        if (keyIsDown(LEFT_ARROW)) {
            ccar.turnLeft();
        }

        if (keyIsDown(RIGHT_ARROW)) {
            ccar.turnRight();
        }

        if (keyIsDown(SHIFT)) {
            ccar.break();
        }

        // ccar.runBrain();

        brainView.background(100);
        let sensFunctions = ccar.brains[0].senses;

        // run sens functions for debugging
        for (let fxid = 0; fxid < sensFunctions.length; fxid++) {
            const val = sensFunctions[fxid](ccar);
        }
        // show internal neurons ( )
        for (let INeu = 0; INeu < ccar.InternalNeurons.length; INeu++) {
            let INN = ccar.InternalNeurons[INeu];
            let posX = 23;
            let posY = INeu + 3;
            let cN = lerpColor(colorLow, colorHigh, INN)
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 12, 10, 10);
            fill(255);
            brainView.text("IN  : " + INN, (posX * 10) + 15, (posY * 12) + 5);
        }


        ccar.update(100);
        ccar.drawCar();
        currentStep++;

    }

    else {
        sortWinners();

        if (fitnessRange[1] > .71) {
            repopulate();
        }

        for (let stepidx = 0; stepidx < STEPS_PER_FRAME; stepidx++) {

            currentStep += 1;
            // if (currentStep > stepsPerRound) {
            //     currentStep = 0;
            //     console.log("END OF ROUND")
            //     // repopulate();
            //     circleTrack = new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);

            // }


            for (let cidx = carArray.length - 1; cidx >= 0; cidx--) { // backwards loop
                if (carArray[cidx].Gasoline <= 0) {
                    carArray.splice(cidx, 1)
                }
            }


            for (let cidx = 0; cidx < carArray.length; cidx++) {
                let carN = carArray[cidx];



                carN.runBrain();



                carN.update(cidx);
            }

        }

        for (let cidx = 0; cidx < carArray.length; cidx++) {
            let carN = carArray[cidx];

            if (darkMode) {
                fill(carN.carColor + '12')
                noStroke();
                ellipse(carN.rearAxle.x, carN.rearAxle.y, 1, 1)
            } else {
                carN.drawCar();
            }



        }


        if (carArray.length < numberOfCars) {

            let topFitness = 0;
            let winners = [];

            for (let cidx = 0; cidx < carArray.length; cidx++) {
                let carN = carArray[cidx];
                if (carN.lastCheckpoint > topFitness) {
                    topFitness = carN.lastCheckpoint;
                }
            }

            // above just finds the top most checkpoint reached

            for (let cidx = 0; cidx < carArray.length; cidx++) {
                let carN = carArray[cidx];
                if (carN.lastCheckpoint == topFitness) {


                }
                /// avove adds all cars who made it to this top checkpoint to an array
            }
            while (carArray.length < numberOfCars) {
                let GSEQ = makeRandomGeneSequence();
                if (fitnessRange[1] < .2) {
                    let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
                    carArray.push(carN);
                }


                if (WinningCars.length > 0 && random() > .1) {
                    GSEQ = WinningCars[int(random(WinningCars.length))]["GSEQ"];
                    if (random() > .1) {
                        GSEQ = mutateGeneSequence(GSEQ)
                    }
                    let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
                }




            }

        }

    }
    if (brainViewShow) {
        image(brainView, 0, 0);
    }
    // 
}

function addWinner(GSEQin, distanceRecord) {

    for (let index = 0; index < WinningCars.length; index++) {
        const carPick = WinningCars[index];
        if (carPick["GSEQ"] == GSEQin) {
            if (WinningCars[index]["dist"] < distanceRecord) {
                WinningCars[index]["dist"] = distanceRecord;
            }

            return
        }
    }

    WinningCars.push({ "GSEQ": GSEQin, "dist": distanceRecord });
}

function sortWinners() {

    WinningCars.sort((a, b) => {
        return b.dist - a.dist;
    });

    while (WinningCars.length > topWinners) {
        WinningCars.pop();
    }
    fill(0);
    // console.log(WinningCars.length)
    // for (let index = 0; index < WinningCars.length; index++) {
    //     const carPick = WinningCars[index];
    //     // console.log(index, carPick)
    //     if (!darkMode) {
    //         if (carPick["dist"] <= .7) {
    //             fill(200, 0, 0);
    //         }
    //         // text(index + ' : ' + (carPick["dist"]).toFixed(2) + ' : ' + carPick["GSEQ"], 10, 100 + index * 15)
    //     }

    // }
    // console.log('---')

    let scoreSteps = 10000;

    if (WinningCars.length > 2) {
        scoreCount++;
        // console.log(WinningCars[0])
        fitnessRange = [WinningCars[0]["dist"], WinningCars[min(WinningCars.length - 1, topWinners - 1)]["dist"]]
        if (scoreCount >= scoreSteps) {
            scoreBoard.background(0);
            scoreCount = 0;
        }
        let x = map(scoreCount, 0, scoreSteps, 0, width)
        let f1 = map(fitnessRange[0], 0, 1, 0, 200)
        let f2 = map(fitnessRange[1], 0, 1, 0, 200)

        scoreBoard.stroke(255);
        scoreBoard.point(x, f1);
        scoreBoard.point(x, f2);


    }

    var winnerListString = '';
    for (var i = 0; i < WinningCars; i++) {
        winnerListString += i + ' : ' + WinningCars[i].score + '<br>';
    }

    winnerDiv.html(winnerListString);
}


function drawArrow(vecLoc, ang) {
    push();
    stroke('red');
    strokeWeight(3);
    fill('red');
    translate(vecLoc.x, vecLoc.y);
    // line(0, 0, vec.x, vec.y);
    rotate(ang);
    let arrowSize = 7;
    translate(40 - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
}


function rectAngle(x, y, w, h, offset, theta) {
    d1 = sqrt((w / 2) * (w / 2) + (h - offset) * (h - offset));
    d2 = sqrt((w / 2) * (w / 2) + offset * offset);
    th1 = atan2(h - offset, w / 2);
    th2 = atan2(offset, w / 2);
    quad(
        x - d1 * cos(th1 - theta),
        y - d1 * sin(th1 - theta),
        x - d2 * cos(th2 + theta),
        y + d2 * sin(th2 + theta),
        x + d2 * cos(th2 - theta),
        y + d2 * sin(th2 - theta),
        x + d1 * cos(th1 + theta),
        y - d1 * sin(th1 + theta)
    );
}

function sign(x) {
    if (x > 0) {
        return 1;
    } else {
        return -1;
    }
}

function mutateGeneSequence(geneIn) {
    const geneOut = geneIn.slice();

    let randomRun = round(random(mutation_amount));
    // adjust a random number of genes.
    for (let index = 0; index < randomRun; index++) {
        let randPick = int(random(geneIn.length));
        let digit = random(80000, 5000000);
        let newHex = hex(digit, 8).replace('.', '0')
        geneOut[randPick] = newHex;
    }
    return geneOut;
}
// Make a new random gene sequence from scratch.
function makeRandomGeneSequence() {
    let genome = []

    numberOfGenes = int(random(10, 60));

    for (let b = 0; b < numberOfGenes; b++) {
        let digit = random(80000, 50000000);
        genome.push(hex(digit, 8).replace('.', '0'));
    }

    return genome
}

function hex2bin(hex) {
    let val = parseInt(hex, 16);
    let binStr = val.toString(2);
    while (binStr.length < 32) {
        binStr = "0" + binStr;
    }
    return binStr;
}

function int2hex(bin) {
    return bin.toString(16);
}