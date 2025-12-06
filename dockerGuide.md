# Stop everything
docker-compose down

# Start everything
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# View logs (live)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f db

# Rebuild after code changes
docker-compose up --build

# Restart a specific service
docker-compose restart app

# Access MySQL from command line
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db