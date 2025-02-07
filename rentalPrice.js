
/**
 * @param {Date} pickupDate
 * @param {Date} dropoffDate
 * @param {string} carType
 * @param {number} driverAge
 * @param {number} driverLicenseAge
 * @returns
 */
function calculatePrice(pickupDate, dropoffDate, carType, driverAge, driverLicenseAge) {
  const rentalDays = getDays(pickupDate, dropoffDate);
  const rentalSeason = getSeason(pickupDate, dropoffDate);

  carType = getCarType(carType);

  // Individuals under the age of 18 are ineligible to rent a car.
  if (driverAge < 18) {
    return "Driver too young - cannot quote the price";
  }

  // Individuals holding a driver's license for less than a year are ineligible to rent.
  if (driverLicenseAge < 1) {
    return "Driver must hold a license for at least 1 year";
  }

  // Those aged 18-21 can only rent Compact cars.
  if (driverAge <= 21 && carType !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  // The minimum rental price per day is equivalent to the age of the driver.
  let rentalPrice = driverAge * rentalDays;

  // If the driver's license has been held for less than three years,
  // then an additional 15 euros will be added to the daily rental price during high season.
  if (driverLicenseAge < 3 && rentalSeason === "High") {
    rentalPrice += 15;
  }

  // If the driver's license has been held for less than two years, the rental price is increased by 30%.
  if (driverLicenseAge < 2) {
    rentalPrice *= 1.3;
  }

  // For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season).
  if (carType === "Racer" && driverAge <= 25 && rentalSeason === "High") {
    rentalPrice *= 1.5;
  }

  // If renting in High season, price is increased by 15%.
  if (rentalSeason === "High") {
    rentalPrice *= 1.15;
  }

  // If renting for more than 10 days, price is decresed by 10% (except during the high season).
  if (rentalDays > 10 && rentalSeason === "Low") {
    rentalPrice *= 0.9;
  }

  return '$' + Math.round(rentalPrice);
}

// Rental cars are categorized into 4 classes: Compact, Electric, Cabrio, Racer.
const VALID_CAR_CLASSES = ["Compact", "Electric", "Cabrio", "Racer"];

/**
 * @param {string} type
 * @returns string
 */
function getCarType(type) {
  if (VALID_CAR_CLASSES.includes(type)) {
    return type;
  }

  return "Unknown";
}

/**
 * Calculates the number of days between two dates.
 * @param {Date} beginDate
 * @param {Date} endDate
 * @returns number
 */
function getDays(beginDate, endDate) {
  const ONE_DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

  return Math.round(Math.abs((beginDate - endDate) / ONE_DAY)) + 1;
}


/**
 * Determines the season based on the pickup and dropoff dates.
 * @param {Date} pickupDate
 * @param {Date} dropoffDate
 * @returns "High" or "Low"
 */
function getSeason(pickupDate, dropoffDate) {
  // Low season is from November until end of March.
  // High season is from April until end of October.

  const HIGH_SEASON_START = 4; // April
  const HIGH_SEASON_END = 10; // October

  const pickupMonth = pickupDate.getMonth();
  const dropoffMonth = dropoffDate.getMonth();

  // If both pickup and dropoff are outside of high season, return low season
  if (pickupMonth > HIGH_SEASON_END && dropoffMonth < HIGH_SEASON_START) {
    return "Low";
  }

  return "High";
}

exports.calculatePrice = calculatePrice;
exports.VALID_CAR_CLASSES = VALID_CAR_CLASSES;
