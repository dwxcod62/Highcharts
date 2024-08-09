let data_for_prepare = [];
let data_for_chart_yearly = {};
let data_for_chart_monthly = {};

let demand_type_available = [];
let uniqueDemandType = ["Spot Reserve", "Term Reserve", "Term Demand"];

function sortObjectBySelectedScenario(obj, selectedScenarios) {
    const sortedObj = {};
    selectedScenarios
        .slice()
        .reverse()
        .forEach((scenario) => {
            if (obj.hasOwnProperty(scenario)) {
                sortedObj[scenario] = obj[scenario];
            }
        });
    return sortedObj;
}

function getData() {
    data_for_prepare = json_data
        .filter((item) => SELECTED_SCENARIO.includes(item.scenario))
        // .filter((item) => item.matrix_id == 0)
        .filter((item) => item.year >= START_YEAR)
        .filter((item) => item.year <= END_YEAR)
        .filter((item) => SELECTED_ORIGIN.includes(item.origin));

    data_for_prepare.forEach((element) => {
        const demand_type = element.demand_type;
        const scenario = element.scenario;
        const quantity_shipped = element.quantity_shipped;
        const year = element.year;
        const month = element.month;

        if (!uniqueDemandType.includes(demand_type)) {
            uniqueDemandType.push(demand_type);
        }

        // ----------------- Yearly
        if (!data_for_chart_yearly[scenario]) {
            data_for_chart_yearly[scenario] = {};
        }

        if (!data_for_chart_yearly[scenario][year]) {
            data_for_chart_yearly[scenario][year] = {};
        }

        if (!data_for_chart_yearly[scenario][year][demand_type]) {
            data_for_chart_yearly[scenario][year][demand_type] = {
                value: 0,
                percent: 0,
            };
        }

        data_for_chart_yearly[scenario][year][demand_type].value += quantity_shipped;
        // ----------------- End Yearly

        // ----------------- Monthly
        if (!data_for_chart_monthly[scenario]) {
            data_for_chart_monthly[scenario] = {};
        }

        const month_year_text = month + "/" + year;

        if (!data_for_chart_monthly[scenario][month_year_text]) {
            data_for_chart_monthly[scenario][month_year_text] = {};
        }

        if (!data_for_chart_monthly[scenario][month_year_text][demand_type]) {
            data_for_chart_monthly[scenario][month_year_text][demand_type] = {
                value: 0,
                date_str: year + "-" + month + "-" + 1,
            };
        }

        data_for_chart_monthly[scenario][month_year_text][demand_type].value += quantity_shipped;
        // ----------------- End Monthly
    });

    // data_for_chart_monthly = Object.fromEntries(
    //     Object.entries(data_for_chart_monthly).sort(([keyA], [keyB]) => {
    //         for (let i = 0; i < Math.min(keyA.length, keyB.length); i++) {
    //             const charA = keyA.charCodeAt(i);
    //             const charB = keyB.charCodeAt(i);
    //             if (charA !== charB) {
    //                 return charB - charA;
    //             }
    //         }
    //         return keyB.length - keyA.length;
    //     })
    // );

    // data_for_chart_yearly = Object.fromEntries(
    //     Object.entries(data_for_chart_yearly).sort(([keyA], [keyB]) => {
    //         for (let i = 0; i < Math.min(keyA.length, keyB.length); i++) {
    //             const charA = keyA.charCodeAt(i);
    //             const charB = keyB.charCodeAt(i);
    //             if (charA !== charB) {
    //                 return charB - charA;
    //             }
    //         }
    //         return keyB.length - keyA.length;
    //     })
    // );

    data_for_chart_yearly = sortObjectBySelectedScenario(data_for_chart_yearly, SELECTED_SCENARIO);
    data_for_chart_monthly = sortObjectBySelectedScenario(data_for_chart_monthly, SELECTED_SCENARIO);

    cal_for_month(data_for_chart_monthly);
    data_for_chart_monthly = sortByValueToSort(data_for_chart_monthly);

    categories = prepareCategories(data_for_chart_yearly);
    seriesArray = prepareSeriesArray(data_for_chart_yearly);

    console.log(data_for_chart_monthly);

    renderChart(categories, seriesArray, false);
}

// -------------------------------------------------------------------------------------------------------------------

getData();
