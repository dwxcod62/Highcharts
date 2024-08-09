function convertToCSV(jsonObject, columns) {
    const array = typeof jsonObject !== "object" ? JSON.parse(jsonObject) : jsonObject;
    let csv = "";

    const lowerCaseColumns = columns.map((column) => (column === "Charterer" ? column : column.toLowerCase()));

    csv += lowerCaseColumns.join(",") + "\n";

    array.forEach((item) => {
        columns.forEach((column, index) => {
            if (index > 0) csv += ",";
            const columnKey = column === "Ship" ? "Vessel" : column;
            let value = item[columnKey] !== undefined ? item[columnKey] : "";
            if (columnKey === "Quantity_shipped" && !item[columnKey]) {
                value = 0;
            }
            if (typeof value === "string" && value.includes(",")) {
                value = `"${value}"`;
            }
            csv += value;
        });
        csv += "\n";
    });

    return csv;
}

function downloadCSV(jsonObject, columns, fileName) {
    const csv = convertToCSV(jsonObject, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fileName);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const columns = [
    "Scenario",
    "Status",
    "Origin",
    "Supply_port",
    "Destination",
    "Demand_port",
    "Year",
    "Month",
    "Ship",
    "ship_series",
    "Charterer",
    "Start_day",
    "Expiry_date",
    "Dry_dock_days",
    "Active_days",
    "Quantity_shipped",
    "Num_trips",
    "Voyage_days",
    "Ship_util_days",
    "Ship_util_per_year",
    "Origin_group",
];

document.getElementById("downloadBtn").addEventListener("click", function () {
    const filteredData = window.data.filter((item) => selected_ship.includes(item.Ship));
    const filteredData_Scenario = filteredData.filter((item) => scenario_list.includes(item.Scenario));

    const sortedData = filteredData_Scenario.sort((a, b) => {
        if (a.Vessel < b.Vessel) return -1;
        if (a.Vessel > b.Vessel) return 1;
        return 0;
    });

    downloadCSV(sortedData, columns, "filtered_data.csv");
});
