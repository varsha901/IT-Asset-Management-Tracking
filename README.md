# AssetTrack

AssetTrack is a production-oriented IT Asset Management System built with Node.js, Express, MongoDB, and Mongoose.

## Features
- Asset CRUD and lifecycle tracking
- Assignment and assignment history
- Maintenance ticket management
- License management with expiry awareness
- Dashboard and reporting endpoints
- Role-based access for IT Admin, Manager, and Employee

## Project Structure
```text
src/
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  server.js
infra/
  terraform/
  main.tf
tests/
Dockerfile
Jenkinsfile
deployment.yaml
service.yaml
```

## Quick Start
1. Copy .env.example to .env
2. Install dependencies with npm install
3. Start the app with npm run dev

## Deployment Notes
- Azure App Service is supported via Dockerfile and Terraform
- Jenkins pipeline includes CI and CD stages
- Replace Azure credential IDs and app names in Jenkinsfile for your environment
