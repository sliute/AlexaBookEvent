# Makers Rooms

![Logo](./images/MR-wordmark.jpg)

As part of our final project at Makers Academy, we have developed a skill for the Amazon Echo which facilitates the creation and management of meeting room bookings.  The skill itself was conceived, planned and developed in a period of less than two weeks.  

---

## The Challenge

Makers Academy is a fantastic place to study and, as a result, everyone wants to come here.  Whilst that's completely understandable, it does mean that booking a private room can be quite difficult, especially during group project weeks.  

With Makers Rooms enabled on an Amazon Echo device, the user can ask Alexa whether a room is currently available, and can make an appropriate booking.

---
## Approach

#### Planning & Design

At the outset of the project, we agreed to develop the skill using Node.js as opposed to Java.  Whilst none of our team had experience in developing an Alexa skill, nor programming using Node.js, we were confident that our familiarity with Javascript would facilitate any prerequisite learning processes.

Our overarching goal for the project was to develop a skill which could quickly and clearly inform a user whether a particular meeting room was available at a given time.

In deciding the requirements of a Minimum Viable Product ('MVP'), we decided that any skill should have the ability to create, read and delete bookings and that a booking should only be accepted when a room is available.

To manage our progress throughout the project, we agreed to use Taiga.io.

#### User Stories

MVP:
```
As a User,
I can ask Alexa to book a room
so that I can have a room for my meeting.

As a User,  
I can ask Alexa for a day’s schedule,
so that I know the room's status.

As a User,
I can ask Alexa to cancel a booking
so that someone else can use the room if my meeting is cancelled.

As a User,
I can only book if the room is free,
so that my event doesn’t overlap with others.
```

Additional features:
```
As a User,
I would like to receive a card when I’ve booked a room,
so that I have confirmation of the booking.

As a User,
I can add a room,
so that it is available for booking.

As a User,
I can ask Alexa which room will be available at any given time,
so I can book an alternative room, if necessary.

As a User,
Alexa will ask me for a password (when managing a booking),
so that the booking system remains secure.
```
#### Development
Whilst our ultimate aim was to produce a skill which saved and read items from an online database, we realised that the first stage in developing the product would be to produce a functioning skill locally.

Due to our lack of experience with the technology involved, the first four days of the project were spent researching, and completing tutorials on Node.js, and Amazon's Alexa Skills Kit.

Once every member of the team was comfortable with the syntax we started to develop the skill using the [Alexa-App-Server('AAP')](https://github.com/alexa-js/alexa-app-server) and a local install of Amazon's DynamoDB. AAP provided us with a local server on which we could test our development and model our schema and utterances.  

Whilst Amazon's Alexa Skills Kit provides a reliable online 'Service Simulator' for running tests, it required that any change to the code was first compressed and then uploaded to Lambda functions as a zip file. We therefore found that testing the skill using the local server provided by AAP was far more convenient.

Using AAP and the local DynamoDB database, we were able to create a number of behaviours for Alexa ('intents') which allowed a user to create, read and delete bookings. Using an Amazon Developer account, linked to an Amazon Echo Dot, we were able to test the full user experience and, once happy, we linked the lambda function to a table on DynamoDB hosted in the cloud.


## Technology

In order to develop Makers Rooms, we used the following technologies:
- Node.js;
- Alexa-App-Server;
- AWS:
  - Lambda;
  - DynamoDB;
  - Alexa Skills Kit;
  - Cloudwatch; and
- Mocha / Chai for unit testing.

## How to Deploy, Test and Use

Prerequisites:
* Install DynamoDB local, following on the instructions in [this](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html#DynamoDBLocal.DownloadingAndRunning) link;

* Install the latest [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html);

* Install [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html);

* To launch DynamoDBLocal (temporary memory), run the following commands in the command line:

```
$ cd [to downloaded DynamoDB folder, where the .jar file is]
$ java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -inMemory

// Leave this open and start a new Terminal shell. Use the following commands to:

- List tables in the database
$ aws dynamodb list-tables --endpoint-url http://localhost:8000

- Scan the BookedEvents table
$ aws dynamodb scan --table-name BookedEvents --endpoint-url http://localhost:8000


```

* To access Alexa App Server in your browser, run the following commands in the command line:

```
$ git clone https://github.com/alexa-js/alexa-app-server.git
$ cd examples
$ npm install
$ cd examples/apps
$ git clone https://github.com/sliute/AlexaBookEvent.git
$ cd AlexaBookEvent
$ npm install
$ cd [to downloaded DynamoDB folder, where the .jar file is]
$ java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -inMemory
$ cd ../.. [back to examples directory]
$ node server
$ open localhost:8080/alexa/book_event

```

## Presentation

At the conclusion of the course, we presented our skill to our peers.  A video showing our presentation and demonstration is available [here](https://youtu.be/y8ZY2_FgwEQ?t=24m18s).

## Authors

Irene Canuti, Edyta Wrobel, Ben Kielty, Stefan Liute.
