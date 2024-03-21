---
title: The Death of Springboot Webflux
author: Inácio Klassmann
date: 2024-03-20 10:55:00
categories: [springboot, webflux, netty]
tags: [ThreadLocal, springboot, webflux, reactive, netty]
pin: true
math: true
mermaid: true
image:
  path: /assets/img/webflux.png
---


First of all, I love `Netty`, it's a great non-blocking webserver, very fast and has zero vulnerabilities so far.
I also love `Springboot`, I've been using it since the very beginning.

Putting both together, here is `Spring WebFlux`. Which is Springboot implementation for Netty embedded server.
At first glance sounds to be awesome, having both good thing in just one place.

However, there is something very dangerous running in background, let me explain a little bit with more details.

Springboot dependency `spring-boot-starter-webflux` is using Netty as default embedded server,
which sounds a very good thing right.
Well, besides the part of using Netty the other things that came with it are not so good, like `webflux`.

The way Springboot has implemented `webflux` + `Netty` makes mandatory to use `Flux` and `Mono`.
Which means, if you want to have full benefit of reactive, then every class or component should be part of the reactive chain.
In other words, most of the methods should return `Flux` or `Mono` types.
Otherwise, they will not have access to the context of reactive chain, 
which will make these methods do not access context variables you may want to propagate,
like **correlation-id** or **transaction-id**.

So you can think _"ok, that is fine, lets keep every component part of the reactive chain"_.

Unfortunately, the answerer is **NO**. That is not a good idea, there is something deeply hidden here.

The problem is they forgot to mention a little BIG thing that `Flux` and `Mono` **doesn't work with** `ThreadLocal`.
So this changes everything, as we know `ThreadLocal` is a great feature from JVM and works very well with recently released **Virtual Threads (JDK21)**.

`ThreadLocal` is very cool, I want to keep it working in my projects.
Otherwise, it could have compatibility issues since many libraries are using `ThreadLocal` as well,
so every dependency that could be using `ThreadLocal` will stop working in reactive chain context. 
I'd say the risk of breaking something is very high specially when the application needs to evolve.
Or would be very difficult to find an alternative library as replacement that supports reactive chain.

Just remember that if you want use `weflux` you should be aware that might have dependencies in your project that will not work fine.
