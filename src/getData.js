const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const fetch = require('node-fetch');
let cachedData = {
  expires: 0,
  people: [],
  planets: []
}
const CACHED_DATA_FILE = 'cachedData.json';
const DAYS_1 = 24*60*60*1000;

async function getPeople() {
  return cachedData.people;
}

async function getPlanets() {
  return cachedData.planets;
}

async function loadAllData() {
  if (fs.existsSync(CACHED_DATA_FILE)) {
    cachedData = JSON.parse(await fsp.readFile(CACHED_DATA_FILE));

    // Only use this data if it is no more than 4 hours old.
    if (cachedData.expires > Date.now()) {
      return;
    }
  }

  const [ people, planets ] = await Promise.all([loadPeople(), loadPlanets()]);
  // Normalize the person data
  /*
  people.forEach(person => {
    person.height = Number(person.height) || 0;
    person.mass = Number(person.mass) || 0;
  });
  */

  // make the cachedData object
  cachedData.people = people;
  cachedData.planets = planets;

  // Create an index based on person URLs just in case they are not correctly indexed
  const personIdx = people.reduce((acc, person, idx) => {
    acc[person.url] = idx;
    return acc;
  }, {});

  // Normalize the resident data for each planet
  planets.forEach(planet => {
    planet.residents = planet.residents.map(url => {
      const idx = personIdx[url];
      return (people[idx]||{}).name;
    });
  });

  cachedData.expires = Date.now() + DAYS_1; // Indicate when this cache is invalid

  // Save the cache data to the cache file
  await fsp.writeFile(CACHED_DATA_FILE, JSON.stringify(cachedData,0,2));
}

async function loadPeople(url = 'https://swapi.dev/api/people') {
  return loadRestData(url);
}

async function loadPlanets(url ='https://swapi.dev/api/planets') {
  return loadRestData(url);
}

async function loadRestData(url) {
  const resp = await fetch(url);
  const newData = await resp.json();
  console.log(`${url} returned ${newData.results.length} items.`);
  let retVal = [...newData.results];
  if (newData.next) {
    retVal = [...retVal, ...(await loadRestData(newData.next))];
  }

  return retVal;
}

module.exports = {
  getPeople,
  getPlanets,
  loadAllData
};
