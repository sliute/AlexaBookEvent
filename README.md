# Book Me Alexa

## What This Is

## Technology

## How to Deploy, Test and Use

Prerequisites:
* [DynamoDB Local](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html#DynamoDBLocal.DownloadingAndRunning) (the latest [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html) is needed to install it).
* [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) (Python and pip are needed to install it, then a [$PATH](http://docs.aws.amazon.com/cli/latest/userguide/cli-install-macos.html#awscli-install-osx-path) needs adding).

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
