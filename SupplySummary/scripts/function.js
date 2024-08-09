// function prepareCategories(data) {
//     let resultArray = [];
//     let categories = [];
//     for (let origin in data) {
//         categories = [];
//         for (let scenario in data[origin]) {
//             if (!categories.includes(scenario)) {
//                 categories.push(scenario);
//             }
//         }

//         resultArray.push({
//             name: origin,
//             categories: categories,
//         });
//     }

//     return resultArray;
// }



// function prepareSeriesArray(ship_data, list_demand) {
//     const seriesArray = [];
//     uniqueDemandType.forEach((demand) => {
//         const data = [];
//         for (let origin in ship_data) {
//             if (ship_data[origin]) {
//                 SELECTED_SCENARIO.forEach((scenario) => {
//                     if (ship_data[origin][scenario]) {
//                         if (ship_data[origin][scenario][demand]) {
//                             data.push(ship_data[origin][scenario][demand]);
//                         } else {
//                             data.push(0.0);
//                         }
//                     }
//                 });
//             }
//         }
//         seriesArray.push({
//             name: demand,
//             data: data,
//             color: getColorForDemand(demand),
//         });
//     });
//     return seriesArray;
// }

function addMissingStatuses(data, uniqueDemandType) {
    for (const origin in data) {
        for (const scenario in data[origin]) {
            const currentDemand = Object.keys(data[origin][scenario]);
            for (const uniqueDemand of uniqueDemandType) {
                if (!currentDemand.includes(uniqueDemand)) {
                    data[origin][scenario][uniqueDemand] = 0;
                }
            }
        }
    }
}

function sortReverseAlphabetically(data) {
    let sortedEntries = Object.entries(data).sort((a, b) => {
        if (a[0] > b[0]) return -1;
        if (a[0] < b[0]) return 1;
        return 0;
    });

    let sortedData = {};
    sortedEntries.forEach(([key, value]) => {
        sortedData[key] = value;
    });

    return sortedData;
}

function getTotalScenarioInChart(data) {
    var count = 0;
    for (const origin in data) {
        for (const scenario in data[origin]) {
            if (data[origin][scenario]) {
                count++;
            }
        }
    }
    return count;
}

function getColorForDemand(demand) {
    let colorMap = {
        spot: "#295E7E",
        portfolio: "#D8F049",
        term_excess: "#30c1d7",
        cspa: "#AF728A",
        term_excess_mlng: "#EA8B00",
        ptp: "#C41300",
    };

    return colorMap[demand] || "#000000";
}
