$env:DATABASE_URL="postgres://postgres:password@localhost:5432/bioforge"
$env:PORT="8080"
$env:GEMINI_API_KEY="AIzaSyDd_wbYQYBp8sTqSjoSbyB6Aejdi41n4Hw"

echo "Waiting for PostgreSQL to start..."
Start-Sleep -Seconds 3

echo "Pushing database schema..."
pnpm --filter @workspace/db run push

echo "Seeding the database..."
pnpm --filter @workspace/api-server run seed

echo "Starting the API server..."
pnpm --filter @workspace/api-server run dev
