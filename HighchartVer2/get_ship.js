function getFirstPart(shipName) {
    return shipName.split("_")[0];
}


const shipSet = new Set();
const transformed_data = [];

data.forEach((item) => {
    let ship = getFirstPart(item.ship);

    if (!ship.includes("fob")) {
        if (ship.includes("third")) {
            const parcel = Number(item.Parcel_size.toFixed(3));
            ship = ship + "_" + parcel;
        }

        if (!shipSet.has(ship)) {
            transformed_data.push({ Value: ship, Label: ship });
            shipSet.add(ship);
        }
    }
});

console.log(transformed_data);
