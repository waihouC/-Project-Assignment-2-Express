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

    // get all groupbuy list greater or equal to today
    // hide expired groupbuy and sort by deadline ascending
    app.get('/groupbuy', async function(req, res) {
        let db = MongoUtil.getDB();
        let results = await db.collection('groupbuy').find({
            'deadline': {
                $gte: new Date().toISOString().split('T')[0]
            }
        }).sort({deadline: 1}).toArray();
        res.json(results);
    })

    // search function
    app.get('/groupbuy/search', async function(req, res){
        // default criteria
        // filter away expired groupbuy
        let criteria = {
            'deadline': {
                $gte: new Date().toISOString().split('T')[0]
            }
        };

        if (req.query.groupName) {
            criteria['groupName'] = {$regex: req.query.groupName, $options:'i'};
        }

        if (req.query.price) {
            const price = parseFloat(req.query.price);
            criteria['price'] = {$lte: price}
        }

        if (req.query.location) {
            criteria['location'] = {$regex: req.query.location, $options:'i'};
        }

        if (req.query.category) {
            criteria['category'] = {$regex: req.query.category, $options:'i'};
        }

        if (req.query.tags) {
            let tags = req.query.tags;
            // regex to split by comma and remove whitespace
            const regex = /\s*(?:,|$)\s*/
            const queryList = tags.split(regex);
            criteria['tags'] = {$in: queryList};
        }

        let db = MongoUtil.getDB();
        let results = await db.collection('groupbuy').find(criteria).sort({deadline: 1}).toArray();
        res.json(results);
    })

    // create group
    app.post('/groupbuy/create', async function(req, res) {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('groupbuy').insertOne({
                'userName': req.body.userName,
                'groupName': req.body.groupName,
                'price': req.body.price,
                'location': req.body.location,
                'deadline': req.body.deadline,
                'contact': req.body.contact,
                'maxOrders': req.body.maxOrders,
                'description': req.body.description,
                'category': req.body.category,
                'tags': req.body.tags,
                'groupMembers': [],
                'createdOn': new Date().toISOString(),
                'lastEditedOn': ""
            });
            res.status(200);
            res.json(result);
        } catch(e) {
            res.status(500);
            res.json({
                'error': e
            });
        }
    })

    // join group
    app.put('/groupbuy/join/:groupid', async function(req, res) {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('groupbuy').updateOne({
                '_id': ObjectId(req.params.groupid)
            }, {
                '$push': {
                    'groupMembers': {
                        '_id': new ObjectId(),
                        'firstName': req.body.firstName,
                        'lastName': req.body.lastName,
                        'contact': req.body.contact,
                        'joinedOn': new Date().toISOString()
                    }
                }
            });
            res.status(200);
            res.json(result);
        } catch(e) {
            res.status(500);
            res.json({
                'error': e
            });
        }
    })

    // find member in group
    app.get('/groupbuy/join/:memberid', async function(req, res) {
        let db = MongoUtil.getDB();
        let result = await db.collection('groupbuy').findOne({
            'groupMembers._id': ObjectId(req.params.memberid)
        }, {
            'projection': {
                'groupMembers': {
                    '$elemMatch': {
                        '_id': ObjectId(req.params.memberid)
                    }
                }
            }
        });
        res.json(result);
    })

    // get selected group for update
    app.get('/groupbuy/edit/:groupid', async function(req, res) {
        let db = MongoUtil.getDB();
        let result = await db.collection('groupbuy').findOne({
            '_id': ObjectId(req.params.groupid)
        });
        res.json(result);
    })

    // update selected group
    app.patch('/groupbuy/edit/:groupid', async function(req, res) {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('groupbuy').updateOne({
                '_id': ObjectId(req.params.groupid)
            }, {
                '$set': {
                    'groupName': req.body.groupName,
                    'price': req.body.price,
                    'location': req.body.location,
                    'deadline': req.body.deadline,
                    'contact': req.body.contact,
                    'maxOrders': req.body.maxOrders,
                    'description': req.body.description,
                    'category': req.body.category,
                    'tags': req.body.tags,
                    'lastEditedOn': new Date().toISOString()
                }
            });
            res.status(200);
            res.json(result);   
        } catch(e) {
            res.status(500);
            res.json({
                'error': e
            });
        }
    })

    // delete group
    app.delete('/groupbuy/delete/:groupid', async function(req, res) {
        try {
            let db = MongoUtil.getDB();
            let result = db.collection('groupbuy').deleteOne({
                '_id': ObjectId(req.params.groupid)
            });
            res.status(200);
            res.json(result);
        } catch(e) {
            res.status(500);
            res.json({
                'error': e
            });
        }
    })

    app.listen(process.env.PORT, ()=>{
        console.log("Server started.");
    })
}

main();