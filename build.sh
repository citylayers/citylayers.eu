#!/bin/bash

# deploy-app.sh - Deploy CityLayers application to GCP Cloud Run
# Usage: ./deploy-app.sh

set -e

source .env

# Set the project
echo "Setting GCP project..."
gcloud config set project "${GCP_PROJECT_ID}"

# Enable required APIs
echo "Enabling required GCP APIs..."
gcloud services enable cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe "${REPO_NAME}" \
  --location="${GCP_REGION}" 2>/dev/null || \
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${GCP_REGION}" \
  --description="CityLayers application images"

# Build and push the image using Cloud Build
echo "Building application image..."
gcloud builds submit --config=imagebuild.yaml \
  --substitutions=_GCP_PROJECT_ID="${GCP_PROJECT_ID}",_GCP_REGION="${GCP_REGION}",_REPO_NAME="${REPO_NAME}",_APP_IMAGE_NAME="${APP_SERVICE_NAME}",_APP_VERSION="latest" \
  .

# Deploy to Cloud Run with environment variables
echo "Deploying to Cloud Run..."
gcloud run deploy "${APP_SERVICE_NAME}" \
    --image="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO_NAME}/${APP_SERVICE_NAME}:latest" \
    --region="${GCP_REGION}" \
    --platform=managed \
    --allow-unauthenticated \
    --memory=2Gi \
    --cpu=2 \
    --port=8080 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="NODE_ENV=production" \
    --execution-environment=gen2 \
    --timeout=300

echo "Deployment complete!"
echo "Service URL:"
gcloud run services describe "${APP_SERVICE_NAME}" \
  --region="${GCP_REGION}" \
  --format='value(status.url)'
