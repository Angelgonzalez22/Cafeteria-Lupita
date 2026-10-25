# Cafeteria-Lupita

Backend de Cafetería Lupita: autenticación, roles, productos, pedidos, cocina, pagos y reportes.

Iniciar PostgreSQL y aplicar las migraciones antes de ejecutar la API:

```powershell
docker compose up -d --wait postgres
dotnet tool restore
dotnet ef database update --project backend/Lupita.Api
dotnet run --project backend/Lupita.Api
```

Swagger local: http://localhost:5110/swagger/index.html.

Para ejecutar la API en Docker:

```powershell
docker compose up -d --build
```

Swagger Docker: http://localhost:8080/swagger/index.html.
