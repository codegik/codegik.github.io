---
title: The death of Linux Containers
author: Inácio Klassmann
date: 2021-04-30 20:55:00
categories: [unikernel]
tags: [linux, container, unikernel]
pin: true
math: true
mermaid: true
image:
  path: /assets/img/unikernels.png
---

Unikernels are awesome!

First of all, let’s understand what unikernel is. *“Unikernels are specialized, single-address-space machine images constructed by using library operating systems.” (Unikernel, n.d.)*

**Specialized** means the unikernel holds a single application, and **single-address-space** means that is the core, and that is it! Nothing more! No other space or program exists on the unikernel, and it is built to run just one application.

Unikernel is different from the conventional kernel; we can call the Linux kernel a monolith kernel because it brings many resources, drivers, userspace, libs, etc. Unikernel is the opposite of the Linux kernel, and it’s smaller, has less code and is less prone to bugs. Which means it brings more reliability, isolation, and security.

They are compiled with the required modules to run the application, so the result is a small, lightweight, and highly efficient virtualized application.

To better understand about these concepts, let’s observe the figure below.

![monolith-kernel.png](/assets/img/monolith-kernel.png){:style="display:block; margin-left:auto; margin-right:auto"}

This picture represents a monolith kernel running on a conventional operational system. The application runs on the userspace, and then a lot of functions are called to the kernel space. There is an abstraction on these calls. Besides that, the kernel space is prepared to handle many concurrency applications.

Let’s observe the unikernel application below.


![unikernel-sctructure.png](/assets/img/unikernel-sctructure.png){:style="display:block; margin-left:auto; margin-right:auto"}

This structure doesn’t segregate the user space from kernel space. It is just one thing. It doesn’t need the abstractions to call functions, and the unikernel doesn’t need to handle concurrency applications. It is beautifully built for a single application wholly isolated and secured.

## Let's talk about security

The unikernel is not sharing any resources with others and doesn’t have another process running. No port will be opened beside the application port, no process concurrency, and no software trying to access other software addresses. The unikernels have limited access to the network device and don’t have the unnecessary operational system function like device management, remote access, or command-line interface. Those features are not present in the source code of the unikernel application. So I’m pretty comfortable to say the security is on another level here.

Unikernels have more isolation and security than Linux containers because they have more layers, more code, more tools, etc., so there are multiple points of security failure.

## Linux Containers vs Unikernel

Machine virtualization is the key of this article, and the most common implementation is VMware and Xen Project. Both are called hypervisors, and it’s responsible for hosting multiple guest operating system on a single physical machine.

Said that let’s see the difference between the two solutions.

![unikernel-sctructure.png](/assets/img/linux-containers-vs-uniternels.png){:style="display:block; margin-left:auto; margin-right:auto"}

The most impressive difference here is the layer reduction and the abstraction. It is very clear the Linux containers have much more load resources as opposed to unikernels. Therefore, the unikernels are providing the application from a reduced VM, increasing the isolation and security. On the other hand, the Linux containers share the same kernel, which means they share the same vulnerabilities.

## Linux Containers

### Pros
- Lightweight virtualization
- Fast boot times
- Orchestration solutions
- Dynamic resource allocation

### Cons
- Reduced isolation between host and guest due to shared kernel
- Less flexible (i.e., dependent on host kernel)
- Network is less flexible

## Unikernels

### Pros
- Lightweight images
- Specialized application
- Complete isolation from the host
- Higher security against absent functionalities (e.g., remote command execution)

### Cons
- Requires developing applications from the grounds up
- Limited deployment possibilities
- Lack of complete IDE support
- Static resource allocation
- Lack of orchestration tools

## Conclusion

The unikernels are new technology, and they are not recommended to use in a production environment yet. The idea is to present the potential against containers, and there are some benefits in terms of performance. But it has some improvements to move forward, especially in matters of orchestration tools and observability.

While containers are quickly becoming industry standard, unikernels still have a lot to go through. Unikernels try to push the concepts of containers even further, eliminating the need for an OS altogether. Instead of maintaining a resident kernel in memory, everything is managed through pre-built binary libraries. Unikernels do not handle resource allocation, though, so they still require a hypervisor.

Unikernels may reduce the long-term usefulness of containers.
