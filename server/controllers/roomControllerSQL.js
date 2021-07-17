const { MoveToInboxTwoTone } = require('@material-ui/icons');
const db = require('../models/NextroomModels.js');
const geocoder = require('../utils/geocoder');

const roomControllerSQL = {};

// YOU HAVE TO RUN cookiesControllerSQL.checkCookie BEFORE ANY OF THESE MIDDLEWARE FUNCS!

roomControllerSQL.addRooms = async (req, res, next) => {

  try {
    const { address, zipcode, title, description, imageFileName, price } = req.body;
    const id = res.locals.token.id;


    const location = await geocoder.geocode(address);
    console.log(location[0].formattedAddress);
    const latitude = location[0].latitude
    const longtitude = location[0].longitude

    const query = `INSERT INTO rooms (id, title, address, zipcode, description, imageFileName, longitude, latitude, price)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    const values = [id, title, address, zipcode, description, imageFileName, longtitude, latitude, price]; //imageFileName might be different
    const queryResult = await db.query(query, values);

    res.locals.rooms = queryResult.rows[0];

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
  next();
};

roomControllerSQL.getRooms = async (req, res, next) => {
  try {
    const id = res.locals.token.id;

    const query = `SELECT * FROM rooms WHERE id = ($1)`;
    const queryResult = await db.query(query, [id]);
    res.locals.rooms = queryResult.rows;
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

roomControllerSQL.getNearRooms = async (req, res, next) => {
  let { longitude, latitude, miles } = req.body;
  longitude = Number(longitude);
  latitude = Number(latitude);
  miles = Number(miles) / 68.703;
  console.log('miles', miles);
  if (miles === undefined) miles = 10 / 68.703;
  try {
    const query = `SELECT * FROM rooms`;
    // data.rows[0]
    // rows [{long:00}, {}, {}, {}, {}]
    let bathroomsArr = []
    // bathrooms.rows.forEach(el =>{
    //     if((el['location']['coordinates'][0] < longitude+miles &&
    //     el['location']['coordinates'][0] > longitude-miles) &&
    //     (el['location']['coordinates'][1] < latitude+miles &&
    //     el['location']['coordinates'][1] > latitude-miles) &&
    //     el['location']['coordinates'][1]) {
    //         bathroomsArr.push(el)
    //     }
    // })

    // res.locals.nearBathrooms = bathroomsArr
    next();
  } catch (err) {
    // next(`error in bathroomController.getNearBathrooms: ${err}`)
    next({ err });
  }
};

roomControllerSQL.updateroom = async (req, res, next) => {
  const id = res.locals.token.id;
  try {
    const location = await geocoder.geocode(req.body.address);
    //console.log(req.body)
    // Room info requires id, title, description, address, price, type, logitude, latitude, formattedAddress, imageFileName

    const type = 'point';
    const coordinates = [location[0].longitude, location[0].latitude];
    const formattedAddress = location[0].formattedAddress;

    const query = `UPDATE rooms
    SET type = ($1), coordinates = ($2), formattedAddress = ($3)
    WHERE id = ($4)`;
    const value = [type, coordinates, formattedAddress, id];
    const result = await db.query(query, value);
    res.locals.updatedRoom = result.rows[0]; 
    next()
  } catch (err) {
    console.log(err);
    next(err);
  }
};

roomControllerSQL.deleteRooms = async (req, res, next) => {
  //const id = res.locals.token.id;
  const id = req.body.id;
  const title = req.body.title;
  //console.log(id, title)
  const values = [id, title]
  try {
    const query = `DELETE FROM rooms WHERE id = $1 AND title = $2`;
    await db.query(query, values);
    next()
  } catch (err) {
    console.log(err);
    next(err);
  }

};

module.exports = roomControllerSQL;
