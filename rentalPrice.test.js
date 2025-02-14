const rental = require('./rentalPrice');

describe('getDays', () => {
  const testDates = [
    ['2021-01-01', '2021-01-10', 10],
    ['1980-01-01', '1980-12-31', 366],
    ['1985-01-01', '1985-12-31', 365],
    ['2020-12-31', '2021-01-01', 2],
    ['2024-05-05', '2024-05-05', 1],
    ['2021-01-01', '2020-12-31', 2],
  ]

  for (const [beginDate, endDate, expected] of testDates) {
    test(`${beginDate} to ${endDate} should be ${expected} days`, () => {
      expect(rental.getDays(new Date(beginDate), new Date(endDate))).toBe(expected)
    })
  }
})

describe('getCarType', () => {
  for (const type of rental.VALID_CAR_CLASSES) {
    test(`${type} should return ${type}`, () => {
      expect(rental.getCarType(type)).toBe(type)
    })
  }

  test('invalid type should return Unknown', () => {
    expect(rental.getCarType('Invalid')).toBe('Unknown')
    expect(rental.getCarType('ReallyInvalid')).toBe('Unknown')
    expect(rental.getCarType('Unknown')).toBe('Unknown')
    expect(rental.getCarType('NotUnknown')).toBe('Unknown')
  })
})

describe('getSeason', () => {
  const testDates = [
    ['2020-11-01', '2021-03-31', 'Low'],
    ['2021-04-01', '2021-10-30', 'High'],
    ['2021-01-01', '2021-10-30', 'High'],
    ['2021-01-01', '2021-02-01', 'Low'],
    ['2021-01-01', '2021-05-01', 'High'],
  ]

  for (const [pickupDate, dropoffDate, expected] of testDates) {
    test(`${pickupDate} to ${dropoffDate} should be ${expected} season`, () => {
      expect(rental.getSeason(new Date(pickupDate), new Date(dropoffDate))).toBe(expected)
    })
  }
})

describe('isWeekend', () => {
  const testDates = [
    ['2025-02-10', '2025-02-12', false],
    ['2025-02-13', '2025-02-15', true],
    ['2025-02-14', '2025-02-17', true],
  ]

  for (const [pickupDate, dropoffDate, expected] of testDates) {
    test(`${pickupDate} to ${dropoffDate} -> ${expected}`, () => {
      expect(rental.isWeekend(new Date(pickupDate), new Date(dropoffDate))).toBe(expected)
    })
  }
})

describe('calculatePrice', () => {
  const pickupDate = new Date('2025-02-10')
  const dropoffDate = new Date('2025-02-13')

  test('The minimum rental price per day is equivalent to the age of the driver', () => {
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Compact', 50, 20)).toBe('$200')
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Compact', 30, 20)).toBe('$120')
  })

  test('Individuals under the age of 18 are ineligible to rent a car', () => {
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Compact', 17, 20)).not.toBe('$68')
  })

  test('Those aged 18-21 can only rent Compact cars', () => {
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Compact', 20, 20)).toBe('$80')
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Electric', 20, 20)).not.toBe('$80')
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Cabrio', 20, 20)).not.toBe('$80')
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Racer', 20, 20)).not.toBe('$80')
  })

  test('If renting in High season, price is increased by 15%', () => {
    expect(rental.calculatePrice(new Date('2025-05-05'), new Date('2025-05-08'), 'Compact', 50, 20)).toBe('$230')
  })

  describe('For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season)', () => {
    test('during low season', () => {
      expect(rental.calculatePrice(pickupDate, dropoffDate, 'Racer', 25, 20)).toBe('$100')
    })
    test('during high season', () => {
      expect(rental.calculatePrice(new Date('2025-05-05'), new Date('2025-05-08'), 'Racer', 25, 20)).toBe('$173')
    })
  })

  describe('If renting for more than 10 days, price is decresed by 10% (except during the high season)', () => {
    test('during low season', () => {
      expect(rental.calculatePrice(new Date('2025-02-03'), new Date('2025-02-22'), 'Compact', 50, 20)).toBe('$945')
    })
    test('during high season', () => {
      expect(rental.calculatePrice(new Date('2025-05-05'), new Date('2025-05-24'), 'Compact', 50, 20)).toBe('$1208')
    })
  })

  test('Individuals holding a driver\'s license for less than a year are ineligible to rent', () => {
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Compact', 50, 0)).not.toBe('$200')
  })

  test('If the driver\'s license has been held for less than two years, the rental price is increased by 30%', () => {
    expect(rental.calculatePrice(pickupDate, dropoffDate, 'Compact', 50, 1)).toBe('$260')
  })

  test('If the driver\'s license has been held for less than three years, then an additional 15 euros will be added to the daily rental price during high season', () => {
    expect(rental.calculatePrice(new Date('2025-05-05'), new Date('2025-05-08'), 'Compact', 50, 2)).toBe('$247')
  })

  // Weekday/Weekend Pricing
  describe('Weekdays have regular price and weekend days have 5% price increase', () => {
    test('Monday, Tuesday, Wednesday', () => {
      expect(rental.calculatePrice(new Date('2025-02-10'), new Date('2025-02-12'), 'Compact', 50, 20)).toBe('$150')
    })

    test('Thursday, Friday, Saturday', () => {
      expect(rental.calculatePrice(new Date('2025-02-13'), new Date('2025-02-15'), 'Compact', 50, 20)).toBe('$158')
    })
  })
})

/*Weekday/Weekend Pricing:

Write tests to ensure that pricing is different for weekdays and weekends. Write tests to verify correctly determined price based on the rental period.

Implement functionality to have different pricing for weekdays and weekends. Weekdays have regular price and weekend days have 5% price increase.

Example 1: 50 year old driver rents a car for three days: Monday, Tuesday, Wednesday - Total price $150

Example 2: 50 year old driver rents a car for three days: Thursday, Friday, Saturday - Total price $152.50*/

