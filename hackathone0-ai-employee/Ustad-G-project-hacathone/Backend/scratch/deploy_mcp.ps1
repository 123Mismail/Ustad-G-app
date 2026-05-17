$project_id = "vertical-shore-471312-a5"
$gcloud_path = "C:\Users\ACER\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

& $gcloud_path run deploy ustadg-mcp `
  --image gcr.io/$project_id/ustadg-mcp `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --project $project_id `
  --timeout=3600 `
  --env-vars-file env.yaml