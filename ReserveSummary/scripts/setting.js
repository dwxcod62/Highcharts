let categories = {};
let seriesArray = {};

let SELECTED_SCENARIO = ["[Base] KPBI_Base 2023-09-05", "test_no_zscaler", "test_home_network", "test_e2e_vc_changes"];
let SELECTED_ORIGIN = ["BLNG", "CANADA", "FLNG 1", "FLNG 2", "GLNG", "MLNG DUA", "MLNG SATU", "MLNG TIGA", "SERI", "TTF", "Train 9", "idle"];

const START_YEAR_LIST = 2022;
const END_YEAR_LIST = 2034;

let START_YEAR = 2025;
let END_YEAR = 2031;

const colorMap = ["#00a19c", "#763f98", "#20419a", "#fdb924", "#bfd730", "#30c1d7", "#295e7e", "#965971", "#c41300", "#ea8b00", "#00a19c"];

let isPercent = false;

const startYearSelect = document.getElementById("startYearSelect");
for (let year = START_YEAR_LIST; year <= END_YEAR_LIST; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    startYearSelect.appendChild(option);
}

const endYearSelect = document.getElementById("endYearSelect");
for (let year = START_YEAR_LIST; year <= END_YEAR_LIST; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    endYearSelect.appendChild(option);
}

const scenarioSelect = document.getElementById("scenarioSelect");
SELECTED_SCENARIO.forEach((scenario) => {
    const option = document.createElement("option");
    option.value = scenario;
    option.textContent = scenario;
    scenarioSelect.appendChild(option);
});

function updateChart() {
    START_YEAR = parseInt(startYearSelect.value);
    END_YEAR = parseInt(endYearSelect.value);
    SELECTED_SCENARIO = Array.from(scenarioSelect.selectedOptions).map((option) => option.value);

    data_for_prepare = [];
    data_for_chart_yearly = {};
    data_for_chart_monthly = {};
    demand_type_available = [];
    getData();
}

document.getElementById("toggle-percent-checkbox").addEventListener("change", function () {
    isPercent = this.checked;

    renderChart(categories, seriesArray, isPercent);
});

document.getElementById("view-by-monthly-checkbox").addEventListener("change", function () {
    const isChecked = this.checked;

    if (isChecked) {
        categories = prepareCategories(data_for_chart_monthly);
        seriesArray = prepareSeriesArray(data_for_chart_monthly);
    } else {
        categories = prepareCategories(data_for_chart_yearly);
        seriesArray = prepareSeriesArray(data_for_chart_yearly);
    }

    renderChart(categories, seriesArray, isPercent);
});
