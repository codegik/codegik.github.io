---
title: Old fashion way of Microservices Architecture
author: Inácio Klassmann
date: 2020-08-11 20:55:00
categories: [microservice, architecture, service discovery]
tags: [microservices, use case, architecture, service discovery, zuul, consul, swagger]
pin: true
math: true
mermaid: true
image:
  path: /assets/img/microservices-architecture.png
---

It is a rich history of using microservices in a financial company with a fixed mindset culture and fixed infrastructure as well. It sounds crazy, right? Yes, indeed, that environment does not match the microservice architecture. But they were starting the digital transformation, and there were a lot of changes happening in the whole company. First of all, I would like to say that not overall software development is about k8s and microservices; there is no silver bullet.

Imagine a financial company that needs compliance with the government, has a lot of security rules, has so many auditing levels, and needs to pay the support license for every technology used by the teams. It was tough to put new technologies inside the company because they were afraid of breaking a rule or being blamed for the possible problem.

My first version of architecture was pretty good. I proposed using cloud, container management, API management, ELK, spring-boot, and automation (of course), because I was looking for observability and scalability. But guess what? The company denied the architecture because it has many open source technologies that cannot be implemented without a support license. Really? Are you sure we are doing a digital transformation here? In my opinion, the company doesn’t know what digital transformation is. But it is ok. I wasn’t in a position that I could discuss intensely at that moment. So let’s move on.

I want to share my experience and show another way of doing microservice architecture without container management. The solution below shows what was accomplished during the time that I was present in the project. As I know, the project keeps growing after I left.

## Overall Architecture

Since I understand the limits present in the veins of the whole company, I started a different approach. I proposed a new microservice architecture that was very simple, composed of: Consul, Zuul, and Spring-boot. The Graylog stack it was already implemented by the company. 

Here is a picture resuming the architecture.

![dc1-dc2.png](/assets/img/dc1-dc2.png)

Remember that we don’t have container management, so the approach is to keep the infrastructure redundant to have some availability here. There are two data centers, and they are bounded by API gateway cluster and by Consul cluster. VM 1, 2,3, 4 are the core of the services application and are the main topic of the solution that I will talk about here.

There are some relevant aspects:

- Each service has at least two instances.
- The services doesn’t know each other. They only know where Consul is.
- The communication between services is by message broker or REST calls.
- Each service has its database.
- The services are independent for development and deployment.
- The services have endpoints for health-check, metrics, and swagger.
- The services are using Gelf to sending its logs to Graylog via UDP.
- The automated deployment will set up a Linux service in systemd. So for some reason the VM is restarted, the services will startup with the SO automatically.

There are other particular details in that solution. Still, I choose not to explain the whole thing since I’m trying to show how to solve the main problem that is the company can’t build a microservice architecture with container management based on its rules.

## Service discovery

Consul is a great tool and is responsible for registering the services and expose its catalog. It is an abstraction of service location, and can tell us the availability of a service and which host is running it.

The services were using spring-cloud-consul dependency for registering itself automatically on startup. The configuration is straightforward, like below.

**application.yml**
```yml
spring:
  cloud:
    consul:
      host: localhost
      port: 8500
```

**App.java**
```java
@SpringBootApplication
@EnableDiscoveryClient
public class App {
    public static void main(String[] args) throws Exception {
        new SpringApplication(App.class).run(args);
    }
}
```

After the service does a self-registration on the Consul catalog, Consul will often check the service’s availability by the endpoint /health, which is a great thing because we can combine with spring-boot-actuator that provides this endpoint natively.

## Configuration repository

Consul provides a [Key/Value] Store for storing configuration and other metadata. Spring Cloud Consul Config is an alternative to the [Config Server and Client]. Configuration is loaded into the Spring Environment during the particular “bootstrap” phase. Configuration is stored in the _/config_ folder by default.

So let’s use that feature too, because this way we are keeping the solution simple with a small toolbelt and low complexity.

To get started with Consul Configuration use the starter with group _org.springframework.cloud_ and artifact id _spring-cloud-starter-consul-config_. See the [Spring Cloud Project] page for setting up your build system with the current Spring Cloud Release Train.

The settings below will enable auto-configuration that will setup Spring Cloud Consul Config.

**application.yml**
```yml 
spring:
  cloud:
    consul:
      host: localhost
      port: 8500
      config:
        enabled: true
        prefix: config
        defaultContext: apps
        profileSeparator: '::'
```

Consul has another feature called Config Watch that is enabled by default. It is responsible for looking at the configuration values, when Consul find some configuration variation, a refresh event will be published and the microservice will receive that event and will reload de configuration without a reboot needed.


## Zuul & Swagger UI

Zuul is an edge service that provides routing, monitoring, resiliency, security, and more. Zuul was configured to be a dynamic dummy gateway between API Manager and the microservice, just that.

To do that, Zuul needs to know which host and port each service is available on. Consul has what Zuul needs, so to enable the integration of Zuul and the consul catalog, you need this setup:

**pom.xml**

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-zuul</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-consul-all</artifactId>
</dependency>
```


**application.yml**
```yml
spring:
  application:
    name: zuul-ms
  cloud:
    consul:
      host: localhost
      port: 8500
      discovery:
        port: 9000
      config:
        enabled: true
        prefix: config
        defaultContext: apps
        profileSeparator: '::'
```

**App.java**

```java
@EnableZuulProxy
@SpringBootApplication
@EnableDiscoveryClient
@EnableAutoConfiguration
public class App {
        new SpringApplication(App.class).run(args);
}
```


Now Zuul has access to the Consul catalog and can forward the requests to the available services dynamically without any extra setup. When a new microservice rises, the catalog will be updated automatically, and Zuul will be aware of this.

Zuul has one more responsible in this architecture; it provides the swagger documentation UI. The microservices use only the springfox-swagger2 dependency because I don’t want to put the swagger-ui inside of each microservice; it is a waste of resources. So the solution is putting swagger-ui on the Zuul project because it is a single point of communication.

The configuration below is for enabling the swagger:

**pom.xml**

```xml
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger2</artifactId>
</dependency>
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger-ui</artifactId>
</dependency>
```


**SwaggerConfig.java**
```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {   
    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2).select().apis(RequestHandlerSelectors.any())
            .paths(PathSelectors.any()).build();
    }
}
```

The Zuul gateway is dynamic, so we need to have the swagger documentation dynamic too. We don’t want to do manual work each time the microservices have some contract changes. So here is a configuration to enable it:

```java
@Component
@Primary
@EnableAutoConfiguration
public class SwaggerResourceConfig implements SwaggerResourcesProvider {
    private final RoutesEndpoint routesEndpoint;
    
    public SwaggerResourceConfig(RoutesEndpoint routesEndpoint) {
        this.routesEndpoint = routesEndpoint;
    }@Override
    public List<SwaggerResource> get() {
        final List<SwaggerResource> resources = new ArrayList<SwaggerResource>();routesEndpoint.invoke().forEach((key, value) -> {
            if (value.startsWith("zuul")) {
                resources.add(swaggerResource(value, "/v2/api-docs", "2.0"));
            } else {
                resources.add(swaggerResource(value, "/api/" + value + "/v2/api-docs", "2.0"));
            }
        });
        
        return resources;
    }private SwaggerResource swaggerResource(String name, String location, String version) {
        SwaggerResource swaggerResource = new SwaggerResource();
        swaggerResource.setName(name);
        swaggerResource.setLocation(location);
        swaggerResource.setSwaggerVersion(version);
        return swaggerResource;
    }
}
```

You can start Zuul, open the swagger-ui URL in your browser and take a look at the service Combobox selection, and it should have a list of the microservices API.


## Conclusion

Consul is a service mesh solution that offers a software-driven approach to routing and segmentation. It also brings additional benefits, such as failure handling, retries, and network observability. Consul cluster is imposing, and it is very stable.

Zuul performs like a charm, and we don’t need more than two instances to support the requests.

The observability is right; we have spring-sleuth/spring-actuator to do distributed tracing and generate some metrics; also, we have logs in the same place.

The infrastructure scalability is a big problem, because it is manual and slow, the hardware is limited for scaling. Moving to cloud could be the right solution for the scalability problem.

I wouldn’t say I liked to choose that solution. I realize that was an excellent learning, and for each scenario, there will be a different software architecture solution. I shared my experience to show that there are other ways to build software without containers.




[Key/Value]: https://consul.io/docs/agent/http/kv.html
[Config Server and Client]: https://github.com/spring-cloud/spring-cloud-config
[Spring Cloud Project]: https://projects.spring.io/spring-cloud/
