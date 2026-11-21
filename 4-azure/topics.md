# Microsoft Azure & Cloud Interview Topics & Concept Checklist

> **Profile Context:** ~6 Years Python Backend Experience  
> **Resume Links:** Microsoft Azure AZ-900 Certified, App Services deployment & maintenance, Virtual Machines, Azure Blob Storage (secure file storage & application data management), CI/CD pipelines (GitHub Actions, Jenkins).

---

## 1. Cloud Fundamentals & AZ-900 Core Architecture
- [ ] **Cloud Computing Models:** IaaS vs PaaS vs SaaS, Private vs Public vs Hybrid Cloud.
- [ ] **High Availability, Scalability & Resilience:**
  - Regions, Availability Zones (AZ), Geographies, and Region Pairs.
  - Scale Up (Vertical) vs Scale Out (Horizontal).
  - Disaster Recovery (RTO - Recovery Time Objective, RPO - Recovery Point Objective), Fault Tolerance, SLAs.

---

## 2. Azure App Services (PaaS Deployment - Direct Resume Topic)
- [ ] **App Service Architecture:**
  - App Service Plans (Free, Basic, Standard, Premium, Isolated tiers).
  - Scale rules: CPU/Memory percentage autoscale rules, schedule-based scaling.
- [ ] **Deployment Slots & Zero-Downtime Releases:**
  - Staging slot vs Production slot.
  - Slot Swap mechanics: Pre-warming, traffic redirection, swap with preview, instant rollback.
- [ ] **Configuration & Security:**
  - App Settings (exposed as environment variables in Python) vs Connection Strings.
  - Securing secrets using Azure Key Vault References (`@Microsoft.KeyVault(...)`).
  - Custom Linux startup script: Specifying Gunicorn / Uvicorn entrypoints (`gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`).
- [ ] **Diagnostics & Kudu:** Kudu console, Log stream, SSH into container, Application Insights integration.

---

## 3. Azure Virtual Machines (IaaS - Direct Resume Topic)
- [ ] **VM Sizing & Disks:** Compute-optimized vs Memory-optimized sizes, OS Disk vs Data Disks (Standard HDD, Standard SSD, Premium SSD).
- [ ] **Virtual Networking & Security:**
  - Virtual Networks (VNets), Subnets, Private IP vs Public IP.
  - Network Security Groups (NSGs): Inbound & outbound security rules, priority numbers, service tags.
  - Secure Access: Azure Bastion, SSH key authentication, disabling direct public SSH port 22.

---

## 4. Azure Blob Storage & Data Management (Direct Resume Topic)
- [ ] **Storage Account Architecture:**
  - Redundancy options: LRS (Locally Redundant), ZRS (Zone Redundant), GRS (Geo-Redundant), RA-GRS (Read-Access Geo-Redundant).
  - Blob types: Block Blobs (files/documents), Append Blobs (logs), Page Blobs (VHDs).
- [ ] **Access Control & Security:**
  - Shared Access Signatures (SAS): Service SAS vs Account SAS vs User Delegation SAS (backed by Azure AD).
  - Stored Access Policies for revocable SAS tokens.
  - Storage Account Access Keys vs Azure AD RBAC.
  - Blob encryption at rest (Microsoft-managed vs Customer-managed keys).
- [ ] **Lifecycle Management & Tiers:**
  - Access tiers: Hot, Cool, Cold, Archive.
  - Automated lifecycle policies (e.g. move logs to Cool after 30 days, Archive after 90 days, delete after 365 days).
- [ ] **Python SDK Integration (`azure-storage-blob`):**
  - `BlobServiceClient`, `ContainerClient`, `BlobClient`.
  - Secure file upload, chunked streaming for large files, generating pre-signed SAS URLs for client direct uploads.

---

## 5. Enterprise Identity, Access Management & Secrets
- [ ] **Microsoft Entra ID (formerly Azure Active Directory):**
  - Tenant ID, Client ID, Client Secrets, Service Principals, App Registrations.
  - Role-Based Access Control (RBAC): Built-in roles (Owner, Contributor, Reader) vs Custom roles, Role Assignments at Subscription / Resource Group / Resource scope.
- [ ] **Managed Identities (Zero-Secret Architecture):**
  - System-Assigned vs User-Assigned Managed Identity.
  - How an App Service or VM authenticates to Azure Blob Storage or Key Vault without hardcoded credentials via `DefaultAzureCredential`.
- [ ] **Azure Key Vault:** Secrets, Keys, Certificates management, access policies vs Azure RBAC.

---

## 6. Serverless (Azure Functions)
- [ ] **Hosting Models:** Consumption plan (cold starts), Premium plan (pre-warmed instances, VNet integration), Dedicated plan.
- [ ] **Triggers & Bindings:**
  - HTTP Trigger, Blob Trigger, Timer Trigger (Cron expressions), Event Hub / Queue Storage triggers.
  - Python programming model v2 (`@app.route`, `@app.blob_trigger`).
  - Local development: Azure Functions Core Tools, Azurite emulator, `local.settings.json`.

---

## 7. CI/CD Pipelines & Observability
- [ ] **Automated Deployments:**
  - GitHub Actions: Workflows, Azure Web App deploy action, OpenID Connect (OIDC) authentication without storing client secrets.
  - Jenkins: Pipeline as Code (Jenkinsfile), webhook triggers, deployment scripts.
- [ ] **Monitoring & Observability:**
  - Azure Monitor and Application Insights (distributed request tracing, exception tracking, live metrics, App Map).
  - Alerts and action groups for downtime or latency spikes.

