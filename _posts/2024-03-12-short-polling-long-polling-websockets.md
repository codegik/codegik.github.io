---
title: Short polling, Long polling and Wesockets
author: Inácio Klassmann
date: 2024-03-12 10:55:00
categories: [event notification, software design]
tags: [software design, good practice, shor polling, long polling, websockets]
pin: true
math: true
mermaid: true
image:
  path: /assets/img/async-notification.png
---


It's all about notification. 
Basically this polling technic is a server/client solution where in one side there is the client requesting information to the other side in background mode. 
The user cannot see what's is happening behind the scenes, but in their perspective looks like something that pop up in the screen without manual intervention.

We call this behavior as async notification mechanism. 
This is made by the client side that is polling server side all the times.

Also, there are other forms of communication, e.g. push notification, SMS, email, webhooks and others. 
Each one has its own behavior and mechanism, but each one could impact in user experience and also in security in different way.

Email and SMS are more insecure if compared to other communication. 
The user experience is also impacted when use these form of communication.
Imagine a bank application saying "_we're processing your book transfer, once it's done you will receive an email_".
It's not a good experience to the user for sure.

Instead, the bank could use polling or websockets to give better experience to the user. 
Let's understand how it works each one.

## Short polling

![short-polling](/assets/img/short-polling.png)

Client/server solution where client is requesting information to the server in intervals.
E.g.
- Client: is there new data?
- Server: No
- Client: is there new data?
- Server: No
- Client: is there new data?
- Server: yes
- Client: do something with new data

The solution is on client side, it consists in create infinite a loop, requesting data to the server, wait an interval and do it again.

### Downsides
- Increase traffic over network due too many requests from many users all the time.
- Increase resource usage because there are more requests being processed by the server.
- Very rare to be the right decision, almost no one is using this nowadays.

### Benefits
- It doesn't require special configurations in both sides, it's just a normal request.
- Easy implementation since doesn't require much effort to implement.

## Long pooling

![long-polling](/assets/img/long-polling.png)

It's also a client/server solution. 
But instead of doing many requests to the server, the client is doing one single request.
This will keep the connection opened between client and server, looks like a request without timeout that never ends. 
The client will be waiting for the data from server, once get it, will request again.

E.g.

- Client: is there new data?
- Server: waiting for new data came.
- Server: waiting for new data came.
- Server: waiting for new data came.
- Server: there is new data, sending to client.
- Client: do something with new data

### Downsides
- There is no timeouts, there will be more efforts to setup this kind of behavior in infrastructure, usually we want to avoid requests without timeouts.
- Long-lived connections, Long polling can come with a latency overhead because it requires several hops between servers and devices. 
Gateways often have different ideas of how long a typical connection is allowed to stay open, so sometimes close while processing is still underway.
- Depending on the server implementation, confirmation of message receipt by one client instance may also cause another client instance to never receive an expected message at all, as the server could mistakenly believe that the client has already received the data it is expecting.
- Bad SOA design, this solution is not following SOA principles of communication between systems.

### Benefits 
- Reduced number of requests can reduce the network workload.
- Near real-time updates, once server has new data it will deliver right after to the client.

## Websockets

![websockets](/assets/img/websockets.png)

It's also a client/server solution.
But it's bidirectional, it's similar to traditional communication using sockets. 
After connection is opened, either client or server can send messages.
