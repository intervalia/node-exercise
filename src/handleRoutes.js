const { getPlanets, getPeople }  = require('./getData');
const fetch = require('node-fetch');
const VALID_SORT_FIELDS = ['name', 'height', 'mass'];
const DEFAULT_SORT = VALID_SORT_FIELDS[0];
const VALID_SORT_DIR_FIELDS = ['asc', 'desc'];
const DEFAULT_SORT_DIR = VALID_SORT_DIR_FIELDS[0];
const NUMBER_RE = /^\d{1,3}((,\d{3})|\d)*$/

function handleRoutes(app) {
  app.get('/', showPage)
  app.get('/api/people', processPeople);
  app.get('/api/planets', processPlanets);
  app.use(errorHandler);
}

function errorHandler(error, req, res, next) {
  res.status = 404;
  res.send(`Error: ${error}`)
  res.end();
}

function sortPeople(sortBy, invert) {
  return (a, b) => {
    let resp = 0;
    let av = a[sortBy];
    if (NUMBER_RE.test(av)) {
      av = Number(av.replace(/,/g, ''));
    }
    let bv = b[sortBy];
    if (NUMBER_RE.test(bv)) {
      bv = Number(bv.replace(/,/g, ''));
    }

    if (av < bv) {
      resp = -1;
    }
    else if (av > bv) {
      resp = 1;
    }

    return invert ? resp * -1 : resp;
  }
}

async function processPeople(req, res, next) {
  let sortBy = (req.query.sortBy || DEFAULT_SORT).toLowerCase();
  let sortDir = (req.query.sortDir || DEFAULT_SORT_DIR).toLowerCase();
  if (!VALID_SORT_FIELDS.includes(sortBy)) {
    sortBy = DEFAULT_SORT;
  }
  if (!VALID_SORT_DIR_FIELDS.includes(sortDir)) {
    sortDir = DEFAULT_SORT_DIR;
  }

  const people = (await getPeople()).sort(sortPeople(sortBy, sortDir !== DEFAULT_SORT_DIR));
  res.json(people);
}

async function processPlanets(req, res, next) {
  const planets = await getPlanets();
  res.json(planets);
}

function showPage(req, res, next) {
  res.render('main');
}

module.exports = handleRoutes;
