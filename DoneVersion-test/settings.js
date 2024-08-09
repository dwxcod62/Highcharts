const SERIES_NOT_ALLOW = "Temp Series";
const uniqueStatuses = ["Signed"];

const AVAILABLE_CHARACTER = ["MLNG", "PLL", "third"];
const SHIP_NOT_SELECT = ["third_0.008", "third_0.062", "third_0.004"];
// const DESIRED_ORDER = ["Signed", "Dry Dock", "Spot", "Term Excess", "P10", "P50"];
// let scenario_list = ["Supply Contract", "[Base] KPBI_Base 2024-05-07"];
// // scenario_list = ["[Base] KPBI_Base 2024-05-07"];
// // const scenario_list = ["Supply Contract", "[Base] TAA 2024-04-04"];
// // const scenario_list = [
// //     "[Base] KPBI_Base 2023-11-16",
// //     "pv alpha run",
// //     "test run ai",
// //     "New linda",
// //     "New scenario",
// //     "HRE - Extension 26BACQ CY28-36",
// //     "HRE - Extension 16BACQ CY28-36",
// // ];

const scenario_list = ["test run ai", "New linda", "[Base] KPBI_Base 2023-11-16"];

const scenario_all_text = scenario_list.join(", ");
const year = 2024;

const selected_ship = [
    "Aman Sendai",
    "Arctic Spirit",
    "Dukhan",
    "HongKong Energy",
    "Ibri LNG",
    "KMarin Diamond",
    "Lagenda Serenity",
    "Lagenda Setia",
    "Lagenda Suria",
    "Linda Ship 2",
    "Linda Ship 3",
    "Methane Heather Sally",
    "Newbuild Vessel 1",
    "Newbuild Vessel 10",
    "Newbuild Vessel 11",
    "Newbuild Vessel 2",
    "Newbuild Vessel 3",
    "Newbuild Vessel 4",
    "Newbuild Vessel 5",
    "Newbuild Vessel 6",
    "Newbuild Vessel 7",
    "Newbuild Vessel 8",
    "Newbuild Vessel 9",
    "Puteri Delima",
    "Puteri Delima Satu",
    "Puteri Firus Satu",
    "Puteri Intan",
    "Puteri Intan Satu",
    "Puteri Ledang",
    "Puteri Mahsuri",
    "Puteri Mayang",
    "Puteri Mutiara Satu",
    "Puteri Nilam",
    "Puteri Nilam Satu",
    "Puteri Saadong",
    "Puteri Santubong",
    "Puteri Sejinjang",
    "Puteri Zamrud",
    "Puteri Zamrud Satu",
    "Seri Alam",
    "Seri Amanah",
    "Seri Anggun",
    "Seri Angkasa",
    "Seri Ayu",
    "Seri Ayu 5",
    "Seri Bakti",
    "Seri Begawan",
    "Seri Bijaksana",
    "Seri Camar",
    "Seri Camellia",
    "Seri Cemara",
    "Seri Cempaka",
    "Seri Cenderawasih",
    "Tangguh Batur",
    "third_0.033",
    "third_0.065",
    "third_0.067",
    "third_0.068",
    "third_0.07",
];

function getColorForStatus(status) {
    const statusColors = {
        P10: "#ba7be0",
        P50: "#6689e8",
        P90: "#d4df33",
        Spot: "#ea8b00",
        Signed: "#00a19c",
        "Dry Dock": "#ba7be0",
        "Term Excess": "#c41300",
    };

    return statusColors[status] || "#000000";
}

function getFirstPart(shipName) {
    return shipName.split("_")[0];
}

function checkName(shipName, Parcel_size) {
    if (shipName == "third") {
        const parcel = Number(Parcel_size.toFixed(3));
        return shipName + "_" + parcel;
    }
    return getFirstPart(shipName);
}

function formatStatus(status) {
    let words = status.split("_");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return words.join(" ");
}

function calculateTotalUtilization(shipData) {
    const totalUtilizationByShip = [];

    for (const ship in shipData) {
        let totalUtilization = 0;

        for (const scenario in shipData[ship]) {
            for (const status in shipData[ship][scenario]) {
                if (shipData[ship][scenario][status].utilization != 0) {
                    let index_utilization = shipData[ship][scenario][status].utilization;

                    if (ship == "Puteri Ledang") {
                        console.log(index_utilization);
                    }
                    totalUtilization += index_utilization;
                }
            }
        }
        if (ship == "Puteri Ledang") {
            console.log("=> " + totalUtilization);
        }

        // totalUtilization = totalUtilization / 10;
        totalUtilizationByShip.push({ ship, totalUtilization });
    }

    totalUtilizationByShip.sort((a, b) => {
        if (b.totalUtilization !== a.totalUtilization) {
            return b.totalUtilization - a.totalUtilization;
        } else if (b.totalUtilization == 0.0 || a.totalUtilization == 0) {
            return a.ship.localeCompare(b.ship);
        } else {
            return ship_in_year.indexOf(a.ship) - ship_in_year.indexOf(b.ship);
        }
    });

    return totalUtilizationByShip;
}

function prepareSeriesArray(totalUtilizationByShip, shipData, uniqueStatuses) {
    const seriesArray = [];
    DESIRED_ORDER.forEach((status) => {
        if (uniqueStatuses.includes(status)) {
            const data = [];
            totalUtilizationByShip.forEach((item) => {
                const ship = item.ship;
                if (shipData[ship]) {
                    for (const scenario in shipData[ship]) {
                        if (shipData[ship][scenario][status]) {
                            const utilization = shipData[ship][scenario][status].utilization || 0.0;
                            data.push(utilization);
                        } else {
                            data.push(0.0);
                        }
                    }
                }
            });
            seriesArray.push({
                name: status,
                data: data,
                color: getColorForStatus(status),
            });
        }
    });
    return seriesArray;
}
