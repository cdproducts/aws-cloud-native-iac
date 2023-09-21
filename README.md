# AWS CDK to Deploy E2E Microservices on ECS Fargate with all the supporting infrastructure components 

# Infrastructure as Code (IaC) - Non-Functional Features 🛠️

This repository encompasses a set of non-functional features that enhance the efficiency and flexibility of the provided Infrastructure as Code (IaC) solution.

### Isolated Components 🔒
One of the key strengths of this IaC implementation lies in its ability to maintain isolation among various components. This means that taking down a specific set of services will not adversely affect other services. For instance, even when deactivating microservices, the underlying networking stack remains unaffected, ensuring seamless operation.

### Lifecycle Driven 🔄
Our IaC solution is designed with a deterministic and version-controlled infrastructure lifecycle in mind. This empowers users to effortlessly deploy their configurations across multiple environments. Simply by modifying the configuration settings, you can ensure consistent and reliable deployment across different stages.

### Developer Friendly 👩‍💻👨‍💻
Simplicity and efficiency are at the core of our IaC approach. Developers can swiftly set up new instances of their services by leveraging existing code snippets. By copying and pasting the relevant code and making the necessary parameter adjustments, you can rapidly create new instances of your services, saving valuable time and effort.

### Core TypeScript Codebase 🚀
This IaC solution is built upon a robust TypeScript foundation. The utilization of TypeScript as the core language ensures a secure, typed, and scalable codebase. This choice not only enhances development speed but also provides a strong foundation for building and managing your infrastructure.


# Functional Features

## Networking Infrastructure with AWS Best Practices

This repository contains the code for setting up a robust networking infrastructure following AWS best practices. The infrastructure includes various components such as VPC, Subnets, Routing Tables, Internet Gateway, NAT Gateway, Load Balancer, and Default Target Group. 

### 1. Virtual Private Cloud (VPC)
- The VPC is a logically isolated section of the AWS Cloud where you can launch AWS resources into a virtual network.

### 2. Subnets
- Public Subnets: These subnets are designed to be accessible from the internet. They are typically used for resources like load balancers, bastion hosts, etc.
- Private Subnets: These subnets are not directly accessible from the internet. They are used for resources that should not be exposed, like databases and internal services.
- Persistence Subnets: These subnets are designed for long-term data storage and should be highly available.

### 3. Availability Zones (AZs)
- The subnets are spread across the specified number of Availability Zones (AZs) for high availability and fault tolerance.

### 4. Routing Tables
- Routing tables define the traffic rules for the subnets. They ensure that traffic flows correctly between different subnets.

### 5. Routes
- Routes define the paths that network packets take from the source to the destination. They are crucial for efficient and secure traffic flow.

### 6. Internet Gateway
- The internet gateway allows resources within the VPC to connect to the internet.

### 7. NAT Gateway
- NAT Gateways enable resources in private subnets to access the internet while remaining private.

### 8. Load Balancer
- A load balancer distributes incoming network traffic across multiple targets (e.g., EC2 instances) to ensure no single resource gets overwhelmed.

### 9. Default Target Group
- The default target group defines a set of targets that receive traffic from a load balancer.

## Usage Example

To create the networking stack using the AWS CDK, you can use the following code snippet:

```typescript
const app = new cdk.App();
const network = new CopanNetworkingStack(app, "networkingStack-ecommerce", {
  stackName: "networkingStackLatest",
  env: {
    region: config.aws.region,
    account: config.aws.account,
  },
  environment: config.environment!,
  orgName: config.orgName!,
  vpcName: "ecommerce",
  natGatewayCount: 2,
});
```

Make sure to replace the placeholders (e.g., `config.aws.region`, `config.aws.account`) with your specific AWS configuration.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute as per the terms of the license. If you find any issues or have suggestions, please open an [issue](https://github.com/your-repo/issues).

---

Happy coding! 🚀

---