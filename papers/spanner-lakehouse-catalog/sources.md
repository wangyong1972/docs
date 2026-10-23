# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-16. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. Spanner-powered Lakehouse runtime catalog



- Managed Apache Iceberg at scale
- Google Cloud engineering blog, October 6, 2026
- Control-plane consistency and availability for a shared lakehouse

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 这是厂商工程博客。架构解释有参考价值，但没有独立论文式对照实验或可复现 catalog 实现。

## 02. The catalog lies on the query path



- The Iceberg REST catalog resolves table metadata locations.
- Writers require an atomic metadata-pointer update under optimistic concurrency.
- A catalog outage can stop otherwise healthy query engines and object storage.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** catalog 是控制平面的关键依赖。数据文件仍在对象存储，不能把 metadata DB 与数据扫描层混为一谈。

## 03. Commit coordination needs compare-and-swap



- A writer prepares metadata based on the observed current table version.
- The catalog must atomically validate the expected pointer and publish the replacement.
- Concurrent updates need conflict handling rather than a blind last-writer-wins overwrite.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 博客明确强调 CAS。这里是协议级机制说明，文章没有披露内部 schema 或每个 RPC 的实现。

## 04. Spanner backs catalog state



- The blog attributes strong consistency and scalable metadata state to Spanner.
- Relational SQL and multi-table ACID transactions provide the backing primitives.
- Dynamic range splitting and movement address storage and load growth.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 这些是 backing database 能力。具体 table-key 设计、缓存策略、热点缓解细节在文章中没有公开。

## 05. Availability claims have a configuration scope



- The blog cites regional Spanner configurations with up to 99.99% availability.
- Cloud Storage dual-region and multi-region buckets support failover use cases.
- Catalog availability and complete query availability depend on additional services and configuration.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 不要把数据库配置可达的可用性直接作为所有 end-to-end query 的 SLA。需要查实际产品合同及依赖。

## 06. Open REST interfaces decouple compute



- The runtime catalog implements the Iceberg REST Catalog specification.
- BigQuery, managed Spark, and compatible open-source engines discover registered tables.
- Pointers reference existing underlying data, avoiding a mandatory data rewrite for registration.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 接口兼容不意味着任意引擎版本支持所有写入特性。迁移时仍需验证 schema、权限和表格式版本。

## 07. Credential vending narrows storage access



- The catalog can vend short-lived storage credentials.
- OAuth/OIDC and IAM integration separate identity from broad object-store permissions.
- Federation connects catalogs and storage across cloud boundaries.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 外部 catalog、凭证交换和实际对象存储授权是多层链路。建议测试过期、撤权、租户隔离与审计。

## 08. Knowledge Catalog adds discovery indexes



- The blog describes full-text and vector search over a common base dataset in Spanner.
- It claims transactional index updates alongside base-table DML.
- This supports metadata discovery and contextual retrieval for agents.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 这里的 base dataset 是该索引所在的数据语义。不能推断外部所有 Iceberg 数据文件与 Spanner 索引构成同一个分布式事务。

## 09. Maintenance remains a distinct responsibility



- Catalog state alone does not compact files or expire snapshots.
- Manifest rewriting and orphan cleanup need coordinated maintenance workflows.
- Retention rules must protect readers and historical snapshots during cleanup.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 博客把 maintenance coordination 列为痛点，但未提供完整调度器或 GC 算法。以上边界应在选型时问清。

## 10. Evidence and missing baselines



Published evidence | Interpretation
--- | ---
Product described as GA | Availability statement on October 6 blog
Etsy 60% pipeline acceleration | Customer example with workload-specific context
Spanner consistency and scaling | Architectural motivation
No catalog QPS/latency comparison | No independent performance frontier in this article

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 不能将客户流水线加速拆解为 catalog 单独提升 60%。博客没有给出消融和统一基线。

## 11. Architecture evaluation proposal



- Proposed test: race conflicting commits and verify reader-visible snapshot transitions.
- Proposed test: measure catalog p50/p99 and retry rate under metadata-heavy traffic.
- Proposed test: exercise credential expiry, failover, and cleanup with active readers.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 这是面向 AI 数据平台的验证清单，尚未执行。应把 catalog 延迟与对象扫描延迟分别观测。

## 12. Adoption and reproducibility boundary



- Inference: a managed consistent catalog can reduce control-plane operations work.
- A product trial must verify actual region, permissions, engine versions, and cost model.
- No open implementation or benchmark reproduction accompanies the reviewed blog.

- [Engineering blog](https://cloud.google.com/blog/products/data-analytics/lakehouse-runtime-catalog-powered-by-spanner)

**中文讲解：** 可用标准 REST 客户端设计黑盒实验，不能把文章当成已经复现的内部实现。
