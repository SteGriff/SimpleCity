var lastRoad = null;
var cash = 4000;
var earned = 0;
var costs = 0;
var profit = 0;

var pop = 0;
var jobs = 0;
var numOfHouses = 0;
var numOfShops = 0;
var status = '';

var eq = 0; //Education
var health = 0;
var trafficScore = 100;
var happiness = 0;

var tax = 1;
var powerCost = 0;
var maintCost = 0;
var publicCost = 0;
var loanCost = 0;
var totalCost = 0;

function e(className)
{
    return document.getElementsByClassName(className)[0];
}
function a(className)
{
    return document.getElementsByClassName(className);
}

function GetRandom(max)
{
    return Math.max(0, Math.round(Math.random() * (max - 1)));
}

function AddRoad()
{
    if (Pay(100))
    {
        var roadClone = e('row').cloneNode(true);
        roadClone.classList.remove('hide');
        var area = e('area');
        area.appendChild(roadClone);
    }
}

function ShowControls(el)
{
    lastRoad = el.parentElement;

    var y = lastRoad.offsetTop - 2;
    var controls = e('build-controls');
    controls.classList.remove('hide');
    controls.style.top = y + 'px';
}

function BuildRes()
{
    if (Pay(200)) Build('res');
}
function BuildBiz()
{
    if (Pay(300)) Build('biz');
}
function BuildSchool()
{
    if (Pay(300)) Build('scl');
}
function BuildHospital()
{
    if (Pay(400)) Build('hsp');
}

function Build(bType)
{
    if (!lastRoad) return;
    var template = e(bType).cloneNode(true);
    template.classList.remove('hide');
    lastRoad.appendChild(template);
}

function Pay(amount)
{
    if (cash > amount)
    {
        cash -= amount;
        SetStatus();
        return true;
    }
    return false;
}

function Unbuild(el)
{
    cash += 10;
}

function GetLoan()
{
    if (loanCost === 0)
    {
        cash += 1000;
        loanCost += 10;
        e('get-loan').classList.add('hide');
        e('repay-loan').classList.remove('hide');
        SetStatus();
    }
}

function RepayLoan()
{
    if (loanCost > 0 && cash >= 1000)
    {
        cash -= 1000;
        loanCost -= 10;
        if (loanCost === 0)
        {
            e('get-loan').classList.remove('hide');
            e('repay-loan').classList.add('hide');
        }
        SetStatus();
    }
}

function Cycle()
{
    var first = true;

    //People
    CalcPop();

    //Schooling
    first = true;
    var schools = a('scl');
    numOfSchools = schools.length - 1;
    var housesServedPerSchool = 10;
    eq = Math.floor((housesServedPerSchool * numOfSchools) / numOfHouses) || 0;
    eq = Math.min(eq, 5);

    //Health
    first = true;
    var hospitals = a('hsp');
    numOfHospitals = hospitals.length - 1;
    var housesServedPerHospital = 15;
    health = Math.floor((housesServedPerHospital * numOfHospitals) / numOfHouses) || 0;
    health = Math.min(health, 5);

    //Jobs
    CalcJobs();

    //Traffic
    var roads = a('row');
    var numOfRoads = roads.length - 1;
    var numOfBuildings = (numOfShops + numOfHouses);
    var buildsPerRoad = numOfBuildings / numOfRoads;
    trafficScore = Math.round((5 - buildsPerRoad) * (18 + GetRandom(4)));

    //Assignment
    var employed = 0;
    if (jobs > pop)
    {
        var diff = jobs - pop;
        status = diff + ' worker shortage';
        employed = pop;
    }
    else
    {
        var diff = pop - jobs;
        status = diff + ' unemployed';
        employed = jobs;
    }

    //Costs
    publicCost = (numOfSchools * 3) + (numOfHospitals * 4);
    powerCost = Math.ceil(numOfBuildings / 6) * 5;
    earned = employed * tax;

    totalCost = powerCost + publicCost + loanCost;
    profit = earned - totalCost;
    cash += profit;

    SetStatus();
}

function CalcJobs()
{
    jobs = 0
    var first = true;
    var shops = a('biz');
    numOfShops = shops.length - 1;
    for(var s of shops)
    {
        if (first)
        {
            first = false;
            continue;
        }
        var fixedJobs = 2 + eq;
        var sJobs = fixedJobs + GetRandom(Math.ceil(fixedJobs/2));
        jobs += sJobs;
    }
}

function CalcPop()
{
    pop = 0;
    var neighbourPoints = 0;
    var first = true;
    var houses = a('res');
    numOfHouses = houses.length - 1;
    for(var h of houses)
    {
        if (first)
        {
            first = false;
            continue;
        }

        if (h.nextSibling 
            && h.nextSibling.classList 
            && h.nextSibling.classList.contains('res'))
        {
            neighbourPoints += 1;
        }
        var base = 1 + health;
        var random = GetRandom(Math.ceil(health / 2));
        var hPop =  + base + random;
        pop += hPop;
    }
}

function SetStatus()
{
    e('traffic-flow').innerText = trafficScore + '% flow';

    e("out-cash").innerText = '$' + cash;
    e("out-pop").innerText = pop;
    e("out-jobs").innerText = jobs;
    e("out-eq").innerText = eq * 20 + '%';
    e("out-health").innerText = health * 20 + '%';
    e("out-income").innerText = '$' + earned;
    e("out-costs").innerText = '$' + totalCost;
    
    e('status').innerText = status; 

    var profitBox = e("out-profit");
    profitBox.innerText = '$' + profit;
    profitBox.classList.remove('red');
    profitBox.classList.remove('green');
    var newClass = profit >= 0 ? 'green' : 'red';
    profitBox.classList.add(newClass);

}

var cycleInterval = setInterval(Cycle, 3000);
Cycle();