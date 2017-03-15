# Book Me Alexa

## What This Is

## Technology

## How to Deploy, Test and Use

Prerequisites:
* DynamoDB (java JDK is needed to install it)
* AWS CLI (pip is needed to install it)

```
$ git clone https://github.com/sliute/AlexaBookEvent.git
$ cd AlexaBookEvent
$ npm install
$ cd examples/apps/book_event
$ npm install
$ cd [to downloaded DynamoDB folder, where the .jar file is]
$ java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -inMemory
$ cd [back to AlexaBookEvent/examples]
$ node server
$ open localhost:8080/alexa/book_event

```

## Progress and Issues

## Authors

Irene Canuti, Edyta Wrobel, Ben Kielty, Stefan Liute.
