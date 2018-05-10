const chai = require('chai');
const chaiHTTP = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');


const expect = chai.expect;
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHTTP);

function seedBlogData() {
    const seedData = [];

    for (let i=1; i<=10; i++) {
        seedData.push(generateBlogData());
      }
      // this will return a promise
      return BlogPost.insertMany(seedData);
    

 }

function generateBlogData() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
          },
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph(),
          created: faker.date.past()
    }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
  }


describe('Blog API test', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
      });
    
      beforeEach(function() {
        return seedBlogData();
      });
    
      afterEach(function() {
        return tearDownDb();
      });
    
      after(function() {
        return closeServer();
    });


    it('should return all db for a GET function', function(){
     let res
     return chai.request(app)
        .get("/posts")
        .then(function(_res){
            res = _res;
            expect(res).to.have.status(200);
            expect(res.body).to.have.lengthOf.at.least(1)
            return BlogPost.count()
        })
        .then(function(count){
            expect(res.body).to.have.lengthOf(count)
        })

    })

    it('should add a new blog post on a POST', function () {
        const newTestBlogPost = {
            title: "I'm just a test", 
            content: "I'm just some test content",
            author: "I'm just a test author"
        }
        return chai.request(app)
        .post("/posts")
        .send(newTestBlogPost)
        .then(function(res){
            expect(res).to.have.status(201);
            expect(res).to.be.json
        })
    })

})

