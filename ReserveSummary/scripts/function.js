function sortByValueToSort(data) {
    const monthSortValues = {};
    for (let scenario in data) {
        for (let monthYear in data[scenario]) {
            const termData = data[scenario][monthYear];
            let maxValueToSort = 0;
            for (const term in termData) {
                const valueToSort = parseInt(termData[term].value_to_sort);
                if (valueToSort > maxValueToSort) {
                    maxValueToSort = valueToSort;
                }
            }
            monthSortValues[monthYear] = maxValueToSort;
        }
    }

    const sortedMonths = Object.keys(monthSortValues).sort((a, b) => {
        return monthSortValues[a] - monthSortValues[b];
    });

    const sortedData = {};
    for (let scenario in data) {
        sortedData[scenario] = {};
        sortedMonths.forEach((monthYear) => {
            if (data[scenario][monthYear]) {
                sortedData[scenario][monthYear] = data[scenario][monthYear];
            }
        });
    }

    return sortedData;
}

function calcPercentage(data) {
    for (let scenario in data) {
        for (let year in data[scenario]) {
            let total = 0;
            for (let demand in data[scenario][year]) {
                total += data[scenario][year][demand].value;
            }
            for (let demand in data[scenario][year]) {
                data[scenario][year][demand].percent = (data[scenario][year][demand].value / total) * 100;
            }
        }
    }
}

function getRandomColors(colorArray, numColors) {
    const shuffledColors = colorArray.sort(() => 0.5 - Math.random());

    return shuffledColors.slice(0, numColors);
}

const [spotReserveColor, termReserveColor, termDemandColor] = getRandomColors(colorMap, 3);

let colorMapDemand = {
    "Spot Reserve": spotReserveColor,
    "Term Reserve": termReserveColor,
    "Term Demand": termDemandColor,
};
const d = JSON.stringify(colorMapDemand);

function getColorForDemand(demand) {
    let colorTemp = JSON.parse(d);

    return colorMapDemand[demand] || "#000000";
}

function prepareCategories(data) {
    let resultArray = [];
    let categories = [];
    for (let scenario in data) {
        categories = [];
        for (let year in data[scenario]) {
            if (!categories.includes(year)) {
                categories.push(year);
            }
        }

        resultArray.push({
            name: scenario,
            categories: categories,
        });
    }

    return resultArray;
}

function prepareSeriesArray(data) {
    const seriesArray = [];
    uniqueDemandType.forEach((demand) => {
        const data_rs = [];
        for (let scenario in data) {
            for (let year in data[scenario]) {
                if (data[scenario][year][demand]) {
                    data_rs.push(data[scenario][year][demand].value);
                } else {
                    data_rs.push(0.0);
                }
            }
        }
        if (data_rs.length > 0) {
            console.log("a");
            seriesArray.push({
                name: demand,
                data: data_rs,
                color: getColorForDemand(demand),
            });
        }
    });
    return seriesArray;
}

function getDaysInMonth(month) {
    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    if (months.includes(month)) {
        return daysInMonth[month - 1];
    } else {
        return "Invalid month";
    }
}

function cal_for_month(data) {
    for (let scenario in data) {
        for (let month_year_text in data[scenario]) {
            for (let demand_type in data[scenario][month_year_text]) {
                let dateParts = data[scenario][month_year_text][demand_type].date_str.split("-");

                let year = parseInt(dateParts[0]);
                let month = parseInt(dateParts[1]);
                let date = parseInt(dateParts[2]);

                let year_after_sub = year - 1970;
                let month_after_divide = month / 12;
                let year_month_add_value = year_after_sub + month_after_divide;

                let date_divide_thousand = date / 100;
                let day_in_month = getDaysInMonth(month);
                let date_divide_day_in_month = date_divide_thousand / day_in_month;

                let rs = year_month_add_value + date_divide_day_in_month;

                rs = rs * 365;

                rs = rs * 86400000;

                rs = rs.toFixed(0);

                data[scenario][month_year_text][demand_type].value_to_sort = rs;
            }
        }
    }
}
