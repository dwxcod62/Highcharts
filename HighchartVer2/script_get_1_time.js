const desiredOrder = ["Signed", "Spot", "Term Excess", "Dry Dock", "P10", "P50"];
const availableCharacter = ["MLNG", "PLL", "third"];

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

function processData(jsonData) {
    const shipData = {};
    const uniqueStatuses = [];

    jsonData.forEach((data) => {
        let ship = getFirstPart(data.ship);
        const status = formatStatus(data.Status);
        const activeDay = parseInt(data.Active_days);
        const scenario = data.scenario;
        const tt = parseFloat(data.tt);
        const numTrip = parseInt(data.Num_trips);
        const dryDay = parseInt(data.Dry_dock_days);
        const character = data.Character;
        const parcelSize = data.Parcel_size;

        const year = data.Year.toString();

        if (!shipData[year]) {
            shipData[year] = [];
        }

        if (!ship.includes("fob") && availableCharacter.includes(character)) {
            if (ship.includes("third")) {
                const parcel = Number(parcelSize.toFixed(3));
                ship = `${ship}_${parcel}`;
            }

            let shipEntry = shipData[year].find((entry) => entry.ship === ship);

            if (!shipEntry) {
                shipEntry = {
                    ship: ship,
                    scenarios: [],
                };
                shipData[year].push(shipEntry);
            }

            let scenarioEntry = shipEntry.scenarios.find((sc) => sc.scenario === scenario);

            if (!scenarioEntry) {
                scenarioEntry = {
                    scenario: scenario,
                    status: [],
                };
                shipEntry.scenarios.push(scenarioEntry);
            }

            let statusEntry = scenarioEntry.status.find((st) => st.status === status);
            if (!statusEntry) {
                statusEntry = {
                    status: status,
                    utils: 0.0,
                    activeDate: 0.0,
                    utilization: 0.0,
                };
                scenarioEntry.status.push(statusEntry);
            }

            statusEntry.activeDate = Math.max(statusEntry.activeDate, activeDay + dryDay);
            statusEntry.utils += tt * numTrip;
        }
    });

    return shipData;
}

async function downloadShipData() {
    try {
        const jsonData = await fetchData("ver2.json");
        const processedData = processData(jsonData);
        const jsonDataString = JSON.stringify(processedData, null, 2);
        const blob = new Blob([jsonDataString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "shipData.json";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading shipData:", error);
    }
}

downloadShipData();
