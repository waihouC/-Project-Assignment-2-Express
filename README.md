# Tompang.sg - A Groupbuy Site
## Summary
This project provides the necessary RESTful API for the site to work with MongoDB. The site stores all data to a single collection.

These are the functionalities that are provided to the site:
* Retrieve all non-expired groupbuys for display
* Search for non-expired groupbuys based on given criteria
* Add a member to a groupbuy
* Show member details of a groupbuy
* Create a new groupbuy
* Edit an existing groupbuy
* Delete an existing groupbuy

The schema of a groupbuy object is listed below:
- Id: ObjectId
- userName: String
- groupName: String
- price: Double
- location: String
- deadline: String
- contact: String
- maxOrders: Int32
- description: String
- category: String
- createdOn: String
- lastEditedOn: String
- tags: String Array
- groupMembers: Object Array
  - Id: ObjectId
  - firstName: String
  - lastName: String
  - contact: String
  - joinedOn: String

Refer to https://github.com/waihouC/Project-Assignment-2-Vue for the full project.