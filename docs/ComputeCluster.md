# Compute Cluster Stack Configuration ⚙️

The Compute Cluster Stack constitutes only the ECS (Elastic Container Service) Cluster and the Service Discovery Namespace configuration, seamlessly integrated with Route 53.

```typescript
const computeCluster = new ClusterStack(
  app,
  `${config.orgName}-computeClusterStack-${config.environment}`,
  {
    stackName: `${config.orgName}-computeClusterStack-${config.environment}`,
    vpc: network.awsNetwork,
    clusterName: `ecommerce`,
    env: {
      region: config.aws.region,
      account: config.aws.account,
    },
    namespace: "ecommerce",
    environment: config.environment!,
    orgName: config.orgName!,
  }
);
```

This code snippet demonstrates the creation of a Compute Cluster Stack, incorporating essential configurations for ECS and Service Discovery using Route 53. Parameters such as `clusterName` and `namespace` are customizable to suit your specific requirements.

---

*Note: For detailed usage instructions and further information, please refer to the [documentation](docs/README.md) provided in this repository.*