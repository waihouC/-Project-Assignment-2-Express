const express = require('express');
const cors = require('cors');

require('dotenv').config();

const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;
const MongoUrl = process.env.MONGO_URL;

let app = express();

app.use(express.json());
app.use(cors());

async function main() {
    // connect to mongodb
    await MongoUtil.connect(MongoUrl, 'tgc13_assignment2');

    // get all groupbuy list
    app.get('/groupbuy', async function(req, res) {
        let db = MongoUtil.getDB();
        let results = await db.collection('groupbuy').find({}).toArray();
        res.json(results);
    })

    // search function
    app.get('/groupbuy/search', async function(req, res){
        let criteria = {};

        if (req.query.groupName) {
            criteria['groupName'] = {$regex: req.query.groupName, $options:'i'};
        }

        if (req.query.price) {
            criteria['price'] = {$regex: req.query.price, $options:'i'}
        }

        if (req.query.location) {
            criteria['location'] = {$regex: req.query.location, $options:'i'}
        }

        if (req.query.deadline) {
            criteria['deadline'] = {$regex: req.query.deadline, $options:'i'}
        }

        if (req.query.category) {
            criteria['category'] = {$regex: req.query.category, $options:'i'}
        }

        if (req.query.tags) {
            criteria['tags'] = {$regex: req.query.tags, $options:'i'}
        }

        let db = MongoUtil.getDB();
        let results = await db.collection('groupbuy').find(criteria).toArray();
        res.json(results);
    })

    app.listen(3000, ()=>{
        console.log("Server started.");
    })
}

main();