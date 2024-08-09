let data_for_prepare = [];
let data_for_chart = {};

let demand_type_available = [];
let uniqueDemandType = [];
let uniqueScenario = [];

let scenario_in_chart = [];

const ENTITY_NOT_ALLOW = "petronas";
const DEMAND_TYPE_OLD_VALUE = "spot_mlng";
const DEMAND_TYPE_NEW_VALUE = "spot";
const DEMAND_NOT_ALLOW = ["dry_dock", "idle"];
const LIST_ORIGIN_NEED_REPLACE = ["HH", "JCC", "JKM", "JLC", "NBP", "TTF", "AECO", "Brent"];
const ORIGIN_REPLACE_VALUE = "SPOT";
const HIDE_DRAGON_DEMAND_DELETE = "demand(dragon)";
const HIDE_DRAGON_LIST_ORIGIN_DELETE = [
    "Dragon_seller1",
    "Dragon_seller2",
    "Dragon_seller3",
    "Dragon_seller4",
    "Dragon_seller5",
    "Dragon_seller6",
    "Dragon_seller7",
    "Dragon_seller8",
    "Dragon_seller9",
    "Dragon_seller10",
];

function customScenarioSort(scenarios) {
    return scenarios.sort((a, b) => {
        if (a.includes("[base]") && !b.includes("[base]")) {
            return -1;
        } else if (!a.includes("[base]") && b.includes("[base]")) {
            return 1;
        } else {
            return a.localeCompare(b);
        }
    });
}

function GetData() {
    data_for_prepare = json_data
        .filter((item) => item.entity == ENTITY_NOT_ALLOW) //                                Filter entity equal 'petronas'
        .filter((item) => SELECTED_SCENARIO.includes(item.scenario)) //                      Filter scenario in list selected scenario
        .filter((item) => item.year >= START_YEAR && item.year <= END_YEAR) //                                        Filter year greater than ( or equal ) selected start year
        .filter((item) => !DEMAND_NOT_ALLOW.includes(item.demand_type)) //                   Filter demand_type not in ['dry_dock', 'idle']
        .map((item) => {
            const updatedItem = Object.assign({}, item);

            // Create/modify in demand_type column, replace 'spot_mlng' to 'spot'
            if (item.demand_type == DEMAND_TYPE_OLD_VALUE) {
                updatedItem.demand_type = DEMAND_TYPE_NEW_VALUE;
            }

            // Create/modify in origin column, replace value in [HH, JCC, JKM, JLC, NBP, TTF, AECO, Brent] to 'SPOT'
            if (LIST_ORIGIN_NEED_REPLACE.includes(item.origin)) {
                updatedItem.origin = ORIGIN_REPLACE_VALUE;
            }

            return updatedItem;
        });

    // HIDE DRAGON
    if (HIDE_DRAGON) {
        data_for_prepare = data_for_prepare
            .filter((item) => !HIDE_DRAGON_LIST_ORIGIN_DELETE.includes(item.origin))
            .filter((item) => item.origin != HIDE_DRAGON_DEMAND_DELETE);
    }

    data_for_prepare.forEach((element) => {
        const demand_type = element.demand_type;
        const origin = element.origin;
        const scenario = element.scenario;
        const quantity_shipped = element.quantity_shipped;

        if (!data_for_chart[origin]) {
            data_for_chart[origin] = {};
        }

        if (!data_for_chart[origin][scenario]) {
            data_for_chart[origin][scenario] = {};
        }

        if (!data_for_chart[origin][scenario][demand_type]) {
            data_for_chart[origin][scenario][demand_type] = 0;
        }

        // Sum quantity_shipped
        data_for_chart[origin][scenario][demand_type] += quantity_shipped;

        if (!demand_type_available.includes(demand_type)) {
            demand_type_available.push(demand_type);
        }

        if (!uniqueDemandType.includes(demand_type)) {
            uniqueDemandType.push(demand_type);
        }

        if (!scenario_in_chart.includes(scenario)) {
            scenario_in_chart.push(scenario);
        }
    });

    uniqueScenario = scenario_in_chart;
    uniqueScenario.sort((strA, strB) => {
        for (let i = 0; i < Math.min(strA.length, strB.length); i++) {
            const charA = strA.charCodeAt(i);
            const charB = strB.charCodeAt(i);
            if (charA !== charB) {
                return charB - charA;
            }
        }
        return strB.length - strA.length;
    });

    data_for_chart = sortReverseAlphabetically(data_for_chart);

    // Sort data_for_chart scenarios
    // for (const origin in data_for_chart) {
    //     const scenarios = Object.keys(data_for_chart[origin]);
    //     const sortedScenarios = customScenarioSort(scenarios);
    //     const sortedData = {};
    //     sortedScenarios.forEach((scenario) => {
    //         sortedData[scenario] = data_for_chart[origin][scenario];
    //     });
    //     data_for_chart[origin] = sortedData;
    // }

    addMissingStatuses(data_for_chart, uniqueDemandType);
    const categories = prepareCategories(data_for_chart);
    const seriesArray = prepareSeriesArray(data_for_chart, uniqueScenario);
    const count = getTotalScenarioInChart(data_for_chart);
    renderChart(categories, seriesArray, count);
}

function prepareCategories(data) {
    let resultArray = [];
    let categories = [];

    for (let origin in data) {
        categories = [];
        uniqueScenario.forEach((sc) => {
            if (data[origin][sc]) {
                if (!categories.includes(sc)) {
                    categories.push(sc);
                }
            }
        });

        resultArray.push({
            name: origin,
            categories: categories,
        });
    }

    return resultArray;
}

function prepareSeriesArray(ship_data, list_demand) {
    const seriesArray = [];
    uniqueDemandType.forEach((demand) => {
        const data = [];
        for (let origin in ship_data) {
            if (ship_data[origin]) {
                uniqueScenario.forEach((scenario) => {
                    if (ship_data[origin][scenario]) {
                        if (ship_data[origin][scenario][demand]) {
                            data.push(ship_data[origin][scenario][demand]);
                        } else {
                            data.push(null);
                        }
                    }
                });
            }
        }
        seriesArray.push({
            name: demand,
            data: data,
            color: getColorForDemand(demand),
        });
    });
    return seriesArray;
}
