const mongoose = require('mongoose');
const { Schema } = mongoose;


mongoose.connect('mongodb://localhost/weatherdb', {
    useNewUrlParser: true
}).then(
    () => { console.log('DB connected') },
    err => { console.log(err) }
);

const CitySchema = new Schema({
    id: Number ,
    name: String,
    country: String,
    coord: {
        lon: Number,
        lat: Number
    }
});
const City = mongoose.model('cities', CitySchema);

module.exports = City;