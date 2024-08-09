// let SELECTED_SCENARIO = ["[Base] KPBI_Base 2023-09-05", "test_no_zscaler", "test_home_network", "test_e2e_vc_changes"];
let SELECTED_SCENARIO = ["TAA run Li Ann Alpha", "[Base] TAA 2024-04-04"];

const START_YEAR_LIST = 2022;
const END_YEAR_LIST = 2034;

let START_YEAR = 2025;
let END_YEAR = 2031;

let HIDE_DRAGON = true;

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

    scenario_in_chart = [];
    data_for_prepare = [];
    data_for_chart = {};
    demand_type_available = [];
    uniqueDemandType = [];
    GetData();
}
