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
- [Networking Infrastructure](./docs/Networking.md)
- [Other Section](./other/README.md)
## License

---