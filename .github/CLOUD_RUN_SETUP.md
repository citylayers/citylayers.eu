# Cloud Run Deployment Setup Guide

This guide explains how to set up GitHub Actions for automatic deployment to Google Cloud Run.

## Prerequisites

- Google Cloud Platform account with billing enabled
- GitHub repository with admin access
- `gcloud` CLI installed locally (for setup)

## 1. Google Cloud Setup

### 1.1 Create/Select GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com
```

### 1.2 Create Artifact Registry Repository

```bash
# Create repository for Docker images
gcloud artifacts repositories create citylayers-server \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker repository for CityLayers server"
```

### 1.3 Setup Authentication

#### Option A: Workload Identity Federation (Recommended)

This is more secure as it doesn't require service account keys.

```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create Workload Identity Pool
gcloud iam workload-identity-pools create github-pool \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Get the Workload Identity Pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe github-pool \
  --location="global" \
  --format="value(name)")

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Allow GitHub repo to impersonate the service account
# Replace GITHUB_ORG and GITHUB_REPO with your values
export GITHUB_ORG="your-github-org"
export GITHUB_REPO="citylayers.eu"

gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"

# Get the Workload Identity Provider resource name (needed for GitHub secrets)
gcloud iam workload-identity-pools providers describe github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

#### Option B: Service Account Key (Alternative)

If Workload Identity Federation is not available:

```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com

# Display key content (copy this for GitHub secrets)
cat key.json

# IMPORTANT: Delete this file after copying to GitHub secrets
rm key.json
```

## 2. GitHub Repository Setup

### 2.1 Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

#### For Workload Identity Federation (Option A):

Add these secrets:

1. **GCP_PROJECT_ID**: Your GCP project ID
   ```
   your-project-id
   ```

2. **WIF_PROVIDER**: Workload Identity Provider resource name
   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider
   ```
   (Get this from the last command in Option A setup)

3. **WIF_SERVICE_ACCOUNT**: Service account email
   ```
   github-actions-deployer@your-project-id.iam.gserviceaccount.com
   ```

#### For Service Account Key (Option B):

Add these secrets:

1. **GCP_PROJECT_ID**: Your GCP project ID
   ```
   your-project-id
   ```

2. **GCP_SA_KEY**: Entire content of the key.json file
   ```json
   {
     "type": "service_account",
     "project_id": "...",
     ...
   }
   ```

### 2.2 Update Workflow File (if needed)

If using Service Account Key (Option B), update `.github/workflows/deploy-cloud-run.yml`:

```yaml
- name: Authenticate to Google Cloud
  id: auth
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

### 2.3 Customize Deployment Settings

Edit `.github/workflows/deploy-cloud-run.yml` to adjust:

- **REGION**: Change `europe-west1` to your preferred region
- **SERVICE_NAME**: Change if you want a different service name
- **Memory/CPU**: Adjust `--memory` and `--cpu` flags
- **Scaling**: Adjust `--max-instances` and `--min-instances`
- **Authentication**: Change `--allow-unauthenticated` to `--no-allow-unauthenticated` if you need authentication

## 3. Test Deployment

### 3.1 Initial Manual Deployment (Optional)

Test deployment manually first:

```bash
# Build and push image
docker build -t europe-west1-docker.pkg.dev/${PROJECT_ID}/citylayers-server/citylayers-server:test .
docker push europe-west1-docker.pkg.dev/${PROJECT_ID}/citylayers-server/citylayers-server:test

# Deploy to Cloud Run
gcloud run deploy citylayers-server \
  --image=europe-west1-docker.pkg.dev/${PROJECT_ID}/citylayers-server/citylayers-server:test \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --port=8080
```

### 3.2 Trigger GitHub Actions

Push to master branch:

```bash
git add .
git commit -m "Add Cloud Run deployment workflow"
git push origin master
```

### 3.3 Monitor Deployment

1. Go to GitHub repository → Actions tab
2. Watch the workflow run
3. Check logs for any errors
4. Once complete, visit the service URL displayed in the logs

## 4. Environment Variables

To add environment variables to your Cloud Run service:

### Via Workflow File

Edit `.github/workflows/deploy-cloud-run.yml` and add to the deploy step:

```yaml
--set-env-vars="NODE_ENV=production,DATABASE_URL=xxx,API_KEY=xxx"
```

### Via Secrets

For sensitive values, add them as GitHub secrets and reference in the workflow:

```yaml
--set-env-vars="NODE_ENV=production,API_KEY=${{ secrets.API_KEY }}"
```

### Via Cloud Console

Alternatively, set them directly in Cloud Run:

```bash
gcloud run services update citylayers-server \
  --region=europe-west1 \
  --set-env-vars="KEY1=value1,KEY2=value2"
```

## 5. Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure service account has all required roles
2. **Artifact Registry Not Found**: Verify repository exists and region matches
3. **Build Fails**: Check Dockerfile and build context
4. **Service Fails to Start**: Check logs with `gcloud run logs read`

### View Logs

```bash
# View recent logs
gcloud run logs read citylayers-server --region=europe-west1

# Follow logs in real-time
gcloud run logs tail citylayers-server --region=europe-west1
```

### Check Service Status

```bash
# Get service details
gcloud run services describe citylayers-server --region=europe-west1

# List all services
gcloud run services list
```

## 6. Cost Optimization

Cloud Run is pay-per-use. To optimize costs:

- Set `--min-instances=0` (scale to zero when idle)
- Use `--cpu-throttling` to reduce CPU allocation when not handling requests
- Monitor usage in GCP Console
- Set up budget alerts

## 7. Security Best Practices

1. ✅ Use Workload Identity Federation (no service account keys)
2. ✅ Apply principle of least privilege for IAM roles
3. ✅ Enable VPC Service Controls if needed
4. ✅ Use Cloud Armor for DDoS protection
5. ✅ Enable Cloud Run audit logs
6. ✅ Regularly rotate service account keys (if using keys)
7. ✅ Use Secret Manager for sensitive environment variables

## Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions for GCP](https://github.com/google-github-actions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
