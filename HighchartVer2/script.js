const desiredOrder = ["Signed", "Spot", "Term Excess", "Dry Dock", "P10", "P50"];
const availableCharacter = ["MLNG", "PLL", "third"];

const scenario_list = ["Supply Contract", "[Base] KPBI_Base 2024-05-07"];

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

// Exp: dry_dock -> Dry Dock
function formatStatus(status) {
    let words = status.split("_");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return words.join(" ");
}

// Exp: ShipABC_21 -> ShipABC
function getFirstPart(shipName) {
    return shipName.split("_")[0];
}

// Get data
async function fetchData(url) {
    const response = await fetch(url);
    return await response.json();
}

function getStatusList(jsonData) {
    const uniqueStatuses = [];
    for (let key in jsonData) {
        for (let scenario in jsonData[key]) {
            for (let status in jsonData[key][scenario]) {
                if (!uniqueStatuses.includes(status)) {
                    uniqueStatuses.push(status);
                }
            }
        }
    }
    return uniqueStatuses;
}

function processData(jsonData) {
    const shipData = {};
    const uniqueStatuses = [];

    jsonData.forEach((data) => {
        let ship = getFirstPart(data.ship);
        const year = parseInt(data.Year);
        const status = formatStatus(data.Status);
        const activeDay = parseInt(data.Active_days);
        const scenario = data.scenario;
        const tt = parseFloat(data.tt);
        const numTrip = parseInt(data.Num_trips);
        const dryDay = parseInt(data.Dry_dock_days);
        const character = data.Character;
        const parcelSize = data.Parcel_size;

        if (year === 2031 && !ship.includes("fob") && availableCharacter.includes(character)) {
            if (ship.includes("third")) {
                const parcel = Number(parcelSize.toFixed(3));
                ship = `${ship}_${parcel}`;
            }

            if (!shipData[ship]) {
                shipData[ship] = {};
            }

            if (scenario_list.includes(scenario)) {
                if (!shipData[ship][scenario]) {
                    shipData[ship][scenario] = {};
                }

                if (!shipData[ship][scenario][status]) {
                    if (!uniqueStatuses.includes(status)) {
                        uniqueStatuses.push(status);
                    }
                    shipData[ship][scenario][status] = {
                        utils: 0.0,
                        activeDate: 0.0,
                        utilization: 0.0,
                    };
                }
                if (activeDay + dryDay > shipData[ship][scenario][status].activeDate) {
                    shipData[ship][scenario][status].activeDate = activeDay + dryDay;
                }

                shipData[ship][scenario][status].utils += tt * numTrip;
            }
        }
    });

    return { shipData, uniqueStatuses };
}

function calculateUtilization(shipData) {
    for (const ship in shipData) {
        for (const scenario in shipData[ship]) {
            for (const status in shipData[ship][scenario]) {
                const utils = shipData[ship][scenario][status].utils;
                const activeDate = shipData[ship][scenario][status].activeDate;

                if (activeDate !== 0) {
                    const utilization = (utils / activeDate) * 100;
                    shipData[ship][scenario][status].utilization = parseFloat(utilization.toFixed(1));
                }
            }
        }
    }
}

function addMissingStatuses(shipData, uniqueStatuses) {
    for (const ship in shipData) {
        for (const scenario in shipData[ship]) {
            const currentStatuses = Object.keys(shipData[ship][scenario]);
            for (const uniqueStatus of uniqueStatuses) {
                if (!currentStatuses.includes(uniqueStatus)) {
                    shipData[ship][scenario][uniqueStatus] = {
                        utils: 0.0,
                        activeDate: 0.0,
                        utilization: 0.0,
                    };
                }
            }
        }
    }
}

function calculateTotalUtilization(shipData) {
    const totalUtilizationByShip = [];
    for (const ship in shipData) {
        let totalUtilization = 0;
        for (const scenario in shipData[ship]) {
            for (const status in shipData[ship][scenario]) {
                totalUtilization += shipData[ship][scenario][status].utilization;
            }
        }
        totalUtilizationByShip.push({ ship, totalUtilization });
    }
    totalUtilizationByShip.sort((a, b) => b.totalUtilization - a.totalUtilization);
    return totalUtilizationByShip;
}

function prepareCategories(totalUtilizationByShip, shipData) {
    return totalUtilizationByShip.map((item) => {
        return {
            name: item.ship,
            categories: Object.keys(shipData[item.ship]),
        };
    });
}

function prepareSeriesArray(totalUtilizationByShip, shipData, uniqueStatuses) {
    const seriesArray = [];
    desiredOrder.forEach((status) => {
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

function renderChart(categories, seriesArray) {
    Highcharts.chart("container", {
        chart: {
            type: "bar",
            height: 1600,
        },
        title: {
            text: "% Shipping Utilization by Year: 2024 ",
        },
        xAxis: {
            categories: categories,
            labels: {
                rotation: 0,
                x: -8,
                align: "right",
                style: {
                    fontSize: "11px",
                },
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: "",
            },
        },
        legend: {
            backgroundColor: "#0000001a",
        },
        tooltip: {
            backgroundColor: "#B4B4B8",
            pointFormatter: function () {
                const color = this.series.color;
                return '<span style="color:' + color + '">\u25CF</span> ' + this.series.name + ": " + this.y.toFixed(1) + "%<br/>";
            },
        },
        plotOptions: {
            series: {
                stacking: "normal",
                borderWidth: 1,
                borderColor: "#000",
                pointWidth: 14,
                dataLabels: {
                    enabled: true,
                    inside: true,
                    formatter: function () {
                        return this.y !== 0 ? this.y : null; // Display utilization with %
                    },
                    style: {
                        fontSize: "11px",
                        color: "black",
                    },
                },
            },
        },
        series: seriesArray,
    });
}

function customReplacer(key, value) {
    if (typeof value === "number" && value === 0) {
        return value;
    }
    return value;
}

const loadData = async () => {
    try {
        const jsonData = await fetchData("ver2.json");
        const { shipData, uniqueStatuses } = processData(jsonData);

        calculateUtilization(shipData);
        addMissingStatuses(shipData, uniqueStatuses);

        const b = getStatusList(JSON.parse(JSON.stringify(shipData)));

        const totalUtilizationByShip = calculateTotalUtilization(shipData);
        const categories = prepareCategories(totalUtilizationByShip, shipData);
        const seriesArray = prepareSeriesArray(totalUtilizationByShip, shipData, b);

        renderChart(categories, seriesArray);
    } catch (error) {
        console.error("Error loading JSON data:", error);
    }
};

loadData();
